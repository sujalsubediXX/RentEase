export type ComplaintCategory =
  | "damage"
  | "late_return"
  | "missing_parts"
  | "uncleaned"
  | "other";

export type ComplaintStatus = "pending" | "under_review" | "resolved" | "dismissed";

export interface ItemComplaint {
  _id: string;
  rentalId: string;
  itemId: { _id: string; title: string } | string;
  ownerId: { _id: string; fullName: string; profileImage?: string } | string;
  renterId: { _id: string; fullName: string; profileImage?: string } | string;
  category: ComplaintCategory;
  description: string;
  evidenceImages: string[];
  status: ComplaintStatus;
  resolutionNote?: string;
  createdAt: string;
  updateAt:string;
}