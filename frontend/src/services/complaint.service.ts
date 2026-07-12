import { authService } from "./auth.services"; 
import API_BASE_URL from "../config/api";
import type { ComplaintCategory, ItemComplaint } from "../types/complaint";

const authHeader = () => ({
  Authorization: `Bearer ${authService.getAccessToken()}`,
});

export const complaintService = {
  fileComplaint: async (
    rentalId: string,
    category: ComplaintCategory,
    description: string,
    evidenceImages: File[]
  ) => {
    const formData = new FormData();
    formData.append("rentalId", rentalId);
    formData.append("category", category);
    formData.append("description", description);
    evidenceImages.forEach((file) => formData.append("evidenceImages", file));

    const res = await fetch(`${API_BASE_URL}/api/complaints`, {
      method: "POST",
      headers: authHeader(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to file complaint");
    }
    return res.json();
  },

  getOwnerComplaints: async (ownerId: string): Promise<ItemComplaint[]> => {
    const res = await fetch(`${API_BASE_URL}/api/complaints/owner/${ownerId}`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to fetch complaints");
    const data = await res.json();
    return data.complaints;
  },

  getAllComplaints: async (status?: string): Promise<ItemComplaint[]> => {
    const query = status && status !== "all" ? `?status=${status}` : "";
    const res = await fetch(`${API_BASE_URL}/api/complaints/admin/all${query}`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to fetch complaints");
    const data = await res.json();
    return data.complaints;
  },

  updateComplaintStatus: async (
    id: string,
    status: string,
    resolutionNote: string
  ) => {
    const res = await fetch(`${API_BASE_URL}/api/complaints/admin/${id}/status`, {
      method: "PUT",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolutionNote }),
    });
    if (!res.ok) throw new Error("Failed to update complaint");
    return res.json();
  },
};