import mongoose from "mongoose";

const kycVerificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        personalInfo: {
            fullName: { type: String, required: true, trim: true },
            dob: { type: Date, required: true },
            gender: {
                type: String,
                enum: ["Male", "Female", "Other", "Prefer not to say"],
                required: true,
            },
            nationality: { type: String, required: true },
            address: { type: String, required: true, trim: true },
            city: { type: String, required: true },
            phone: { type: String, required: true },
            email: { type: String, required: true, lowercase: true, trim: true },
        },
        documentInfo: {
            docType: {
                type: String,
                enum: ["Citizenship Certificate", "Passport", "National ID Card", "Driving License"],
                required: true,
            },
            docNumber: { type: String, required: true, trim: true },
            issuedDate: { type: Date, required: true },
            expiryDate: { type: Date },
            frontImage: { type: String, required: true }, // stored file path/url
            backImage: { type: String }, // only present for Citizenship Certificate
        },
        selfieImage: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending","under review", "verified", "rejected"],
            default: "pending",
        },
        rejectionReason: { type: String },
        submittedAt: { type: Date, default: Date.now },
        reviewedAt: { type: Date },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);



export default mongoose.model("KYCVerification", kycVerificationSchema)