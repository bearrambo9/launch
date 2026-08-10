import Docker from "dockerode";
import { prisma } from "../lib/prisma.js";
import type { Project } from "../generated/prisma/index.js";
import { WebSocket } from "ws";

const docker = new Docker();

export async function handleTerminalConnection(ws: WebSocket) {
  const userId = (ws as any).user;
  const containerId = (ws as any).containerId;

  try {
    const terminalContainer = docker.getContainer(containerId);

    const exec = await terminalContainer.exec({
      Cmd: ["bash"],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    });

    const stream = await exec.start({
      hijack: true,
      stdin: true,
    });

    stream.on("data", (chunk: Buffer) => {
      ws.send(chunk.toString());
    });

    ws.on("message", (msg: string) => {
      stream.write(msg);
    });

    ws.on("close", () => {
      stream.end();
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
    const projectContainer = docker.getContainer(containerId);
    const info = await projectContainer.inspect();

    if (!info.State.Running) {
      await projectContainer.start();
    }

    return containerId;
  }

  const containerName = `project-${project.id}`;

  try {
    const projectContainer = await docker.createContainer({
      Image: "launch-base:latest",
      name: containerName,
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
