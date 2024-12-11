const EventEmitter = require('events');

// Create a shared mock instance that extends EventEmitter
class MockRedisClient extends EventEmitter {
  constructor() {
    super();
    this.store = new Map();
    this.get = jest.fn().mockImplementation(key => Promise.resolve(this.store.get(key) || null));
    this.set = jest.fn().mockImplementation((key, value, options) => {
      this.store.set(key, value);
      return Promise.resolve('OK');
    });
    this.del = jest.fn().mockImplementation(key => {
      const existed = this.store.delete(key);
      return Promise.resolve(existed ? 1 : 0);
    });
    this.exists = jest.fn().mockImplementation(key => {
      return Promise.resolve(this.store.has(key) ? 1 : 0);
    });
    this.isReady = true;
    this.isOpen = true;
    this.connected = true;

    // Emit initial events after a short delay
    setTimeout(() => {
      this.emit('connect');
      this.emit('ready');
    }, 0);
  }

  async connect() {
    if (!this.isReady) {
      this.isReady = true;
      this.isOpen = true;
      this.connected = true;
      this.emit('connect');
      this.emit('ready');
    }
    return this;
  }

  async disconnect() {
    if (this.isReady) {
      this.isReady = false;
      this.isOpen = false;
      this.connected = false;
      this.emit('end');
    }
    return Promise.resolve();
  }

  async quit() {
    return this.disconnect();
  }

  // Clear the store (useful for tests)
  async clear() {
    this.store.clear();
    return Promise.resolve();
  }
}

const mockRedisClient = new MockRedisClient();

// Export both the mock client and the factory function
module.exports = {
  createClient: jest.fn(() => mockRedisClient),
  mockRedisClient
};

// Export the mock client directly for test access
global.__redisMockClient = mockRedisClient;
