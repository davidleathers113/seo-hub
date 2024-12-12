import { Request } from 'express';
import { User, Session } from '../database/interfaces';

export interface AuthenticatedRequest extends Request {
  user: User;
  session?: Session;
}

// Extend Express Request to include optional user and session
declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}