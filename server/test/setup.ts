import path from 'path'
import { TestContainer } from './infrastructure/test-container'
import { TestMonitor } from './infrastructure/test-monitor'
import { EnhancedRedisMock } from './infrastructure/enhanced-redis-mock'
import { TestDatabaseClient } from './infrastructure/TestDatabaseClient'
import { DatabaseClient } from '../database/interfaces'

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key'
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.LOG_LEVEL = 'silent'

// Get test container instance
const container = TestContainer.getInstance()

// Helper to clear require cache for project files
const clearProjectModuleCache = () => {
  const projectRoot = path.resolve(__dirname, '..')
  Object.keys(require.cache).forEach(key => {
    if (key.startsWith(projectRoot)) {
      delete require.cache[key]
    }
  })
}

// Configure test environment before any tests
beforeAll(async () => {
  // Clear module cache
  clearProjectModuleCache()

  // Mock external dependencies
  jest.mock('../utils/log', () => require('./mocks/log'))
  jest.mock('redis', () => {
    const redisMock = container.getRedisMock()
    return {
      createClient: jest.fn(() => redisMock)
    }
  })
  jest.mock('../utils/jwt', () => require('./mocks/jwt'))
  jest.mock('../services/user')
  jest.mock('../services/llm')

  // Initialize test database
  const testDb = await TestDatabaseClient.getInstance()
  container.registerDatabaseClient(testDb)

  // Register cleanup
  container.registerCleanup(async () => {
    await testDb.cleanup()
  })

  // Initialize test monitoring
  TestMonitor.clear()
})

// Reset state before each test
beforeEach(async () => {
  // Clear all collections
  const testDb = container.getDatabaseClient() as TestDatabaseClient
  await testDb.clearCollections()

  // Reset test container state
  await container.reset()

  // Clear test monitor events
  TestMonitor.clear()

  // Reset all mocks
  jest.clearAllMocks()
})

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})

// Export test utilities
export { container, TestMonitor }
export const monitoredTest = TestMonitor.createTestWrapper()

// Helper function to get database client for tests
export function getTestDatabase(): DatabaseClient {
  return container.getDatabaseClient()
}