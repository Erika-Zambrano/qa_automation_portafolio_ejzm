import { test, expect } from '@playwright/test';
import { expectError, expectFieldError } from '../../utils/playground-api';

test.describe('Chaos endpoint', () => {
  test('@smoke the default response is 200 with an echo payload', async ({ request }) => {
    const response = await request.get('/api/chaos');
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: 200, delay: 0, method: 'GET', body: null });
  });

  const statuses = [200, 201, 202, 400, 401, 403, 404, 409, 418, 422, 429, 500, 502, 503, 504, 599];
  for (const status of statuses) {
    test(`@regression status=${status} returns exactly that status`, async ({ request }) => {
      const response = await request.get(`/api/chaos?status=${status}`);
      expect(response.status()).toBe(status);
      const body = await response.json();
      if (status >= 400) {
        expect(body.error).toMatchObject({ code: 'CHAOS_REQUESTED', message: `Requested status ${status}` });
        expect(body.error.requestId).toBe(response.headers()['x-request-id']);
      } else {
        expect(body.status).toBe(status);
      }
    });
  }

  test('@regression status=204 returns an empty body', async ({ request }) => {
    const response = await request.get('/api/chaos?status=204');
    expect(response.status()).toBe(204);
    expect(await response.text()).toBe('');
  });

  for (const status of [429, 503]) {
    test(`@regression status=${status} includes a Retry-After header`, async ({ request }) => {
      const response = await request.get(`/api/chaos?status=${status}`);
      expect(response.headers()['retry-after']).toBe('1');
    });
  }

  test('@regression other error statuses do not include Retry-After', async ({ request }) => {
    expect((await request.get('/api/chaos?status=500')).headers()['retry-after']).toBeUndefined();
  });

  for (const [value, code] of [['abc', 'INVALID_TYPE'], ['1.5', 'INVALID_TYPE'], ['199', 'OUT_OF_RANGE'], ['600', 'OUT_OF_RANGE'], ['0', 'OUT_OF_RANGE'], ['-200', 'OUT_OF_RANGE'], ['', 'INVALID_TYPE']] as const) {
    test(`@regression invalid status "${value}" returns 400 ${code}`, async ({ request }) => {
      await expectFieldError(await request.get(`/api/chaos?status=${value}`), 400, 'status', code);
    });
  }

  test('@sanity delay adds latency', async ({ request }) => {
    const started = Date.now();
    const response = await request.get('/api/chaos?delay=400');
    const elapsed = Date.now() - started;
    expect(response.status()).toBe(200);
    expect(elapsed).toBeGreaterThanOrEqual(380);
    expect(elapsed).toBeLessThan(3000);
    expect((await response.json()).delay).toBe(400);
  });

  test('@regression no delay answers quickly', async ({ request }) => {
    const started = Date.now();
    await request.get('/api/chaos');
    expect(Date.now() - started).toBeLessThan(400);
  });

  test('@regression delay and status combine', async ({ request }) => {
    const started = Date.now();
    const response = await request.get('/api/chaos?delay=300&status=503');
    expect(Date.now() - started).toBeGreaterThanOrEqual(280);
    expect(response.status()).toBe(503);
  });

  for (const [value, code] of [['-1', 'OUT_OF_RANGE'], ['10001', 'OUT_OF_RANGE'], ['fast', 'INVALID_TYPE'], ['1.5', 'INVALID_TYPE']] as const) {
    test(`@regression invalid delay "${value}" returns 400 ${code}`, async ({ request }) => {
      await expectFieldError(await request.get(`/api/chaos?delay=${value}`), 400, 'delay', code);
    });
  }

  test('@regression malformed=true returns a truncated JSON body that cannot be parsed', async ({ request }) => {
    const response = await request.get('/api/chaos?malformed=true');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const text = await response.text();
    expect(text).toBe('{"data": [1, 2,');
    expect(() => JSON.parse(text)).toThrow();
  });

  test('@regression malformed combines with a status code', async ({ request }) => {
    const response = await request.get('/api/chaos?malformed=true&status=500');
    expect(response.status()).toBe(500);
    const text = await response.text();
    expect(() => JSON.parse(text)).toThrow();
  });

  test('@regression malformed values other than true are ignored', async ({ request }) => {
    const response = await request.get('/api/chaos?malformed=1');
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: 200 });
  });

  test('@regression failRate=1 always fails with 503 CHAOS_FAILURE', async ({ request }) => {
    for (let i = 0; i < 5; i += 1) {
      const response = await request.get('/api/chaos?failRate=1');
      await expectError(response, 503, 'CHAOS_FAILURE');
      expect(response.headers()['retry-after']).toBe('1');
    }
  });

  test('@regression failRate=0 never fails', async ({ request }) => {
    for (let i = 0; i < 20; i += 1) expect((await request.get('/api/chaos?failRate=0')).status()).toBe(200);
  });

  test('@regression failRate=0.5 produces both outcomes over many calls', async ({ request }) => {
    const codes = new Set<number>();
    for (let i = 0; i < 60 && codes.size < 2; i += 1) codes.add((await request.get('/api/chaos?failRate=0.5')).status());
    expect([...codes].sort()).toEqual([200, 503]);
  });

  for (const value of ['2', '-0.1', 'abc', 'NaN', 'Infinity']) {
    test(`@regression invalid failRate "${value}" returns 400 OUT_OF_RANGE`, async ({ request }) => {
      await expectFieldError(await request.get(`/api/chaos?failRate=${value}`), 400, 'failRate', 'OUT_OF_RANGE');
    });
  }

  test('@regression the endpoint echoes the method and the body', async ({ request }) => {
    const payload = { artwork: 'El grito', tags: ['a', 'b'], n: 1 };
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'] as const) {
      const response = await request.fetch('/api/chaos', { method, data: payload });
      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject({ method, body: payload });
    }
  });

  test('@regression status and body combine for failing writes', async ({ request }) => {
    const response = await request.post('/api/chaos?status=422', { data: { a: 1 } });
    await expectError(response, 422, 'CHAOS_REQUESTED');
  });

  test('@regression chaos responses are not cached', async ({ request }) => {
    const response = await request.get('/api/chaos?status=500');
    expect(response.headers()['cache-control']).toBe('no-store');
  });
});
