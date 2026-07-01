import Router from "express";

// Adjust these import paths/names to match your existing auth middleware
import {  authMiddleware } from "../middleware/auth.middleware.ts";
import { handleKycUpload } from "../config/upload.ts";

import {
  submitKYC,
  getMyKYCStatus,
  getPendingKYCs,
  reviewKYC,
} from "../controllers/kycverification.controller.ts";

const router = Router();

// User routes
router.post("/submit/:userId", handleKycUpload, submitKYC);
router.get("/status/:userId", getMyKYCStatus);

// Admin routes
router.get("/admin/pending", authMiddleware, getPendingKYCs);
router.patch("/admin/:id/review", authMiddleware, reviewKYC);

export default router;

