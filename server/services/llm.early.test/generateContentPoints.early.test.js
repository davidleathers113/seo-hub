// Unit tests for: generateContentPoints

const { generateContentPoints, sendLLMRequest } = require('../llm');
const { logger } = require('../../utils/log');

jest.mock('../llm', () => ({
  generateContentPoints: jest.requireActual('../llm').generateContentPoints,
  sendLLMRequest: jest.fn()
}));

jest.mock('../../utils/log', () => ({
  logger: jest.fn(() => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }))
}));

describe('generateContentPoints()', () => {
  let mockSection;
  let mockResearch;
  let mockLLMResponse;

  beforeEach(() => {
    mockSection = {
      title: 'Introduction',
      contentPoints: []
    };

    mockResearch = [
      { source: 'Source 1', content: 'Research content 1' },
      { source: 'Source 2', content: 'Research content 2' }
    ];

    mockLLMResponse = `- Point 1: Detailed content about point 1
- Point 2: Detailed content about point 2
- Point 3: Detailed content about point 3`;

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should generate content points for all sections', async () => {
      // Arrange
      sendLLMRequest.mockResolvedValue(mockLLMResponse);

      // Act
      const result = await generateContentPoints(mockSection, mockResearch);

      // Assert
      expect(sendLLMRequest).toHaveBeenCalledTimes(1);
      expect(sendLLMRequest).toHaveBeenCalledWith(
        'openai',
        'gpt-4',
        expect.stringContaining(mockSection.title)
      );
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        point: 'Point 1: Detailed content about point 1',
        generated: true
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty research data', async () => {
      // Arrange
      const emptyResearch = [];

      // Act & Assert
      await expect(generateContentPoints(mockSection, emptyResearch))
        .rejects.toThrow('No research data provided');
    });

    it('should handle invalid LLM response', async () => {
      // Arrange
      sendLLMRequest.mockResolvedValue('');

      // Act & Assert
      await expect(generateContentPoints(mockSection, mockResearch))
        .rejects.toThrow('Failed to generate valid content points');
    });

    it('should handle LLM request failure', async () => {
      // Arrange
      sendLLMRequest.mockRejectedValue(new Error('LLM request failed'));

      // Act & Assert
      await expect(generateContentPoints(mockSection, mockResearch))
        .rejects.toThrow('Failed to generate content points using AI');
    });
  });
});
