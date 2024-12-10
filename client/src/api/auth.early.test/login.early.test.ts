
// Unit tests for: login


import api from '../api';
import { login } from '../auth';


// Import necessary modules
// Mock the api.post method
jest.mock("../api", () => ({
  post: jest.fn(),
}));

describe('login() login method', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  describe('Happy paths', () => {
    it('should successfully login with valid email and password', async () => {
      // Arrange: Set up the mock response for a successful login
      const mockResponse = {
        token: 'mockToken',
        user: { id: 'userId', email: 'user@example.com' },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act: Call the login function
      const response = await login('user@example.com', 'password123');

      // Assert: Verify the response and that api.post was called correctly
      expect(response).toEqual(mockResponse);
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle login attempt with empty email and password', async () => {
      // Arrange: Set up the mock response for an error
      const mockError = new Error('Invalid email or password');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert: Call the login function and expect it to throw an error
      await expect(login('', '')).rejects.toThrow('Invalid email or password');
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: '',
        password: '',
      });
    });

    it('should handle login attempt with invalid email format', async () => {
      // Arrange: Set up the mock response for an error
      const mockError = new Error('Invalid email format');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert: Call the login function and expect it to throw an error
      await expect(login('invalid-email', 'password123')).rejects.toThrow('Invalid email format');
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'invalid-email',
        password: 'password123',
      });
    });

    it('should handle server error during login', async () => {
      // Arrange: Set up the mock response for a server error
      const mockError = new Error('Internal Server Error');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert: Call the login function and expect it to throw an error
      await expect(login('user@example.com', 'password123')).rejects.toThrow('Internal Server Error');
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });
});

// End of unit tests for: login
