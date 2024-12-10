
// Unit tests for: Dashboard

import { getDashboardStats } from "@/api/dashboard";
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import "@testing-library/jest-dom";

// Mock the getDashboardStats API call
jest.mock("@/api/dashboard", () => ({
  getDashboardStats: jest.fn(),
}));

describe('Dashboard() Dashboard method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should display loading state initially', () => {
      // Arrange: Mock the API call to delay response
      (getDashboardStats as jest.Mock).mockImplementation(() => new Promise(() => {}));

      // Act: Render the Dashboard component
      render(<Dashboard />);

      // Assert: Check if the loading text is displayed
      expect(screen.getByText(/Loading dashboard.../i)).toBeInTheDocument();
    });

    it('should render dashboard stats correctly when data is fetched successfully', async () => {
      // Arrange: Mock the API call to return a successful response
      const mockData = {
        niches: { total: 10, new: 2, inProgress: 3, completed: 5 },
        pillars: { total: 8, approved: 5, pending: 3 },
        subpillars: { total: 6, completed: 4 },
        seo: {
          averageScore: 85,
          above80Percent: 70,
          trend: [{ date: '2023-01-01', score: 80 }],
        },
        quality: {
          readabilityScore: 90,
          plagiarismScore: 5,
          keywordDensity: 3,
        },
        resources: { apiUsage: 500, apiLimit: 1000 },
      };
      (getDashboardStats as jest.Mock).mockResolvedValue({ data: mockData });

      // Act: Render the Dashboard component
      render(<Dashboard />);

      // Assert: Wait for the data to be displayed and verify the content
      await waitFor(() => {
        expect(screen.getByText('Total Niches')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('Content Pillars')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
        expect(screen.getByText('SEO Performance')).toBeInTheDocument();
        expect(screen.getByText('85')).toBeInTheDocument();
        expect(screen.getByText('API Usage')).toBeInTheDocument();
        expect(screen.getByText('50.0%')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle API failure gracefully', async () => {
      // Arrange: Mock the API call to return an error
      (getDashboardStats as jest.Mock).mockRejectedValue(new Error('API Error'));

      // Act: Render the Dashboard component
      render(<Dashboard />);

      // Assert: Wait for the loading state to disappear and check for absence of data
      await waitFor(() => {
        expect(screen.queryByText(/Loading dashboard.../i)).not.toBeInTheDocument();
        expect(screen.queryByText('Total Niches')).not.toBeInTheDocument();
      });
    });

    it('should handle empty data response gracefully', async () => {
      // Arrange: Mock the API call to return empty data
      const mockData = {
        niches: { total: 0, new: 0, inProgress: 0, completed: 0 },
        pillars: { total: 0, approved: 0, pending: 0 },
        subpillars: { total: 0, completed: 0 },
        seo: { averageScore: 0, above80Percent: 0, trend: [] },
        quality: { readabilityScore: 0, plagiarismScore: 0, keywordDensity: 0 },
        resources: { apiUsage: 0, apiLimit: 0 },
      };
      (getDashboardStats as jest.Mock).mockResolvedValue({ data: mockData });

      // Act: Render the Dashboard component
      render(<Dashboard />);

      // Assert: Wait for the data to be displayed and verify the content
      await waitFor(() => {
        expect(screen.getByText('Total Niches')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('Content Pillars')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('SEO Performance')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('API Usage')).toBeInTheDocument();
        expect(screen.getByText('NaN%')).toBeInTheDocument(); // Since apiLimit is 0, this will result in NaN
      });
    });
  });
});

// End of unit tests for: Dashboard
