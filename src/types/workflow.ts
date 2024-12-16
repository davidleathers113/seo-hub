export type WorkflowStep =
  | 'research'
  | 'pillar-validation'
  | 'subpillar-validation'
  | 'outline-validation'
  | 'content-generation'
  | 'content-review'
  | 'seo-validation'
  | 'final-review';

export type WorkflowStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'needs_review';

export interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  status: WorkflowStatus;
  lastUpdated: string;
  metadata: Record<string, unknown>;
}

export interface StepValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface WorkflowSettings {
  autoAdvance: boolean;
  requireApproval: boolean;
  notifyOnCompletion: boolean;
  aiModel: string;
  temperature: number;
  maxTokens: number;
}

export interface StepMetadata {
  startTime: string;
  endTime?: string;
  duration?: number;
  attempts: number;
  lastError?: string;
}