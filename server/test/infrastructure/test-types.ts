import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express-serve-static-core';
import type { SuperAgentTest } from 'supertest';

// Extend Express types with proper typing
export interface Request extends ExpressRequest {
  user?: {
    _id: string;
    email: string;
    permissions?: string[];
    metadata?: Record<string, any>;
  };
  headers: {
    authorization?: string;
    [key: string]: string | undefined;
  };
}

export interface Response extends ExpressResponse {
  json: jest.Mock;
  status: jest.Mock;
  send: jest.Mock;
}

// Extend Jest's expect
declare global {
  namespace jest {
    // Extend basic matchers
    interface Matchers<R> {
      // Comparison
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toStrictEqual(expected: any): R;
      toBeInstanceOf(expected: any): R;

      // Numeric
      toBeGreaterThan(expected: number): R;
      toBeLessThan(expected: number): R;
      toBeGreaterThanOrEqual(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;

      // Collection
      toHaveLength(expected: number): R;
      toContain(expected: any): R;
      toContainEqual(expected: any): R;

      // Object
      toMatchObject(expected: any): R;
      toHaveProperty(path: string, value?: any): R;

      // String
      toMatch(expected: string | RegExp): R;
      toMatchInlineSnapshot(snapshot?: string): R;

      // Mock
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalledTimes(count: number): R;
    }

    // Extend asymmetric matchers
    interface ExpectStatic {
      // Type checking
      any(constructor: any): any;
      anything(): any;

      // String matching
      stringContaining(str: string): any;
      stringMatching(str: string | RegExp): any;

      // Array/Object matching
      arrayContaining<T>(arr: Array<T>): any;
      objectContaining<T extends object>(obj: Partial<T>): any;

      // Number matching
      closeTo(num: number, delta: number): any;
    }

    // Extend inverse matchers
    interface InverseAsymmetricMatchers {
      // Type checking
      any(constructor: any): any;
      anything(): any;

      // String matching
      stringContaining(str: string): any;
      stringMatching(str: string | RegExp): any;

      // Array/Object matching
      arrayContaining<T>(arr: Array<T>): any;
      objectContaining<T extends object>(obj: Partial<T>): any;

      // Number matching
      closeTo(num: number, delta: number): any;
    }
  }

  // Extend global expect
  interface Expect extends jest.ExpectStatic {
    <T = any>(actual: T): jest.Matchers<void>;
    not: jest.InverseAsymmetricMatchers;
  }
}

// Test helper types
export interface TestContext {
  req: Partial<Request>;
  res: Partial<Response>;
  next: jest.Mock<void, [Error?]>;
}

export interface TestServer {
  app: any;
  server: any;
  close: () => Promise<void>;
}

// Re-export commonly used types
export type { ExpressRequest, ExpressResponse, NextFunction, SuperAgentTest };