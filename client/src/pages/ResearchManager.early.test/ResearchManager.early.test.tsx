
// Unit tests for: ResearchManager

import { useToast } from "@/hooks/useToast";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResearchManager } from '../ResearchManager';



// Mocking dependencies
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ subpillarId: '123' }),
  useNavigate: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

describe('ResearchManager() ResearchManager method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should render the ResearchManager component correctly', () => {
      // Render the component
      render(
        <MemoryRouter>
          <ResearchManager />
        </MemoryRouter>
      );

      // Check if the main elements are rendered
      expect(screen.getByText('Research Manager')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search research items...')).toBeInTheDocument();
      expect(screen.getByText('Add Research')).toBeInTheDocument();
    });

    it('should fetch and display research items', async () => {
      // Render the component
      render(
        <MemoryRouter>
          <ResearchManager />
        </MemoryRouter>
      );

      // Wait for the mock data to be displayed
      await waitFor(() => {
        expect(screen.getByText('SEO Best Practices 2024')).toBeInTheDocument();
        expect(screen.getByText('Key findings about modern SEO practices...')).toBeInTheDocument();
      });
    });

    it('should filter research items based on search query', async () => {
      // Render the component
      render(
        <MemoryRouter>
          <ResearchManager />
        </MemoryRouter>
      );

      // Wait for the mock data to be displayed
      await waitFor(() => {
        expect(screen.getByText('SEO Best Practices 2024')).toBeInTheDocument();
      });

      // Enter a search query
      fireEvent.change(screen.getByPlaceholderText('Search research items...'), {
        target: { value: 'non-existent' },
      });

      // Check that no items are displayed
      expect(screen.queryByText('SEO Best Practices 2024')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle fetch errors gracefully', async () => {
      // Mock the toast function
      const toastMock = jest.fn();
      (useToast as jest.Mock).mockReturnValue({ toast: toastMock });

      // Mock fetchResearchItems to throw an error
      jest.spyOn(global, 'fetch').mockImplementation(() => {
        throw new Error('Fetch error');
      });

      // Render the component
      render(
        <MemoryRouter>
          <ResearchManager />
        </MemoryRouter>
      );

      // Wait for the error toast to be called
      await waitFor(() => {
        expect(toastMock).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch research items',
        });
      });
    });

    it('should display no items when there are no research items', async () => {
      // Mock fetchResearchItems to return an empty array
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => [],
      });

      // Render the component
      render(
        <MemoryRouter>
          <ResearchManager />
        </MemoryRouter>
      );

      // Check that no items are displayed
      await waitFor(() => {
        expect(screen.queryByText('SEO Best Practices 2024')).not.toBeInTheDocument();
      });
    });
  });
});

// End of unit tests for: ResearchManager
