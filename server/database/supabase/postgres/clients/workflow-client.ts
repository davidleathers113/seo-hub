import { BasePostgresClient } from '../base-client';
import { LLMOperations } from './workflow/llm-operations';
import { StepOperations } from './workflow/step-operations';
import { GenerationOperations } from './workflow/generation-operations';
import { 
    LLM, 
    WorkflowStep, 
    UserStepSettings,
    ContentGeneration,
    GenerationRequest 
} from '../../interfaces/workflow';

export class WorkflowClient extends BasePostgresClient {
    private llmOps!: LLMOperations;
    private stepOps!: StepOperations;
    private genOps!: GenerationOperations;

    constructor(config: { uri?: string } = {}) {
        super(config);
        // Initialize operation classes after super() has created the pool
        this.initializeOperations();
    }

    private initializeOperations(): void {
        this.llmOps = new LLMOperations(this.pool);
        this.stepOps = new StepOperations(this.pool);
        this.genOps = new GenerationOperations(this.pool);
    }

    // LLM Operations
    async getAllLLMs(): Promise<LLM[]> {
        return this.llmOps.getAllLLMs();
    }

    async getLLMsByProvider(provider: string): Promise<LLM[]> {
        return this.llmOps.getLLMsByProvider(provider);
    }

    // Workflow Step Operations
    async getWorkflowSteps(): Promise<WorkflowStep[]> {
        return this.stepOps.getWorkflowSteps();
    }

    async getUserStepSettings(userId: number): Promise<UserStepSettings[]> {
        return this.stepOps.getUserStepSettings(userId);
    }

    async updateUserStepSettings(
        userId: number,
        stepId: number,
        settings: Partial<UserStepSettings>
    ): Promise<void> {
        return this.stepOps.updateUserStepSettings(userId, stepId, settings);
    }

    async resetUserStepSettings(userId: number): Promise<void> {
        return this.stepOps.resetUserStepSettings(userId);
    }

    // Content Generation Operations
    async generateContent(
        contentType: ContentGeneration['contentType'],
        contentId: string,
        request: GenerationRequest
    ): Promise<ContentGeneration> {
        return this.genOps.generateContent(contentType, contentId, request);
    }

    async getGenerationHistory(contentId: string): Promise<ContentGeneration[]> {
        return this.genOps.getGenerationHistory(contentId);
    }

    async getGenerationById(id: string): Promise<ContentGeneration | null> {
        return this.genOps.getGenerationById(id);
    }

    async retryGeneration(id: string): Promise<ContentGeneration> {
        return this.genOps.retryGeneration(id);
    }

    async updateGenerationStatus(
        id: string,
        status: ContentGeneration['status'],
        error?: string
    ): Promise<ContentGeneration> {
        return this.genOps.updateGenerationStatus(id, status, error);
    }

    async updateGenerationMetadata(
        id: string,
        metadata: Record<string, any>
    ): Promise<ContentGeneration> {
        return this.genOps.updateGenerationMetadata(id, metadata);
    }
}
