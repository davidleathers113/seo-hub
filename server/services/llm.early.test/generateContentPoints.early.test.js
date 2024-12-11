
// Unit tests for: generateContentPoints




const { sendLLMRequest, generateContentPoints } = require('../llm');
const { logger } = require('../../utils/log');
const { sendLLMRequest } = require('../server/services/llm');

jest.mock("../server/services/llm", () => ({
  sendLLMRequest: jest.fn(),
}));

describe('generateContentPoints() generateContentPoints method', () => {
  const mockOutlineSection = { title: 'Sample Section' };
  const mockResearch = [
    { source: 'Source 1', content: 'Content 1' },
    { source: 'Source 2', content: 'Content 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy paths', () => {
    it('should generate content points successfully when valid outline section and research are provided', async () => {
      // Arrange
      const mockResponse = '1. Point 1\n2. Point 2\n3. Point 3';
      sendLLMRequest.mockResolvedValue(mockResponse);

      // Act
      const result = await generateContentPoints(mockOutlineSection, mockResearch);

      // Assert
      expect(sendLLMRequest).toHaveBeenCalledWith(
        'openai',
        'gpt-4',
        expect.stringContaining('Sample Section')
      );
      expect(result).toEqual([
        { point: 'Point 1', generated: true },
        { point: 'Point 2', generated: true },
        { point: 'Point 3', generated: true },
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty research array gracefully', async () => {
      // Arrange
      const emptyResearch = [];
      const mockResponse = '1. Point 1\n2. Point 2';
      sendLLMRequest.mockResolvedValue(mockResponse);

      // Act
      const result = await generateContentPoints(mockOutlineSection, emptyResearch);

      // Assert
      expect(sendLLMRequest).toHaveBeenCalledWith(
        'openai',
        'gpt-4',
        expect.stringContaining('Sample Section')
      );
      expect(result).toEqual([
        { point: 'Point 1', generated: true },
        { point: 'Point 2', generated: true },
      ]);
    });

    it('should throw an error if no content points are generated', async () => {
      // Arrange
      const mockResponse = '';
      sendLLMRequest.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(generateContentPoints(mockOutlineSection, mockResearch))
        .rejects
        .toThrow('Failed to generate valid content points');
    });

    it('should throw an error if sendLLMRequest fails', async () => {
      // Arrange
      sendLLMRequest.mockRejectedValue(new Error('LLM request failed'));

      // Act & Assert
      await expect(generateContentPoints(mockOutlineSection, mockResearch))
        .rejects
        .toThrow('Failed to generate content points using AI');
    });
  });
});

// End of unit tests for: generateContentPoints
