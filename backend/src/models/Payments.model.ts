import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        transactionId: {
            type: String,
            required: true,
            unique: true
        },
        rentalIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rentals'
        }],
        paymentMethod: {
            type: String,
            enum: ['cod', 'digital', 'esewa'],
            default: 'esewa'
        },
        paymentDetails: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        // eSewa specific fields
        esewaSignature: {
            type: String
        },
        esewaTransactionUuid: {
            type: String
        },
        productCode: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Payments', paymentSchema);