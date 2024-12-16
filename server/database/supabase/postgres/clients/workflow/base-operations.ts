import { Pool, QueryResult, QueryResultRow } from 'pg';

export class BaseOperations {
    protected pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    protected async query<T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
        try {
            return await this.pool.query<T>(text, params);
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
}
