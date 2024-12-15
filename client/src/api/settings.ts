import api from './api';
import { AISettings, AIModelSettings, StepSettings } from '../types/ai-settings';
import { LLMProvider, AIModel } from '../../../server/services/llm';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

// Update User Profile
export const updateProfile = (data: { name: string; email: string }): Promise<ApiResponse<void>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: undefined,
        success: true,
        message: "Profile updated successfully"
      });
    }, 1000);
  });
};

// Change Password
export const changePassword = (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: undefined,
        success: true,
        message: "Password changed successfully"
      });
    }, 1000);
  });
};

// Get AI Settings
export const getAISettings = (): Promise<ApiResponse<AISettings>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          defaultModelSettings: {
            provider: LLMProvider.OPENAI,
            model: AIModel.GPT_4,
            temperature: 0.7,
            maxTokens: 1000
          },
          steps: [],
          defaultSteps: [
            {
              stepName: 'Niche Selection',
              modelSettings: {
                provider: LLMProvider.OPENAI,
                model: AIModel.GPT_4,
                temperature: 0.7,
                maxTokens: 1000
              },
              prompt: 'Analyze the following niche market...'
            },
            {
              stepName: 'Content Planning',
              modelSettings: {
                provider: LLMProvider.ANTHROPIC,
                model: AIModel.CLAUDE_2,
                temperature: 0.5,
                maxTokens: 2000
              },
              prompt: 'Create a content strategy for...'
            },
            {
              stepName: 'Article Generation',
              modelSettings: {
                provider: LLMProvider.OPENAI,
                model: AIModel.GPT_4_32K,
                temperature: 0.8,
                maxTokens: 4000
              },
              prompt: 'Write an engaging article about...'
            }
          ]
        },
        success: true,
        message: "AI settings retrieved successfully"
      });
    }, 1000);
  });
};

// Update Default Model Settings
export const updateDefaultModelSettings = (settings: AIModelSettings): Promise<ApiResponse<void>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: undefined,
        success: true,
        message: "Default model settings updated successfully"
      });
    }, 1000);
  });
};

// Update Step Settings
export const updateStepSettings = (stepSettings: StepSettings[]): Promise<ApiResponse<void>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: undefined,
        success: true,
        message: "Step settings updated successfully"
      });
    }, 1000);
  });
};

// Reset Steps to Default
export const resetSteps = (): Promise<ApiResponse<void>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: undefined,
        success: true,
        message: "Steps reset to default"
      });
    }, 1000);
  });
};

// Update Settings
export const updateSettings = (data: { [key: string]: any }): Promise<ApiResponse<void>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: undefined,
        success: true,
        message: "Settings updated successfully"
      });
    }, 1000);
  });
};

// Export User Data
export const exportUserData = (): Promise<ApiResponse<{ niches: any[]; pillars: any[]; articles: any[] }>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          niches: [],
          pillars: [],
          articles: []
        },
        success: true,
        message: "Data exported successfully"
      });
    }, 1000);
  });
};

// Delete Account
export const deleteAccount = (): Promise<ApiResponse<void>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: undefined,
        success: true,
        message: "Account deleted successfully"
      });
    }, 1000);
  });
};
