import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from './errors';
import type { Ctx } from './http';

const SECRET = process.env.JWT_SECRET ?? 'qa-playground-dev-secret';
export const DEFAULT_TTL_SECONDS = 900;

export type TokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
};

const b64 = (input: Buffer | string) => Buffer.from(input).toString('base64url');

export function sign(data: string): string {
  return createHmac('sha256', SECRET).update(data).digest('base64url');
}

export function signToken(user: Pick<TokenPayload, 'sub' | 'email' | 'name' | 'role'>, ttl = DEFAULT_TTL_SECONDS): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64(JSON.stringify({ ...user, iat: now, exp: now + ttl }));
  return `${header}.${payload}.${sign(`${header}.${payload}`)}`;
}

export function verifyToken(token: string): TokenPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new ApiError(401, 'TOKEN_INVALID', 'Malformed token');
  const [header, payload, signature] = parts;
  let parsedHeader: { alg?: string };
  try {
    parsedHeader = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
  } catch {
    throw new ApiError(401, 'TOKEN_INVALID', 'Malformed token');
  }
  if (parsedHeader.alg !== 'HS256') throw new ApiError(401, 'TOKEN_INVALID', 'Unsupported algorithm');
  const expected = Buffer.from(sign(`${header}.${payload}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new ApiError(401, 'TOKEN_INVALID', 'Invalid signature');
  }
  let data: TokenPayload;
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    throw new ApiError(401, 'TOKEN_INVALID', 'Malformed token');
  }
  if (typeof data.exp !== 'number' || data.exp <= Math.floor(Date.now() / 1000)) {
    throw new ApiError(401, 'TOKEN_EXPIRED', 'Token has expired');
  }
  return data;
}

export function requireAuth(ctx: Ctx): TokenPayload {
  const header = ctx.header('authorization');
  if (!header) throw new ApiError(401, 'UNAUTHORIZED', 'Missing Authorization header', undefined, { 'WWW-Authenticate': 'Bearer' });
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  if (!match) throw new ApiError(401, 'UNAUTHORIZED', 'Authorization must use the Bearer scheme', undefined, { 'WWW-Authenticate': 'Bearer' });
  return verifyToken(match[1]);
}
