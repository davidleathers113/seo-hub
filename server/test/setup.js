const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');

// Helper to clear require cache for project files
const clearProjectModuleCache = () => {
  const projectRoot = path.resolve(__dirname, '..');
  Object.keys(require.cache).forEach(key => {
    if (key.startsWith(projectRoot)) {
      delete require.cache[key];
    }
  });
};

// Clear module cache and set up mocks before any tests
beforeAll(async () => {
  // Clear the module cache
  clearProjectModuleCache();
  
  // Mock all external services and utilities
  jest.mock('../utils/log', () => require('./mocks/log'));
  jest.mock('redis', () => require('./mocks/redisMock'));
  jest.mock('../services/user');
  jest.mock('../services/llm');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.LOG_LEVEL = 'silent'; // Suppress actual logging in tests
  
  // Configure MongoDB Memory Server
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Configure Mongoose
  await mongoose.connect(mongoUri);
  
  // Store mongoServer instance for cleanup
  global.__MONGO_SERVER__ = mongoServer;
});

// Clean up after all tests
afterAll(async () => {
  // Disconnect from test database
  await mongoose.disconnect();
  
  // Stop MongoDB Memory Server
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
  }
  
  // Clear all mocks and module cache
  jest.clearAllMocks();
  clearProjectModuleCache();
});

// Reset database and mocks before each test
beforeEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
  
  // Reset all mocks
  jest.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
