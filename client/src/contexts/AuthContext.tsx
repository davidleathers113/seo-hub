import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { login as apiLogin, register as apiRegister } from "@/api/auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.data.error || "Login failed");
      }
    } catch (error) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await apiRegister(email, password);
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.data.error || "Registration failed");
      }
    } catch (error) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      register,
      logout
    }}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
