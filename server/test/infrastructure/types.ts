/**
 * Core type definitions for test infrastructure
 */

export interface TestState {
  auth: {
    tokens: Map<string, TokenState>
    sessions: Map<string, SessionState>
    blacklist: Set<string>
  }
  redis: {
    store: Map<string, any>
    connectionState: 'connected' | 'disconnected' | 'error'
    errorQueue: Error[]
  }
  user: {
    current: UserState | null
    permissions: Set<string>
    metadata: Map<string, any>
  }
}

export interface TokenState {
  value: string
  expires: Date
  claims: Record<string, any>
  blacklisted: boolean
}

export interface SessionState {
  id: string
  user: UserState
  created: Date
  lastActive: Date
  metadata: Map<string, any>
}

export interface UserState {
  _id: string
  email: string
  permissions?: string[]
  metadata?: Record<string, any>
}

export type RedisConnectionState = 'connected' | 'disconnected' | 'error'

export interface RedisOperation {
  type: 'get' | 'set' | 'del'
  key: string
  value?: any
  timestamp: Date
}