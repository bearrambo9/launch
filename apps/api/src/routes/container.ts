import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { initializeProjectContainer } from "../services/docker.service.js";

const router: Router = Router({ mergeParams: true });

router.post("/initialize", async (req, res) => {
  const projectId = req.body.projectId;

  if (!projectId) return res.status(400).json({ error: "No project ID." });

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
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

export default router;
