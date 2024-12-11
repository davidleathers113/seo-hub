import { EnhancedRedisMock } from './enhanced-redis-mock'
import { TestState, UserState, TokenState, SessionState } from './types'
import { RedisError } from './errors'

/**
 * Enhanced test container with better type safety and state management
 */
export class TestContainer {
  private static instance: TestContainer
  private mocks: Map<string, jest.Mock>
  private state: TestState
  private redisMock: EnhancedRedisMock
  private cleanupHandlers: Array<() => Promise<void>>
  private stateSubscribers: Array<(state: TestState) => void>

  private constructor() {
    this.mocks = new Map()
    this.redisMock = new EnhancedRedisMock()
    this.cleanupHandlers = []
    this.stateSubscribers = []
    this.state = this.createInitialState()
  }

  static getInstance(): TestContainer {
    if (!TestContainer.instance) {
      TestContainer.instance = new TestContainer()
    }
    return TestContainer.instance
  }

  // State Management
  getState(): Readonly<TestState> {
    return Object.freeze({ ...this.state })
  }

  setState(newState: Partial<TestState>): void {
    this.state = {
      ...this.state,
      ...newState
    }
    this.notifyStateSubscribers()
  }

  subscribeToState(callback: (state: TestState) => void): () => void {
    this.stateSubscribers.push(callback)
    return () => {
      this.stateSubscribers = this.stateSubscribers.filter(cb => cb !== callback)
    }
  }

  // Mock Management
  getMock<T extends jest.Mock>(name: string): T {
    const mock = this.mocks.get(name)
    if (!mock) {
      const newMock = jest.fn() as T
      this.mocks.set(name, newMock)
      return newMock
    }
    return mock as T
  }

  setMock(name: string, mock: jest.Mock): void {
    this.mocks.set(name, mock)
  }

  clearMocks(): void {
    this.mocks.forEach(mock => mock.mockClear())
  }

  // Redis Mock Access
  getRedisMock(): EnhancedRedisMock {
    return this.redisMock
  }

  // User State Management
  setCurrentUser(user: UserState): void {
    this.setState({
      user: {
        ...this.state.user,
        current: user
      }
    })
  }

  getCurrentUser(): Readonly<UserState> | null {
    return this.state.user.current ? Object.freeze({ ...this.state.user.current }) : null
  }

  // Token Management
  addToken(token: string, claims: Record<string, any>): void {
    const tokenState: TokenState = {
      value: token,
      expires: new Date(Date.now() + 3600000), // 1 hour from now
      claims,
      blacklisted: false
    }

    this.state.auth.tokens.set(token, tokenState)
    this.notifyStateSubscribers()
  }

  blacklistToken(token: string): void {
    const tokenState = this.state.auth.tokens.get(token)
    if (tokenState) {
      tokenState.blacklisted = true
      this.state.auth.blacklist.add(token)
      this.notifyStateSubscribers()
    }
  }

  // Session Management
  addSession(session: SessionState): void {
    this.state.auth.sessions.set(session.id, session)
    this.notifyStateSubscribers()
  }

  removeSession(sessionId: string): void {
    this.state.auth.sessions.delete(sessionId)
    this.notifyStateSubscribers()
  }

  // Error Simulation
  simulateError(error: Error): void {
    if (error instanceof RedisError) {
      this.redisMock.simulateError(error)
    } else {
      throw new Error(`Unsupported error type: ${error.constructor.name}`)
    }
  }

  // Cleanup Management
  registerCleanup(handler: () => Promise<void>): void {
    this.cleanupHandlers.push(handler)
  }

  async reset(): Promise<void> {
    try {
      // Execute all cleanup handlers
      await Promise.all(this.cleanupHandlers.map(handler => handler()))

      // Reset state
      this.state = this.createInitialState()
      this.mocks.clear()
      this.cleanupHandlers = []

      // Reset Redis mock
      this.redisMock = new EnhancedRedisMock()

      this.notifyStateSubscribers()
    } catch (error) {
      console.error('Error during test container reset:', error)
      throw error
    }
  }

  // Private Helpers
  private createInitialState(): TestState {
    return {
      auth: {
        tokens: new Map(),
        sessions: new Map(),
        blacklist: new Set()
      },
      redis: {
        store: new Map(),
        connectionState: 'disconnected',
        errorQueue: []
      },
      user: {
        current: null,
        permissions: new Set(),
        metadata: new Map()
      }
    }
  }

  private notifyStateSubscribers(): void {
    const frozenState = this.getState()
    this.stateSubscribers.forEach(callback => {
      try {
        callback(frozenState)
      } catch (error) {
        console.error('Error in state subscriber:', error)
      }
    })
  }
}

// Export singleton instance
export const testContainer = TestContainer.getInstance()

// Export type-safe helper functions
export const getTestContainer = (): TestContainer => TestContainer.getInstance()
export const resetTestContainer = async (): Promise<void> => {
  await TestContainer.getInstance().reset()
}