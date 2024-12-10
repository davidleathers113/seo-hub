
// Unit tests for: initRedis




const { initRedis } = require('../auth');
const { generateToken, verifyToken } = require('../../utils/jwt.js');
const { authenticateWithToken } = require('../middleware/auth.js');
const redis = require('redis');
const { validateEmail, validatePassword } = require('../../utils/validation.js');
// Mock the redis module
jest.mock("redis", () => {
  const originalModule = jest.requireActual("redis");
  return {
    __esModule: true,
    ...originalModule,
    createClient: jest.fn(() => ({
      on: jest.fn(),
      connect: jest.fn(),
    })),
  };
});

describe('initRedis() initRedis method', () => {
  let mockClient;

  beforeEach(() => {
    // Reset the mock client before each test
    mockClient = {
      on: jest.fn(),
      connect: jest.fn(),
    };
    redis.createClient.mockReturnValue(mockClient);
  });

  describe('Happy paths', () => {
    it('should initialize redis client with provided client', () => {
      // Test that initRedis uses the provided client
      initRedis(mockClient);
      expect(redis.createClient).not.toHaveBeenCalled();
      expect(mockClient.on).not.toHaveBeenCalled();
      expect(mockClient.connect).not.toHaveBeenCalled();
    });

    it('should initialize redis client with default configuration', () => {
      // Test that initRedis creates a new client with default configuration
      initRedis();
      expect(redis.createClient).toHaveBeenCalledWith({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });
      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockClient.connect).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle redis client error event', () => {
      // Test that initRedis handles the error event
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      initRedis();
      const errorHandler = mockClient.on.mock.calls.find(call => call[0] === 'error')[1];
      const error = new Error('Test error');
      errorHandler(error);
      expect(consoleSpy).toHaveBeenCalledWith('Redis Client Error', error);
      consoleSpy.mockRestore();
    });
  });
});

// End of unit tests for: initRedis
