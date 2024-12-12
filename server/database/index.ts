import { DatabaseClient } from './interfaces';
import { MongoDBClient } from './mongodb/client';

type DatabaseType = 'mongodb' | 'postgres' | 'sqlite';

export class DatabaseFactory {
  private static instance: DatabaseClient;

  static async createClient(type: DatabaseType, config: any): Promise<DatabaseClient> {
    switch (type) {
      case 'mongodb':
        this.instance = new MongoDBClient(config.uri);
        break;
      // Add other database implementations here
      // case 'postgres':
      //   this.instance = new PostgresClient(config);
      //   break;
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }

    await this.instance.connect();
    return this.instance;
  }

  static getInstance(): DatabaseClient {
    if (!this.instance) {
      throw new Error('Database client not initialized. Call createClient first.');
    }
    return this.instance;
  }

  static async closeConnection(): Promise<void> {
    if (this.instance) {
      await this.instance.disconnect();
    }
  }
}

// Export a convenience function to get the database client
export function getDatabase(): DatabaseClient {
  return DatabaseFactory.getInstance();
}

// Export interfaces
export * from './interfaces';