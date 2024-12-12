import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

declare global {
  namespace Express {
    interface Request extends ExpressRequest {
      user?: {
        _id: string;
        email: string;
        [key: string]: any;
      };
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
  user?: {
    _id: string;
    email: string;
    [key: string]: any;
  };
  method: string;
  url: string;
  originalUrl: string;
  headers: any;
}

export interface Response<
  ResBody = any,
  Locals extends Record<string, any> = Record<string, any>
> extends ExpressResponse<ResBody, Locals> {
  json: (body: ResBody) => Response<ResBody, Locals>;
  status: (code: number) => Response<ResBody, Locals>;
}

export type NextFunction = (error?: any) => void;
