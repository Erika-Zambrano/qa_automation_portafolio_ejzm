import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ApiError } from './errors';

export type Req = IncomingMessage & { query?: Record<string, string | string[] | undefined> };
export type Res = ServerResponse;

export type Ctx = {
  req: Req;
  method: string;
  query: Record<string, string>;
  headers: IncomingMessage['headers'];
  requestId: string;
  body: unknown;
  ip: string;
  header: (name: string) => string | undefined;
};

export type Result = {
  status: number;
  body?: unknown;
  raw?: string;
  headers?: Record<string, string>;
};

export type Handler = (ctx: Ctx) => Promise<Result> | Result;

const MAX_BODY_BYTES = 100 * 1024;
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let rejected = false;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        if (!rejected) {
          rejected = true;
          chunks.length = 0;
          reject(new ApiError(413, 'PAYLOAD_TOO_LARGE', `Body exceeds ${MAX_BODY_BYTES} bytes`));
        }
        return;
      }
      if (!rejected) chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function buildQuery(req: Req): Record<string, string> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const out: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    out[key] = value;
  });
  for (const [key, value] of Object.entries(req.query ?? {})) {
    if (value !== undefined) out[key] = Array.isArray(value) ? value[0] : value;
  }
  return out;
}

function send(res: Res, requestId: string, result: Result, extra: Record<string, string> = {}) {
  res.statusCode = result.status;
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'X-Request-Id, X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After, Idempotent-Replayed');
  for (const [key, value] of Object.entries({ ...extra, ...(result.headers ?? {}) })) res.setHeader(key, value);
  if (result.status === 204 || result.status === 304 || (result.body === undefined && result.raw === undefined)) {
    res.end();
    return;
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(result.raw ?? JSON.stringify(result.body));
}

export function route(handlers: Partial<Record<string, Handler>>) {
  const allowed = [...Object.keys(handlers), 'OPTIONS'].join(', ');
  return async (req: Req, res: Res) => {
    const incoming = req.headers['x-request-id'];
    const requestId =
      typeof incoming === 'string' && /^[\w.-]{1,64}$/.test(incoming) ? incoming : randomUUID();
    const method = (req.method ?? 'GET').toUpperCase();
    try {
      if (method === 'OPTIONS') {
        send(res, requestId, { status: 204 }, {
          'Access-Control-Allow-Methods': allowed,
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key, X-Request-Id, X-RateLimit-Key',
          'Access-Control-Max-Age': '600',
        });
        return;
      }
      const handler = handlers[method];
      if (!handler) {
        throw new ApiError(405, 'METHOD_NOT_ALLOWED', `${method} is not allowed`, undefined, { Allow: allowed });
      }
      let body: unknown;
      if (BODY_METHODS.has(method)) {
        const text = await readBody(req);
        if (text.trim().length > 0) {
          const contentType = String(req.headers['content-type'] ?? '');
          if (!contentType.toLowerCase().includes('application/json')) {
            throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Content-Type must be application/json');
          }
          try {
            body = JSON.parse(text);
          } catch {
            throw new ApiError(400, 'INVALID_JSON', 'Body is not valid JSON');
          }
        }
      }
      const ctx: Ctx = {
        req,
        method,
        query: buildQuery(req),
        headers: req.headers,
        requestId,
        body,
        ip: String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown').split(',')[0].trim(),
        header: (name) => {
          const value = req.headers[name.toLowerCase()];
          return Array.isArray(value) ? value[0] : value;
        },
      };
      send(res, requestId, await handler(ctx));
    } catch (error) {
      if (error instanceof ApiError) {
        send(
          res,
          requestId,
          {
            status: error.status,
            body: { error: { code: error.code, message: error.message, ...(error.details !== undefined ? { details: error.details } : {}), requestId } },
            headers: error.headers,
          },
        );
        return;
      }
      send(res, requestId, {
        status: 500,
        body: { error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error', requestId } },
      });
    }
  };
}
