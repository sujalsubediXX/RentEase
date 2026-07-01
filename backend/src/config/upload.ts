import multer from "multer";
import path from "path";
import type { Request, Response, NextFunction } from "express";

const storageCategories = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/categories");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
        file.originalname
      )}`
    );
  },
});

const storageItems = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/items");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
        file.originalname
      )}`
    );
  },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};




const storageKycImage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/kyc"),
   filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
        file.originalname
      )}`
    );
  },
});

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

const fileFilterKyc: multer.Options["fileFilter"] = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or PDF files are allowed"));
  }
};

const uploadkyc = multer({
  storage: storageKycImage,
  fileFilter: fileFilterKyc,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});


const kycUpload = uploadkyc.fields([
  { name: "frontImage", maxCount: 1 },
  { name: "backImage", maxCount: 1 },
  { name: "selfieImage", maxCount: 1 },
]);

// Wrap multer errors into a consistent JSON response instead of letting them crash/hang
export const handleKycUpload = (req: Request, res: Response, next: NextFunction) => {
  kycUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Each file must be under 5MB" });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};








export const uploadItem = multer({
  storage: storageItems,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});
export const uploadCategory = multer({
  storage: storageCategories,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});