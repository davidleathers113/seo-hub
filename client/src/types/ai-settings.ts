import { LLMProvider, AIModel } from "../../../server/services/llm"

export interface AIModelSettings {
  provider: LLMProvider;
  model: AIModel;
  temperature: number;
  maxTokens: number;
}

export interface StepSettings {
  stepName: string;
  modelSettings: AIModelSettings;
  prompt: string;
}

export interface AISettings {
  defaultModelSettings: AIModelSettings;
  steps: StepSettings[];
  defaultSteps: StepSettings[];
}
