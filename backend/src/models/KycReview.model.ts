import mongoose from "mongoose";

const kycVerificationReviewSchema = new mongoose.Schema(
    {
        kycVerificationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'KYCVerification',
            required: true
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['approved', 'rejected'],
            required: true
        },
        comments: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('KYCVerificationReview', kycVerificationReviewSchema);