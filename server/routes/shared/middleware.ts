import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ValidationSchema, AuthenticatedRequest } from './types';
import { createErrorResponse } from './errors';
import { logger } from '../../utils/log';

const log = logger('routes/shared/middleware');

export const validateRequest = (schema: ValidationSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    const errors: string[] = [];

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in body)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Validate properties
    for (const [key, value] of Object.entries(body)) {
      const propertySchema = schema.properties[key];
      if (!propertySchema) {
        errors.push(`Unknown field: ${key}`);
        continue;
      }

      // Type validation
      if (propertySchema.type === 'string' && typeof value !== 'string') {
        errors.push(`${key} must be a string`);
      }

      // String length validation
      if (propertySchema.type === 'string' && typeof value === 'string') {
        if (propertySchema.minLength && value.length < propertySchema.minLength) {
          errors.push(`${key} must be at least ${propertySchema.minLength} characters long`);
        }
        if (propertySchema.maxLength && value.length > propertySchema.maxLength) {
          errors.push(`${key} must be at most ${propertySchema.maxLength} characters long`);
        }
      }

      // Format validation
      if (propertySchema.format === 'uuid' && typeof value === 'string') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
          errors.push(`${key} must be a valid UUID`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json(createErrorResponse(400, 'Validation Error', errors));
    }

    next();
  };
};

export const isAuthenticated = (req: Request): req is AuthenticatedRequest => {
  return 'user' in req && req.user !== undefined;
};

export const requireAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!isAuthenticated(req)) {
    res.status(401).json(createErrorResponse(401, 'Authentication required'));
    return;
  }
  next();
};

export const logRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  log.info(`${req.method} ${req.path}`, {
    query: req.query,
    params: req.params,
    body: req.body
  });
  next();
};

export const handleAsyncRoute = (
  handler: (req: AuthenticatedRequest, res: Response) => Promise<void>
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req as AuthenticatedRequest, res);
    } catch (error) {
      next(error);
    }
  };
};
