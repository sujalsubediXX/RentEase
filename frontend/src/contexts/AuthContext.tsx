import {
  createContext,
  useState,
  useEffect
} from "react";
import type { ReactNode } from "react";
import { authService } from "../services/auth.services";
import type {
  LoginCredentials,
  RegisterData,
  User,
} from "../types/auth.types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const checkAuth = async () => {
    try {
      const token = authService.getAccessToken();

      if (token) {
        const userData = await authService.getCurrentUser();
        if (userData) {          // ✅ only set user if we actually got one
          setUser(userData);
        } else {
          authService.logout();  // token exists but /me failed — clear it
        }
      }
    } catch (err) {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  checkAuth();
}, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);
      setUser(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await authService.logout();
      setUser(null);
      window.location.href = "/"; // FIX: replace navigate
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};