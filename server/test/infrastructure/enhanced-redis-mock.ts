import { EventEmitter } from 'events'
import { RedisOperation, RedisConnectionState } from './types'
import { RedisError } from './errors'

/**
 * Enhanced Redis Mock with operation tracking and realistic behavior simulation
 */
export class EnhancedRedisMock extends EventEmitter {
  private state: {
    store: Map<string, any>
    operations: RedisOperation[]
    connectionState: RedisConnectionState
    errors: Error[]
  }

  constructor() {
    super()
    this.state = {
      store: new Map(),
      operations: [],
      connectionState: 'disconnected',
      errors: []
    }
  }

  // Redis client interface implementation
  async connect(): Promise<void> {
    await this.simulateLatency()
    this.state.connectionState = 'connected'
    this.emit('connect')
    this.emit('ready')
  }

  async disconnect(): Promise<void> {
    await this.simulateLatency()
    this.state.connectionState = 'disconnected'
    this.emit('end')
  }

  async get(key: string): Promise<any> {
    await this.ensureConnection()
    await this.simulateLatency()
    this.recordOperation('get', key)
    return this.state.store.get(key)
  }

  async set(key: string, value: any, options?: any): Promise<'OK'> {
    await this.ensureConnection()
    await this.simulateLatency()
    this.recordOperation('set', key, value)
    this.state.store.set(key, value)
    return 'OK'
  }

  async del(key: string): Promise<number> {
    await this.ensureConnection()
    await this.simulateLatency()
    this.recordOperation('del', key)
    const existed = this.state.store.delete(key)
    return existed ? 1 : 0
  }

  // Test helper methods
  getOperationHistory(): RedisOperation[] {
    return [...this.state.operations]
  }

  clearOperationHistory(): void {
    this.state.operations = []
  }

  getConnectionState(): RedisConnectionState {
    return this.state.connectionState
  }

  simulateError(error: Error): void {
    this.state.errors.push(error)
    this.state.connectionState = 'error'
    this.emit('error', error)
  }

  // Private helper methods
  private recordOperation(type: string, key: string, value?: any): void {
    this.state.operations.push({
      type: type as RedisOperation['type'],
      key,
      value,
      timestamp: new Date()
    })
  }

  private async ensureConnection(): Promise<void> {
    if (this.state.connectionState !== 'connected') {
      throw new RedisError('Not connected to Redis', 'connection')
    }
    if (this.state.errors.length > 0) {
      throw this.state.errors[0]
    }
  }

  private async simulateLatency(): Promise<void> {
    const latency = Math.random() * 10 // 0-10ms latency
    await new Promise(resolve => setTimeout(resolve, latency))
  }
}

// Factory function to create new instances
export const createEnhancedRedisMock = () => new EnhancedRedisMock()