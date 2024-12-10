
// Unit tests for: SubpillarDetail

import { useToast } from "@/hooks/useToast";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useNavigate, useParams } from "react-router-dom";
import { SubpillarDetail } from '../SubpillarDetail';



// Mocking dependencies
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

describe('SubpillarDetail() SubpillarDetail method', () => {
  const mockNavigate = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({ subpillarId: '1' });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  describe('Happy Paths', () => {
    it('should render loading state initially', () => {
      // Test to ensure the loading state is displayed initially
      render(<SubpillarDetail />);
      expect(screen.getByText(/Loading subpillar details.../i)).toBeInTheDocument();
    });

    it('should display subpillar details after loading', async () => {
      // Test to ensure subpillar details are displayed after loading
      render(<SubpillarDetail />);
      await waitFor(() => {
        expect(screen.getByText(/On-Page SEO Fundamentals/i)).toBeInTheDocument();
        expect(screen.getByText(/Essential elements of on-page optimization/i)).toBeInTheDocument();
      });
    });

    it('should navigate back when "Back to Subpillars" button is clicked', async () => {
      // Test to ensure navigation occurs when the back button is clicked
      render(<SubpillarDetail />);
      await waitFor(() => screen.getByText(/Back to Subpillars/i));
      fireEvent.click(screen.getByText(/Back to Subpillars/i));
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should start content generation when "Generate Content" button is clicked', async () => {
      // Test to ensure content generation starts when the button is clicked
      render(<SubpillarDetail />);
      await waitFor(() => screen.getByText(/Generate Content/i));
      fireEvent.click(screen.getByText(/Generate Content/i));
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Content generation started",
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle API error gracefully', async () => {
      // Test to ensure the component handles API errors gracefully
      (useParams as jest.Mock).mockReturnValue({ subpillarId: 'invalid' });
      render(<SubpillarDetail />);
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch subpillar details",
        });
      });
    });

    it('should disable "Generate Content" button when status is complete', async () => {
      // Test to ensure the "Generate Content" button is disabled when status is complete
      render(<SubpillarDetail />);
      await waitFor(() => {
        const button = screen.getByText(/Generate Content/i);
        expect(button).toBeDisabled();
      });
    });
  });
});

// End of unit tests for: SubpillarDetail
