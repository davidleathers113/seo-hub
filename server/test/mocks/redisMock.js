// Create a shared mock instance
const mockRedisClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  isReady: true
};

// Export both the mock client and the factory function
module.exports = {
  createClient: jest.fn(() => mockRedisClient),
  mockRedisClient
};

// Export the mock client directly for test access
global.__redisMockClient = mockRedisClient;
