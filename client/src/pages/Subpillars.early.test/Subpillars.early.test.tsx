
// Unit tests for: Subpillars

import { useToast } from "@/hooks/useToast";
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Subpillars } from '../Subpillars';



// Mocking necessary hooks and components
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

describe('Subpillars() Subpillars method', () => {
  const mockNavigate = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (require('react-router-dom').useParams as jest.Mock).mockReturnValue({ pillarId: '123' });
    (require('react-router-dom').useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  describe('Happy Paths', () => {
    it('should render loading state initially', () => {
      // Test to ensure the loading state is displayed initially
      render(
        <MemoryRouter>
          <Subpillars />
        </MemoryRouter>
      );
      expect(screen.getByText(/Loading subpillars.../i)).toBeInTheDocument();
    });

    it('should render subpillars correctly after loading', async () => {
      // Test to ensure subpillars are rendered correctly after loading
      render(
        <MemoryRouter>
          <Subpillars />
        </MemoryRouter>
      );

      // Wait for the loading state to disappear
      expect(await screen.findByText(/SEO Strategies/i)).toBeInTheDocument();
      expect(screen.getByText(/On-Page SEO Fundamentals/i)).toBeInTheDocument();
      expect(screen.getByText(/Technical SEO Audit Guide/i)).toBeInTheDocument();
      expect(screen.getByText(/Link Building Strategies/i)).toBeInTheDocument();
    });

    it('should navigate back to pillars when back button is clicked', async () => {
      // Test to ensure navigation back to pillars works
      render(
        <MemoryRouter>
          <Subpillars />
        </MemoryRouter>
      );

      fireEvent.click(await screen.findByText(/Back to Pillars/i));
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should navigate to subpillar details on card click', async () => {
      // Test to ensure navigation to subpillar details works
      render(
        <MemoryRouter>
          <Subpillars />
        </MemoryRouter>
      );

      fireEvent.click(await screen.findByText(/On-Page SEO Fundamentals/i));
      expect(mockNavigate).toHaveBeenCalledWith('/subpillars/1/details');
    });
  });

  describe('Edge Cases', () => {
    it('should handle API error gracefully', async () => {
      // Test to ensure API errors are handled gracefully
      (useToast as jest.Mock).mockReturnValue({
        toast: jest.fn(({ variant, title, description }) => {
          expect(variant).toBe('destructive');
          expect(title).toBe('Error');
          expect(description).toBe('Failed to fetch subpillars');
        }),
      });

      render(
        <MemoryRouter>
          <Subpillars />
        </MemoryRouter>
      );

      // Simulate an error in fetching subpillars
      expect(mockToast).toHaveBeenCalled();
    });

    it('should display correct status and progress for each subpillar', async () => {
      // Test to ensure each subpillar displays correct status and progress
      render(
        <MemoryRouter>
          <Subpillars />
        </MemoryRouter>
      );

      expect(await screen.findByText(/Complete/i)).toBeInTheDocument();
      expect(screen.getByText(/100%/i)).toBeInTheDocument();
      expect(screen.getByText(/Draft/i)).toBeInTheDocument();
      expect(screen.getByText(/75%/i)).toBeInTheDocument();
      expect(screen.getByText(/Outline/i)).toBeInTheDocument();
      expect(screen.getByText(/50%/i)).toBeInTheDocument();
    });
  });
});

// End of unit tests for: Subpillars
