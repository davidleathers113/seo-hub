
// Unit tests for: logger




const { logger } = require('../log');
const pino = require('pino');
jest.mock("pino");

describe('logger() logger method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    test('should create a logger with the default log level in development environment', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const name = 'testLogger';
      const expectedLevel = 'debug';

      // Act
      logger(name);

      // Assert
      expect(pino).toHaveBeenCalledWith({ name, level: expectedLevel });
    });

    test('should create a logger with the default log level in production environment', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const name = 'testLogger';
      const expectedLevel = 'info';

      // Act
      logger(name);

      // Assert
      expect(pino).toHaveBeenCalledWith({ name, level: expectedLevel });
    });

    test('should create a logger with a custom log level', () => {
      // Arrange
      process.env.LOG_LEVEL = 'warn';
      const name = 'testLogger';
      const expectedLevel = 'warn';

      // Act
      logger(name);

      // Assert
      expect(pino).toHaveBeenCalledWith({ name, level: expectedLevel });
    });
  });

  describe('Edge Cases', () => {
    test('should throw an error if an invalid log level is provided', () => {
      // Arrange
      process.env.LOG_LEVEL = 'invalidLevel';
      const name = 'testLogger';
      const validLevels = Object.keys(pino.levels.values).join(', ');

      // Act & Assert
      expect(() => logger(name)).toThrow(`Log level must be one of: ${validLevels}`);
    });

    test('should handle missing name parameter gracefully', () => {
      // Arrange
      process.env.LOG_LEVEL = 'info';
      const expectedLevel = 'info';

      // Act
      logger();

      // Assert
      expect(pino).toHaveBeenCalledWith({ name: undefined, level: expectedLevel });
    });

    test('should use default log level if LOG_LEVEL is not set', () => {
      // Arrange
      delete process.env.LOG_LEVEL;
      process.env.NODE_ENV = 'development';
      const name = 'testLogger';
      const expectedLevel = 'debug';

      // Act
      logger(name);

      // Assert
      expect(pino).toHaveBeenCalledWith({ name, level: expectedLevel });
    });
  });
});

// End of unit tests for: logger
