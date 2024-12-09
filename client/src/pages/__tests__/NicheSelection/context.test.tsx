import { screen } from '@testing-library/react';
import { vi, describe, it } from 'vitest';
import { renderWithProviders, mockApi } from '@/test/test-utils';
import NicheSelection from '../../NicheSelection';

describe('NicheSelection Router Context', () => {
  it('should render with router context', () => {
    // Mock API response to prevent loading state
    mockApi.get.mockResolvedValueOnce({ data: { data: [] } });

    renderWithProviders(<NicheSelection />);

    // Test component renders with router context available
    expect(screen.getByTestId('niche-selection')).toBeInTheDocument();
    expect(screen.getByText('Create New Niche')).toBeInTheDocument();
    expect(screen.getByText('Your Niches')).toBeInTheDocument();
  });
});
