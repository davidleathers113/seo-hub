import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { Session } from 'express-session';
import { UserDocument } from '../database/mongodb/models/User';

// Define session data structure
interface SessionData extends Session {
  userId?: string;
  isAuthenticated?: boolean;
  lastAccess?: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      session: SessionData;
    }
  }
}

export interface Request<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
> extends ExpressRequest<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: UserDocument;
  session: SessionData;
  method: string;
  url: string;
  originalUrl: string;
  headers: {
    [key: string]: string | string[] | undefined;
  };
}

export interface Response<
  ResBody = any,
  Locals extends Record<string, any> = Record<string, any>
> extends ExpressResponse<ResBody, Locals> {
  json: (body: ResBody) => Response<ResBody, Locals>;
  status: (code: number) => Response<ResBody, Locals>;
  sendError?: (error: Error & { statusCode?: number }) => void;
}

export interface ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
}

export type NextFunction = (error?: ApiError | Error | any) => void;
