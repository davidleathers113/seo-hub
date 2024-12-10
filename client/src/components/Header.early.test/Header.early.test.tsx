
// Unit tests for: Header

import { useAuth } from "@/contexts/AuthContext";
import { fireEvent, render, screen } from '@testing-library/react';
import { useNavigate } from "react-router-dom";
import { Header } from '../Header';
import "@testing-library/jest-dom";

// Mocking dependencies
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe('Header() Header method', () => {
  const mockLogout = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ logout: mockLogout });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should render the Header component with logo and title', () => {
      // Test to ensure the Header component renders correctly with logo and title
      render(<Header />);
      expect(screen.getByAltText('SEO Content Hub')).toBeInTheDocument();
      expect(screen.getByText('SEO Content Hub')).toBeInTheDocument();
    });

    it('should render the ThemeToggle component', () => {
      // Test to ensure the ThemeToggle component is rendered
      render(<Header />);
      expect(screen.getByRole('button', { name: /theme toggle/i })).toBeInTheDocument();
    });

    it('should render the user menu button', () => {
      // Test to ensure the user menu button is rendered
      render(<Header />);
      expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
    });

    it('should call logout and navigate to login on logout click', () => {
      // Test to ensure logout function is called and navigation to login occurs on logout click
      render(<Header />);
      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
      fireEvent.click(screen.getByText('Logout'));
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Edge Cases', () => {
    it('should handle logout function not being available', () => {
      // Test to ensure the component handles the absence of the logout function gracefully
      (useAuth as jest.Mock).mockReturnValue({ logout: undefined });
      render(<Header />);
      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
      fireEvent.click(screen.getByText('Logout'));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should handle navigate function not being available', () => {
      // Test to ensure the component handles the absence of the navigate function gracefully
      (useNavigate as jest.Mock).mockReturnValue(undefined);
      render(<Header />);
      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
      fireEvent.click(screen.getByText('Logout'));
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});

// End of unit tests for: Header
