class AppError extends Error {
  constructor(type, message, code = null) {
    super(message);
    this.type = type;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super('VALIDATION_ERROR', message, 'VALIDATION_FAILED');
  }
}

class DuplicateError extends AppError {
  constructor(message) {
    super('DUPLICATE_ERROR', message, 'DUPLICATE_EMAIL');
  }
}

class AuthenticationError extends AppError {
  constructor(message) {
    super('AUTHENTICATION_ERROR', message, 'AUTH_FAILED');
  }
}

class DatabaseError extends AppError {
  constructor(message) {
    super('DATABASE_ERROR', message, 'DB_ERROR');
  }
}

module.exports = {
  AppError,
  ValidationError,
  DuplicateError,
  AuthenticationError,
  DatabaseError
};