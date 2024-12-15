import { Pool } from 'pg';
import { BaseOperations } from './base-operations';
import { ContentGeneration, GenerationRequest } from '../../../interfaces/workflow';

export class GenerationOperations extends BaseOperations {
    constructor(pool: Pool) {
        super(pool);
    }

    async generateContent(
        contentType: ContentGeneration['contentType'],
        contentId: string,
        request: GenerationRequest
    ): Promise<ContentGeneration> {
        const result = await this.query<ContentGeneration>(`
            INSERT INTO content_generations (
                content_id,
                content_type,
                llm_id,
                prompt,
                temperature,
                max_tokens,
                status,
                metadata,
                generated_at
            )
            VALUES (
                $1::uuid,
                $2,
                $3,
                $4,
                $5::decimal,
                $6,
                'pending',
                $7::jsonb,
                CURRENT_TIMESTAMP
            )
            RETURNING 
                id,
                content_id as "contentId",
                content_type as "contentType",
                llm_id as "llmId",
                prompt,
                temperature,
                max_tokens as "maxTokens",
                generated_at as "generatedAt",
                status,
                error,
                metadata,
                created_at as "createdAt",
                updated_at as "updatedAt"
        `, [
            contentId,
            contentType,
            request.llmId,
            request.customPrompt || '',
            request.temperature || 0.7,
            request.maxTokens || 1000,
            JSON.stringify({
                requestMetadata: {
                    timestamp: new Date().toISOString(),
                    customPrompt: request.customPrompt ? true : false,
                    temperature: request.temperature,
                    maxTokens: request.maxTokens
                }
            })
        ]);

        return result.rows[0];
    }

    async getGenerationHistory(contentId: string): Promise<ContentGeneration[]> {
        const result = await this.query<ContentGeneration>(`
            SELECT 
                cg.id,
                cg.content_id as "contentId",
                cg.content_type as "contentType",
                cg.llm_id as "llmId",
                cg.prompt,
                cg.temperature,
                cg.max_tokens as "maxTokens",
                cg.generated_at as "generatedAt",
                cg.status,
                cg.error,
                cg.metadata,
                cg.created_at as "createdAt",
                cg.updated_at as "updatedAt",
                l.name as "llmName",
                l.model_id as "modelId",
                l.provider
            FROM content_generations cg
            LEFT JOIN llms l ON cg.llm_id = l.id
            WHERE cg.content_id = $1::uuid
            ORDER BY cg.generated_at DESC
        `, [contentId]);

        return result.rows;
    }

    async getGenerationById(id: string): Promise<ContentGeneration | null> {
        const result = await this.query<ContentGeneration>(`
            SELECT 
                cg.id,
                cg.content_id as "contentId",
                cg.content_type as "contentType",
                cg.llm_id as "llmId",
                cg.prompt,
                cg.temperature,
                cg.max_tokens as "maxTokens",
                cg.generated_at as "generatedAt",
                cg.status,
                cg.error,
                cg.metadata,
                cg.created_at as "createdAt",
                cg.updated_at as "updatedAt",
                l.name as "llmName",
                l.model_id as "modelId",
                l.provider
            FROM content_generations cg
            LEFT JOIN llms l ON cg.llm_id = l.id
            WHERE cg.id = $1::uuid
        `, [id]);

        return result.rows[0] || null;
    }

    async retryGeneration(id: string): Promise<ContentGeneration> {
        // First get the original generation
        const original = await this.getGenerationById(id);
        if (!original) {
            throw new Error('Generation not found');
        }

        // Create new metadata for retry
        const retryMetadata = {
            retryOf: id,
            originalMetadata: original.metadata,
            retryInfo: {
                timestamp: new Date().toISOString(),
                originalGenerationDate: original.generatedAt,
                reason: 'Manual retry',
                previousStatus: original.status,
                previousError: original.error
            }
        };

        // Create a new generation with the same parameters but as a retry
        const result = await this.query<ContentGeneration>(`
            INSERT INTO content_generations (
                content_id,
                content_type,
                llm_id,
                prompt,
                temperature,
                max_tokens,
                status,
                metadata,
                generated_at
            )
            VALUES (
                $1::uuid,
                $2,
                $3,
                $4,
                $5::decimal,
                $6,
                'pending',
                $7::jsonb,
                CURRENT_TIMESTAMP
            )
            RETURNING 
                id,
                content_id as "contentId",
                content_type as "contentType",
                llm_id as "llmId",
                prompt,
                temperature,
                max_tokens as "maxTokens",
                generated_at as "generatedAt",
                status,
                error,
                metadata,
                created_at as "createdAt",
                updated_at as "updatedAt"
        `, [
            original.contentId,
            original.contentType,
            original.llmId,
            original.prompt,
            original.temperature,
            original.maxTokens,
            JSON.stringify(retryMetadata)
        ]);

        if (result.rows.length === 0) {
            throw new Error('Failed to create retry generation');
        }

        return result.rows[0];
    }

    async updateGenerationStatus(
        id: string,
        status: ContentGeneration['status'],
        error?: string
    ): Promise<ContentGeneration> {
        const result = await this.query<ContentGeneration>(`
            UPDATE content_generations
            SET 
                status = $2,
                error = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1::uuid
            RETURNING 
                id,
                content_id as "contentId",
                content_type as "contentType",
                llm_id as "llmId",
                prompt,
                temperature,
                max_tokens as "maxTokens",
                generated_at as "generatedAt",
                status,
                error,
                metadata,
                created_at as "createdAt",
                updated_at as "updatedAt"
        `, [id, status, error]);

        return result.rows[0];
    }

    async updateGenerationMetadata(
        id: string,
        metadata: Record<string, any>
    ): Promise<ContentGeneration> {
        const result = await this.query<ContentGeneration>(`
            UPDATE content_generations
            SET 
                metadata = $2::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1::uuid
            RETURNING 
                id,
                content_id as "contentId",
                content_type as "contentType",
                llm_id as "llmId",
                prompt,
                temperature,
                max_tokens as "maxTokens",
                generated_at as "generatedAt",
                status,
                error,
                metadata,
                created_at as "createdAt",
                updated_at as "updatedAt"
        `, [id, JSON.stringify(metadata)]);

        return result.rows[0];
    }
}
