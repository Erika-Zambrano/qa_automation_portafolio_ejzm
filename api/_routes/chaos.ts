import { ApiError, Issues } from '../_lib/errors';
import { type Ctx, route } from '../_lib/http';
import { queryInt } from '../_lib/validate';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handler = async (ctx: Ctx) => {
  const issues = new Issues();
  const status = queryInt(ctx.query, 'status', issues, { min: 200, max: 599, fallback: 200 });
  const delay = queryInt(ctx.query, 'delay', issues, { min: 0, max: 10000, fallback: 0 });
  let failRate = 0;
  if (ctx.query.failRate !== undefined) {
    failRate = Number(ctx.query.failRate);
    if (!Number.isFinite(failRate) || failRate < 0 || failRate > 1) issues.add('failRate', 'OUT_OF_RANGE', 'failRate must be between 0 and 1');
  }
  issues.throwIfAny();
  if (delay > 0) await sleep(delay);
  if (failRate > 0 && Math.random() < failRate) {
    throw new ApiError(503, 'CHAOS_FAILURE', 'Random failure injected', undefined, { 'Retry-After': '1' });
  }
  const headers: Record<string, string> = {};
  if (status === 429 || status === 503) headers['Retry-After'] = '1';
  if (ctx.query.malformed === 'true') return { status, raw: '{"data": [1, 2,', headers };
  if (status === 204 || status === 304) return { status, headers };
  const body = status >= 400
    ? { error: { code: 'CHAOS_REQUESTED', message: `Requested status ${status}`, requestId: ctx.requestId } }
    : { status, delay, method: ctx.method, body: ctx.body ?? null };
  return { status, body, headers };
};

export default route({ GET: handler, POST: handler, PUT: handler, PATCH: handler, DELETE: handler });
