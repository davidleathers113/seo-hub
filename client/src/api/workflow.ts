import api from './api';

export interface LLM {
  id: string;
  name: string;
  modelId: string;
  provider: string;
  contextLength: number;
}

export interface StepSettings {
  stepName: string;
  modelId: string;
  temperature: number;
  maxTokens: number;
  prompt: string;
}

export interface WorkflowSettings {
  steps: StepSettings[];
  defaultSteps: StepSettings[];
}

// Get all available LLMs
export const getAllLLMs = async (): Promise<LLM[]> => {
  const response = await api.get('/api/workflow/llms');
  return response.data;
};

// Get LLMs by provider
export const getLLMsByProvider = async (provider: string): Promise<LLM[]> => {
  const response = await api.get(`/api/workflow/llms/${provider}`);
  return response.data;
};

// Get workflow settings
export const getWorkflowSettings = async (): Promise<WorkflowSettings> => {
  const response = await api.get('/api/workflow/settings');
  return response.data;
};

// Update step settings
export const updateStepSettings = async (stepName: string, settings: Partial<StepSettings>): Promise<void> => {
  await api.put(`/api/workflow/steps/${encodeURIComponent(stepName)}/settings`, settings);
};

// Reset all settings to default
export const resetWorkflowSettings = async (): Promise<void> => {
  await api.post('/api/workflow/settings/reset');
};
