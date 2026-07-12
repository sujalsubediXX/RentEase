import mongoose, { Schema, Document, Types } from "mongoose";

export type ComplaintCategory =
  | "damage"
  | "late_return"
  | "missing_parts"
  | "uncleaned"
  | "other";

export type ComplaintStatus = "pending" | "under_review" | "resolved" | "dismissed";

export interface IItemComplaint extends Document {
  rentalId: Types.ObjectId;
  itemId: Types.ObjectId;
  ownerId: Types.ObjectId;
  renterId: Types.ObjectId;
  category: ComplaintCategory;
  description: string;
  evidenceImages: string[];
  status: ComplaintStatus;
  resolutionNote?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const itemComplaintSchema = new Schema<IItemComplaint>(
  {
    rentalId: { type: Schema.Types.ObjectId, ref: "Rentals", required: true },
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    renterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["damage", "late_return", "missing_parts", "uncleaned", "other"],
      required: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    evidenceImages: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "dismissed"],
      default: "pending",
    },
    resolutionNote: { type: String, trim: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

itemComplaintSchema.index({ rentalId: 1, ownerId: 1 }, { unique: true });

export default mongoose.model<IItemComplaint>("ItemComplaint", itemComplaintSchema);