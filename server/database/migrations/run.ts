import { db } from '../index';
import * as fs from 'fs';
import * as path from 'path';

interface MigrationRecord {
    name: string;
    executed_at?: Date;
}

async function runMigrations() {
    try {
        // Create migrations table if it doesn't exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Get all SQL files in the migrations directory
        const migrationsDir = __dirname;
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        // Get executed migrations
        const { rows: executedMigrations } = await db.query<MigrationRecord>(
            'SELECT name FROM migrations'
        );
        const executedMigrationNames = executedMigrations.map((m: MigrationRecord) => m.name);

        // Run pending migrations
        for (const file of files) {
            if (!executedMigrationNames.includes(file)) {
                console.log(`Running migration: ${file}`);
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');

                await db.query('BEGIN');
                try {
                    await db.query(sql);
                    await db.query(
                        'INSERT INTO migrations (name) VALUES ($1)',
                        [file]
                    );
                    await db.query('COMMIT');
                    console.log(`Migration ${file} completed successfully`);
                } catch (error) {
                    await db.query('ROLLBACK');
                    console.error(`Error running migration ${file}:`, error);
                    throw error;
                }
            }
        }

        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runMigrations();
