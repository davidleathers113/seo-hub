
// Unit tests for: mergeContentIntoArticle




const { sendLLMRequest, mergeContentIntoArticle } = require('../llm');
const { logger } = require('../../utils/log');
jest.mock("../llm", () => ({
  ...jest.requireActual("../llm"),
  sendLLMRequest: jest.fn(),
}));

describe('mergeContentIntoArticle() mergeContentIntoArticle method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should successfully merge content into an article with valid outline', async () => {
      // Arrange
      const outline = {
        sections: [
          {
            title: 'Introduction',
            contentPoints: [
              { point: 'Point 1', generated: true },
              { point: 'Point 2', generated: true },
            ],
          },
          {
            title: 'Conclusion',
            contentPoints: [
              { point: 'Point 3', generated: true },
            ],
          },
        ],
      };
      const expectedArticle = 'Generated article content';
      sendLLMRequest.mockResolvedValue(expectedArticle);

      // Act
      const result = await mergeContentIntoArticle(outline);

      // Assert
      expect(sendLLMRequest).toHaveBeenCalledWith(
        'openai',
        'gpt-4',
        expect.stringContaining('## Introduction\n\nPoint 1\n\nPoint 2\n\n## Conclusion\n\nPoint 3')
      );
      expect(result).toBe(expectedArticle);
    });
  });

  describe('Edge Cases', () => {
    it('should handle an empty outline gracefully', async () => {
      // Arrange
      const outline = { sections: [] };
      sendLLMRequest.mockResolvedValue('');

      // Act & Assert
      await expect(mergeContentIntoArticle(outline)).rejects.toThrow('Failed to generate article content');
    });

    it('should handle sections with no content points', async () => {
      // Arrange
      const outline = {
        sections: [
          { title: 'Empty Section', contentPoints: [] },
        ],
      };
      sendLLMRequest.mockResolvedValue('');

      // Act & Assert
      await expect(mergeContentIntoArticle(outline)).rejects.toThrow('Failed to generate article content');
    });

    it('should throw an error if sendLLMRequest fails', async () => {
      // Arrange
      const outline = {
        sections: [
          {
            title: 'Introduction',
            contentPoints: [
              { point: 'Point 1', generated: true },
            ],
          },
        ],
      };
      sendLLMRequest.mockRejectedValue(new Error('LLM request failed'));

      // Act & Assert
      await expect(mergeContentIntoArticle(outline)).rejects.toThrow('Failed to merge content into article using AI');
    });
  });
});

// End of unit tests for: mergeContentIntoArticle
