
// Unit tests for: SEOGrade

import { useToast } from "@/hooks/useToast";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useNavigate, useParams } from "react-router-dom";
import { SEOGrade } from '../SEOGrade';
import "@testing-library/jest-dom";

// Mocking dependencies
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

describe('SEOGrade() SEOGrade method', () => {
  const mockNavigate = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({ articleId: '123' });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  describe('Happy Paths', () => {
    it('should render loading state initially', () => {
      // Test to ensure the loading state is displayed initially
      render(<SEOGrade />);
      expect(screen.getByText('Analyzing content...')).toBeInTheDocument();
    });

    it('should display SEO metrics and suggestions after loading', async () => {
      // Test to ensure metrics and suggestions are displayed after loading
      render(<SEOGrade />);
      await waitFor(() => expect(screen.getByText('SEO Analysis')).toBeInTheDocument());

      expect(screen.getByText('Overall SEO Score')).toBeInTheDocument();
      expect(screen.getByText('Keyword Optimization')).toBeInTheDocument();
      expect(screen.getByText('Optimize Meta Description')).toBeInTheDocument();
    });

    it('should navigate back to content when "Back to Content" button is clicked', async () => {
      // Test to ensure navigation works when the back button is clicked
      render(<SEOGrade />);
      await waitFor(() => expect(screen.getByText('SEO Analysis')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Back to Content'));
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should apply all suggestions when "Apply All Suggestions" button is clicked', async () => {
      // Test to ensure suggestions are applied when the button is clicked
      render(<SEOGrade />);
      await waitFor(() => expect(screen.getByText('SEO Analysis')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Apply All Suggestions'));
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'SEO improvements applied successfully',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle API error gracefully', async () => {
      // Test to ensure the component handles API errors gracefully
      (useToast as jest.Mock).mockReturnValueOnce({
        toast: jest.fn(() => {
          throw new Error('API Error');
        }),
      });

      render(<SEOGrade />);
      await waitFor(() => expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch SEO data',
      }));
    });

    it('should disable "Apply All Suggestions" button when all suggestions are applied', async () => {
      // Test to ensure the button is disabled when all suggestions are applied
      render(<SEOGrade />);
      await waitFor(() => expect(screen.getByText('SEO Analysis')).toBeInTheDocument());

      const applyButton = screen.getByText('Apply All Suggestions');
      fireEvent.click(applyButton);
      await waitFor(() => expect(applyButton).toBeDisabled());
    });
  });
});

// End of unit tests for: SEOGrade
