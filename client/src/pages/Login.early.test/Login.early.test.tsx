
// Unit tests for: Login


import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useAuth } from "contexts/AuthContext";
import { useToast } from "hooks/useToast";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Login } from '../Login';



// Mocking dependencies
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("react-hook-form", () => ({
  useForm: jest.fn(),
}));

jest.mock("hooks/useToast", () => {
  const actual = jest.requireActual("hooks/useToast");
  return {
    ...actual,
    useToast: jest.fn(),
  };
});

jest.mock("contexts/AuthContext", () => {
  const actual = jest.requireActual("contexts/AuthContext");
  return {
    ...actual,
    useAuth: jest.fn(),
  };
});

// Mock components









describe('Login() Login method', () => {
  let mockNavigate: jest.Mock;
  let mockToast: jest.Mock;
  let mockLogin: jest.Mock;

  beforeEach(() => {
    mockNavigate = jest.fn();
    mockToast = jest.fn();
    mockLogin = jest.fn();

    (useNavigate as any).mockReturnValue(mockNavigate);
    (useToast as any).mockReturnValue({ toast: mockToast });
    (useAuth as any).mockReturnValue({ login: mockLogin });

    (useForm as any).mockReturnValue({
      register: jest.fn(),
      handleSubmit: (fn: any) => fn,
    });
  });

  // Happy path test: Successful login
  it('should navigate to /niche-selection on successful login', async () => {
    mockLogin.mockResolvedValueOnce(undefined as never);

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Logged in successfully',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/niche-selection');
    });
  });

  // Edge case test: Invalid login credentials
  it('should show error toast on invalid login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials') as never);

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'Invalid email or password',
      });
    });
  });

  // Edge case test: Navigate to reset password
  it('should navigate to /reset-password when "Forgot password?" is clicked', () => {
    render(<Login />);

    fireEvent.click(screen.getByText('Forgot password?'));

    expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
  });

  // Edge case test: Navigate to register
  it('should navigate to /register when "Create one now" is clicked', () => {
    render(<Login />);

    fireEvent.click(screen.getByText('Create one now'));

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});

// End of unit tests for: Login
