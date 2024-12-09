import { screen } from '@testing-library/react';
import { vi, describe, it, beforeEach } from 'vitest';
import { NicheSelection } from '../NicheSelection';
import { renderWithProviders, mockApi } from '@/test/test-utils';

console.log('Loading NicheSelection test suite');

// Import test suites
import './NicheSelection/form.test';
import './NicheSelection/api.test';
import './NicheSelection/display.test';
import './NicheSelection/navigation.test';

describe('NicheSelection Component - Initial Render', () => {
  beforeEach(() => {
    console.log('Running beforeEach hook in NicheSelection test');
    vi.clearAllMocks();
    mockApi.get.mockResolvedValueOnce({ data: [] });
  });

  it('should render the component correctly', () => {
    renderWithProviders(<NicheSelection />);

    expect(screen.getByText(/create new niche/i)).toBeInTheDocument();
    expect(screen.getByText(/your niches/i)).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    mockApi.get.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    renderWithProviders(<NicheSelection />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render the create niche form', () => {
    renderWithProviders(<NicheSelection />);

    expect(screen.getByPlaceholderText(/e\.g\., digital marketing/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create niche/i })).toBeInTheDocument();
  });
});
