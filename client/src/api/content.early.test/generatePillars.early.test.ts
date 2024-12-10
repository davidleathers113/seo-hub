
// Unit tests for: generatePillars


import api from '../api';
import { generatePillars } from '../content';


// Import necessary modules
// Mock the api module
jest.mock("../api");

describe('generatePillars() generatePillars method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should successfully call the API with the correct URL', async () => {
      // Arrange: Set up the mock response
      const mockResponse = { data: [{ title: 'Pillar 1', approved: true, status: 'generated' }] };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act: Call the function
      const nicheId = '123';
      const response = await generatePillars(nicheId);

      // Assert: Verify the API call and response
      expect(api.post).toHaveBeenCalledWith(`/niches/${nicheId}/pillars/generate`);
      expect(response).toEqual(mockResponse);
    });
  });

  describe('Edge Cases', () => {
    it('should handle an empty nicheId gracefully', async () => {
      // Arrange: Set up the mock response
      const mockResponse = { data: [] };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act: Call the function with an empty nicheId
      const nicheId = '';
      const response = await generatePillars(nicheId);

      // Assert: Verify the API call and response
      expect(api.post).toHaveBeenCalledWith(`/niches/${nicheId}/pillars/generate`);
      expect(response).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      // Arrange: Set up the mock to reject
      const mockError = new Error('API Error');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert: Call the function and expect it to throw
      const nicheId = '123';
      await expect(generatePillars(nicheId)).rejects.toThrow('API Error');
    });
  });
});

// End of unit tests for: generatePillars
