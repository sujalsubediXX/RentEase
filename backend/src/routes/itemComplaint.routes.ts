import { Router } from "express";

import { complaintUpload } from "../middleware/complaintUpload.middleware.ts";
import {
  fileComplaint,
  getOwnerComplaints,
  getRenterComplaints,
  getAllComplaints,
  updateComplaintStatus,
} from "../controllers/itemComplaint.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = Router();

router.post("/", authMiddleware, complaintUpload.array("evidenceImages", 5), fileComplaint);
router.get("/owner/:ownerId", authMiddleware, getOwnerComplaints);
router.get("/user/:userId",authMiddleware,  getRenterComplaints);

// admin
router.get("/admin/all", authMiddleware,  getAllComplaints);
router.put("/admin/:id/status",  authMiddleware, updateComplaintStatus);

export default router;