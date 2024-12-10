
// Unit tests for: NicheDetail


import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import { useToast } from '../../hooks/useToast';
import { NicheDetail } from '../NicheDetail';



// Mocking useParams and useNavigate
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useParams: jest.fn(),
    useNavigate: jest.fn(),
  };
});

// Mocking api
jest.mock("../../api/api", () => ({
  get: jest.fn(),
  delete: jest.fn(),
}));

// Mocking useToast
jest.mock("../../hooks/useToast", () => {
  const actual = jest.requireActual("../../hooks/useToast");
  return {
    ...actual,
    useToast: jest.fn(),
  };
});

// Mock Button component

// Mock useToast hook
class MockuseToast {
  toast = jest.fn();
}

describe('NicheDetail() NicheDetail method', () => {
  let mockUseParams: jest.Mock;
  let mockUseNavigate: jest.Mock;
  let mockApiGet: jest.Mock;
  let mockApiDelete: jest.Mock;
  let mockUseToast: MockuseToast;

  beforeEach(() => {
    mockUseParams = useParams as jest.Mock;
    mockUseNavigate = useNavigate as jest.Mock;
    mockApiGet = api.get as jest.Mock;
    mockApiDelete = api.delete as jest.Mock;
    mockUseToast = new MockuseToast() as any;

    mockUseParams.mockReturnValue({ id: '1' });
    mockUseNavigate.mockReturnValue(jest.fn());
    (useToast as any).mockReturnValue(mockUseToast);
  });

  describe('Happy Paths', () => {
    it('should render loading state initially', () => {
      // Test to ensure the loading state is displayed initially
      render(<NicheDetail />);
      expect(screen.getByText('Loading niche details...')).toBeInTheDocument();
    });

    it('should render niche details after successful fetch', async () => {
      // Test to ensure niche details are displayed after successful fetch
      const nicheData = {
        id: '1',
        name: 'Test Niche',
        pillars: [],
        pillarsCount: 0,
        progress: 50,
        status: 'Active',
        lastUpdated: '2023-10-01T00:00:00Z',
      };
      mockApiGet.mockResolvedValue({ data: { data: nicheData } } as any as never);

      render(<NicheDetail />);
      await waitFor(() => expect(screen.getByText('Niche Detail')).toBeInTheDocument());
      expect(screen.getByText('Test Niche')).toBeInTheDocument();
    });

    it('should navigate to niche selection after successful deletion', async () => {
      // Test to ensure navigation occurs after successful deletion
      mockApiGet.mockResolvedValue({ data: { data: { id: '1', name: 'Test Niche', pillars: [], pillarsCount: 0, progress: 50, status: 'Active', lastUpdated: '2023-10-01T00:00:00Z' } } } as any as never);
      mockApiDelete.mockResolvedValue({} as any as never);
      const mockNavigate = jest.fn();
      mockUseNavigate.mockReturnValue(mockNavigate);

      render(<NicheDetail />);
      await waitFor(() => expect(screen.getByText('Delete Niche')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Delete Niche'));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/niche-selection'));
    });
  });

  describe('Edge Cases', () => {
    it('should display error message on fetch failure', async () => {
      // Test to ensure error message is displayed on fetch failure
      mockApiGet.mockRejectedValue({ response: { data: { error: 'Fetch error' } } } as never);

      render(<NicheDetail />);
      await waitFor(() => expect(screen.getByText('Error: Fetch error')).toBeInTheDocument());
    });

    it('should display error message on delete failure', async () => {
      // Test to ensure error message is displayed on delete failure
      mockApiGet.mockResolvedValue({ data: { data: { id: '1', name: 'Test Niche', pillars: [], pillarsCount: 0, progress: 50, status: 'Active', lastUpdated: '2023-10-01T00:00:00Z' } } } as any as never);
      mockApiDelete.mockRejectedValue({ response: { data: { error: 'Delete error' } } } as never);

      render(<NicheDetail />);
      await waitFor(() => expect(screen.getByText('Delete Niche')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Delete Niche'));
      await waitFor(() => expect(mockUseToast.toast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to delete the niche. Please try again.",
        variant: "destructive",
      }));
    });

    it('should display "No niche found" if niche is null', async () => {
      // Test to ensure "No niche found" is displayed if niche is null
      mockApiGet.mockResolvedValue({ data: { data: null } } as any as never);

      render(<NicheDetail />);
      await waitFor(() => expect(screen.getByText('No niche found')).toBeInTheDocument());
    });
  });
});

// End of unit tests for: NicheDetail
