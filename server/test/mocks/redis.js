const mockRedis = {
  // Connection management
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue('OK'),
  isReady: true,

  // Event handling
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),

  // Data operations
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
  expire: jest.fn().mockResolvedValue(1),
  ttl: jest.fn().mockResolvedValue(-1),

  // Hash operations
  hget: jest.fn().mockResolvedValue(null),
  hset: jest.fn().mockResolvedValue(1),
  hdel: jest.fn().mockResolvedValue(1),
  hgetall: jest.fn().mockResolvedValue({}),

  // List operations
  lpush: jest.fn().mockResolvedValue(1),
  rpush: jest.fn().mockResolvedValue(1),
  lpop: jest.fn().mockResolvedValue(null),
  rpop: jest.fn().mockResolvedValue(null),
  lrange: jest.fn().mockResolvedValue([]),

  // Set operations
  sadd: jest.fn().mockResolvedValue(1),
  srem: jest.fn().mockResolvedValue(1),
  smembers: jest.fn().mockResolvedValue([]),
  sismember: jest.fn().mockResolvedValue(0),

  // Transaction support
  multi: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),

  // Clear all mocks
  clearAllMocks() {
    Object.values(this)
      .filter(value => typeof value === 'function' && value.mockClear)
      .forEach(mock => mock.mockClear());
  }
};

// Add error simulation capabilities
const errorStates = {
  connectionError: false,
  operationError: false
};

// Wrap all Redis operations to handle error states
Object.keys(mockRedis).forEach(key => {
  if (typeof mockRedis[key] === 'function' && mockRedis[key].mock) {
    const originalFn = mockRedis[key];
    mockRedis[key] = jest.fn(async (...args) => {
      if (errorStates.connectionError) {
        throw new Error('Connection error');
      }
      if (errorStates.operationError) {
        throw new Error('Operation error');
      }
      return originalFn.call(mockRedis, ...args);
    });
  }
});

// Export the mock client factory and the mock instance
module.exports = {
  createClient: jest.fn(() => mockRedis),
  mockRedis,
  errorStates,
  clearAllMocks: () => mockRedis.clearAllMocks()
};
