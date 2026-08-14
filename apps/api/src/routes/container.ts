import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { initializeProjectContainer } from "../services/docker.service.js";
import * as fs from "fs/promises";
import path from "path";

const router: Router = Router({ mergeParams: true });

router.post("/initialize", async (req, res) => {
  const { id: projectId } = req.params as { id: string };

  if (!projectId) return res.status(400).json({ error: "No project ID." });

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      ownerId: req.user,
    },
  });

  if (!project) return res.status(404).json({ error: "No project found." });

  try {
    const containerId = await initializeProjectContainer(project);

    return res.status(200).json({ success: true, containerId });
  } catch (error) {
    console.log(`Error when initializing container: ${error}`);

    return res.status(500).json({ error: "Failed to initialize environment." });
  }
});

router.get("/files/*path", async (req, res) => {
  const { id: projectId } = req.params as unknown as { id: string };

  if (!projectId) return res.status(400).json({ error: "No project ID." });

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      ownerId: req.user,
    },
  });

  if (!project) return res.status(404).json({ error: "No project found." });

  const rawPath = req.params.path;
  const relativePath = Array.isArray(rawPath) ? rawPath.join("/") : rawPath;

  if (!relativePath) return res.status(400).json({ error: "No path." });

  const projectRoot = path.resolve("./data/projects", project.id);
  const filePath = path.resolve(projectRoot, relativePath);

  if (!filePath.startsWith(projectRoot)) {
    return res.status(400).json({ error: "Invalid path." });
  }

  console.log(filePath);

  try {
    const data = await fs.readFile(filePath, "utf-8");
    return res.status(200).send(data);
  } catch (error) {
    return res.status(404).json({ error: "File not found." });
  }
});

export default router;
