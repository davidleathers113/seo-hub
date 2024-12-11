import { Request, Response } from 'express';
import { RedisClientType } from 'redis';

// Allow both Express.NextFunction and jest.Mock
type NextFunctionOrMock = ((err?: any) => void) | jest.Mock;

export function authenticateWithToken(
  req: Request,
  res: Response,
  next: NextFunctionOrMock
): Promise<void>;

export function requireUser(
  req: Request,
  res: Response,
  next: NextFunctionOrMock
): void;

export function initRedis(client: RedisClientType): void;