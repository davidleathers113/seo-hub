import { DatabaseClient } from '../../database/interfaces';
import { getDatabase } from '../../database';
import { logger } from '../../utils/log';

const log = logger('test/fixtureHelper');

interface TestFixture {
  provider: string;
  type: string;
  category: string;
  content: any;
  metadata?: Record<string, any>;
}

export class FixtureHelper {
  private static db: DatabaseClient = getDatabase();

  /**
   * Ensure database connection is ready
   */
  private static async ensureConnection(): Promise<void> {
    try {
      await this.db.ping();
    } catch (error) {
      log.warn('Database not ready, waiting...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.ensureConnection();
    }
  }

  /**
   * Initialize fixtures for a test suite
   */
  static async initializeFixtures(): Promise<void> {
    await this.ensureConnection();
    await this.seedFixtures();
  }

  /**
   * Get a response fixture
   */
  static async getResponse(provider: string, category: string): Promise<any> {
    await this.ensureConnection();
    return this.getFixture(provider, 'response', category);
  }

  /**
   * Get an error fixture
   */
  static async getError(provider: string, category: string): Promise<any> {
    await this.ensureConnection();
    return this.getFixture(provider, 'error', category);
  }

  /**
   * Get test data
   */
  static async getTestData(category: string): Promise<any> {
    await this.ensureConnection();
    return this.getFixture('general', 'test_data', category);
  }

  /**
   * Update a fixture
   */
  static async updateFixture(
    provider: string,
    type: string,
    category: string,
    content: any,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    await this.ensureConnection();
    await this.db.updateFixture({
      provider,
      type,
      category,
      content,
      metadata: {
        ...metadata,
        lastUpdated: new Date()
      }
    });
  }

  /**
   * Clear all fixtures (useful for cleanup)
   */
  static async clearFixtures(): Promise<void> {
    await this.ensureConnection();
    await this.db.clearFixtures();
  }

  /**
   * Get a specific fixture
   */
  private static async getFixture(provider: string, type: string, category: string): Promise<any> {
    const fixture = await this.db.findFixture({ provider, type, category });
    return fixture?.content;
  }

  /**
   * Seed initial fixtures
   */
  private static async seedFixtures(): Promise<void> {
    const defaultFixtures: TestFixture[] = [
      {
        provider: 'openai',
        type: 'response',
        category: 'default',
        content: {
          choices: [{ message: { content: 'Test response' } }]
        }
      },
      {
        provider: 'anthropic',
        type: 'response',
        category: 'default',
        content: {
          content: [{ text: 'Test response' }]
        }
      },
      {
        provider: 'general',
        type: 'test_data',
        category: 'message',
        content: {
          text: 'Test message'
        }
      }
    ];

    for (const fixture of defaultFixtures) {
      await this.db.createFixture(fixture);
    }
  }
}