export type UserRole = 'renter' | 'owner' | 'admin';

export interface LoginCredentials {
  email: string | undefined;
  password: string | undefined;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  address: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  address: string;
  profileImage:string;
  isKycVerified: boolean;
  profilePicture?: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

// Also export a type for API error responses if needed
export interface ApiError {
  message: string;
  status?: number;
  errors?: string[];
}