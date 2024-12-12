declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      SESSION_SECRET: string;
      REDIS_URL: string;
      OPENROUTER_API_KEY: string;
      APP_URL: string;
      // Legacy API keys (can be removed if not needed)
      OPENAI_API_KEY?: string;
      ANTHROPIC_API_KEY?: string;
    }
  }
}

export {};