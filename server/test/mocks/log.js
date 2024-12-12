const createLogger = (name) => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
});

module.exports = {
  logger: jest.fn().mockImplementation(createLogger)
};
