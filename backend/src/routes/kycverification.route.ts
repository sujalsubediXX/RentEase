import Router from "express";

import { authMiddleware } from "../middleware/auth.middleware.ts";
import { handleKycUpload } from "../config/upload.ts";

import {
  submitKYC,
  getMyKYCStatus,
  getAllKYCs,
  getKYCById,
  reviewKYC,
} from "../controllers/kycverification.controller.ts";

const router = Router();


router.use(authMiddleware);
// User routes
router.post("/submit", authMiddleware, handleKycUpload, submitKYC);
router.get("/status", authMiddleware, getMyKYCStatus);

// Admin routes
router.get("/admin", authMiddleware, getAllKYCs);
router.get("/admin/:id", authMiddleware, getKYCById);
router.patch("/admin/:id/review", authMiddleware, reviewKYC);

export default router;

