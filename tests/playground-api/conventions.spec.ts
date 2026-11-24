import { test, expect } from '@playwright/test';
import { expectError, isolate } from '../../utils/playground-api';

const ENDPOINTS: Array<{ path: string; methods: string[] }> = [
  { path: '/api/health', methods: ['GET'] },
  { path: '/api/reset', methods: ['POST'] },
  { path: '/api/chaos', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
  { path: '/api/auth/login', methods: ['POST'] },
  { path: '/api/auth/register', methods: ['POST'] },
  { path: '/api/auth/me', methods: ['GET'] },
  { path: '/api/auth/logout', methods: ['POST'] },
  { path: '/api/products', methods: ['GET'] },
  { path: '/api/products/1', methods: ['GET'] },
  { path: '/api/cart/price', methods: ['POST'] },
  { path: '/api/checkout', methods: ['POST'] },
  { path: '/api/orders/ord_x', methods: ['GET'] },
  { path: '/api/forms/submit', methods: ['POST'] },
];

const ALL_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

test.describe('API conventions', () => {
  test('@smoke GET /api/health returns status ok', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ status: 'ok', service: 'qa-playground' });
    expect(new Date(body.time).toString()).not.toBe('Invalid Date');
  });

  test('@sanity every response carries X-Request-Id, no-store and CORS headers', async ({ request }) => {
    const response = await request.get('/api/health');
    const headers = response.headers();
    expect(headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(headers['cache-control']).toBe('no-store');
    expect(headers['access-control-allow-origin']).toBe('*');
    expect(headers['access-control-expose-headers']).toContain('X-Request-Id');
    expect(headers['content-type']).toContain('application/json');
  });

  test('@sanity a valid client X-Request-Id is echoed back', async ({ request }) => {
    const response = await request.get('/api/health', { headers: { 'X-Request-Id': 'trace-abc_123.x' } });
    expect(response.headers()['x-request-id']).toBe('trace-abc_123.x');
  });

  for (const invalid of ['has spaces', 'a'.repeat(65), 'semi;colon', 'ñandú']) {
    test(`@regression an invalid X-Request-Id (${invalid.slice(0, 12)}) is replaced by a generated one`, async ({ request }) => {
      const response = await request.get('/api/health', { headers: { 'X-Request-Id': invalid } });
      expect(response.headers()['x-request-id']).not.toBe(invalid);
      expect(response.headers()['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    });
  }

  test('@regression each request gets a different generated request id', async ({ request }) => {
    const ids = await Promise.all([1, 2, 3, 4, 5].map(async () => (await request.get('/api/health')).headers()['x-request-id']));
    expect(new Set(ids).size).toBe(5);
  });

  test('@regression error bodies carry the same request id as the header', async ({ request }) => {
    const response = await request.get('/api/does-not-exist', { headers: { 'X-Request-Id': 'trace-err-1' } });
    const error = await expectError(response, 404, 'NOT_FOUND');
    expect(error.requestId).toBe('trace-err-1');
  });

  test('@sanity unknown routes return 404 NOT_FOUND in the standard envelope', async ({ request }) => {
    await expectError(await request.get('/api/nope'), 404, 'NOT_FOUND');
    await expectError(await request.post('/api/nope/deeper', { data: {} }), 404, 'NOT_FOUND');
  });

  for (const { path, methods } of ENDPOINTS) {
    test(`@regression OPTIONS ${path} answers the CORS preflight`, async ({ request }) => {
      const response = await request.fetch(path, { method: 'OPTIONS' });
      expect(response.status()).toBe(204);
      expect(response.headers()['access-control-allow-origin']).toBe('*');
      expect(response.headers()['access-control-allow-headers']).toContain('Authorization');
      expect(response.headers()['access-control-allow-headers']).toContain('Idempotency-Key');
      for (const method of methods) expect(response.headers()['access-control-allow-methods']).toContain(method);
      expect(await response.text()).toBe('');
    });

    test(`@regression ${path} rejects unsupported methods with 405 and an Allow header`, async ({ request }) => {
      const rejected = ALL_METHODS.filter((m) => !methods.includes(m));
      for (const method of rejected) {
        const response = await request.fetch(path, { method, headers: isolate() });
        const error = await expectError(response, 405, 'METHOD_NOT_ALLOWED');
        expect(error.message).toContain(method);
        for (const allowed of methods) expect(response.headers().allow).toContain(allowed);
      }
    });
  }

  test('@regression POST with a non-JSON content type returns 415', async ({ request }) => {
    const response = await request.post('/api/auth/login', { headers: { 'Content-Type': 'text/plain', ...isolate() }, data: 'email=a' });
    await expectError(response, 415, 'UNSUPPORTED_MEDIA_TYPE');
  });

  test('@regression POST with form-encoded body returns 415', async ({ request }) => {
    const response = await request.post('/api/auth/login', { headers: isolate(), form: { email: 'user@qa.test', password: 'x' } });
    await expectError(response, 415, 'UNSUPPORTED_MEDIA_TYPE');
  });

  for (const [label, raw] of [
    ['truncated object', '{"email": "a"'],
    ['trailing comma', '{"email":"a",}'],
    ['single quotes', "{'email':'a'}"],
    ['plain word', 'hello'],
  ] as const) {
    test(`@regression malformed JSON (${label}) returns 400 INVALID_JSON`, async ({ request }) => {
      const response = await request.post('/api/auth/login', { headers: { 'Content-Type': 'application/json', ...isolate() }, data: Buffer.from(raw) });
      await expectError(response, 400, 'INVALID_JSON');
    });
  }

  for (const [label, payload] of [
    ['an array', '[1,2,3]'],
    ['a string', '"text"'],
    ['a number', '42'],
    ['null', 'null'],
    ['a boolean', 'true'],
  ] as const) {
    test(`@regression a JSON body that is ${label} is rejected with 400`, async ({ request }) => {
      const response = await request.post('/api/auth/login', { headers: { 'Content-Type': 'application/json', ...isolate() }, data: Buffer.from(payload) });
      const error = await expectError(response, 400, 'VALIDATION_ERROR');
      expect(error.details?.[0]).toMatchObject({ field: 'body', code: 'INVALID_TYPE' });
    });
  }

  test('@regression an empty POST body is rejected as a validation error', async ({ request }) => {
    const response = await request.post('/api/auth/login', { headers: isolate() });
    await expectError(response, 400, 'VALIDATION_ERROR');
  });

  test('@regression a body just under 100 KB is processed', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      headers: isolate(),
      data: { email: 'user@qa.test', password: 'x'.repeat(90_000) },
    });
    expect(response.status()).not.toBe(413);
  });

  test('@regression a body over 100 KB returns 413 PAYLOAD_TOO_LARGE', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      headers: isolate(),
      data: { email: 'user@qa.test', password: 'x'.repeat(110_000) },
    });
    await expectError(response, 413, 'PAYLOAD_TOO_LARGE');
  });

  test('@regression every error uses the same envelope keys', async ({ request }) => {
    const responses = [
      await request.get('/api/nope'),
      await request.get('/api/auth/me'),
      await request.get('/api/products?page=0'),
      await request.post('/api/auth/login', { headers: isolate(), data: {} }),
    ];
    for (const response of responses) {
      const body = await response.json();
      expect(Object.keys(body)).toEqual(['error']);
      expect(Object.keys(body.error)).toEqual(expect.arrayContaining(['code', 'message', 'requestId']));
    }
  });
});
