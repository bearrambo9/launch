import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { ProjectRole } from "../generated/prisma/index.js";

const router: Router = Router();

router.use(authenticateToken);

// General project routes

router.get("/", (req, res) => {
  res.json({ msg: "Get all projects user has access to" });
});

router.post("/", async (req, res) => {
  const { name, isPublic } = req.body;

  if (!name || typeof name !== "string" || typeof isPublic !== "boolean") {
    return res
      .status(400)
      .json({ error: "Project name and publicity are required." });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: name,
        public: isPublic,
        ownerId: req.user,
        members: {
          create: { userId: req.user, role: ProjectRole.OWNER },
        },
      },
    });

    console.log(project);

    return res.json({ message: "testing" });
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
