import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../routes/shared/types';
import { User } from '../../database/interfaces';

export interface MockResponse extends Response {
  json: jest.Mock;
  status: jest.Mock;
  send: jest.Mock;
}

export function createMockResponse(): MockResponse {
  const res = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  } as MockResponse;
  return res;
}

export function createTestHandler(handler: BaseHandler) {
  return async (req: Partial<AuthenticatedRequest>, res: MockResponse) => {
    await handler(req as AuthenticatedRequest, res as Response);
  };
}

export function mockAuthenticatedRequest(
  userId: string,
  params = {},
  body = {},
  query = {}
): Partial<AuthenticatedRequest> {
  return {
    user: {
      id: userId,
      email: `user-${userId}@example.com`,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User,
    params,
    body,
    query
  };
}

export function mockService<T extends object>(methods: Partial<T>): T {
  return methods as T;
}

export function expectError(res: MockResponse, status: number, errorMessage?: string) {
  expect(res.status).toHaveBeenCalledWith(status);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.any(String),
      ...(errorMessage && { message: errorMessage })
    })
  );
}

export function expectSuccess(res: MockResponse, data: any, status = 200) {
  if (status === 204) {
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  } else {
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({ data });
  }
}
