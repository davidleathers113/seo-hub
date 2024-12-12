const EventEmitter = require('events');

class RedisMock extends EventEmitter {
  constructor() {
    super();
    this.store = new Map();
    this.isReady = false;
    this.error = null;
    this.connected = false;
  }

  async connect() {
    if (this.error) {
      this.isReady = false;
      this.connected = false;
      const error = this.error;
      this.emit('error', error);
      throw error;
    }
    this.isReady = true;
    this.connected = true;
    this.emit('connect');
    return this;
  }

  async get(key) {
    if (!this.isReady || !this.connected || this.error) {
      const error = this.error || new Error('Redis client not ready');
      this.emit('error', error);
      throw error;
    }
    return this.store.get(key);
  }

  async set(key, value, options = {}) {
    if (!this.isReady || !this.connected || this.error) {
      const error = this.error || new Error('Redis client not ready');
      this.emit('error', error);
      throw error;
    }
    this.store.set(key, value);
    return 'OK';
  }

  async del(key) {
    if (!this.isReady || !this.connected || this.error) {
      const error = this.error || new Error('Redis client not ready');
      this.emit('error', error);
      throw error;
    }
    return this.store.delete(key) ? 1 : 0;
  }

  // Test helper methods
  simulateError(error) {
    this.error = error;
    this.isReady = false;
    this.connected = false;
    this.emit('error', error);
    throw error;
  }

  simulateReconnect() {
    this.error = null;
    this.isReady = true;
    this.connected = true;
    this.emit('connect');
    return this;
  }

  reset() {
    this.store.clear();
    this.error = null;
    this.isReady = false;
    this.connected = false;
    this.removeAllListeners();
  }

  // Additional helper methods
  getConnectionState() {
    return {
      isReady: this.isReady,
      connected: this.connected,
      hasError: !!this.error
    };
  }

  getOperationHistory() {
    return Array.from(this.store.entries()).map(([key, value]) => ({
      type: 'get',
      key,
      value,
      timestamp: new Date()
    }));
  }
}

const mockInstance = new RedisMock();

const createClient = () => {
  mockInstance.reset();
  return mockInstance;
};

module.exports = { createClient };
