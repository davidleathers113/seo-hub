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

describe('generateContentPoints() generateContentPoints method', () => {
  let mockOutline;
  let mockLLMResponse;

  beforeEach(() => {
    mockOutline = {
      sections: [
        { title: 'Introduction', contentPoints: [] },
        { title: 'Main Section', contentPoints: [] }
      ]
    };

    mockLLMResponse = [
      'Point 1',
      'Point 2',
      'Point 3'
    ];

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should generate content points for all sections', async () => {
      // Arrange
      sendLLMRequest.mockResolvedValue(mockLLMResponse);

      // Act
      const result = await generateContentPoints(mockOutline);

      // Assert
      expect(sendLLMRequest).toHaveBeenCalledTimes(mockOutline.sections.length);
      expect(result.sections[0].contentPoints).toEqual(mockLLMResponse);
      expect(result.sections[1].contentPoints).toEqual(mockLLMResponse);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty outline', async () => {
      // Arrange
      const emptyOutline = { sections: [] };

      // Act
      const result = await generateContentPoints(emptyOutline);

      // Assert
      expect(result.sections).toEqual([]);
    });

    it('should handle LLM request failure', async () => {
      // Arrange
      sendLLMRequest.mockRejectedValue(new Error('LLM request failed'));

      // Act & Assert
      await expect(generateContentPoints(mockOutline)).rejects.toThrow('Failed to generate content points');
    });

    it('should handle invalid LLM response', async () => {
      // Arrange
      sendLLMRequest.mockResolvedValue(null);

      // Act & Assert
      await expect(generateContentPoints(mockOutline)).rejects.toThrow('Invalid content points received from LLM');
    });
  });
});

// End of unit tests for: generateContentPoints
