import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import type { SuperTest, Test } from 'supertest';
import type { IncomingHttpHeaders } from 'http';

// Extend Express types with proper typing
export interface Request extends ExpressRequest {
  user?: {
    _id: string;
    email: string;
    permissions?: string[];
    metadata?: Record<string, any>;
  };
  headers: IncomingHttpHeaders;
  get(name: string): string | undefined;
}

export interface Response extends ExpressResponse {
  json: jest.Mock;
  status: jest.Mock;
  send: jest.Mock;
}

// Extend NextFunction to work with jest.Mock
export type TestNextFunction = jest.Mock<void, [(Error | undefined)?]>;

// Test helper types
export interface TestContext {
  req: Partial<Request>;
  res: Partial<Response>;
  next: TestNextFunction;
}

export interface TestServer {
  app: any;
  server: any;
  close: () => Promise<void>;
}

// Re-export commonly used types
export type { ExpressRequest, ExpressResponse, NextFunction, SuperTest, Test };
