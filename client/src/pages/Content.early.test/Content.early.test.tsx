
// Unit tests for: Content

import { generatePillars } from "@/api/content";
import { useToast } from "@/hooks/useToast";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Content } from '../Content';
import "@testing-library/jest-dom";

// Mock the necessary modules
jest.mock("@/hooks/useToast");
jest.mock("@/api/content");

describe('Content() Content method', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should render the form and submit button correctly', () => {
      // Render the Content component
      render(<Content />);

      // Check if the input and button are rendered
      expect(screen.getByLabelText(/Enter your niche/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate Pillars/i })).toBeInTheDocument();
    });

    it('should call generatePillars and display success toast on successful submission', async () => {
      // Mock the generatePillars API call
      const mockPillars = [{ id: '1', title: 'Pillar 1', approved: false }];
      (generatePillars as jest.Mock).mockResolvedValue({ data: { pillars: mockPillars } });

      // Mock the toast function
      const mockToast = jest.fn();
      (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

      // Render the Content component
      render(<Content />);

      // Fill out the form and submit
      fireEvent.change(screen.getByLabelText(/Enter your niche/i), { target: { value: 'Marketing' } });
      fireEvent.click(screen.getByRole('button', { name: /Generate Pillars/i }));

      // Wait for the async operations to complete
      await waitFor(() => {
        expect(generatePillars).toHaveBeenCalledWith('Marketing');
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Content pillars generated successfully',
        });
      });

      // Check if the pillars are displayed
      expect(screen.getByText('Pillar 1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should display error toast on API failure', async () => {
      // Mock the generatePillars API call to reject
      (generatePillars as jest.Mock).mockRejectedValue(new Error('API Error'));

      // Mock the toast function
      const mockToast = jest.fn();
      (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

      // Render the Content component
      render(<Content />);

      // Fill out the form and submit
      fireEvent.change(screen.getByLabelText(/Enter your niche/i), { target: { value: 'Marketing' } });
      fireEvent.click(screen.getByRole('button', { name: /Generate Pillars/i }));

      // Wait for the async operations to complete
      await waitFor(() => {
        expect(generatePillars).toHaveBeenCalledWith('Marketing');
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to generate content pillars',
        });
      });
    });

    it('should disable the submit button while loading', async () => {
      // Mock the generatePillars API call
      (generatePillars as jest.Mock).mockResolvedValue({ data: { pillars: [] } });

      // Render the Content component
      render(<Content />);

      // Fill out the form and submit
      fireEvent.change(screen.getByLabelText(/Enter your niche/i), { target: { value: 'Marketing' } });
      fireEvent.click(screen.getByRole('button', { name: /Generate Pillars/i }));

      // Check if the button is disabled
      expect(screen.getByRole('button', { name: /Generating.../i })).toBeDisabled();

      // Wait for the async operations to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Pillars/i })).not.toBeDisabled();
      });
    });
  });
});

// End of unit tests for: Content
