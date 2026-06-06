import mongoose from "mongoose";

const itemRatingSchema = new mongoose.Schema(
    {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        review: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        // Compound index to ensure one rating per user per item
        indexes: [
            {
                unique: true,
                fields: ['itemId', 'userId']
            }
        ]
    }
);

export default mongoose.model('ItemRating', itemRatingSchema);