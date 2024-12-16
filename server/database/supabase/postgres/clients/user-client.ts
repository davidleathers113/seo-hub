import { Pool } from 'pg';
import { User, UserCreateInput, UserUpdateInput } from '../../interfaces';
import { logger } from '../../../utils/log';

const log = logger('database/postgres/user-client');

export class UserClient {
    constructor(private pool: Pool) {}

    private transformRow(row: any): User {
        return {
            id: row.id,
            email: row.email,
            name: row.name,
            password: row.password,
            token: row.token,
            lastLoginAt: row.last_login_at,
            isActive: row.is_active,
            role: row.role,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    async findUserByEmail(email: string): Promise<User | null> {
        try {
            const query = `
                SELECT *
                FROM users
                WHERE email = $1
            `;
            const result = await this.pool.query(query, [email]);
            if (result.rows.length === 0) {
                return null;
            }
            return this.transformRow(result.rows[0]);
        } catch (error) {
            log.error('Error in findUserByEmail:', error);
            throw error;
        }
    }

    async findUserById(id: string): Promise<User | null> {
        try {
            const query = `
                SELECT *
                FROM users
                WHERE id = $1
            `;
            const result = await this.pool.query(query, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            return this.transformRow(result.rows[0]);
        } catch (error) {
            log.error('Error in findUserById:', error);
            throw error;
        }
    }

    async findUserByToken(token: string): Promise<User | null> {
        try {
            const query = `
                SELECT *
                FROM users
                WHERE token = $1
            `;
            const result = await this.pool.query(query, [token]);
            if (result.rows.length === 0) {
                return null;
            }
            return this.transformRow(result.rows[0]);
        } catch (error) {
            log.error('Error in findUserByToken:', error);
            throw error;
        }
    }

    async createUser(input: UserCreateInput): Promise<User> {
        try {
            const query = `
                INSERT INTO users (email, password, name, role, is_active)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const values = [
                input.email,
                input.password,
                input.name || null,
                input.role || 'user',
                input.isActive !== undefined ? input.isActive : true
            ];
            const result = await this.pool.query(query, values);
            return this.transformRow(result.rows[0]);
        } catch (error) {
            log.error('Error in createUser:', error);
            throw error;
        }
    }

    async updateUser(id: string, input: UserUpdateInput): Promise<User | null> {
        try {
            const setClause = [];
            const values: any[] = [id];
            let paramIndex = 2;

            if (input.email !== undefined) {
                setClause.push(`email = $${paramIndex}`);
                values.push(input.email);
                paramIndex++;
            }
            if (input.password !== undefined) {
                setClause.push(`password = $${paramIndex}`);
                values.push(input.password);
                paramIndex++;
            }
            if (input.name !== undefined) {
                setClause.push(`name = $${paramIndex}`);
                values.push(input.name);
                paramIndex++;
            }
            if (input.token !== undefined) {
                setClause.push(`token = $${paramIndex}`);
                values.push(input.token);
                paramIndex++;
            }
            if (input.lastLoginAt !== undefined) {
                setClause.push(`last_login_at = $${paramIndex}`);
                values.push(input.lastLoginAt);
                paramIndex++;
            }
            if (input.isActive !== undefined) {
                setClause.push(`is_active = $${paramIndex}`);
                values.push(input.isActive);
                paramIndex++;
            }
            if (input.role !== undefined) {
                setClause.push(`role = $${paramIndex}`);
                values.push(input.role);
                paramIndex++;
            }

            if (setClause.length === 0) {
                return this.findUserById(id);
            }

            const query = `
                UPDATE users
                SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;

            const result = await this.pool.query(query, values);
            if (result.rows.length === 0) {
                return null;
            }
            return this.transformRow(result.rows[0]);
        } catch (error) {
            log.error('Error in updateUser:', error);
            throw error;
        }
    }

    async deleteUser(id: string): Promise<boolean> {
        try {
            const query = `
                DELETE FROM users
                WHERE id = $1
                RETURNING id
            `;
            const result = await this.pool.query(query, [id]);
            return result.rows.length > 0;
        } catch (error) {
            log.error('Error in deleteUser:', error);
            throw error;
        }
    }

    async findUsers(): Promise<User[]> {
        try {
            const query = `
                SELECT *
                FROM users
                ORDER BY created_at DESC
            `;
            const result = await this.pool.query(query);
            return result.rows.map(this.transformRow);
        } catch (error) {
            log.error('Error in findUsers:', error);
            throw error;
        }
    }
}
