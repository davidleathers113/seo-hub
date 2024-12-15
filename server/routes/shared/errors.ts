import { Response } from 'express';
import { ValidationError } from '../../database/mongodb/client';
import { ErrorResponse } from './types';
import { logger } from '../../utils/log';

const log = logger('routes/shared/errors');

export const handleRouteError = (error: unknown, res: Response): void => {
  if (error instanceof ValidationError) {
    const response: ErrorResponse = {
      error: 'Validation Error',
      message: error.message
    };

    if (error.message.includes('Not authorized')) {
      res.status(403).json(response);
    } else {
      res.status(400).json(response);
    }
    return;
  }

  log.error('Unhandled route error:', error);
  const response: ErrorResponse = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  };

  if (process.env.NODE_ENV === 'development') {
    response.details = error;
  }

  res.status(500).json(response);
};

export const createErrorResponse = (
  statusCode: number,
  message: string,
  details?: unknown
): ErrorResponse => {
  const response: ErrorResponse = {
    error: message
  };

  if (details) {
    response.details = details;
  }

  return response;
};
