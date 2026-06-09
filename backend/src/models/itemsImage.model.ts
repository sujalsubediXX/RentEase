import mongoose from "mongoose";

const itemImageSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('ItemImage', itemImageSchema);