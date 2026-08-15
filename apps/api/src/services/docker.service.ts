import Docker from "dockerode";
import path from "path";
import chokidar from "chokidar";
import * as fs from "fs/promises";
import { prisma } from "../lib/prisma.js";
import type { Project } from "../generated/prisma/index.js";
import { WebSocket } from "ws";

const docker = new Docker();

type TreeItem = {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeItem[];
};

async function buildTree(dir: string, root: string = dir): Promise<TreeItem[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const tree: TreeItem[] = []; // Root: {}

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    if (entry.isDirectory()) {
      // if entry is a directory, recurse into it first to build its children
      // and then push it as a node with those children attached

      const children = await buildTree(path.join(dir, entry.name), root);
      tree.push({
        name: entry.name,
        isDir: true,
        children,
        path: path.relative(root, path.join(dir, entry.name)),
      });
    } else {
      /* If entry is not a directory, push it directly to tree {
                                                                  {name: "test.txt",
                                                                  isDir: false}

      idk why this was so confusing have to explain to myself to remember
      */
      tree.push({
        name: entry.name,
        isDir: false,
        path: path.relative(root, path.join(dir, entry.name)),
      });
    }
  }

  tree.sort((a, b) => Number(b.isDir) - Number(a.isDir));

  return tree;
}

async function createProjectPath(fullPath: string, isDir: boolean) {
  if (isDir) {
    await fs.mkdir(fullPath);
  } else {
    await fs.writeFile(fullPath, "", { flag: "wx" });
  }
}

export async function handleFilesConnection(ws: WebSocket) {
  const projectId = (ws as any).projectId;
  const projectPath = path.resolve("./data/projects", projectId);

  async function sendTree() {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
      const tree = await buildTree(projectPath);
      ws.send(JSON.stringify({ tree }));
    } catch (error) {
      console.log("Failed to build file tree:", error);
    }
  }

  async function createFile(name: string, isDir: boolean) {
    const targetPath = path.join(projectPath, name);

    try {
      await createProjectPath(targetPath, isDir);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error)
        if (error.code === "EEXIST") {
          ws.send(JSON.stringify({ error: "This path already exists." }));
        } else {
          ws.send(JSON.stringify({ error: "Could not create file." }));
        }
    }
  }

  await sendTree();

  const watcher = chokidar.watch(projectPath, {
    ignoreInitial: true,
  });

  watcher.on("all", () => sendTree());

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.event === "refresh") {
      sendTree();
    } else if (msg.event === "create") {
      createFile(msg.path, msg.isDir);
    }
  });

  ws.on("close", () => {
    watcher.close();
  });
}

export async function handleTerminalConnection(ws: WebSocket) {
  const containerId = (ws as any).containerId;
  const rows = (ws as any).rows;
  const cols = (ws as any).cols;

  try {
    const terminalContainer = docker.getContainer(containerId);

    const exec = await terminalContainer.exec({
      Cmd: ["bash", "-i"],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      Env: ["TERM=xterm-256color"],
    });

    const stream = await exec.start({
      hijack: true,
      stdin: true,
      Tty: true,
    });

    async function handleTerminalResize(rows: number, cols: number) {
      await exec.resize({
        h: rows,
        w: cols,
      });
    }

    await handleTerminalResize(rows, cols);

    stream.on("data", (chunk: Buffer) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(chunk, { binary: true });
      }
    });

    ws.on("message", (data: Buffer, isBinary: boolean) => {
      if (isBinary) {
        stream.write(data);
        return;
      }

      try {
        const payload = JSON.parse(data.toString());
        const event = payload.event;

        switch (event) {
          case "resize": {
            const rows = payload.rows;
            const cols = payload.cols;

            if (rows && cols) handleTerminalResize(rows, cols);
            break;
          }
        }
      } catch (error) {
        console.log(`Terminal error: ${error}`);
      }
    });

    ws.on("close", () => {
      stream.end();
      if (
        "destroy" in stream &&
        typeof (stream as any).destroy === "function"
      ) {
        (stream as any).destroy();
      }
    });
  } catch (error) {
    console.log(error);
    ws.close();
  }
}

export async function initializeProjectContainer(
  project: Project,
): Promise<string> {
  let containerId = project.containerId;

  if (containerId) {
    try {
      const projectContainer = docker.getContainer(containerId);
      const info = await projectContainer.inspect();

      if (!info.State.Running) {
        await projectContainer.start();
      }

      return containerId;
    } catch (error: any) {
      if (error?.statusCode === 404) {
        containerId = null;
      } else {
        throw error;
      }
    }
  }

  const containerName = `project-${project.id}`;
  const projectPath = path.resolve("./data/projects", project.id);

  try {
    await fs.mkdir(projectPath, { recursive: true });

    const projectContainer = await docker.createContainer({
      Image: "launch-base:latest",
      name: containerName,
      HostConfig: {
        Binds: [`${projectPath}:/workspace:Z`], // Read and write getting blocked by Fedora
      },
    });

    await projectContainer.start();
    containerId = projectContainer.id;
  } catch (error) {
    if (isContainerNameConflict(error)) {
      containerId = await resolveExistingContainer(containerName);
    } else {
      throw error;
    }
  }

  await prisma.project.update({
    where: { id: project.id },
    data: { containerId },
  });

  return containerId;
}

function isContainerNameConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    (error as { statusCode: number }).statusCode === 409
  );
}

async function resolveExistingContainer(
  containerName: string,
): Promise<string> {
  const containers = await docker.listContainers({
    all: true,
    filters: { name: [containerName] },
  });

  const existingContainer = containers.find((container) =>
    container.Names.includes(`/${containerName}`),
  );

  if (!existingContainer) {
    throw new Error(
      `Container name error for ${containerName} but no container with the same name was found.`,
    );
  }

  const projectContainer = docker.getContainer(existingContainer.Id);

  if (existingContainer.State !== "running") {
    await projectContainer.start();
  }

  return existingContainer.Id;
}
