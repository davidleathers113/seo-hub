import { ValidationError } from './errors'
import { Request } from './test-types'

/**
 * Protocol Guard for validating requests and operations
 */
export class ProtocolGuard {
  /**
   * Validates authentication request structure
   */
  static validateAuthRequest(request: Partial<Request>): void {
    const required = ['headers.authorization']
    this.validateFields(request, required)

    const authHeader = request.headers?.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ValidationError(
        'Invalid authorization header format',
        'headers.authorization',
        authHeader
      )
    }
  }

  /**
   * Validates login request structure
   */
  static validateLoginRequest(request: { body: any }): void {
    const required = ['body.email', 'body.password']
    this.validateFields(request, required)

    if (!this.isValidEmail(request.body.email)) {
      throw new ValidationError(
        'Invalid email format',
        'body.email',
        request.body.email
      )
    }
  }

  /**
   * Validates registration request structure
   */
  static validateRegistrationRequest(request: { body: any }): void {
    const required = ['body.email', 'body.password']
    this.validateFields(request, required)

    if (!this.isValidEmail(request.body.email)) {
      throw new ValidationError(
        'Invalid email format',
        'body.email',
        request.body.email
      )
    }

    if (!this.isValidPassword(request.body.password)) {
      throw new ValidationError(
        'Invalid password format',
        'body.password'
      )
    }
  }

  /**
   * Validates Redis operation parameters
   */
  static validateRedisOperation(operation: string, key: string, value?: any): void {
    if (!['get', 'set', 'del'].includes(operation)) {
      throw new ValidationError(
        'Invalid Redis operation',
        'operation',
        operation
      )
    }

    if (typeof key !== 'string') {
      throw new ValidationError(
        'Redis key must be string',
        'key',
        key
      )
    }

    if (operation === 'set' && value === undefined) {
      throw new ValidationError(
        'Value required for set operation',
        'value'
      )
    }
  }

  /**
   * Validates presence of required fields in an object
   */
  private static validateFields(obj: any, fields: string[]): void {
    for (const field of fields) {
      if (!this.hasField(obj, field)) {
        throw new ValidationError(
          `Missing required field: ${field}`,
          field
        )
      }
    }
  }

  /**
   * Checks if a nested field exists in an object
   */
  private static hasField(obj: any, field: string): boolean {
    return field.split('.').reduce((o, i) => o && o[i], obj) !== undefined
  }

  /**
   * Validates email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validates password requirements
   */
  private static isValidPassword(password: string): boolean {
    return password.length >= 8
  }
}