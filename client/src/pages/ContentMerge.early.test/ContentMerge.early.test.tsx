
// Unit tests for: ContentMerge

import { useToast } from "@/hooks/useToast";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ContentMerge } from '../ContentMerge';



// Mocking dependencies
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

describe('ContentMerge() ContentMerge method', () => {
  const mockNavigate = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (require('react-router-dom').useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (require('react-router-dom').useParams as jest.Mock).mockReturnValue({ subpillarId: '123' });
  });

  describe('Happy Paths', () => {
    it('should render loading state initially', () => {
      // Test to ensure the loading state is displayed initially
      render(
        <MemoryRouter>
          <ContentMerge />
        </MemoryRouter>
      );
      expect(screen.getByText('Loading content points...')).toBeInTheDocument();
    });

    it('should render content points after loading', async () => {
      // Test to ensure content points are rendered after loading
      render(
        <MemoryRouter>
          <ContentMerge />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Introduction to On-Page SEO')).toBeInTheDocument();
        expect(screen.getByText('Title Tag Optimization')).toBeInTheDocument();
      });
    });

    it('should navigate to final draft on successful merge', async () => {
      // Test to ensure navigation occurs on successful merge
      render(
        <MemoryRouter initialEntries={['/subpillars/123']}>
          <Routes>
            <Route path="/subpillars/:subpillarId" element={<ContentMerge />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Merge & Refine'));
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Content merged successfully',
        });
        expect(mockNavigate).toHaveBeenCalledWith('/subpillars/123/final-draft');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle API error when fetching content points', async () => {
      // Test to ensure error handling when fetching content points fails
      jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
        Promise.reject(new Error('API is down'))
      );

      render(
        <MemoryRouter>
          <ContentMerge />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch content points',
        });
      });
    });

    it('should handle API error when updating point status', async () => {
      // Test to ensure error handling when updating point status fails
      render(
        <MemoryRouter>
          <ContentMerge />
        </MemoryRouter>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Needs Revision'));
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update point status',
        });
      });
    });

    it('should handle API error when merging content', async () => {
      // Test to ensure error handling when merging content fails
      jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
        Promise.reject(new Error('API is down'))
      );

      render(
        <MemoryRouter>
          <ContentMerge />
        </MemoryRouter>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Merge & Refine'));
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to merge content',
        });
      });
    });
  });
});

// End of unit tests for: ContentMerge
