import type{ LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth.types';

// Mock user database
const MOCK_USERS: User[] = [
  {
    id: '1',
    fullName: 'Demo User',
    email: 'demo@rentease.com',
    phoneNumber: '9812345678',
    role: 'renter',
    address: 'Kathmandu, Nepal',
    isKycVerified: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    fullName: 'Test Owner',
    email: 'owner@rentease.com',
    phoneNumber: '9823456789',
    role: 'owner',
    address: 'Lalitpur, Nepal',
    isKycVerified: true,
    createdAt: new Date(),
  },
];

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    this.token = localStorage.getItem('accessToken');
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Login attempt:', credentials.email);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = MOCK_USERS.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('User not found. Please check your email or register first.');
    }
    
    // Demo password check
    if (credentials.password !== 'Demo@123') {
      throw new Error('Invalid password. Demo password is "Demo@123"');
    }
    
    const token = 'mock-jwt-token-' + Date.now();
    const refreshToken = 'mock-refresh-token-' + Date.now();
    
    this.setTokens(token, refreshToken);
    localStorage.setItem('userEmail', user.email);
    
    console.log('Login successful:', user.email);
    
    return { user, token, refreshToken };
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    console.log('Register attempt:', userData.email);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    if (MOCK_USERS.some(u => u.email === userData.email)) {
      throw new Error('User with this email already exists. Please login instead.');
    }
    
    const newUser: User = {
      id: String(MOCK_USERS.length + 1),
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      address: userData.address,
      isKycVerified: false,
      createdAt: new Date(),
    };
    
    const token = 'mock-jwt-token-' + Date.now();
    const refreshToken = 'mock-refresh-token-' + Date.now();
    
    this.setTokens(token, refreshToken);
    localStorage.setItem('userEmail', newUser.email);
    
    // Add to mock database
    MOCK_USERS.push(newUser);
    
    console.log('Registration successful:', newUser.email);
    
    return { user: newUser, token, refreshToken };
  }

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.clearTokens();
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getAccessToken();
    if (!token) return null;
    
    const email = localStorage.getItem('userEmail');
    const user = MOCK_USERS.find(u => u.email === email);
    return user || null;
  }

  getAccessToken(): string | null {
    return this.token;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.token = accessToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens(): void {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
  }
}

export const authService = AuthService.getInstance();