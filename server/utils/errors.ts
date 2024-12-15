export class AppError extends Error {
  type: string;
  code: string | null;

  constructor(type: string, message: string, code: string | null = null) {
    super(message);
    this.type = type;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 'VALIDATION_FAILED');
  }
}

export class DuplicateError extends AppError {
  constructor(message: string) {
    super('DUPLICATE_ERROR', message, 'DUPLICATE_EMAIL');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super('AUTHENTICATION_ERROR', message, 'AUTH_FAILED');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super('DATABASE_ERROR', message, 'DB_ERROR');
  }
}
