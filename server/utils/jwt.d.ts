export interface TokenPayload {
  id: string;
  email: string;
  exp?: number;
  iat?: number;
}

export function generateToken(user: { _id: string; email: string }): string;
export function verifyToken(token: string): TokenPayload;