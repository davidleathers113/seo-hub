import { LLM, WorkflowStep, UserStepSettings } from '../../types/workflow';

export { LLM, WorkflowStep, UserStepSettings };

export interface ContentGeneration {
    id: string;
    contentId: string;
    contentType: 'pillar' | 'subpillar' | 'outline' | 'article';
    llmId: number;
    prompt: string;
    temperature: number;
    maxTokens: number;
    generatedAt: Date;
    status: 'pending' | 'completed' | 'failed';
    error?: string;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
    llmName?: string;
    modelId?: string;
    provider?: string;
}

export interface GenerationRequest {
    llmId: number;
    temperature?: number;
    maxTokens?: number;
    customPrompt?: string;
}

export interface WorkflowClient {
    // LLM Methods
    getAllLLMs(): Promise<LLM[]>;
    getLLMsByProvider(provider: string): Promise<LLM[]>;

    // Workflow Step Methods
    getWorkflowSteps(): Promise<WorkflowStep[]>;
    getUserStepSettings(userId: number): Promise<UserStepSettings[]>;
    updateUserStepSettings(userId: number, stepId: number, settings: Partial<UserStepSettings>): Promise<void>;
    resetUserStepSettings(userId: number): Promise<void>;

    // Content Generation Methods
    generateContent(contentType: ContentGeneration['contentType'], contentId: string, request: GenerationRequest): Promise<ContentGeneration>;
    getGenerationHistory(contentId: string): Promise<ContentGeneration[]>;
    getGenerationById(id: string): Promise<ContentGeneration | null>;
    retryGeneration(id: string): Promise<ContentGeneration>;
    updateGenerationStatus(id: string, status: ContentGeneration['status'], error?: string): Promise<ContentGeneration>;
    updateGenerationMetadata(id: string, metadata: Record<string, any>): Promise<ContentGeneration>;
}
