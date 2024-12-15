import { Pool, QueryResult, QueryResultRow, PoolClient } from 'pg';
import { WhereClauseResult } from './types';

export class BasePostgresClient {
    protected pool: Pool;

    constructor(config: { uri?: string } = {}) {
        this.pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'content_creation_app',
            password: process.env.DB_PASSWORD || 'postgres',
            port: parseInt(process.env.DB_PORT || '5432'),
        });
    }

    async connect(): Promise<void> {
        try {
            await this.pool.connect();
        } catch (error) {
            console.error('Failed to connect to PostgreSQL:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        await this.pool.end();
    }

    async healthCheck(): Promise<boolean> {
        try {
            await this.pool.query('SELECT 1');
            return true;
        } catch (error) {
            return false;
        }
    }

    protected async query<T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
        try {
            return await this.pool.query<T>(text, params);
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    protected async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    protected buildWhereClause(filters: Record<string, any>, startParamCount = 1): WhereClauseResult {
        let clause = '';
        const values: any[] = [];
        let paramCount = startParamCount;

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
                clause += clause ? ' AND ' : ' WHERE ';
                clause += `${key} = $${paramCount++}`;
                values.push(value);
            }
        });

        return { clause, values, nextParamCount: paramCount };
    }
}
