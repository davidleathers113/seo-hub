
// Unit tests for: logout


import api from '../api';
import { logout } from '../auth';


// Import necessary modules
// Mock the api module
jest.mock("../api");

describe('logout() logout method', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  // Happy Path Tests
  describe('Happy Path', () => {
    it('should successfully call the logout API and return a success response', async () => {
      // Arrange: Mock the API response
      const mockResponse = { success: true, message: 'Logged out successfully' };
      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act: Call the logout function
      const response = await logout();

      // Assert: Verify the API was called correctly and the response is as expected
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(response).toEqual(mockResponse);
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle API failure gracefully', async () => {
      // Arrange: Mock the API to reject with an error
      const mockError = new Error('Network Error');
      (api.post as jest.Mock).mockRejectedValueOnce(mockError);

      // Act & Assert: Call the logout function and expect it to throw an error
      await expect(logout()).rejects.toThrow('Network Error');
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should handle unexpected response structure', async () => {
      // Arrange: Mock the API to return an unexpected response structure
      const unexpectedResponse = { unexpectedKey: 'unexpectedValue' };
      (api.post as jest.Mock).mockResolvedValueOnce(unexpectedResponse);

      // Act: Call the logout function
      const response = await logout();

      // Assert: Verify the API was called correctly and the response is as expected
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(response).toEqual(unexpectedResponse);
    });
  });
});

// End of unit tests for: logout
