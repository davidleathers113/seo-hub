import { BasePostgresClient } from '../base-client';
import { Article, Research, Outline, OutlineSection } from '../../interfaces';
import { ArticleCreateInput, ResearchCreateInput, OutlineCreateInput } from '../../interfaces';
import { ArticleFilters, PaginationOptions } from '../../interfaces';
import { OutlineSectionRow } from '../types';

export class ContentClient extends BasePostgresClient {
    // Article operations
    async createArticle(data: ArticleCreateInput): Promise<Article> {
        const result = await this.query<Article>(
            'INSERT INTO articles (title, content, subpillar_id, author_id, status, seo_score, keywords, meta_description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [data.title, data.content, data.subpillarId, data.authorId, data.status, data.seoScore, data.keywords, data.metaDescription]
        );
        return result.rows[0];
    }

    async findArticleById(id: string): Promise<Article | null> {
        const result = await this.query<Article>('SELECT * FROM articles WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findArticlesBySubpillarId(subpillarId: string): Promise<Article[]> {
        const result = await this.query<Article>('SELECT * FROM articles WHERE subpillar_id = $1', [subpillarId]);
        return result.rows;
    }

    async updateArticle(id: string, data: Partial<Article>): Promise<Article | null> {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const result = await this.query<Article>(
            `UPDATE articles SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return result.rows[0] || null;
    }

    async deleteArticle(id: string): Promise<boolean> {
        const result = await this.query('DELETE FROM articles WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async findArticles(filters: ArticleFilters, options?: PaginationOptions): Promise<Article[]> {
        const { clause, values, nextParamCount } = this.buildWhereClause(filters);
        let query = `SELECT * FROM articles${clause}`;

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

        const result = await this.query<Article>(query, values);
        return result.rows;
    }

    // Research operations
    async createResearch(data: ResearchCreateInput): Promise<Research> {
        const result = await this.query<Research>(
            'INSERT INTO research (subpillar_id, content, source, relevance, notes, created_by_id, article_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [data.subpillarId, data.content, data.source, data.relevance, data.notes, data.createdById, data.articleId]
        );
        return result.rows[0];
    }

    async findResearchById(id: string): Promise<Research | null> {
        const result = await this.query<Research>('SELECT * FROM research WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async findResearchBySubpillarId(subpillarId: string): Promise<Research[]> {
        const result = await this.query<Research>('SELECT * FROM research WHERE subpillar_id = $1', [subpillarId]);
        return result.rows;
    }

    async updateResearch(id: string, data: Partial<Research>): Promise<Research | null> {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const result = await this.query<Research>(
            `UPDATE research SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return result.rows[0] || null;
    }

    async deleteResearch(id: string): Promise<boolean> {
        const result = await this.query('DELETE FROM research WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }

    // Outline operations
    private mapOutlineSectionRow(row: OutlineSectionRow): OutlineSection {
        try {
            const contentPoints = typeof row.content_points === 'string' 
                ? JSON.parse(row.content_points)
                : row.content_points;

            return {
                title: row.title,
                contentPoints: contentPoints,
                order: row.order_index,
                content: row.content
            };
        } catch (error) {
            console.error('Error parsing outline section content points:', error);
            return {
                title: row.title,
                contentPoints: [],
                order: row.order_index,
                content: row.content
            };
        }
    }

    async createOutline(data: OutlineCreateInput): Promise<Outline> {
        return await this.withTransaction(async (client) => {
            const result = await client.query<Outline>(
                'INSERT INTO outlines (subpillar_id, status, created_by_id) VALUES ($1, $2, $3) RETURNING *',
                [data.subpillarId, data.status, data.createdById]
            );
            const outline = result.rows[0];

            if (data.sections) {
                for (const section of data.sections) {
                    const contentPointsJson = JSON.stringify(section.contentPoints);
                    await client.query(
                        'INSERT INTO outline_sections (outline_id, title, content_points, order_index, content) VALUES ($1, $2, $3, $4, $5)',
                        [outline.id, section.title, contentPointsJson, section.order, section.content]
                    );
                }
            }

            return outline;
        });
    }

    async findOutlineById(id: string): Promise<Outline | null> {
        const outlineResult = await this.query<Outline>('SELECT * FROM outlines WHERE id = $1', [id]);
        if (!outlineResult.rows[0]) return null;

        const outline = outlineResult.rows[0];
        const sectionsResult = await this.query<OutlineSectionRow>(
            'SELECT * FROM outline_sections WHERE outline_id = $1 ORDER BY order_index',
            [id]
        );
        outline.sections = sectionsResult.rows.map(row => this.mapOutlineSectionRow(row));
        return outline;
    }

    async findOutlineBySubpillarId(subpillarId: string): Promise<Outline | null> {
        const outlineResult = await this.query<Outline>(
            'SELECT * FROM outlines WHERE subpillar_id = $1',
            [subpillarId]
        );
        if (!outlineResult.rows[0]) return null;

        const outline = outlineResult.rows[0];
        const sectionsResult = await this.query<OutlineSectionRow>(
            'SELECT * FROM outline_sections WHERE outline_id = $1 ORDER BY order_index',
            [outline.id]
        );
        outline.sections = sectionsResult.rows.map(row => this.mapOutlineSectionRow(row));
        return outline;
    }

    async updateOutline(id: string, data: Partial<Outline>): Promise<Outline | null> {
        return await this.withTransaction(async (client) => {
            const outlineResult = await client.query<Outline>(
                'UPDATE outlines SET status = COALESCE($2, status), updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
                [id, data.status]
            );
            if (!outlineResult.rows[0]) return null;

            const outline = outlineResult.rows[0];

            if (data.sections) {
                await client.query('DELETE FROM outline_sections WHERE outline_id = $1', [id]);
                for (const section of data.sections) {
                    const contentPointsJson = JSON.stringify(section.contentPoints);
                    await client.query(
                        'INSERT INTO outline_sections (outline_id, title, content_points, order_index, content) VALUES ($1, $2, $3, $4, $5)',
                        [id, section.title, contentPointsJson, section.order, section.content]
                    );
                }
            }

            const sectionsResult = await client.query<OutlineSectionRow>(
                'SELECT * FROM outline_sections WHERE outline_id = $1 ORDER BY order_index',
                [id]
            );
            outline.sections = sectionsResult.rows.map(row => this.mapOutlineSectionRow(row));
            return outline;
        });
    }

    async deleteOutline(id: string): Promise<boolean> {
        return await this.withTransaction(async (client) => {
            await client.query('DELETE FROM outline_sections WHERE outline_id = $1', [id]);
            const result = await client.query('DELETE FROM outlines WHERE id = $1', [id]);
            return (result.rowCount ?? 0) > 0;
        });
    }
}
