import Router from "express";


import { handleKycUpload } from "../config/upload.ts";

import {
  submitKYC,
  getMyKYCStatus,
  getAllKYCs,
  getKYCById,
  reviewKYC,
} from "../controllers/kycverification.controller.ts";

const router = Router();

// User routes
router.post("/submit/:userId", handleKycUpload, submitKYC);
router.get("/status/:userId", getMyKYCStatus);

// Admin routes
router.get("/admin",  getAllKYCs);
router.get("/admin/:id",  getKYCById);
router.patch("/admin/:id/review", reviewKYC);

export default router;

