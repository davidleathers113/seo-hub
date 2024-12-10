
// Unit tests for: ProtectedRoute

import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { render, screen } from '@testing-library/react';
import { Navigate, useLocation } from "react-router-dom";
import { ProtectedRoute } from '../ProtectedRoute';



// Mocking dependencies
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Navigate: jest.fn(() => null),
  useLocation: jest.fn(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/components/Layout", () => ({
  Layout: jest.fn(({ children }) => <div>{children}</div>),
}));

// MockReactNode type
type MockReactNode = {
  type: string;
  props: any;
  key: string | null;
};

// Test suite for ProtectedRoute
describe('ProtectedRoute() ProtectedRoute method', () => {
  let mockChildren: MockReactNode;

  beforeEach(() => {
    mockChildren = { type: 'div', props: { children: 'Protected Content' }, key: null } as any;
  });

  describe('Happy paths', () => {
    it('should render loading state when isLoading is true', () => {
      // Arrange
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false, isLoading: true } as any);
      (useLocation as jest.Mock).mockReturnValue({ pathname: '/protected' } as any);

      // Act
      render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render children when user is authenticated', () => {
      // Arrange
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true, isLoading: false } as any);
      (useLocation as jest.Mock).mockReturnValue({ pathname: '/protected' } as any);

      // Act
      render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);

      // Assert
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should redirect to login when user is not authenticated', () => {
      // Arrange
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false, isLoading: false } as any);
      const mockLocation = { pathname: '/protected' };
      (useLocation as jest.Mock).mockReturnValue(mockLocation as any);

      // Act
      render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);

      // Assert
      expect(Navigate).toHaveBeenCalledWith({ to: '/login', state: { from: mockLocation }, replace: true }, {});
    });

    it('should handle edge case where children is null', () => {
      // Arrange
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true, isLoading: false } as any);
      (useLocation as jest.Mock).mockReturnValue({ pathname: '/protected' } as any);

      // Act
      render(<ProtectedRoute>{null as any}</ProtectedRoute>);

      // Assert
      expect(Layout).toHaveBeenCalledWith({ children: null }, {});
    });
  });
});

// End of unit tests for: ProtectedRoute
