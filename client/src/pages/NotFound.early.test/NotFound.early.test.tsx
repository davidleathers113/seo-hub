
// Unit tests for: NotFound

import { fireEvent, render, screen } from '@testing-library/react';
import { useNavigate } from "react-router-dom";
import { NotFound } from '../NotFound';
import "@testing-library/jest-dom";

// Mock the useNavigate hook from react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe('NotFound() NotFound method', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Reset the mock before each test
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the NotFound component with correct text and icon', () => {
      // Render the NotFound component
      render(<NotFound />);

      // Check if the icon is rendered
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();

      // Check if the heading is rendered
      expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeInTheDocument();

      // Check if the paragraph is rendered
      expect(screen.getByText(/The page you're looking for doesn't exist./i)).toBeInTheDocument();
    });

    it('should navigate to the dashboard when the button is clicked', () => {
      // Render the NotFound component
      render(<NotFound />);

      // Find the button and simulate a click
      const button = screen.getByRole('button', { name: /Go to Dashboard/i });
      fireEvent.click(button);

      // Check if navigate was called with the correct path
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle the absence of navigate function gracefully', () => {
      // Mock useNavigate to return undefined
      (useNavigate as jest.Mock).mockReturnValue(undefined);

      // Render the NotFound component
      render(<NotFound />);

      // Find the button and simulate a click
      const button = screen.getByRole('button', { name: /Go to Dashboard/i });
      fireEvent.click(button);

      // Since navigate is undefined, it should not throw an error
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

// End of unit tests for: NotFound
