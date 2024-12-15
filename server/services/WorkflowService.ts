import { db } from '../database';
import { LLM, WorkflowStep, UserStepSettings } from '../types/workflow';
import { logger } from '../utils/log';

const log = logger('services/WorkflowService');

/**
 * WorkflowService handles workflow-specific operations that require complex SQL queries.
 * 
 * Note: Unlike other services that use DatabaseClient for CRUD operations,
 * WorkflowService intentionally uses direct database access through db.query.
 * This is because:
 * 1. Workflow operations require complex SQL queries with joins and specific PostgreSQL features
 * 2. These operations don't map well to the generic CRUD operations in DatabaseClient
 * 3. The queries are workflow-specific and benefit from direct SQL access
 * 4. Performance is critical for workflow operations, and direct queries are more efficient
 */
export class WorkflowService {
    /**
     * Fetch all available Language Learning Models (LLMs).
     * Uses a direct SQL query to efficiently retrieve LLM data in a single operation.
     */
    async getAllLLMs(): Promise<LLM[]> {
        try {
            log.info('Fetching all LLMs');
            const query = `
                SELECT id, name, model_id, provider, context_length
                FROM llms
                ORDER BY provider, name
            `;
            const result = await db.query(query);
            log.info(`Retrieved ${result.rows.length} LLMs`);
            return result.rows;
        } catch (error) {
            log.error('Error fetching LLMs:', error);
            throw error;
        }
    }

    /**
     * Fetch LLMs by provider.
     * Uses parameterized query for security and efficient provider-specific retrieval.
     */
    async getLLMsByProvider(provider: string): Promise<LLM[]> {
        try {
            log.info(`Fetching LLMs for provider: ${provider}`);
            const query = `
                SELECT id, name, model_id, provider, context_length
                FROM llms
                WHERE provider = $1
                ORDER BY name
            `;
            const result = await db.query(query, [provider]);
            log.info(`Retrieved ${result.rows.length} LLMs for provider ${provider}`);
            return result.rows;
        } catch (error) {
            log.error(`Error fetching LLMs for provider ${provider}:`, error);
            throw error;
        }
    }

    /**
     * Fetch all workflow steps with their default settings.
     * Uses a complex JOIN operation that's more efficient with direct SQL.
     */
    async getWorkflowSteps(): Promise<WorkflowStep[]> {
        try {
            log.info('Fetching workflow steps');
            const query = `
                SELECT 
                    ws.id,
                    ws.name,
                    ws.description,
                    ws.order_index,
                    ws.default_temperature,
                    ws.default_max_tokens,
                    ws.default_prompt,
                    l.id as default_llm_id,
                    l.name as default_llm_name,
                    l.model_id as default_model_id,
                    l.provider as default_provider
                FROM workflow_steps ws
                LEFT JOIN llms l ON ws.default_llm_id = l.id
                ORDER BY ws.order_index
            `;
            const result = await db.query(query);
            log.info(`Retrieved ${result.rows.length} workflow steps`);
            return result.rows;
        } catch (error) {
            log.error('Error fetching workflow steps:', error);
            throw error;
        }
    }

    /**
     * Get user's custom settings for workflow steps.
     * Requires complex JOIN operation and user-specific filtering.
     */
    async getUserStepSettings(userId: string): Promise<UserStepSettings[]> {
        try {
            log.info(`Fetching settings for user: ${userId}`);
            const query = `
                SELECT 
                    uss.id,
                    uss.step_id,
                    uss.temperature,
                    uss.max_tokens,
                    uss.custom_prompt,
                    l.id as llm_id,
                    l.name as llm_name,
                    l.model_id,
                    l.provider
                FROM user_step_settings uss
                LEFT JOIN llms l ON uss.llm_id = l.id
                WHERE uss.user_id = $1::uuid
            `;
            const result = await db.query(query, [userId]);
            log.info(`Retrieved ${result.rows.length} settings for user ${userId}`);
            return result.rows;
        } catch (error) {
            log.error(`Error fetching settings for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Update user's settings for a specific step.
     * Uses PostgreSQL-specific UPSERT operation that's not available in generic CRUD.
     */
    async updateUserStepSettings(
        userId: string,
        stepId: number,
        settings: Partial<UserStepSettings>
    ): Promise<void> {
        try {
            log.info(`Updating settings for user ${userId}, step ${stepId}`);
            const query = `
                INSERT INTO user_step_settings (
                    user_id, step_id, llm_id, temperature, max_tokens, custom_prompt
                )
                VALUES ($1::uuid, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id, step_id)
                DO UPDATE SET
                    llm_id = EXCLUDED.llm_id,
                    temperature = EXCLUDED.temperature,
                    max_tokens = EXCLUDED.max_tokens,
                    custom_prompt = EXCLUDED.custom_prompt,
                    updated_at = CURRENT_TIMESTAMP
            `;
            
            await db.query(query, [
                userId,
                stepId,
                settings.llm_id,
                settings.temperature,
                settings.max_tokens,
                settings.custom_prompt
            ]);
            log.info(`Successfully updated settings for user ${userId}, step ${stepId}`);
        } catch (error) {
            log.error(`Error updating settings for user ${userId}, step ${stepId}:`, error);
            throw error;
        }
    }

    /**
     * Reset user's settings for all steps to default.
     * Simple but critical operation that benefits from direct SQL access.
     */
    async resetUserStepSettings(userId: string): Promise<void> {
        try {
            log.info(`Resetting settings for user ${userId}`);
            const query = `
                DELETE FROM user_step_settings
                WHERE user_id = $1::uuid
            `;
            await db.query(query, [userId]);
            log.info(`Successfully reset settings for user ${userId}`);
        } catch (error) {
            log.error(`Error resetting settings for user ${userId}:`, error);
            throw error;
        }
    }
}
