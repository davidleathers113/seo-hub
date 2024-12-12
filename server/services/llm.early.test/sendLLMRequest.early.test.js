// Unit tests for: sendLLMRequest
const FixtureHelper = require('../../test/helpers/fixtureHelper');

jest.mock('openai');
jest.mock('anthropic');

const {
  OpenAI,
  mockOpenAI,
  mockAnthropic,
  resetMocks,
  setOpenAIResponse,
  setAnthropicResponse,
  setOpenAIFailure,
  setAnthropicFailure
} = require('../__mocks__/llm');

// Set up OpenAI mock
require('openai').OpenAI = OpenAI;

// Set up Anthropic mock
jest.mock('anthropic', () => mockAnthropic);

const { sendLLMRequest } = require('../llm');

describe('sendLLMRequest() method', () => {
  beforeAll(async () => {
    await FixtureHelper.initializeFixtures();
  });

  afterAll(async () => {
    await FixtureHelper.clearFixtures();
  });

  beforeEach(() => {
    resetMocks();
  });

  describe('OpenAI Integration', () => {
    it('should send request to OpenAI successfully and return formatted response', async () => {
      // Get test data from database
      const response = await FixtureHelper.getResponse('openai', 'default');
      const message = await FixtureHelper.getTestData('message');

      setOpenAIResponse(response);

      const result = await sendLLMRequest('openai', 'gpt-4', message.simple);

      expect(result).toBe(response);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: message.simple }],
        max_tokens: 1024,
      });
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('should handle OpenAI errors with proper error message', async () => {
      const errorMessage = await FixtureHelper.getError('openai', 'rateLimit');
      const message = await FixtureHelper.getTestData('message');

      setOpenAIFailure(true, errorMessage);

      await expect(sendLLMRequest('openai', 'gpt-4', message.simple))
        .rejects
        .toThrow(errorMessage);
    });

    it('should implement retry logic for OpenAI failures', async () => {
      const errorMessage = await FixtureHelper.getError('openai', 'default');
      const message = await FixtureHelper.getTestData('message');

      setOpenAIFailure(true, errorMessage);

      try {
        await sendLLMRequest('openai', 'gpt-4', message.simple);
      } catch (error) {
        expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(3);
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('Anthropic Integration', () => {
    it('should send request to Anthropic successfully', async () => {
      const response = await FixtureHelper.getResponse('anthropic', 'default');
      const message = await FixtureHelper.getTestData('message');

      setAnthropicResponse(response);

      const result = await sendLLMRequest('anthropic', 'claude-2', message.simple);

      expect(result).toBe(response);
      expect(mockAnthropic.messages.create).toHaveBeenCalledWith({
        model: 'claude-2',
        messages: [{ role: 'user', content: message.simple }],
        max_tokens: 1024,
      });
    });

    it('should handle Anthropic errors and implement retry logic', async () => {
      const errorMessage = await FixtureHelper.getError('anthropic', 'default');
      const message = await FixtureHelper.getTestData('message');

      setAnthropicFailure(true, errorMessage);

      try {
        await sendLLMRequest('anthropic', 'claude-2', message.simple);
      } catch (error) {
        expect(mockAnthropic.messages.create).toHaveBeenCalledTimes(3);
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw an error for unsupported providers', async () => {
      const message = await FixtureHelper.getTestData('message');
      const invalidProvider = 'invalid';

      await expect(sendLLMRequest(invalidProvider, 'model', message.simple))
        .rejects
        .toThrow(`Unsupported LLM provider: ${invalidProvider}`);
    });

    it('should handle network timeouts', async () => {
      const timeoutError = await FixtureHelper.getError('openai', 'timeout');
      const message = await FixtureHelper.getTestData('message');

      setOpenAIFailure(true, timeoutError);

      await expect(sendLLMRequest('openai', 'gpt-4', message.simple))
        .rejects
        .toThrow(timeoutError);
    });
  });

  describe('LLM Service Health Check', () => {
    it('should verify server connection', async () => {
      const mockResponse = { status: 'healthy' };
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
      );

      const result = await sendLLMRequest('test');
      expect(result).toBeDefined();
    });

    it('should handle connection errors gracefully', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Connection refused')));

      await expect(sendLLMRequest('test')).rejects.toThrow('Failed to process LLM request');
    });
  });
});

// End of unit tests for: sendLLMRequest
