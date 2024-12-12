// Consolidated test setup file
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const { mockRedis, clearAllMocks } = require('./server/test/mocks/redis');
const { testValidator } = require('./server/test/infrastructure/test-validator');

// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.LOG_LEVEL = 'silent';

// Increase timeout for all tests
jest.setTimeout(30000);

// Helper to clear require cache for project files
const clearProjectModuleCache = () => {
  const projectRoot = path.resolve(__dirname);
  Object.keys(require.cache).forEach(key => {
    if (key.startsWith(projectRoot)) {
      delete require.cache[key];
    }
  });
};

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  try {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.REDIS_URL = 'redis://localhost:6379';

    // Setup MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Set the MongoDB URI for other parts of the application
    process.env.MONGO_URI = mongoUri;

    // Connect mongoose with proper options
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Verify connection
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      throw new Error('Failed to connect to MongoDB');
    }

    // Initialize models
    require('./server/models/init');

    // Register MongoDB server with test validator
    testValidator.setGlobalMongoServer(mongoServer);

    // Setup Redis Mock
    await mockRedis.connect();

    // Log successful setup
    console.log('Test environment initialized:', {
      mongoUri,
      redisUrl: process.env.REDIS_URL,
      nodeEnv: process.env.NODE_ENV,
      models: Object.keys(mongoose.models)
    });
  } catch (error) {
    console.error('Test environment setup failed:', error);
    throw error;
  }
});

// Clean up after each test
beforeEach(async () => {
  try {
    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }

    // Reset all mocks
    jest.clearAllMocks();
    clearAllMocks();
  } catch (error) {
    console.error('Test reset failed:', error);
    throw error;
  }
});

// Clean up after all tests
afterAll(async () => {
  try {
    // Cleanup MongoDB
    await mongoose.disconnect();
    await mongoServer.stop();

    // Cleanup Redis
    await mockRedis.quit();

    console.log('Test environment cleaned up');
  } catch (error) {
    console.error('Test environment cleanup failed:', error);
    throw error;
  }
});

// Handle test errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection in tests:', error);
});
