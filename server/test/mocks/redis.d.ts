export interface MockRedis {
  // Connection management
  connect: jest.Mock;
  disconnect: jest.Mock;
  quit: jest.Mock;
  isReady: boolean;

  // Event handling
  on: jest.Mock;
  off: jest.Mock;
  emit: jest.Mock;

  // Data operations
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
  exists: jest.Mock;
  expire: jest.Mock;
  ttl: jest.Mock;

  // Hash operations
  hget: jest.Mock;
  hset: jest.Mock;
  hdel: jest.Mock;
  hgetall: jest.Mock;

  // List operations
  lpush: jest.Mock;
  rpush: jest.Mock;
  lpop: jest.Mock;
  rpop: jest.Mock;
  lrange: jest.Mock;

  // Set operations
  sadd: jest.Mock;
  srem: jest.Mock;
  smembers: jest.Mock;
  sismember: jest.Mock;

  // Transaction support
  multi: jest.Mock;
  exec: jest.Mock;

  // Clear all mocks
  clearAllMocks(): void;
}

export interface ErrorStates {
  connectionError: boolean;
  operationError: boolean;
}

export const mockRedis: MockRedis;
export const errorStates: ErrorStates;
export const clearAllMocks: () => void;
export const createClient: jest.Mock;
