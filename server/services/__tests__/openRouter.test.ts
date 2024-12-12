import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import axios from 'axios';
import OpenRouterService from '../openRouter';
import { OPENROUTER_MODELS } from '../../config/openRouter';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenRouterService', () => {
  let openRouter: OpenRouterService;
  const mockApiKey = 'test-api-key';
  const mockBaseURL = 'https://openrouter.ai/api/v1';
  const mockAppUrl = 'http://localhost:3001';

  beforeEach(() => {
    // Reset environment variables
    process.env.OPENROUTER_API_KEY = mockApiKey;
    process.env.APP_URL = mockAppUrl;

    // Reset axios mocks
    mockedAxios.create.mockReturnValue(mockedAxios);

    openRouter = new OpenRouterService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: mockBaseURL,
        headers: {
          'Authorization': `Bearer ${mockApiKey}`,
          'HTTP-Referer': mockAppUrl,
          'X-Title': 'Content Creation App',
          'Content-Type': 'application/json'
        }
      });
    });

    it('should throw error if API key is not set', () => {
      delete process.env.OPENROUTER_API_KEY;
      expect(() => new OpenRouterService()).toThrow('OPENROUTER_API_KEY is not set');
    });

    it('should allow custom configuration', () => {
      const customConfig = {
        apiKey: 'custom-key',
        baseURL: 'custom-url',
        httpReferrer: 'custom-referer',
        title: 'Custom App'
      };

      const customService = new OpenRouterService(customConfig);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: customConfig.baseURL,
        headers: {
          'Authorization': `Bearer ${customConfig.apiKey}`,
          'HTTP-Referer': customConfig.httpReferrer,
          'X-Title': customConfig.title,
          'Content-Type': 'application/json'
        }
      });
    });
  });

  describe('generateCompletion', () => {
    const mockPrompt = 'Test prompt';
    const mockResponse = {
      data: {
        id: 'test-id',
        choices: [{
          message: {
            content: 'Test response',
            role: 'assistant'
          },
          finish_reason: 'stop'
        }],
        model: OPENROUTER_MODELS.GPT4,
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      }
    };

    it('should generate completion with string prompt', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await openRouter.generateCompletion(mockPrompt);

      expect(result).toBe('Test response');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          model: OPENROUTER_MODELS.GPT4,
          messages: [{
            role: 'user',
            content: mockPrompt
          }]
        })
      );
    });

    it('should generate completion with message array', async () => {
      const messages = [
        { role: 'system' as const, content: 'You are a helpful assistant' },
        { role: 'user' as const, content: 'Hello' }
      ];

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await openRouter.generateCompletion(messages);

      expect(result).toBe('Test response');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          messages
        })
      );
    });

    it('should handle API errors with detailed logging', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: 'Invalid request'
          }
        }
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(openRouter.generateCompletion(mockPrompt))
        .rejects
        .toThrow('OpenRouter API Error: Invalid request');

      expect(consoleSpy).toHaveBeenCalledWith(
        'OpenRouter API Error:',
        expect.objectContaining({
          status: 400,
          message: 'Invalid request'
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('generateWithRetry', () => {
    it('should retry on failure and succeed', async () => {
      const mockError = new Error('API Error');
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'Success after retry',
              role: 'assistant'
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30
          }
        }
      };

      mockedAxios.post
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse);

      const result = await openRouter.generateWithRetry('test', {}, 2, 0);

      expect(result).toBe('Success after retry');
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should implement exponential backoff', async () => {
      jest.useFakeTimers();

      const mockError = new Error('API Error');
      mockedAxios.post.mockRejectedValue(mockError);

      const promise = openRouter.generateWithRetry('test', {}, 3, 1000);

      // First retry after 1000ms
      jest.advanceTimersByTime(1000);
      // Second retry after 2000ms
      jest.advanceTimersByTime(2000);

      await expect(promise).rejects.toThrow('API Error');

      expect(mockedAxios.post).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });
  });

  describe('getTokenUsage', () => {
    it('should return token count for prompt', async () => {
      const mockResponse = {
        data: {
          usage: {
            prompt_tokens: 15,
            completion_tokens: 0,
            total_tokens: 15
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const tokenCount = await openRouter.getTokenUsage('test prompt');

      expect(tokenCount).toBe(15);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({
          model: OPENROUTER_MODELS.GPT35_TURBO,
          max_tokens: 1
        })
      );
    });

    it('should handle errors in token counting', async () => {
      const mockError = new Error('Token count failed');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(openRouter.getTokenUsage('test'))
        .rejects
        .toThrow('Token count failed');
    });
  });
});