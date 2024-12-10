
// Unit tests for: Register


import RegisterPage, { Register, RegisterPage, default } from "../Register";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mocking dependencies
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useForm: jest.fn(),
}));

jest.mock("axios");

jest.mock("../../hooks/useToast", () => {
  const actual = jest.requireActual("../../hooks/useToast");
  return {
    ...actual,
    useToast: jest.fn(),
  };
});

jest.mock("../../contexts/AuthContext", () => {
  const actual = jest.requireActual("../../contexts/AuthContext");
  return {
    ...actual,
    useAuth: jest.fn(),
  };
});

// Mock implementations
class MockuseToast {
  public toast = jest.fn();
}

class MockuseAuth {
  public register = jest.fn();
}

describe('Register() Register method', () => {
  let mockNavigate: jest.Mock;
  let mockUseForm: jest.Mock;
  let mockUseToast: MockuseToast;
  let mockUseAuth: MockuseAuth;

  beforeEach(() => {
    mockNavigate = useNavigate as jest.Mock;
    mockUseForm = useForm as jest.Mock;
    mockUseToast = new MockuseToast() as any;
    mockUseAuth = new MockuseAuth() as any;

    mockNavigate.mockReturnValue(jest.fn());
    mockUseForm.mockReturnValue({
      register: jest.fn(),
      handleSubmit: jest.fn((fn) => fn),
      setError: jest.fn(),
      reset: jest.fn(),
      formState: { errors: {} },
    });
    mockUseToast.toast.mockReturnValue(jest.fn());
    mockUseAuth.register.mockResolvedValue(jest.fn());
  });

  describe('Happy Paths', () => {
    it('should render the registration form', () => {
      render(<Register />);
      expect(screen.getByText('Create an account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Choose a password')).toBeInTheDocument();
    });

    it('should submit the form successfully', async () => {
      render(<Register />);
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('Choose a password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText('Create Account'));

      await waitFor(() => {
        expect(mockUseAuth.register).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockUseToast.toast).toHaveBeenCalledWith({
          variant: 'default',
          title: 'Success',
          description: 'Account created successfully',
        });
        expect(mockNavigate).toHaveBeenCalledWith('/niche-selection');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle email already exists error', async () => {
      mockUseAuth.register.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { error: 'User with this email already exists' },
        },
      });

      render(<Register />);
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'existing@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('Choose a password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText('Create Account'));

      await waitFor(() => {
        expect(mockUseForm().setError).toHaveBeenCalledWith('email', {
          type: 'manual',
          message: 'An account with this email already exists. Please use a different email or try logging in.',
        });
        expect(mockUseForm().reset).toHaveBeenCalledWith({ email: '', password: '' });
      });
    });

    it('should handle unexpected errors', async () => {
      mockUseAuth.register.mockRejectedValueOnce(new Error('Unexpected error'));

      render(<Register />);
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('Choose a password'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText('Create Account'));

      await waitFor(() => {
        expect(mockUseForm().setError).toHaveBeenCalledWith('root', {
          type: 'manual',
          message: 'An unexpected error occurred. Please try again later.',
        });
      });
    });
  });
});

// End of unit tests for: Register
