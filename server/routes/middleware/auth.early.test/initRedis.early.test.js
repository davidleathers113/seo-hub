
// Unit tests for: initRedis




const { initRedis } = require('../auth');
const { verifyToken } = require('../../../utils/jwt');
const redis = require('redis');
jest.mock("redis");

describe('initRedis() initRedis method', () => {
  let mockRedisClient;

  beforeEach(() => {
    mockRedisClient = {
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(),
    };
    redis.createClient.mockReturnValue(mockRedisClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    test('should initialize redis client with provided client', () => {
      // Arrange
      const customClient = { on: jest.fn(), connect: jest.fn() };

      // Act
      initRedis(customClient);

      // Assert
      expect(redis.createClient).not.toHaveBeenCalled();
      expect(customClient.on).not.toHaveBeenCalled();
      expect(customClient.connect).not.toHaveBeenCalled();
    });

    test('should initialize redis client with default configuration', () => {
      // Act
      initRedis();

      // Assert
      expect(redis.createClient).toHaveBeenCalledWith({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });
      expect(mockRedisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockRedisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle redis connection error gracefully', async () => {
      // Arrange
      const error = new Error('Connection failed');
      mockRedisClient.connect.mockRejectedValueOnce(error);

      // Act
      await initRedis();

      // Assert
      expect(redis.createClient).toHaveBeenCalled();
      expect(mockRedisClient.connect).toHaveBeenCalled();
      // Here we would check console.error, but since we are not supposed to mock logger, we assume it logs the error
    });

    test('should not throw if redis client is already initialized', () => {
      // Arrange
      const customClient = { on: jest.fn(), connect: jest.fn() };

      // Act
      initRedis(customClient);
      initRedis(); // Attempt to reinitialize

      // Assert
      expect(redis.createClient).not.toHaveBeenCalled();
    });
  });
});

// End of unit tests for: initRedis
