import fs from "fs";
import type { Request, Response } from "express";
import KYC from "../models/KycVerification.model.ts";
import User from "../models/Users.model.ts";
import { validateKYCSubmission } from "../utils/kycValidation.ts";


interface UploadedFiles {
  frontImage?: Express.Multer.File[];
  backImage?: Express.Multer.File[];
  selfieImage?: Express.Multer.File[];
  [fieldname: string]: Express.Multer.File[] | undefined;
}


const cleanupFiles = (files?: UploadedFiles | Express.Multer.File[]) => {
  if (!files) return;

  const fileList = Array.isArray(files)
    ? files
    : Object.values(files).flatMap((arr) => arr ?? []);

  fileList.forEach((file) => {
    fs.unlink(file.path, () => { });
  });
};

const isUploadedFiles = (files?: UploadedFiles | Express.Multer.File[]): files is UploadedFiles =>
  !!files && !Array.isArray(files);

// ---------------- CONTROLLER ----------------

export const submitKYC = async (req: Request, res: Response) => {
  const files = req.files as UploadedFiles | Express.Multer.File[] | undefined;

  if (!isUploadedFiles(files)) {
    cleanupFiles(files);
    return res.status(400).json({
      success: false,
      message: "Files are required",
    });
  }

  try {
    const {userId} = (req as any).params;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }


    const existing = await KYC.findOne({ user: userId });

    if (existing && existing.status !== "rejected") {
      cleanupFiles(files);

      return res.status(400).json({
        success: false,
        message:
          existing.status === "under_review"
            ? "You already have a KYC submission under review"
            : "You are already verified",
      });
    }

    if (!files) {
      return res.status(400).json({
        success: false,
        message: "Files are required",
      });
    }

    const { valid, errors } = validateKYCSubmission(req.body, files);

    if (!valid) {
      cleanupFiles(files);

      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const {
      fullName,
      dob,
      gender,
      nationality,
      phone,
      email,
      address,
      city,
      docType,
      docNumber,
      issuedDate,
      expiryDate,
    } = req.body;

    const frontImage = files.frontImage?.[0]?.path;
    const backImage = files.backImage?.[0]?.path;
    const selfieImage = files.selfieImage?.[0]?.path;

    if (!frontImage || !selfieImage) {
      cleanupFiles(files);

      return res.status(400).json({
        success: false,
        message: "Required images are missing.",
      });
    }

    const kycData = {
      user: userId,

      personalInfo: {
        fullName,
        dob,
        gender,
        nationality,
        phone,
        email,
        address,
        city,
      },

      documentInfo: {
        docType,
        docNumber,
        issuedDate,
        expiryDate: expiryDate || null,
        frontImage,
        backImage: backImage || null,
      },

      selfieImage,

      status: "under_review" as const,

      submittedAt: new Date(),
    };

    let kycDoc;

    if (existing) {
      cleanupFiles({
        frontImage: existing.documentInfo?.frontImage
          ? [{ path: existing.documentInfo.frontImage } as Express.Multer.File]
          : [],
        backImage: existing.documentInfo?.backImage
          ? [{ path: existing.documentInfo.backImage } as Express.Multer.File]
          : [],
        selfieImage: existing.selfieImage
          ? [{ path: existing.selfieImage } as Express.Multer.File]
          : [],
      });

      Object.assign(existing, kycData);

      existing.rejectionReason = null;
      existing.reviewedAt = null;
      existing.reviewedBy = null;

      kycDoc = await existing.save();
    } else {
      kycDoc = await KYC.create(kycData);
    }

    await User.findByIdAndUpdate(userId, {
      kycStatus: "under_review",
    });

    return res.status(201).json({
      success: true,
      message:
        "KYC submitted successfully. Verification typically takes 1-2 business days.",
      data: {
        id: kycDoc._id,
        status: kycDoc.status,
      },
    });
  } catch (err) {
    cleanupFiles(files);

    console.error("KYC submission error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while submitting KYC",
    });
  }
};
// GET /api/kyc/status
export const getMyKYCStatus = async (req: Request, res: Response) => {
  try {
     const {userId} = (req as any).params;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }


    const kyc = await KYC.findOne({ user: userId }).select(
      "status rejectionReason submittedAt reviewedAt documentInfo.docType"
    );
    if (!kyc) {
      return res.status(404).json({ success: false, message: "No KYC submission found" });
    }
    return res.status(200).json({ success: true, data: kyc });
  } catch (err) {
    console.error("Get KYC status error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
 
type KycStatus = "pending" | "under_review" | "verified" | "rejected";
type KycQueryStatus = "pending" | "under_review" | "verified" | "rejected";

const VALID_STATUS_FILTERS: (KycQueryStatus | "all")[] = ["all", "pending", "under_review", "verified", "rejected"];
const STATUS_QUERY_TO_DB_STATUS: Record<KycQueryStatus, KycStatus> = {
  pending: "pending",
  under_review: "under_review",
  verified: "verified",
  rejected: "rejected",
};
 
// GET /api/kyc/admin?status=pending|under_review|verified|rejected|all
export const getAllKYCs = async (req: Request, res: Response) => {
  try {
        const { status } = req.query;

    // Build filter dynamically
    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }
 
    
    const kycs = await KYC.find(filter)
      .populate("user", "name email")
      .select(
        "user personalInfo.fullName personalInfo.phone documentInfo.docType status submittedAt reviewedAt"
      )
      .sort({ submittedAt: -1 });
 
      const counts = {
      all: await KYC.countDocuments(),
      pending: await KYC.countDocuments({ status: "pending" }),
      under_review: await KYC.countDocuments({ status: "under_review" }),
      verified: await KYC.countDocuments({ status: "verified" }),
      rejected: await KYC.countDocuments({ status: "rejected" }),
    };
    return res.status(200).json({
      success: true,
      data: kycs,
      counts,
    });
  } catch (err) {
    console.error("Get all KYCs error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
 
// GET /api/kyc/admin/:id
// Auto-promotes a "pending" submission to "under_review" the first time an
// admin opens it — gives a live signal that someone's actively looking at it.
export const getKYCById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
 
    const kyc = await KYC.findById(id).populate("user", "name email phone");
    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC submission not found" });
    }
 
    if (kyc.status === "pending") {
      kyc.status = "under_review";
      await kyc.save();
    }
 
    return res.status(200).json({ success: true, data: kyc });
  } catch (err) {
    console.error("Get KYC by id error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
 
// PATCH /api/kyc/admin/:id/review
export const reviewKYC = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, rejectionReason } = req.body as { decision: string; rejectionReason?: string };
 
    if (!["verified", "rejected"].includes(decision)) {
      return res.status(400).json({ success: false, message: "Decision must be 'verified' or 'rejected'" });
    }
    if (decision === "rejected" && !rejectionReason?.trim()) {
      return res.status(400).json({ success: false, message: "A rejection reason is required" });
    }
 
    const kyc = await KYC.findById(id);
    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC submission not found" });
    }
    if (kyc.status === "verified" || kyc.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: `This submission was already ${kyc.status === "verified" ? "approved" : "rejected"}`,
      });
    }
 
    kyc.status = decision as "verified" | "rejected";
    kyc.rejectionReason = decision === "rejected" ? rejectionReason!.trim() : null;
    kyc.reviewedAt = new Date();
    await kyc.save();
 
    await User.findByIdAndUpdate(kyc.user, { kycStatus: decision });
    return res.status(200).json({
      success: true,
      message: decision === "verified" ? "KYC approved" : "KYC rejected",
      data: kyc,
    });
  } catch (err) {
    console.error("Review KYC error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};