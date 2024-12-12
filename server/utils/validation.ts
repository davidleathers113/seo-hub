/**
 * Validates if a string is a valid ID format.
 * This is a database-agnostic validation that checks if the ID matches
 * the format we expect (24 character hex string for MongoDB, but could be
 * adapted for other databases).
 */
export function isValidId(id: string): boolean {
  // Check if the id is a 24 character hex string (MongoDB ObjectId format)
  // This could be adapted for other database ID formats
  return Boolean(id && typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/));
}

/**
 * Validates if an array of IDs are all valid.
 */
export function areValidIds(ids: string[]): boolean {
  return Array.isArray(ids) && ids.every(isValidId);
}

/**
 * Validates if a value is a non-empty string.
 */
export function isNonEmptyString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if a value is a positive number.
 */
export function isPositiveNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Validates an email address format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Type guard to check if an error is an instance of Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}