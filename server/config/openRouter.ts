export const OPENROUTER_MODELS = {
  GPT4: 'openai/gpt-4',
  GPT4_32K: 'openai/gpt-4-32k',
  GPT35_TURBO: 'openai/gpt-3.5-turbo',
  CLAUDE: 'anthropic/claude-2',
  CLAUDE_INSTANT: 'anthropic/claude-instant-v1',
  PALM: 'google/palm-2-chat-bison',
  LLAMA2: 'meta-llama/llama-2-70b-chat',
  MISTRAL: 'mistralai/mistral-7b-instruct',
  YI: 'zero-one-ai/yi-34b-chat'
} as const;

export type OpenRouterModel = typeof OPENROUTER_MODELS[keyof typeof OPENROUTER_MODELS];

export interface OpenRouterModelConfig {
  model: OpenRouterModel;
  maxTokens: number;
  temperature: number;
  description: string;
  costPer1kTokens: number;
}

export const MODEL_CONFIGS: Record<OpenRouterModel, OpenRouterModelConfig> = {
  [OPENROUTER_MODELS.GPT4]: {
    model: OPENROUTER_MODELS.GPT4,
    maxTokens: 4096,
    temperature: 0.7,
    description: 'Most capable GPT-4 model, best for complex tasks',
    costPer1kTokens: 0.01
  },
  [OPENROUTER_MODELS.GPT4_32K]: {
    model: OPENROUTER_MODELS.GPT4_32K,
    maxTokens: 32768,
    temperature: 0.7,
    description: 'GPT-4 with extended context window',
    costPer1kTokens: 0.02
  },
  [OPENROUTER_MODELS.GPT35_TURBO]: {
    model: OPENROUTER_MODELS.GPT35_TURBO,
    maxTokens: 4096,
    temperature: 0.7,
    description: 'Fast and cost-effective for simpler tasks',
    costPer1kTokens: 0.001
  },
  [OPENROUTER_MODELS.CLAUDE]: {
    model: OPENROUTER_MODELS.CLAUDE,
    maxTokens: 8192,
    temperature: 0.7,
    description: 'Anthropic\'s most capable model',
    costPer1kTokens: 0.008
  },
  [OPENROUTER_MODELS.CLAUDE_INSTANT]: {
    model: OPENROUTER_MODELS.CLAUDE_INSTANT,
    maxTokens: 4096,
    temperature: 0.7,
    description: 'Faster, cheaper version of Claude',
    costPer1kTokens: 0.0004
  },
  [OPENROUTER_MODELS.PALM]: {
    model: OPENROUTER_MODELS.PALM,
    maxTokens: 8192,
    temperature: 0.7,
    description: 'Google\'s PaLM 2 model',
    costPer1kTokens: 0.0005
  },
  [OPENROUTER_MODELS.LLAMA2]: {
    model: OPENROUTER_MODELS.LLAMA2,
    maxTokens: 4096,
    temperature: 0.7,
    description: 'Meta\'s most capable open model',
    costPer1kTokens: 0.0004
  },
  [OPENROUTER_MODELS.MISTRAL]: {
    model: OPENROUTER_MODELS.MISTRAL,
    maxTokens: 4096,
    temperature: 0.7,
    description: 'Efficient open source model',
    costPer1kTokens: 0.0002
  },
  [OPENROUTER_MODELS.YI]: {
    model: OPENROUTER_MODELS.YI,
    maxTokens: 4096,
    temperature: 0.7,
    description: 'High performance Yi model',
    costPer1kTokens: 0.0003
  }
};

export const DEFAULT_MODEL = OPENROUTER_MODELS.GPT4;
export const FALLBACK_MODEL = OPENROUTER_MODELS.GPT35_TURBO;

export const getModelConfig = (model: OpenRouterModel): OpenRouterModelConfig => {
  return MODEL_CONFIGS[model];
};

export const estimateCost = (model: OpenRouterModel, tokens: number): number => {
  const config = MODEL_CONFIGS[model];
  return (tokens / 1000) * config.costPer1kTokens;
};