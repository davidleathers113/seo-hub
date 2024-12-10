
// Unit tests for: FinalArticle

import { useToast } from "@/hooks/useToast";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useNavigate, useParams } from "react-router-dom";
import { FinalArticle } from '../FinalArticle';
import "@testing-library/jest-dom";

// Mocking necessary hooks and components
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

describe('FinalArticle() FinalArticle method', () => {
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
      render(<FinalArticle />);
      expect(screen.getByText('Loading article...')).toBeInTheDocument();
    });

    it('should display article metadata and content after loading', async () => {
      // Test to ensure article metadata and content are displayed after loading
      render(<FinalArticle />);
      await waitFor(() => expect(screen.getByText('Complete Guide to On-Page SEO Optimization')).toBeInTheDocument());
      expect(screen.getByText('SEO Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('2500 words')).toBeInTheDocument();
      expect(screen.getByText('10 min read')).toBeInTheDocument();
      expect(screen.getByText('SEO Score: 92')).toBeInTheDocument();
    });

    it('should copy content to clipboard and show success toast', async () => {
      // Test to ensure content is copied to clipboard and success toast is shown
      render(<FinalArticle />);
      await waitFor(() => screen.getByText('Copy'));
      fireEvent.click(screen.getByText('Copy'));
      await waitFor(() => expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Content copied to clipboard',
      }));
    });

    it('should export article in selected format and show success toast', async () => {
      // Test to ensure article is exported in selected format and success toast is shown
      render(<FinalArticle />);
      await waitFor(() => screen.getByText('Export'));
      fireEvent.click(screen.getByText('Export'));
      fireEvent.click(screen.getByText('Text File (.txt)'));
      await waitFor(() => expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Article exported as TXT',
      }));
    });
  });

  describe('Edge Cases', () => {
    it('should handle fetch article error and show error toast', async () => {
      // Test to ensure error toast is shown when fetching article fails
      (useParams as jest.Mock).mockReturnValue({ articleId: 'invalid' });
      render(<FinalArticle />);
      await waitFor(() => expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch article',
      }));
    });

    it('should handle copy content error and show error toast', async () => {
      // Test to ensure error toast is shown when copying content fails
      jest.spyOn(navigator.clipboard, 'writeText').mockImplementation(() => Promise.reject());
      render(<FinalArticle />);
      await waitFor(() => screen.getByText('Copy'));
      fireEvent.click(screen.getByText('Copy'));
      await waitFor(() => expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy content',
      }));
    });

    it('should handle export article error and show error toast', async () => {
      // Test to ensure error toast is shown when exporting article fails
      render(<FinalArticle />);
      await waitFor(() => screen.getByText('Export'));
      fireEvent.click(screen.getByText('Export'));
      fireEvent.click(screen.getByText('Word Document (.docx)'));
      await waitFor(() => expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to export article',
      }));
    });

    it('should handle regenerate content error and show error toast', async () => {
      // Test to ensure error toast is shown when regenerating content fails
      render(<FinalArticle />);
      await waitFor(() => screen.getByText('Regenerate'));
      fireEvent.click(screen.getByText('Regenerate'));
      await waitFor(() => expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to regenerate content',
      }));
    });
  });
});

// End of unit tests for: FinalArticle
