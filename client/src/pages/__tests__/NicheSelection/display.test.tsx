import { screen, waitFor, renderWithProviders, mockApi } from '@/test/test-utils';
import NicheSelection from '../../NicheSelection';
import { vi, describe, it, beforeEach } from 'vitest';

console.log('Loading display test suite');

describe('NicheSelection Component - Display', () => {
  beforeEach(() => {
    console.log('Running beforeEach hook in display test');
    vi.clearAllMocks();
  });

  it('should display existing niches correctly', async () => {
    const mockNiches = [
      {
        id: '1',
        name: 'Digital Marketing',
        pillars: [],
        pillarsCount: 5,
        progress: 60,
        status: 'in-progress',
        lastUpdated: '2024-03-15',
      },
      {
        id: '2',
        name: 'Personal Finance',
        pillars: [],
        pillarsCount: 3,
        progress: 30,
        status: 'new',
        lastUpdated: '2024-03-14',
      },
    ];

    mockApi.get.mockResolvedValueOnce({ data: { data: mockNiches } });
    renderWithProviders(<NicheSelection />);

    await waitFor(() => {
      expect(screen.getByText('Digital Marketing')).toBeInTheDocument();
      expect(screen.getByText('Personal Finance')).toBeInTheDocument();
      expect(screen.getByText('5 Pillars')).toBeInTheDocument();
      expect(screen.getByText('3 Pillars')).toBeInTheDocument();
    });
  });

  it('should handle empty niche list', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { data: [] } });
    renderWithProviders(<NicheSelection />);

    await waitFor(() => {
      expect(screen.getByText(/no niches found/i)).toBeInTheDocument();
    });
  });

  it('should display loading state while fetching niches', () => {
    mockApi.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    renderWithProviders(<NicheSelection />);
    
    const loadingSpinner = screen.getByRole('progressbar', { name: /loading niches/i });
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Failed to fetch niches'));
    renderWithProviders(<NicheSelection />);

    await waitFor(() => {
      expect(screen.getByText(/error loading niches/i)).toBeInTheDocument();
    });
  });

  it('should display progress indicators correctly', async () => {
    const mockNiche = {
      id: '1',
      name: 'Digital Marketing',
      pillars: [],
      pillarsCount: 5,
      progress: 60,
      status: 'in-progress',
      lastUpdated: '2024-03-15',
    };

    mockApi.get.mockResolvedValueOnce({ data: { data: [mockNiche] } });
    renderWithProviders(<NicheSelection />);

    await waitFor(() => {
      const progressBar = screen.getByTestId('niche-card-1').querySelector('progress');
      expect(progressBar).toHaveAttribute('value', '60');
      expect(progressBar).toHaveAttribute('max', '100');
    });
  });
});
