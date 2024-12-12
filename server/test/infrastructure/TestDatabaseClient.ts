import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { DatabaseClient, DatabaseConfig } from '../../database/interfaces';
import { MongoDBClient } from '../../database/mongodb/client';
import { logger } from '../../utils/logger';

const log = logger('test/TestDatabaseClient');

export class TestDatabaseClient extends MongoDBClient {
  private static instance: TestDatabaseClient | null = null;
  private mongoServer: MongoMemoryServer | null = null;

  private constructor() {
    super({ uri: '', dbName: 'test' });
  }

  static async getInstance(): Promise<TestDatabaseClient> {
    if (!TestDatabaseClient.instance) {
      TestDatabaseClient.instance = new TestDatabaseClient();
      await TestDatabaseClient.instance.initialize();
    }
    return TestDatabaseClient.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.mongoServer = await MongoMemoryServer.create();
      const mongoUri = this.mongoServer.getUri();

      await mongoose.connect(mongoUri, {
        autoIndex: true,
        autoCreate: true
      });

      log.info('Connected to test database');
    } catch (error) {
      log.error('Failed to initialize test database:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }

      if (this.mongoServer) {
        await this.mongoServer.stop();
        this.mongoServer = null;
      }

      TestDatabaseClient.instance = null;
      log.info('Test database cleaned up');
    } catch (error) {
      log.error('Failed to cleanup test database:', error);
      throw error;
    }
  }

  async clearCollections(): Promise<void> {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
      log.info('All collections cleared');
    } catch (error) {
      log.error('Failed to clear collections:', error);
      throw error;
    }
  }
}

// Factory function for creating test database instances
export async function createTestDatabase(): Promise<DatabaseClient> {
  return TestDatabaseClient.getInstance();
}