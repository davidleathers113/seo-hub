import { DatabaseClient } from '../database/interfaces';
import { logger } from '../utils/log';
import { getDatabase } from '../database';

const log = logger('database-config');

export async function initializeDatabase(): Promise<DatabaseClient> {
  try {
    log.info('Attempting to connect to database...');
    const client = getDatabase();
    log.info('Database connected successfully');
    return client;
  } catch (error) {
    log.error('Database connection failed:', error);
    throw error;
  }
}
