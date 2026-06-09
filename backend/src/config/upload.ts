import multer from "multer";
import path from "path";

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