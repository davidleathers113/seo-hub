import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout } from "../api/auth";
import { ErrorBoundary } from "../components/ErrorBoundary";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Create a properly formatted JWT token for development
// This token is signed with the fallback secret key 'your-secret-key'
const DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJlMmZkNmM4LWU5NzQtNDkyNy1hYjRlLWQxODJlYzNjMzY5YiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTcwMjU3MjgwMCwiZXhwIjoxNzAyNjU5MjAwfQ.Ry9ZXWEbJwgwqkIZF4nXkwPXk8LJzXtBxm5xZ5Iq-Oc";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state based on token existence
    const token = localStorage.getItem('token');
    if (!token) {
      // For development, set the dev token if no token exists
      localStorage.setItem('token', DEV_TOKEN);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // For development, always succeed
      localStorage.setItem("token", DEV_TOKEN);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      // For development, always succeed
      localStorage.setItem("token", DEV_TOKEN);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

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
