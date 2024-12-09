import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders, mockApi, mockToast } from '@/test/test-utils';
import RegisterPage, { Register } from '../Register';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockNavigate = vi.fn();

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.get.mockResolvedValue({ data: { data: [] } });
  });

  describe('Form Validation', () => {
    it('should show validation errors when submitting empty form', async () => {
      renderWithProviders(<Register />);

      await userEvent.click(screen.getByRole('button', { name: /create account/i }));

      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Email and password are required'
      });
    });

    it('should validate email format', async () => {
      renderWithProviders(<Register />);

      await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
      await userEvent.type(screen.getByLabelText(/password/i), 'ValidPass123!');
      await userEvent.click(screen.getByRole('button', { name: /create account/i }));

      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid email address'
      });
    });

    it('should validate password length', async () => {
      renderWithProviders(<Register />);

      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'short');
      await userEvent.click(screen.getByRole('button', { name: /create account/i }));

      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Password must be at least 8 characters long'
      });
    });
  });

  describe('Form Submission', () => {
    it('should show loading state while submitting', async () => {
      mockApi.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderWithProviders(<Register />);

      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'securePassword123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await userEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/creating account/i);
    });

    it('should successfully register a new user', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { message: 'Registration successful' } });
      renderWithProviders(<Register />);

      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'securePassword123');
      await userEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'default',
          title: 'Success',
          description: 'Account created successfully'
        });
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle API errors gracefully', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Registration failed'));
      renderWithProviders(<Register />);

      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'securePassword123');
      await userEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create account. Please try again.'
        });
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page when clicking sign in link', async () => {
      renderWithProviders(<Register />);

      await userEvent.click(screen.getByText(/already have an account/i));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Error Boundary', () => {
    it('should render RegisterPage with ErrorBoundary', () => {
      renderWithProviders(<RegisterPage />);
      expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    });
  });
});
