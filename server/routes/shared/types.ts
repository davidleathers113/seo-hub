import { Request, Response } from 'express';
import { User } from '../../database/interfaces';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface BaseHandler {
  (req: AuthenticatedRequest, res: Response): Promise<void>;
}

export interface ValidationSchema {
  type: 'object' | 'array';
  properties: Record<string, any>;
  required?: string[];
}

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

export interface SuccessResponse<T> {
  data: T;
  message?: string;
}
