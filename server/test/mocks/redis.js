const mockRedis = {
  connect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  isReady: true
};

module.exports = {
  createClient: jest.fn(() => mockRedis),
  mockRedis
};
