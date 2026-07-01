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
          existing.status === "under review"
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

      status: "under review" as const,

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
      kycStatus: "under review",
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

// GET /api/kyc/admin/pending
export const getPendingKYCs = async (req: Request, res: Response) => {
  try {
    const kycs = await KYC.find({ status: "under review" })
      .populate("user", "name email")
      .sort({ submittedAt: 1 });
    return res.status(200).json({ success: true, data: kycs });
  } catch (err) {
    console.error("Get pending KYCs error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// PATCH /api/kyc/admin/:id/review
export const reviewKYC = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, rejectionReason } = req.body; // decision: "verified" | "rejected"

    if (!["verified", "rejected"].includes(decision)) {
      return res.status(400).json({ success: false, message: "Decision must be 'verified' or 'rejected'" });
    }
    if (decision === "rejected" && !rejectionReason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }

    const kyc = await KYC.findById(id);
    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC submission not found" });
    }

    kyc.status = decision;
    kyc.rejectionReason = decision === "rejected" ? rejectionReason : undefined;
    kyc.reviewedAt = new Date();
    kyc.reviewedBy = req.user._id;
    await kyc.save();

    await User.findByIdAndUpdate(kyc.user, { kycStatus: decision });

    return res.status(200).json({ success: true, message: `KYC ${decision}`, data: kyc });
  } catch (err) {
    console.error("Review KYC error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};