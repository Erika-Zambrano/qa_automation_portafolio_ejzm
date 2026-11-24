import { ApiError } from './errors';
import type { Ctx } from './http';

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(ctx: Ctx, scope: string, limit: number, windowMs = 60_000): Record<string, string> {
  const key = `${scope}:${ctx.header('x-ratelimit-key') ?? ctx.ip}`;
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  const headers = {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
  };
  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    throw new ApiError(429, 'RATE_LIMITED', 'Too many requests', { retryAfter }, { ...headers, 'Retry-After': String(retryAfter) });
  }
  return headers;
}

export function resetRateLimits() {
  buckets.clear();
}
