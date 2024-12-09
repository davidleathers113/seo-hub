import { screen, waitFor, renderWithProviders, mockApi, mockToast } from '@/test/test-utils';
import { userEvent } from '@testing-library/user-event';
import NicheSelection from '../../NicheSelection';
import { vi, describe, it, beforeEach } from 'vitest';
import { useNavigate } from 'react-router-dom';

console.log('Loading navigation test suite');

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('NicheSelection Component - Navigation', () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(navigateMock);
  });

  it('should navigate to niche details when clicking a niche card', async () => {
    const mockNiches = [
      {
        id: '1',
        name: 'Digital Marketing',
        pillars: [],
        pillarsCount: 5,
        progress: 60,
        status: 'active',
        lastUpdated: new Date().toISOString(),
      },
    ];
    mockApi.get.mockResolvedValueOnce({ data: { data: mockNiches } });

    renderWithProviders(<NicheSelection />);

    await waitFor(() => {
      expect(screen.getByText('Digital Marketing')).toBeInTheDocument();
    });

    const nicheCard = screen.getByTestId('niche-card-1');
    await userEvent.click(nicheCard);

    expect(navigateMock).toHaveBeenCalledWith('/niches/1');
  });

  it('should prevent navigation when niche card is disabled', async () => {
    const mockNiches = [
      {
        id: '2',
        name: 'Personal Finance',
        pillars: [],
        pillarsCount: 3,
        progress: 30,
        status: 'disabled',
        lastUpdated: new Date().toISOString(),
      },
    ];
    mockApi.get.mockResolvedValueOnce({ data: { data: mockNiches } });

    renderWithProviders(<NicheSelection />);

    await waitFor(() => {
      expect(screen.getByText('Personal Finance')).toBeInTheDocument();
    });

    const nicheCard = screen.getByTestId('niche-card-2');
    await userEvent.click(nicheCard);

    expect(navigateMock).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Error',
      description: 'Error navigating to niche',
    });
  });

  it('should handle navigation errors gracefully', async () => {
    const mockNiches = [
      {
        id: '1',
        name: 'Digital Marketing',
        pillars: [],
        pillarsCount: 5,
        progress: 60,
        status: 'active',
        lastUpdated: new Date().toISOString(),
      },
    ];
    mockApi.get.mockResolvedValueOnce({ data: { data: mockNiches } });

    // Simulate navigation error
    navigateMock.mockImplementationOnce(() => {
      throw new Error('Navigation Error');
    });

    renderWithProviders(<NicheSelection />);

    await waitFor(() => {
      expect(screen.getByText('Digital Marketing')).toBeInTheDocument();
    });

    const nicheCard = screen.getByTestId('niche-card-1');
    await userEvent.click(nicheCard);

    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Error',
      description: 'Error navigating to niche',
    });
  });
});
