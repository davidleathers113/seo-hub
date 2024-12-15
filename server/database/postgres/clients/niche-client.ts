import { Pool } from 'pg';
import { Niche, NicheCreateInput, NicheUpdateInput } from '../../interfaces';
import { logger } from '../../../utils/log';

const log = logger('database/postgres/niche-client');

export class NicheClient {
    constructor(private pool: Pool) {
        // Bind methods to instance
        this.transformRow = this.transformRow.bind(this);
    }

    private transformRow(row: any): Niche {
        try {
            return {
                id: row.id,
                name: row.name,
                userId: row.user_id, // Changed from userId to user_id to match DB column
                pillars: row.pillars || [],
                progress: Number(row.progress),
                status: row.status,
                createdAt: row.created_at, // Changed from createdAt to created_at
                updatedAt: row.updated_at // Changed from updatedAt to updated_at
            };
        } catch (error) {
            log.error('Error transforming row:', error, 'Row data:', row);
            throw error;
        }
    }

    async findNichesByUserId(userId: string): Promise<Niche[]> {
        try {
            log.info(`Finding niches for user: ${userId}`);
            const query = `
                SELECT id, name, user_id, progress, status, created_at, updated_at
                FROM niches
                WHERE user_id = $1
                ORDER BY created_at DESC
            `;
            const result = await this.pool.query(query, [userId]);
            log.info(`Found ${result.rows.length} niches for user ${userId}`);
            return result.rows.map(this.transformRow);
        } catch (error) {
            log.error('Error in findNichesByUserId:', error);
            throw error;
        }
    }

    async findNicheById(id: string): Promise<Niche | null> {
        try {
            log.info(`Finding niche by ID: ${id}`);
            const query = `
                SELECT id, name, user_id, progress, status, created_at, updated_at
                FROM niches
                WHERE id = $1
            `;
            const result = await this.pool.query(query, [id]);
            if (result.rows.length === 0) {
                log.info(`No niche found with ID: ${id}`);
                return null;
            }
            return this.transformRow(result.rows[0]);
        } catch (error) {
            log.error('Error in findNicheById:', error);
            throw error;
        }
    }

    async createNiche(input: NicheCreateInput): Promise<Niche> {
        try {
            log.info(`Creating niche for user: ${input.userId}`);
            const query = `
                INSERT INTO niches (name, user_id, progress, status)
                VALUES ($1, $2, $3, $4)
                RETURNING id, name, user_id, progress, status, created_at, updated_at
            `;
            const values = [
                input.name,
                input.userId,
                input.progress || 0,
                input.status || 'pending'
            ];
            const result = await this.pool.query(query, values);
            const niche = this.transformRow(result.rows[0]);
            log.info(`Created niche with ID: ${niche.id}`);
            return niche;
        } catch (error) {
            log.error('Error in createNiche:', error);
            throw error;
        }
    }

    async updateNiche(id: string, input: NicheUpdateInput): Promise<Niche | null> {
        try {
            log.info(`Updating niche: ${id}`);
            const setClause = [];
            const values: any[] = [id];
            let paramIndex = 2;

            if (input.name !== undefined) {
                setClause.push(`name = $${paramIndex}`);
                values.push(input.name);
                paramIndex++;
            }
            if (input.progress !== undefined) {
                setClause.push(`progress = $${paramIndex}`);
                values.push(Number(input.progress));
                paramIndex++;
            }
            if (input.status !== undefined) {
                setClause.push(`status = $${paramIndex}`);
                values.push(input.status);
                paramIndex++;
            }

            if (setClause.length === 0) {
                return this.findNicheById(id);
            }

            const query = `
                UPDATE niches
                SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, name, user_id, progress, status, created_at, updated_at
            `;

            const result = await this.pool.query(query, values);
            if (result.rows.length === 0) {
                log.info(`No niche found to update with ID: ${id}`);
                return null;
            }
            const niche = this.transformRow(result.rows[0]);
            log.info(`Updated niche: ${id}`);
            return niche;
        } catch (error) {
            log.error('Error in updateNiche:', error);
            throw error;
        }
    }

    async deleteNiche(id: string): Promise<boolean> {
        try {
            log.info(`Deleting niche: ${id}`);
            const query = `
                DELETE FROM niches
                WHERE id = $1
                RETURNING id
            `;
            const result = await this.pool.query(query, [id]);
            const success = result.rows.length > 0;
            log.info(`Delete niche ${id} success: ${success}`);
            return success;
        } catch (error) {
            log.error('Error in deleteNiche:', error);
            throw error;
        }
    }
}
