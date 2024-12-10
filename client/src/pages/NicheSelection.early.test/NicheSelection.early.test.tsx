
// Unit tests for: NicheSelection


import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useToast } from '../../hooks/useToast';
import { NicheSelection } from '../NicheSelection';



// Mocking dependencies
jest.mock("../../api/api");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("../../hooks/useToast", () => {
  const actual = jest.requireActual("../../hooks/useToast");
  return {
    ...actual,
    useToast: jest.fn(),
  };
});

// Mock components





// Mock implementations
const mockNavigate = useNavigate as jest.Mock;
const mockApiGet = api.get as jest.Mock;
const mockApiPost = api.post as jest.Mock;
const mockUseToast = useToast as jest.Mock;

describe('NicheSelection() NicheSelection method', () => {
  let mockToast: jest.Mock;

  beforeEach(() => {
    mockToast = jest.fn();
    mockUseToast.mockReturnValue({ toast: mockToast } as any);
    mockNavigate.mockReturnValue(jest.fn());
  });

  describe('Happy Paths', () => {
    it('should render the component and fetch niches successfully', async () => {
      // Mock API response
      mockApiGet.mockResolvedValue({
        data: { data: [{ id: '1', name: 'Tech', pillarsCount: 3, progress: 50, status: 'Active', lastUpdated: '2023-10-01' }] },
      } as any as never);

      render(<NicheSelection />);

      // Check if loading spinner is displayed initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for niches to be fetched and rendered
      await waitFor(() => {
        expect(screen.getByText('Tech')).toBeInTheDocument();
      });
    });

    it('should create a new niche successfully', async () => {
      mockApiGet.mockResolvedValueOnce({
        data: { data: [] },
      } as any as never);

      mockApiPost.mockResolvedValue({
        data: { id: '2', name: 'Health', pillarsCount: 0, progress: 0, status: 'New', lastUpdated: '2023-10-02' },
      } as any as never);

      render(<NicheSelection />);

      // Enter niche name
      fireEvent.change(screen.getByPlaceholderText('e.g., Digital Marketing'), { target: { value: 'Health' } });

      // Click create button
      fireEvent.click(screen.getByText('Create Niche'));

      // Wait for toast and API call
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'default',
          title: 'Success',
          description: 'Niche created successfully',
        });
      });

      // Check if new niche is displayed
      expect(screen.getByText('Health')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should display error when API fails to fetch niches', async () => {
      mockApiGet.mockRejectedValue(new Error('Network Error') as never);

      render(<NicheSelection />);

      await waitFor(() => {
        expect(screen.getByText('Error loading niches')).toBeInTheDocument();
      });

      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Network Error',
      });
    });

    it('should validate niche name input', async () => {
      render(<NicheSelection />);

      // Click create button without entering a name
      fireEvent.click(screen.getByText('Create Niche'));

      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Niche name is required',
      });

      // Enter invalid niche name
      fireEvent.change(screen.getByPlaceholderText('e.g., Digital Marketing'), { target: { value: 'Invalid@Name' } });
      fireEvent.click(screen.getByText('Create Niche'));

      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Niche name can only contain letters, numbers, and spaces',
      });
    });
  });
});

// End of unit tests for: NicheSelection
