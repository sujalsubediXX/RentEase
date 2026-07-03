import axios from "axios";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from "../types/auth.types";

import API_BASE_URL from "../config/api";

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    this.token = localStorage.getItem("accessToken");
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // -------------------------
  // LOGIN
  // -------------------------
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/login`,
        {
          email: credentials.email,
          password: credentials.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (!data?.success) {
        throw new Error(data?.message || "Login failed");
      }

      const user: User = {
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
        role: data.user.role,
        profileImage:data.user.profileImage,
        address: data.user.address,
        isKycVerified: data.user.kycStatus === "approved",
        createdAt: new Date(),
      };

      this.setTokens(data.token, data.refreshToken);

      return {
        user,
        token: data.token,
        refreshToken: data.refreshToken,
      };
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || error.message || "Login failed"
      );
    }
  }

  

  // -------------------------
  // REGISTER
  // -------------------------
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/register`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (!data?.success) {
        throw new Error(data?.message || "Registration failed");
      }

      // auto login
      return await this.login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Registration failed"
      );
    }
  }

  // -------------------------
  // LOGOUT
  // -------------------------
  async logout(): Promise<void> {
    this.clearTokens();
  }

  // -------------------------
  // GET CURRENT USER (/me)
  // -------------------------
async getCurrentUser(): Promise<User | null> {
  const token = this.getAccessToken();
  if (!token) return null;

  try {
    const response = await axios.get(`${API_BASE_URL}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = response.data;

    if (!data?.id && !data?._id) return null;

    return {
      id: data.id ?? data._id,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: data.role,
      profileImage: data.profileImage,
      address: data.address,
      kycStatus: data.kycStatus,
      createdAt: data.createdAt,
    };
  } catch (err: any) {
    if (err?.response?.status === 401) {
      this.clearTokens();
    }
    return null;
  }
}

// Add these new methods to fetch rentals, listings, wishlist
async getUserRentals(): Promise<any[]> {
  const token = this.getAccessToken();
  if (!token) return [];

  try {
    const response = await axios.get(`${API_BASE_URL}/user/rentals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.rentals || [];
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return [];
  }
}

async getUserListings(): Promise<any[]> {
  const token = this.getAccessToken();
  if (!token) return [];

  try {
    const response = await axios.get(`${API_BASE_URL}/user/listings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.listings || [];
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
}


  // -------------------------
  // TOKEN GETTER
  // -------------------------
  getAccessToken(): string | null {
    return this.token || localStorage.getItem("accessToken");
  }

  // -------------------------
  // SET TOKENS
  // -------------------------
  private setTokens(accessToken: string, refreshToken: string) {
    this.token = accessToken;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  // -------------------------
  // CLEAR TOKENS
  // -------------------------
  private clearTokens() {
    this.token = null;

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
  }
}




export const requestPasswordReset = async (email: string) => {
  const { data } = await axios.post(`${API_BASE_URL}/user/forgot-password`, { email });
  return data;
};

export const resetPasswordWithToken = async (token: string, password: string) => {
  const { data } = await axios.post(`${API_BASE_URL}/user/reset-password/${token}`, { password });
  return data;
};

export const authService = AuthService.getInstance();