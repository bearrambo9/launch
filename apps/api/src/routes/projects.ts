import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import containerRouter from "../routes/container.js";

const router: Router = Router();

router.use(authenticateToken);
router.use("/:id/container", containerRouter);

export default router;
