
// Unit tests for: sendLLMRequest




const { sendLLMRequest } = require('../llm');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const { logger } = require('../../utils/log');
jest.mock("openai");
jest.mock("dotenv");

describe('sendLLMRequest() sendLLMRequest method', () => {
  beforeEach(() => {
    dotenv.config.mockClear();
    OpenAI.mockClear();
  });

  describe('Happy Paths', () => {
    it('should send a request to OpenAI and return a response', async () => {
      // Mock the OpenAI client and its response
      const mockResponse = { choices: [{ message: { content: 'OpenAI response' } }] };
      OpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockResponse),
          },
        },
      }));

      const result = await sendLLMRequest('openai', 'gpt-4', 'Test message');
      expect(result).toBe('OpenAI response');
    });

    it('should send a request to Anthropic and return a response', async () => {
      // Mock the Anthropic client and its response
      const mockAnthropic = {
        messages: {
          create: jest.fn().mockResolvedValue({ content: [{ text: 'Anthropic response' }] }),
        },
      };
      global.anthropic = mockAnthropic;

      const result = await sendLLMRequest('anthropic', 'model', 'Test message');
      expect(result).toBe('Anthropic response');
    });
  });

  describe('Edge Cases', () => {
    it('should throw an error for unsupported provider', async () => {
      await expect(sendLLMRequest('unsupported', 'model', 'Test message')).rejects.toThrow(
        'Unsupported LLM provider: unsupported'
      );
    });

    it('should retry on OpenAI request failure and eventually throw an error', async () => {
      // Mock the OpenAI client to throw an error
      OpenAI.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('OpenAI error')),
          },
        },
      }));

      await expect(sendLLMRequest('openai', 'gpt-4', 'Test message')).rejects.toThrow('OpenAI error');
      expect(OpenAI.mock.instances[0].chat.completions.create).toHaveBeenCalledTimes(3);
    });

    it('should retry on Anthropic request failure and eventually throw an error', async () => {
      // Mock the Anthropic client to throw an error
      const mockAnthropic = {
        messages: {
          create: jest.fn().mockRejectedValue(new Error('Anthropic error')),
        },
      };
      global.anthropic = mockAnthropic;

      await expect(sendLLMRequest('anthropic', 'model', 'Test message')).rejects.toThrow('Anthropic error');
      expect(global.anthropic.messages.create).toHaveBeenCalledTimes(3);
    });
  });
});

// End of unit tests for: sendLLMRequest
