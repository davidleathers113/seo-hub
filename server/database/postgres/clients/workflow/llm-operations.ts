import { Pool } from 'pg';
import { BaseOperations } from './base-operations';
import { LLM } from '../../../../types/workflow';

export class LLMOperations extends BaseOperations {
    constructor(pool: Pool) {
        super(pool);
    }

    async getAllLLMs(): Promise<LLM[]> {
        const result = await this.query<LLM>('SELECT * FROM llms ORDER BY provider, name');
        return result.rows;
    }

    async getLLMsByProvider(provider: string): Promise<LLM[]> {
        const result = await this.query<LLM>(
            'SELECT * FROM llms WHERE provider = $1 ORDER BY name',
            [provider]
        );
        return result.rows;
    }
}
