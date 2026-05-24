import { Router } from "express";

const router: Router = Router();

// General project routes

router.get("/", (req, res) => {
  res.json({ msg: "Get all projects user has access to" });
});

router.post("/", (req, res) => {
  res.json({ msg: "Create a project for the user" });
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
