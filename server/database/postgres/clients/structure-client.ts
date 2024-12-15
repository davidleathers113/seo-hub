import { BasePostgresClient } from '../base-client';
import { Niche, Pillar, Subpillar } from '../../interfaces';
import { NicheCreateInput, PillarCreateInput, SubpillarCreateInput } from '../../interfaces';
import { NicheFilters, PillarFilters, SubpillarFilters, PaginationOptions } from '../../interfaces';

export class StructureClient extends BasePostgresClient {
    // Niche operations
    async createNiche(data: NicheCreateInput): Promise<Niche> {
        const result = await this.query<Niche>(
            'INSERT INTO niches (name, user_id, status, progress) VALUES ($1, $2, $3, $4) RETURNING *',
            [data.name, data.userId, data.status, data.progress]
        );
        return result.rows[0];
    }

    async findNicheById(id: string): Promise<Niche | null> {
        const result = await this.query<Niche>('SELECT * FROM niches WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findNichesByUserId(userId: string): Promise<Niche[]> {
        const result = await this.query<Niche>('SELECT * FROM niches WHERE user_id = $1', [userId]);
        return result.rows;
    }

    async updateNiche(id: string, data: Partial<Niche>): Promise<Niche | null> {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const result = await this.query<Niche>(
            `UPDATE niches SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return result.rows[0] || null;
    }

    async deleteNiche(id: string): Promise<boolean> {
        const result = await this.query('DELETE FROM niches WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async findNiches(filters: NicheFilters, options?: PaginationOptions): Promise<Niche[]> {
        const { clause, values, nextParamCount } = this.buildWhereClause(filters);
        let query = `SELECT * FROM niches${clause}`;

        if (options?.sortBy) {
            query += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'ASC'}`;
        }
        if (options?.limit) {
            query += ` LIMIT $${nextParamCount}`;
            values.push(options.limit);
        }
        if (options?.page && options?.limit) {
            const offset = (options.page - 1) * options.limit;
            query += ` OFFSET $${nextParamCount + 1}`;
            values.push(offset);
        }

        const result = await this.query<Niche>(query, values);
        return result.rows;
    }

    // Pillar operations
    async createPillar(data: PillarCreateInput): Promise<Pillar> {
        const result = await this.query<Pillar>(
            'INSERT INTO pillars (title, niche_id, status, created_by_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [data.title, data.nicheId, data.status, data.createdById]
        );
        return result.rows[0];
    }

    async findPillarById(id: string): Promise<Pillar | null> {
        const result = await this.query<Pillar>('SELECT * FROM pillars WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findPillarsByNicheId(nicheId: string): Promise<Pillar[]> {
        const result = await this.query<Pillar>('SELECT * FROM pillars WHERE niche_id = $1', [nicheId]);
        return result.rows;
    }

    async updatePillar(id: string, data: Partial<Pillar>): Promise<Pillar | null> {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const result = await this.query<Pillar>(
            `UPDATE pillars SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return result.rows[0] || null;
    }

    async deletePillar(id: string): Promise<boolean> {
        const result = await this.query('DELETE FROM pillars WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async findPillars(filters: PillarFilters, options?: PaginationOptions): Promise<Pillar[]> {
        const { clause, values, nextParamCount } = this.buildWhereClause(filters);
        let query = `SELECT * FROM pillars${clause}`;

        if (options?.sortBy) {
            query += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'ASC'}`;
        }
        if (options?.limit) {
            query += ` LIMIT $${nextParamCount}`;
            values.push(options.limit);
        }
        if (options?.page && options?.limit) {
            const offset = (options.page - 1) * options.limit;
            query += ` OFFSET $${nextParamCount + 1}`;
            values.push(offset);
        }

        const result = await this.query<Pillar>(query, values);
        return result.rows;
    }

    // Subpillar operations
    async createSubpillar(data: SubpillarCreateInput): Promise<Subpillar> {
        const result = await this.query<Subpillar>(
            'INSERT INTO subpillars (title, pillar_id, created_by_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [data.title, data.pillarId, data.createdById, data.status]
        );
        return result.rows[0];
    }

    async findSubpillarById(id: string): Promise<Subpillar | null> {
        const result = await this.query<Subpillar>('SELECT * FROM subpillars WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findSubpillarsByPillarId(pillarId: string): Promise<Subpillar[]> {
        const result = await this.query<Subpillar>('SELECT * FROM subpillars WHERE pillar_id = $1', [pillarId]);
        return result.rows;
    }

    async updateSubpillar(id: string, data: Partial<Subpillar>): Promise<Subpillar | null> {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const result = await this.query<Subpillar>(
            `UPDATE subpillars SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return result.rows[0] || null;
    }

    async deleteSubpillar(id: string): Promise<boolean> {
        const result = await this.query('DELETE FROM subpillars WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async findSubpillars(filters: SubpillarFilters, options?: PaginationOptions): Promise<Subpillar[]> {
        const { clause, values, nextParamCount } = this.buildWhereClause(filters);
        let query = `SELECT * FROM subpillars${clause}`;

        if (options?.sortBy) {
            query += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'ASC'}`;
        }
        if (options?.limit) {
            query += ` LIMIT $${nextParamCount}`;
            values.push(options.limit);
        }
        if (options?.page && options?.limit) {
            const offset = (options.page - 1) * options.limit;
            query += ` OFFSET $${nextParamCount + 1}`;
            values.push(offset);
        }

        const result = await this.query<Subpillar>(query, values);
        return result.rows;
    }
}
