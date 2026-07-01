const PHONE_REGEX = /^(\+977-?)?9\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s.]+$/;

const VALID_DOC_TYPES = [
  "Citizenship Certificate",
  "Passport",
  "National ID Card",
  "Driving License",
];

const DOC_TYPES_REQUIRING_BACK = ["Citizenship Certificate"];

interface KYCBody {
  fullName?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  docType?: string;
  docNumber?: string;
  issuedDate?: string;
  expiryDate?: string;
}

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
}

interface UploadedFiles {
  frontImage?: UploadedFile[];
  backImage?: UploadedFile[];
  selfieImage?: UploadedFile[];
}

interface ValidationErrors {
  fullName?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  docType?: string;
  docNumber?: string;
  issuedDate?: string;
  expiryDate?: string;
  frontImage?: string;
  backImage?: string;
  selfieImage?: string;
}

export function calculateAge(dobStr: string): number {
  const dob = new Date(dobStr);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const monthDiff = today.getMonth() - dob.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

export function validateKYCSubmission(
  body: KYCBody,
  files: UploadedFiles
): { valid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

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
  } = body;

  // Personal Information

  const name = (fullName || "").trim();

  if (!name || name.length < 3) {
    errors.fullName = "Full name must be at least 3 characters";
  } else if (!NAME_REGEX.test(name)) {
    errors.fullName =
      "Full name can only contain letters, spaces and periods";
  }

  if (!dob || isNaN(Date.parse(dob))) {
    errors.dob = "A valid date of birth is required";
  } else {
    const dobDate = new Date(dob);

    if (dobDate > new Date()) {
      errors.dob = "Date of birth cannot be in the future";
    } else if (calculateAge(dob) < 18) {
      errors.dob = "User must be at least 18 years old";
    }
  }

  if (
    !gender ||
    !["Male", "Female", "Other", "Prefer not to say"].includes(gender)
  ) {
    errors.gender = "A valid gender selection is required";
  }

  if (!nationality) {
    errors.nationality = "Nationality is required";
  }

  const cleanPhone = (phone || "").replace(/\s/g, "");

  if (!cleanPhone || !PHONE_REGEX.test(cleanPhone)) {
    errors.phone =
      "A valid Nepal phone number is required (e.g. +977-98XXXXXXXX)";
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.email = "A valid email address is required";
  }

  if (!address || address.trim().length < 5) {
    errors.address = "Address is required (minimum 5 characters)";
  }

  if (!city) {
    errors.city = "City/District is required";
  }

  // Document Information

  if (!docType || !VALID_DOC_TYPES.includes(docType)) {
    errors.docType = "A valid document type is required";
  }

  if (!docNumber || docNumber.trim().length < 4) {
    errors.docNumber = "A valid document number is required";
  }

  if (!issuedDate || isNaN(Date.parse(issuedDate))) {
    errors.issuedDate = "A valid issue date is required";
  } else if (new Date(issuedDate) > new Date()) {
    errors.issuedDate = "Issue date cannot be in the future";
  }

  if (expiryDate) {
    if (isNaN(Date.parse(expiryDate))) {
      errors.expiryDate = "Invalid expiry date";
    } else {
      const expiry = new Date(expiryDate);

      if (issuedDate && expiry <= new Date(issuedDate)) {
        errors.expiryDate = "Expiry date must be after issue date";
      } else if (expiry < new Date()) {
        errors.expiryDate = "This document has expired";
      }
    }
  }

  // Images

  if (!files?.frontImage?.[0]) {
    errors.frontImage = "Front image is required";
  }

  if (
    docType &&
    DOC_TYPES_REQUIRING_BACK.includes(docType) &&
    !files?.backImage?.[0]
  ) {
    errors.backImage = `Back image is required for ${docType}`;
  }

  if (
    docType &&
    !DOC_TYPES_REQUIRING_BACK.includes(docType) &&
    files?.backImage?.[0]
  ) {
    errors.backImage = `Back image is not required for ${docType}`;
  }

  if (!files?.selfieImage?.[0]) {
    errors.selfieImage = "Selfie image is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}