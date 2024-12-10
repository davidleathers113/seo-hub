
// Unit tests for: register


import api from '../api';
import { register } from '../auth';


jest.mock("../api");

describe('register() register method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy paths', () => {
    it('should successfully register a user with valid email and password', async () => {
      // Arrange
      const mockResponse = {
        token: 'mockToken',
        user: { id: '1', email: 'test@example.com' }
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { email: 'test@example.com', password: 'password123' };

      // Act
      const response = await register(data);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/register', data);
      expect(response).toEqual(mockResponse);
    });
  });

  describe('Edge cases', () => {
    it('should handle registration with an empty email', async () => {
      // Arrange
      const data = { email: '', password: 'password123' };
      const mockError = new Error('Email is required');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(register(data)).rejects.toThrow('Email is required');
      expect(api.post).toHaveBeenCalledWith('/register', data);
    });

    it('should handle registration with an empty password', async () => {
      // Arrange
      const data = { email: 'test@example.com', password: '' };
      const mockError = new Error('Password is required');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(register(data)).rejects.toThrow('Password is required');
      expect(api.post).toHaveBeenCalledWith('/register', data);
    });

    it('should handle registration with invalid email format', async () => {
      // Arrange
      const data = { email: 'invalid-email', password: 'password123' };
      const mockError = new Error('Invalid email format');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(register(data)).rejects.toThrow('Invalid email format');
      expect(api.post).toHaveBeenCalledWith('/register', data);
    });

    it('should handle server error during registration', async () => {
      // Arrange
      const data = { email: 'test@example.com', password: 'password123' };
      const mockError = new Error('Internal Server Error');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(register(data)).rejects.toThrow('Internal Server Error');
      expect(api.post).toHaveBeenCalledWith('/register', data);
    });
  });
});

// End of unit tests for: register
