// Create a mock logger instance that matches pino's API
const createMockLogger = () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  fatal: jest.fn(),
  child: jest.fn()
});

// Export the logger factory function in the same structure as the real implementation
module.exports = {
  logger: jest.fn().mockImplementation((name) => createMockLogger())
};
