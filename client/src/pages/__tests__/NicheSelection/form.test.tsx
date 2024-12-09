import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import NicheSelection from '../../NicheSelection';
import { renderWithProviders, mockApi, mockToast } from '@/test/test-utils';

describe('NicheSelection Component - Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock initial API call to prevent loading state
    mockApi.get.mockResolvedValue({ data: { data: [] } });
  });

  it('should show error when submitting empty form', async () => {
    renderWithProviders(<NicheSelection />);
    await userEvent.click(screen.getByRole('button', { name: /create niche/i }));
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Error',
      description: 'Niche name is required',
    });
  });

  it('should show error for invalid characters', async () => {
    renderWithProviders(<NicheSelection />);
    
    await userEvent.type(
      screen.getByPlaceholderText(/e\.g\., digital marketing/i),
      'Invalid$Name'
    );
    await userEvent.click(screen.getByRole('button', { name: /create niche/i }));
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Error',
      description: 'Niche name can only contain letters, numbers, and spaces',
    });
  });

  it('should allow valid niche names', async () => {
    renderWithProviders(<NicheSelection />);
    
    await userEvent.type(
      screen.getByPlaceholderText(/e\.g\., digital marketing/i),
      'Valid Niche 123'
    );
    
    const input = screen.getByPlaceholderText(/e\.g\., digital marketing/i) as HTMLInputElement;
    expect(input.value).toBe('Valid Niche 123');
  });

  it('should handle successful niche creation', async () => {
    renderWithProviders(<NicheSelection />);
    
    mockApi.post.mockResolvedValueOnce({ data: { success: true } });
    
    await userEvent.type(
      screen.getByPlaceholderText(/e\.g\., digital marketing/i),
      'Test Niche'
    );
    await userEvent.click(screen.getByRole('button', { name: /create niche/i }));
    
    expect(mockApi.post).toHaveBeenCalledWith('/niches', { name: 'Test Niche' });
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'default',
      title: 'Success',
      description: 'Niche created successfully',
    });
  });

  it('should disable submit button while submitting', async () => {
    renderWithProviders(<NicheSelection />);
    
    // Mock a delayed API response to test loading state
    mockApi.post.mockImplementationOnce(() => new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true } });
      }, 100);
    }));
    
    await userEvent.type(
      screen.getByPlaceholderText(/e\.g\., digital marketing/i),
      'Test Niche'
    );
    
    const submitButton = screen.getByRole('button', { name: /create niche/i });
    await userEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Creating Niche...');
  });
});
