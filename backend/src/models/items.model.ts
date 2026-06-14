import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    condition: {
      type: String,
      enum: ["new", "like new", "used"],
      default: "used"
    },

    availability: {
      type: String,
      enum: ["available", "unavailable", "rented"],
      default: "available"
    },

    securityDeposit: {
      type: Number,
      default: 0
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1
    },

    isApproved: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
itemSchema.virtual("images", {
  ref: "ItemImage",
  localField: "_id",
  foreignField: "itemId"
});

itemSchema.set("toJSON", { virtuals: true });
itemSchema.set("toObject", { virtuals: true });
export default mongoose.model("Item", itemSchema);