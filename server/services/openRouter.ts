import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
import { OPENROUTER_MODELS, OpenRouterModel, getModelConfig } from '../config/openRouter';

dotenv.config();

interface OpenRouterConfig {
  apiKey: string;
  baseURL: string;
  defaultModel: OpenRouterModel;
  httpReferrer?: string;
  title?: string;
}

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
}

interface OpenRouterRequestParams {
  model: OpenRouterModel;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stream?: boolean;
  transforms?: string[];
  stop?: string[];
}

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenRouterService {
  private client: AxiosInstance;
  private config: OpenRouterConfig;

  constructor(config?: Partial<OpenRouterConfig>) {
    this.config = {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultModel: OPENROUTER_MODELS.GPT4,
      httpReferrer: process.env.APP_URL || 'http://localhost:3001',
      title: 'Content Creation App',
      ...config
    };

    if (!this.config.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables');
    }

    this.client = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': this.config.httpReferrer,
        'X-Title': this.config.title,
        'Content-Type': 'application/json'
      }
    });
  }

  async generateCompletion(
    prompt: string | OpenRouterMessage[],
    options: Partial<OpenRouterRequestParams> = {}
  ): Promise<string> {
    try {
      const messages = Array.isArray(prompt) ? prompt : [{
        role: 'user',
        content: prompt
      }];

      const modelConfig = getModelConfig(options.model || this.config.defaultModel);

      const requestParams: OpenRouterRequestParams = {
        model: modelConfig.model,
        messages,
        max_tokens: options.max_tokens || modelConfig.maxTokens,
        temperature: options.temperature || modelConfig.temperature,
        top_p: options.top_p,
        top_k: options.top_k,
        stream: options.stream || false,
        transforms: options.transforms,
        stop: options.stop
      };

      const response = await this.client.post<OpenRouterResponse>(
        '/chat/completions',
        requestParams
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No completion choices returned from OpenRouter');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error('OpenRouter API Error:', {
          status: error.response?.status,
          message: errorMessage,
          model: options.model || this.config.defaultModel
        });
        throw new Error(`OpenRouter API Error: ${errorMessage}`);
      }
      throw error;
    }
  }

  async generateWithRetry(
    prompt: string | OpenRouterMessage[],
    options: Partial<OpenRouterRequestParams> = {},
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generateCompletion(prompt, options);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) break;

        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateCompletion('test', {
        model: OPENROUTER_MODELS.GPT35_TURBO,
        max_tokens: 5
      });
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Helper method to get token usage for cost estimation
  async getTokenUsage(prompt: string | OpenRouterMessage[]): Promise<number> {
    try {
      const response = await this.client.post<OpenRouterResponse>(
        '/chat/completions',
        {
          model: OPENROUTER_MODELS.GPT35_TURBO,
          messages: Array.isArray(prompt) ? prompt : [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 1
        }
      );
      return response.data.usage.prompt_tokens;
    } catch (error) {
      console.error('Failed to get token usage:', error);
      throw error;
    }
  }
}

export default OpenRouterService;