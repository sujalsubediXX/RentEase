import { Router } from "express";
import { getAdminDashboard } from "../controllers/admin.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = Router();

router.get("/dashboard", authMiddleware, getAdminDashboard);

export default router;