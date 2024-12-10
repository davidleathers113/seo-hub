
// Unit tests for: login


import api from '../api';
import { login } from '../auth';


jest.mock("../api");

describe('login() login method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should successfully login with valid email and password', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'securePassword';
      const mockResponse = {
        token: 'mockToken',
        user: { id: '123', email: 'test@example.com' },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const response = await login(email, password);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email, password });
      expect(response).toEqual(mockResponse);
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle login attempt with empty email', async () => {
      // Arrange
      const email = '';
      const password = 'securePassword';
      const mockError = new Error('Email is required');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(login(email, password)).rejects.toThrow('Email is required');
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email, password });
    });

    it('should handle login attempt with empty password', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = '';
      const mockError = new Error('Password is required');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(login(email, password)).rejects.toThrow('Password is required');
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email, password });
    });

    it('should handle login attempt with invalid email format', async () => {
      // Arrange
      const email = 'invalid-email';
      const password = 'securePassword';
      const mockError = new Error('Invalid email format');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(login(email, password)).rejects.toThrow('Invalid email format');
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email, password });
    });

    it('should handle server error during login', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'securePassword';
      const mockError = new Error('Internal Server Error');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(login(email, password)).rejects.toThrow('Internal Server Error');
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email, password });
    });
  });
});

// End of unit tests for: login
