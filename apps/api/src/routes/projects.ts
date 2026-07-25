import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { ProjectRole } from "../generated/prisma/index.js";
import containerRouter from "../routes/container.js";

const router: Router = Router();

router.use(authenticateToken);
router.use("/:id/container", containerRouter);

// Get user projects

router.get("/", (req, res) => {
  res.json({ msg: "Get all projects user has access to" });
});

// Create project

router.post("/", async (req, res) => {
  const { name, public: isPublic, template } = req.body;

  if (!name || typeof name !== "string" || typeof isPublic !== "boolean") {
    return res
      .status(400)
      .json({ error: "Project name and publicity are required." });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        public: isPublic,
        ...(template != null && { template }),
        ownerId: req.user,
        members: {
          create: { userId: req.user, role: ProjectRole.OWNER },
        },
      },
    });

    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create project." });
  }
});

// Individual project routes

router.get("/:id", (req, res) => {
  res.json({ msg: `Fetch data for project: ${req.params.id}` });
});

router.patch("/:id", (req, res) => {
  res.json({ msg: `Updated project ${req.params.id}` });
});

router.delete("/:id", (req, res) => {
  res.json({ msg: `Delete project: ${req.params.id}` });
});

export default router;
