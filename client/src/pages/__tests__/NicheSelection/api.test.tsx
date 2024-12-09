import { screen, waitFor, renderWithProviders, mockApi, mockToast } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NicheSelection } from '../../NicheSelection';

console.log('Loading API test suite');

describe('NicheSelection Component - API Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    console.log('Running beforeEach hook in API test');
    vi.clearAllMocks();
  });

  it('should successfully create a new niche', async () => {
    const mockNiche = {
      id: '3',
      name: 'Test Niche',
      pillars: [],
      pillarsCount: 0,
      progress: 0,
      status: 'new',
      lastUpdated: new Date().toISOString(),
    };

    mockApi.post.mockResolvedValueOnce({ data: { niche: mockNiche } });
    renderWithProviders(<NicheSelection />);

    await user.type(
      screen.getByPlaceholderText(/e\.g\., digital marketing/i),
      'Test Niche'
    );
    await user.click(screen.getByRole('button', { name: /create niche/i }));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/niches', { name: 'Test Niche' });
    });
  });

  it('should handle API errors when creating niche', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Failed to create'));
    renderWithProviders(<NicheSelection />);

    await user.type(
      screen.getByPlaceholderText(/e\.g\., digital marketing/i),
      'Test Niche'
    );
    await user.click(screen.getByRole('button', { name: /create niche/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create niche. Please try again.',
      });
    });
  });

  it('should fetch niches on component mount', async () => {
    const mockNiches = [
      {
        id: '1',
        name: 'Digital Marketing',
        pillars: [],
        pillarsCount: 0,
        progress: 0,
        status: 'new',
        lastUpdated: new Date().toISOString(),
      },
    ];

    mockApi.get.mockResolvedValueOnce({ data: mockNiches });
    renderWithProviders(<NicheSelection />);

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith('/niches');
    });
  });

  it('should handle invalid data format from API', async () => {
    mockApi.get.mockResolvedValueOnce({ data: 'invalid' });
    renderWithProviders(<NicheSelection />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Invalid data format received for niches',
      });
      expect(screen.getByText(/error loading niches/i)).toBeInTheDocument();
    });
  });
});
