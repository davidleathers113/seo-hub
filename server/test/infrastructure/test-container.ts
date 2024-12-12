import { EnhancedRedisMock } from './enhanced-redis-mock'
import { DatabaseClient } from '../../database/interfaces'

/**
 * Enhanced test container with better type safety and state management
 */
export class TestContainer {
  private static instance: TestContainer | null = null
  private redisMock: EnhancedRedisMock
  private databaseClient: DatabaseClient | null = null
  private cleanupFns: Array<() => Promise<void>> = []

  private constructor() {
    this.redisMock = new EnhancedRedisMock()
  }

  static getInstance(): TestContainer {
    if (!TestContainer.instance) {
      TestContainer.instance = new TestContainer()
    }
    return TestContainer.instance
  }

  getRedisMock(): EnhancedRedisMock {
    return this.redisMock
  }

  registerDatabaseClient(client: DatabaseClient): void {
    this.databaseClient = client
  }

  getDatabaseClient(): DatabaseClient {
    if (!this.databaseClient) {
      throw new Error('Database client not initialized')
    }
    return this.databaseClient
  }

  registerCleanup(fn: () => Promise<void>): void {
    this.cleanupFns.push(fn)
  }

  async reset(): Promise<void> {
    await this.redisMock.flushall()
  }

  async cleanup(): Promise<void> {
    for (const fn of this.cleanupFns) {
      await fn()
    }
    this.cleanupFns = []
    this.databaseClient = null
    TestContainer.instance = null
  }
}

// Export singleton instance
export const testContainer = TestContainer.getInstance()

// Export type-safe helper functions
export const getTestContainer = (): TestContainer => TestContainer.getInstance()
export const resetTestContainer = async (): Promise<void> => {
  await TestContainer.getInstance().reset()
}