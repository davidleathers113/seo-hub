// Create a mock logger instance that matches pino's API
const createLoggerFunction = () => {
  const logFn = jest.fn();
  return logFn;
};

const mockLogger = {
  error: createLoggerFunction(),
  warn: createLoggerFunction(),
  info: createLoggerFunction(),
  debug: createLoggerFunction(),
  trace: createLoggerFunction(),
  fatal: createLoggerFunction(),
  child: jest.fn(function(bindings) {
    // Return a new logger instance with the same methods
    return {
      ...this,
      child: jest.fn().mockReturnThis()
    };
  })
};

// Create the main logger factory function that returns a consistent logger instance
const logger = jest.fn().mockReturnValue(mockLogger);

// Export both the logger instance and the factory function
module.exports = {
  logger,
  mockLogger
};

// Export the mock logger directly for test access
global.__loggerMock = mockLogger;
