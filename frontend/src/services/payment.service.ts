import axios from "axios";
import API_BASE_URL from "../config/api";
import { authService } from "./auth.services";

export type PaymentStatus = "pending" | "completed" | "failed";

export interface PaymentRecord {
  _id: string;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  rentalIds?: string[];
  paymentDetails?: Record<string, any>;
  esewaTransactionUuid?: string;
  productCode?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: {
    _id?: string;
    fullName?: string;
    email?: string;
  } | string;
}

export const getAdminPayments = async (): Promise<PaymentRecord[]> => {
  const token = authService.getAccessToken();

  if (!token) {
    throw new Error("Please login to view payments");
  }

  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;

  const response = await axios.get(`${baseUrl}/payment/getpayments`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data.data || response.data || [];
};