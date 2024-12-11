
// Unit tests for: generateOutline




const { sendLLMRequest, generateOutline } = require('../llm');
const { logger } = require('../../utils/log');
const Research = require('../../models/Research');
jest.mock("../../models/Research");
jest.mock("../llm", () => ({
  ...jest.requireActual("../llm"),
  sendLLMRequest: jest.fn(),
}));

describe('generateOutline() generateOutline method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should generate an outline with valid research data', async () => {
      // Arrange: Mock Research data and LLM response
      const subpillarId = 'validSubpillarId';
      const mockResearchData = [
        { content: 'Research content 1', source: 'Source 1' },
        { content: 'Research content 2', source: 'Source 2' },
      ];
      const mockLLMResponse = '1. Introduction\n2. Main Content\n3. Conclusion';
      Research.find.mockResolvedValue(mockResearchData);
      sendLLMRequest.mockResolvedValue(mockLLMResponse);

      // Act: Call generateOutline
      const result = await generateOutline(subpillarId);

      // Assert: Verify the result
      expect(result).toEqual([
        { title: 'Introduction', contentPoints: [], order: 0 },
        { title: 'Main Content', contentPoints: [], order: 1 },
        { title: 'Conclusion', contentPoints: [], order: 2 },
      ]);
      expect(Research.find).toHaveBeenCalledWith({ subpillar: subpillarId });
      expect(sendLLMRequest).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should throw an error if no research is found for the subpillar', async () => {
      // Arrange: Mock no research data
      const subpillarId = 'invalidSubpillarId';
      Research.find.mockResolvedValue([]);

      // Act & Assert: Expect an error to be thrown
      await expect(generateOutline(subpillarId)).rejects.toThrow('No research found for this subpillar');
      expect(Research.find).toHaveBeenCalledWith({ subpillar: subpillarId });
      expect(sendLLMRequest).not.toHaveBeenCalled();
    });

    it('should throw an error if LLM response is invalid', async () => {
      // Arrange: Mock valid research data but invalid LLM response
      const subpillarId = 'validSubpillarId';
      const mockResearchData = [
        { content: 'Research content 1', source: 'Source 1' },
      ];
      const mockLLMResponse = ''; // Invalid response
      Research.find.mockResolvedValue(mockResearchData);
      sendLLMRequest.mockResolvedValue(mockLLMResponse);

      // Act & Assert: Expect an error to be thrown
      await expect(generateOutline(subpillarId)).rejects.toThrow('Failed to generate valid outline sections');
      expect(Research.find).toHaveBeenCalledWith({ subpillar: subpillarId });
      expect(sendLLMRequest).toHaveBeenCalled();
    });

    it('should handle LLM request failure gracefully', async () => {
      // Arrange: Mock valid research data and LLM request failure
      const subpillarId = 'validSubpillarId';
      const mockResearchData = [
        { content: 'Research content 1', source: 'Source 1' },
      ];
      Research.find.mockResolvedValue(mockResearchData);
      sendLLMRequest.mockRejectedValue(new Error('LLM request failed'));

      // Act & Assert: Expect an error to be thrown
      await expect(generateOutline(subpillarId)).rejects.toThrow('Failed to generate outline using AI');
      expect(Research.find).toHaveBeenCalledWith({ subpillar: subpillarId });
      expect(sendLLMRequest).toHaveBeenCalled();
    });
  });
});

// End of unit tests for: generateOutline
