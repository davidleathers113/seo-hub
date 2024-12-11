/**
 * Error hierarchy for test infrastructure
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AuthError'
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}

export class TokenError extends AuthError {
  constructor(message: string, details?: any) {
    super(message, 'TOKEN_ERROR', details)
    this.name = 'TokenError'
    Object.setPrototypeOf(this, TokenError.prototype)
  }
}

export class SessionError extends AuthError {
  constructor(message: string, details?: any) {
    super(message, 'SESSION_ERROR', details)
    this.name = 'SessionError'
    Object.setPrototypeOf(this, SessionError.prototype)
  }
}

export class RedisError extends Error {
  constructor(
    message: string,
    public operation: string,
    public key?: string
  ) {
    super(message)
    this.name = 'RedisError'
    Object.setPrototypeOf(this, RedisError.prototype)
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: any
  ) {
    super(message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

// Error factory methods for common scenarios
export const createTokenError = (message: string, token?: string) => {
  return new TokenError(message, { token })
}

export const createSessionError = (message: string, sessionId?: string) => {
  return new SessionError(message, { sessionId })
}

export const createRedisError = (operation: string, key: string, message?: string) => {
  return new RedisError(
    message || `Redis operation '${operation}' failed for key '${key}'`,
    operation,
    key
  )
}