
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  items: Types.ObjectId[]; // product/item IDs only
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IWishlist>(
  "Wishlist",
  WishlistSchema
);