
// Unit tests for: RegisterPage


import RegisterPage, { RegisterPage, default } from "../Register";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../contexts/AuthContext";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mocking dependencies
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("react-hook-form", () => ({
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

// Mock components









describe('RegisterPage() RegisterPage method', () => {
  let mockNavigate: jest.Mock;
  let mockUseForm: jest.Mock;
  let mockUseToast: jest.Mock;
  let mockUseAuth: jest.Mock;

  beforeEach(() => {
    mockNavigate = useNavigate as jest.Mock;
    mockUseForm = useForm as jest.Mock;
    mockUseToast = useToast as jest.Mock;
    mockUseAuth = useAuth as jest.Mock;

    mockNavigate.mockReturnValue(jest.fn());
    mockUseForm.mockReturnValue({
      register: jest.fn(),
      handleSubmit: jest.fn(),
      formState: { errors: {} },
    } as any);
    mockUseToast.mockReturnValue({
      addToast: jest.fn(),
    } as any);
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
    } as any);
  });

  describe('Happy Paths', () => {
    it('should render the RegisterPage component correctly', () => {
      render(<RegisterPage />);
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('should call handleSubmit on form submission', () => {
      const handleSubmitMock = jest.fn();
      mockUseForm.mockReturnValueOnce({
        register: jest.fn(),
        handleSubmit: handleSubmitMock,
        formState: { errors: {} },
      } as any);

      render(<RegisterPage />);
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
      expect(handleSubmitMock).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should display error message for invalid email', () => {
      mockUseForm.mockReturnValueOnce({
        register: jest.fn(),
        handleSubmit: jest.fn(),
        formState: { errors: { email: { message: 'Invalid email' } } },
      } as any);

      render(<RegisterPage />);
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('should handle API error gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network Error') as never);

      render(<RegisterPage />);
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      expect(mockUseToast().addToast).toHaveBeenCalledWith('Network Error', { appearance: 'error' });
    });
  });
});

// End of unit tests for: RegisterPage
