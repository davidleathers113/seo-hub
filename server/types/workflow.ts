export interface LLM {
    id: number;
    name: string;
    model_id: string;
    provider: string;
    context_length: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface WorkflowStep {
    id: number;
    name: string;
    description: string;
    order_index: number;
    default_llm_id?: number;
    default_temperature: number;
    default_max_tokens: number;
    default_prompt: string;
    default_llm_name?: string;
    default_model_id?: string;
    default_provider?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface UserStepSettings {
    id: number;
    user_id: number;
    step_id: number;
    llm_id?: number;
    temperature?: number;
    max_tokens?: number;
    custom_prompt?: string;
    llm_name?: string;
    model_id?: string;
    provider?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface WorkflowStepWithSettings extends WorkflowStep {
    user_settings?: UserStepSettings;
}

export interface StepUpdateRequest {
    llm_id?: number;
    temperature?: number;
    max_tokens?: number;
    custom_prompt?: string;
}
