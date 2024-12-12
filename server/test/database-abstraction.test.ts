import { DatabaseFactory, DatabaseClient } from '../database';
import { TestDatabaseClient } from './infrastructure/TestDatabaseClient';
import { MongoDBClient } from '../database/mongodb/client';
import { User, UserCreateInput } from '../database/interfaces';
import { ValidationError, DatabaseError } from '../database/mongodb/client';
import { getTestDatabase } from './setup';
import { logger } from '../utils/logger';

const log = logger('test/database-abstraction');

describe('Database Abstraction Layer', () => {
  let testDb: DatabaseClient;

  beforeEach(async () => {
    testDb = await getTestDatabase();
  });

  describe('Database Factory', () => {
    it('should create MongoDB client instance', async () => {
      const config = { uri: 'mongodb://localhost:27017/test' };
      const client = await DatabaseFactory.createClient('mongodb', config);
      expect(client).toBeInstanceOf(MongoDBClient);
    });

    it('should throw error for unsupported database type', async () => {
      const config = { uri: 'postgres://localhost:5432/test' };
      await expect(DatabaseFactory.createClient('postgres' as any, config))
        .rejects
        .toThrow('Unsupported database type: postgres');
    });

    it('should maintain singleton instance', async () => {
      const config = { uri: 'mongodb://localhost:27017/test' };
      const client1 = await DatabaseFactory.createClient('mongodb', config);
      const client2 = DatabaseFactory.getInstance();
      expect(client1).toBe(client2);
    });

    it('should throw error when getting instance before initialization', () => {
      // Reset the factory instance
      (DatabaseFactory as any).instance = null;
      expect(() => DatabaseFactory.getInstance())
        .toThrow('Database client not initialized');
    });
  });

  describe('Connection Management', () => {
    it('should connect and disconnect successfully', async () => {
      const client = testDb as TestDatabaseClient;
      await client.disconnect();
      await client.connect();
      expect(client).toBeDefined();
    });

    it('should handle connection errors gracefully', async () => {
      const client = testDb as TestDatabaseClient;
      // Force a connection error by using invalid URI
      (client as any).uri = 'invalid-uri';
      await client.disconnect();
      await expect(client.connect()).rejects.toThrow();
    });

    it('should maintain connection state', async () => {
      const client = testDb as TestDatabaseClient;
      await client.disconnect();
      // Try to perform operation while disconnected
      await expect(client.findUserById('123')).rejects.toThrow();
      await client.connect();
      // Should work after reconnecting
      const user = await client.createUser({
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User'
      });
      expect(user).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const invalidUser: UserCreateInput = {
        email: 'invalid-email',
        password: 'short',
        name: 'Test User'
      };

      await expect(testDb.createUser(invalidUser))
        .rejects
        .toThrow(ValidationError);
    });

    it('should handle duplicate key errors', async () => {
      const user: UserCreateInput = {
        email: 'duplicate@example.com',
        password: 'hashedPassword123',
        name: 'Test User'
      };

      await testDb.createUser(user);
      await expect(testDb.createUser(user))
        .rejects
        .toThrow(ValidationError);
    });

    it('should handle database operation errors', async () => {
      // Force an error by passing invalid ObjectId
      await expect(testDb.findUserById('invalid-id'))
        .rejects
        .toThrow(DatabaseError);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data integrity across operations', async () => {
      // Create
      const userData: UserCreateInput = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User'
      };
      const created = await testDb.createUser(userData);
      expect(created.email).toBe(userData.email);

      // Read
      const found = await testDb.findUserById(created.id);
      expect(found).toBeDefined();
      expect(found?.email).toBe(created.email);

      // Update
      const updated = await testDb.updateUser(created.id, { name: 'Updated Name' });
      expect(updated?.name).toBe('Updated Name');

      // Delete
      const deleted = await testDb.deleteUser(created.id);
      expect(deleted).toBe(true);

      // Verify deletion
      const notFound = await testDb.findUserById(created.id);
      expect(notFound).toBeNull();
    });

    it('should handle concurrent operations correctly', async () => {
      const userData: UserCreateInput = {
        email: 'concurrent@example.com',
        password: 'hashedPassword123',
        name: 'Test User'
      };

      // Perform multiple operations concurrently
      const operations = Array(5).fill(null).map(() => testDb.createUser({
        ...userData,
        email: `${Math.random()}@example.com`
      }));

      const results = await Promise.all(operations);
      expect(results).toHaveLength(5);
      expect(new Set(results.map(u => u.email))).toHaveLength(5);
    });
  });
});