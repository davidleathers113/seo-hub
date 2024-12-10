
// Unit tests for: PillarsList

import { generatePillars } from "@/api/content";
import { useToast } from "@/hooks/useToast";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useNavigate, useParams } from "react-router-dom";
import { PillarsList } from '../PillarsList';



// Mocking dependencies
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/api/content", () => ({
  generatePillars: jest.fn(),
}));

describe('PillarsList() PillarsList method', () => {
  const mockNavigate = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useParams as jest.Mock).mockReturnValue({ nicheId: '123' });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  describe('Happy Paths', () => {
    it('should render loading state initially', () => {
      // Test to ensure the loading state is displayed initially
      render(<PillarsList />);
      expect(screen.getByText(/Loading pillars.../i)).toBeInTheDocument();
    });

    it('should render pillars list after fetching', async () => {
      // Test to ensure pillars are rendered after fetching
      render(<PillarsList />);
      await waitFor(() => expect(screen.getByText(/SEO Content Writing/i)).toBeInTheDocument());
      expect(screen.getByText(/Transitioning from Lead Vendors to In-House Teams/i)).toBeInTheDocument();
      expect(screen.getByText(/Technical SEO/i)).toBeInTheDocument();
    });

    it('should navigate to subpillar detail on node click', async () => {
      // Test to ensure navigation occurs on subpillar node click
      render(<PillarsList />);
      await waitFor(() => expect(screen.getByText(/SEO Content Writing/i)).toBeInTheDocument());
      fireEvent.click(screen.getByText(/How to Evaluate Your Current Lead Vendor Dependency/i));
      expect(mockNavigate).toHaveBeenCalledWith('/subpillar-detail/1-1');
    });

    it('should generate pillars on button click', async () => {
      // Test to ensure pillars are generated on button click
      (generatePillars as jest.Mock).mockResolvedValue({ data: [] });
      render(<PillarsList />);
      await waitFor(() => expect(screen.getByText(/SEO Content Writing/i)).toBeInTheDocument());
      fireEvent.click(screen.getByText(/Generate Pillars/i));
      await waitFor(() => expect(generatePillars).toHaveBeenCalledWith('123'));
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "Pillars generated successfully",
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle fetch error gracefully', async () => {
      // Test to ensure fetch error is handled gracefully
      (useParams as jest.Mock).mockReturnValue({ nicheId: null });
      render(<PillarsList />);
      await waitFor(() => expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch pillars",
      }));
    });

    it('should handle generate pillars error gracefully', async () => {
      // Test to ensure generate pillars error is handled gracefully
      (generatePillars as jest.Mock).mockRejectedValue(new Error('Failed to generate'));
      render(<PillarsList />);
      await waitFor(() => expect(screen.getByText(/SEO Content Writing/i)).toBeInTheDocument());
      fireEvent.click(screen.getByText(/Generate Pillars/i));
      await waitFor(() => expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate pillars",
      }));
    });

    it('should not generate pillars if nicheId is missing', async () => {
      // Test to ensure no action is taken if nicheId is missing
      (useParams as jest.Mock).mockReturnValue({ nicheId: null });
      render(<PillarsList />);
      await waitFor(() => expect(screen.getByText(/SEO Content Writing/i)).toBeInTheDocument());
      fireEvent.click(screen.getByText(/Generate Pillars/i));
      expect(generatePillars).not.toHaveBeenCalled();
    });
  });
});

// End of unit tests for: PillarsList
