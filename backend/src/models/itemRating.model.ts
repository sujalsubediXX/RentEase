
// models/Review.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    rentalID: mongoose.Types.ObjectId;   // which booking this review is tied to
    itemID: mongoose.Types.ObjectId;
    userID: mongoose.Types.ObjectId; // renter
    ownerID: mongoose.Types.ObjectId;  
    rating: number;                    // 1-5
    message: string;
    createdAt: Date;
}

const reviewSchema = new Schema<IReview>({
    rentalID: { type: Schema.Types.ObjectId, ref: 'Rentals', required: true, unique: true }, // one review per booking
    itemID: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ownerID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true });

export default mongoose.model<IReview>('ItemRating', reviewSchema);
