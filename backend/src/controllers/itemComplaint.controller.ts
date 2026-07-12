import type { Request, Response } from "express";
import ItemComplaint from "../models/itemComplaint.model.ts";
import Rentals from "../models/Rentals.model.ts"; // adjust path to your actual file
import mongoose from "mongoose";

// POST /api/complaints  (owner only)
export const fileComplaint = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id;
    const { rentalId, category, description } = req.body;

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!rentalId || !category || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const rental = await Rentals.findById(rentalId).populate("itemId");
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    const item: any = rental.itemId;
    if (!item || item.ownerId.toString() !== ownerId) {
      return res.status(403).json({ message: "You do not own this item" });
    }
    if (rental.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Complaints can only be filed after rental completion" });
    }

    const existing = await ItemComplaint.findOne({ rentalId, ownerId });
    if (existing) {
      return res
        .status(409)
        .json({ message: "You have already filed a complaint for this rental" });
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const evidenceImages = files.map((f) => `/uploads/complaints/${f.filename}`);

    const complaint = await ItemComplaint.create({
      rentalId,
      itemId: item._id,
      ownerId,
      renterId: rental.userId, // renter is stored as userId on Rentals
      category,
      description,
      evidenceImages,
    });

    return res.status(201).json({ message: "Complaint filed successfully", complaint });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Complaint already exists for this rental" });
    }
    console.error("fileComplaint error:", err);
    return res.status(500).json({ message: "Failed to file complaint" });
  }
};

// GET /api/complaints/owner/:ownerId
export const getOwnerComplaints = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;
      if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const complaints = await ItemComplaint.find({ ownerId })
      .populate("itemId", "title")
      .populate("renterId", "fullName profileImage")
      .sort({ createdAt: -1 });
    return res.status(200).json({ complaints });
  } catch (err) {
    console.error("getOwnerComplaints error:", err);
    return res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

// GET /api/complaints/user/:userId  (renter's complaint history)
export const getRenterComplaints = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
      if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const complaints = await ItemComplaint.find({ renterId: userId })
      .select("category status createdAt")
      .sort({ createdAt: -1 });
    return res.status(200).json({ complaints, count: complaints.length });
  } catch (err) {
    console.error("getRenterComplaints error:", err);
    return res.status(500).json({ message: "Failed to fetch renter complaints" });
  }
};

// GET /api/admin/complaints
export const getAllComplaints = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;

    const complaints = await ItemComplaint.find(filter)
      .populate("itemId", "title")
      .populate("ownerId", "fullName profileImage")
      .populate("renterId", "fullName profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({ complaints });
  } catch (err) {
    console.error("getAllComplaints error:", err);
    return res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

// PUT /api/admin/complaints/:id/status
export const updateComplaintStatus = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const { status, resolutionNote } = req.body;
    const adminId = req.user?.id;

    // ensure id is a single string and defined
    if (!rawId || Array.isArray(rawId)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }
    const id = rawId as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }
    if (!["pending", "under_review", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const update: Record<string, unknown> = { status, resolutionNote };
    if (status === "resolved" || status === "dismissed") {
      update.resolvedBy = adminId;
      update.resolvedAt = new Date();
    }

    const complaint = await ItemComplaint.findByIdAndUpdate(id, update, { returnDocument: "after" });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.status(200).json({ message: "Complaint updated", complaint });
  } catch (err) {
    console.error("updateComplaintStatus error:", err);
    return res.status(500).json({ message: "Failed to update complaint" });
  }
};