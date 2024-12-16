import { Pool } from 'pg';
import { BaseOperations } from './base-operations';
import { WorkflowStep, UserStepSettings } from '../../../../types/workflow';

export class StepOperations extends BaseOperations {
    constructor(pool: Pool) {
        super(pool);
    }

    async getWorkflowSteps(): Promise<WorkflowStep[]> {
        const result = await this.query<WorkflowStep>(`
            SELECT 
                ws.*,
                l.name as default_llm_name,
                l.model_id as default_model_id,
                l.provider as default_provider
            FROM workflow_steps ws
            LEFT JOIN llms l ON ws.default_llm_id = l.id
            ORDER BY ws.order_index
        `);
        return result.rows;
    }

    async getUserStepSettings(userId: number): Promise<UserStepSettings[]> {
        const result = await this.query<UserStepSettings>(`
            SELECT 
                uss.*,
                l.name as llm_name,
                l.model_id,
                l.provider
            FROM user_step_settings uss
            LEFT JOIN llms l ON uss.llm_id = l.id
            WHERE uss.user_id = $1
        `, [userId]);
        return result.rows;
    }

    async updateUserStepSettings(
        userId: number,
        stepId: number,
        settings: Partial<UserStepSettings>
    ): Promise<void> {
        await this.query(`
            INSERT INTO user_step_settings (
                user_id, step_id, llm_id, temperature, max_tokens, custom_prompt
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id, step_id)
            DO UPDATE SET
                llm_id = EXCLUDED.llm_id,
                temperature = EXCLUDED.temperature,
                max_tokens = EXCLUDED.max_tokens,
                custom_prompt = EXCLUDED.custom_prompt,
                updated_at = CURRENT_TIMESTAMP
        `, [
            userId,
            stepId,
            settings.llm_id,
            settings.temperature,
            settings.max_tokens,
            settings.custom_prompt
        ]);
    }

    async resetUserStepSettings(userId: number): Promise<void> {
        await this.query('DELETE FROM user_step_settings WHERE user_id = $1', [userId]);
    }
}
