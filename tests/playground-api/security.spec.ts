import { test, expect } from '@playwright/test';
import { bearer, expectError, expectFieldError, formBody, isolate, login } from '../../utils/playground-api';

const INJECTIONS = ["' OR '1'='1", '"; DROP TABLE products; --', '<script>alert(1)</script>', '${7*7}', '{{constructor.constructor("return 1")()}}', '../../../etc/passwd', '%00', '\\u0000', 'A'.repeat(2000)];

test.describe('Security: input handling', () => {
  for (const payload of INJECTIONS) {
    test(`@regression q=${payload.slice(0, 24)} is harmless in the catalog search`, async ({ request }) => {
      const response = await request.get(`/api/products?q=${encodeURIComponent(payload)}`);
      expect(response.status()).toBe(200);
      expect((await response.json()).meta.total).toBe(0);
    });

    test(`@regression artist=${payload.slice(0, 24)} is harmless in the catalog filter`, async ({ request }) => {
      expect((await request.get(`/api/products?artist=${encodeURIComponent(payload)}`)).status()).toBe(200);
    });
  }

  for (const id of ['..%2F..%2Fetc%2Fpasswd', '%2e%2e', '%00', '1;DROP', '1%20OR%201=1', 'null', 'undefined', 'NaN', '9'.repeat(400)]) {
    test(`@regression a hostile product id (${id.slice(0, 20)}) never yields a server error`, async ({ request }) => {
      const response = await request.get(`/api/products/${id}`);
      expect([400, 404]).toContain(response.status());
      expect((await response.json()).error.code).toMatch(/INVALID_ID|PRODUCT_NOT_FOUND|NOT_FOUND/);
    });
  }

  test('@regression hostile order ids return 404 without leaking details', async ({ request }) => {
    const { token } = await login(request, 'user');
    for (const id of ['ord_x', 'ord_.', 'ord_a.b', '..', `ord_${'A'.repeat(500)}.${'B'.repeat(16)}`, 'ord_%00']) {
      const response = await request.get(`/api/orders/${id}`, { headers: bearer(token) });
      expect([404, 400]).toContain(response.status());
      const text = await response.text();
      expect(text).not.toMatch(/node_modules|\.ts:\d+|at \w+ \(/);
    }
  });

  test('@regression error responses never expose stack traces or file paths', async ({ request }) => {
    const responses = [
      await request.get('/api/nope'),
      await request.get('/api/products?page=abc'),
      await request.post('/api/auth/login', { headers: { 'Content-Type': 'application/json', ...isolate() }, data: Buffer.from('{bad') }),
      await request.post('/api/forms/submit', { data: { fullName: {} } }),
      await request.get('/api/chaos?status=500'),
    ];
    for (const response of responses) {
      const text = await response.text();
      expect(text).not.toMatch(/node_modules|\/Users\/|\.ts:\d+|at \w+ \(|Error:/);
    }
  });

  test('@regression no technology disclosure headers are sent', async ({ request }) => {
    const headers = (await request.get('/api/health')).headers();
    expect(headers['x-powered-by']).toBeUndefined();
    expect(headers['server']).toBeUndefined();
  });

  test('@regression deeply nested JSON is rejected cleanly', async ({ request }) => {
    const depth = 8000;
    const raw = `${'{"a":'.repeat(depth)}1${'}'.repeat(depth)}`;
    const response = await request.post('/api/forms/submit', { headers: { 'Content-Type': 'application/json' }, data: Buffer.from(raw) });
    expect([400, 422]).toContain(response.status());
    expect(['INVALID_JSON', 'VALIDATION_ERROR']).toContain((await response.json()).error.code);
  });

  test('@regression a very long string value is handled', async ({ request }) => {
    const response = await request.post('/api/forms/submit', { data: formBody({ message: 'x'.repeat(90_000) }) });
    await expectFieldError(response, 422, 'message', 'TOO_LONG');
  });
});

test.describe('Security: mass assignment and prototype pollution', () => {
  for (const key of ['__proto__', 'constructor', 'prototype', 'isAdmin', 'role']) {
    test(`@regression forms reject the ${key} key`, async ({ request }) => {
      const data = JSON.parse(JSON.stringify(formBody()));
      Object.defineProperty(data, key, { value: { polluted: true }, enumerable: true, configurable: true, writable: true });
      const response = await request.post('/api/forms/submit', { data });
      await expectFieldError(response, 422, key, 'UNKNOWN_FIELD');
    });
  }

  test('@regression registration cannot assign the admin role', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      headers: isolate(),
      data: { name: 'Mallory', email: 'mallory@x.co', password: 'Abcdef1!', confirmPassword: 'Abcdef1!', acceptTerms: true, role: 'admin' },
    });
    await expectFieldError(response, 400, 'role', 'UNKNOWN_FIELD');
  });

  test('@regression a registered user is never an admin', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      headers: isolate(),
      data: { name: 'Mallory', email: 'mallory@x.co', password: 'Abcdef1!', confirmPassword: 'Abcdef1!', acceptTerms: true },
    });
    expect((await response.json()).user.role).toBe('user');
  });

  test('@regression the cart price cannot be overridden by the client', async ({ request }) => {
    const response = await request.post('/api/cart/price', { data: { items: [{ productId: 1, quantity: 1, unitPrice: 1, lineTotal: 1 }] } });
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.subtotal).toBe(4500);
    expect(result.lines[0].unitPrice).toBe(4500);
  });

  test('@regression a polluted request does not change later behaviour', async ({ request }) => {
    const polluted = JSON.parse('{"items":[{"productId":1,"quantity":1}],"__proto__":{"coupon":"SAVE10"}}');
    await request.post('/api/cart/price', { data: polluted });
    const clean = await (await request.post('/api/cart/price', { data: { items: [{ productId: 1, quantity: 1 }] } })).json();
    expect(clean.coupon).toBeNull();
    expect(clean.discount).toBe(0);
  });

  test('@regression a method override header does not change the method', async ({ request }) => {
    const response = await request.post('/api/health', { headers: { 'X-HTTP-Method-Override': 'GET' } });
    await expectError(response, 405, 'METHOD_NOT_ALLOWED');
  });
});

test.describe('Security: transport details', () => {
  test('@regression CORS is open but never allows credentials', async ({ request }) => {
    const response = await request.get('/api/products', { headers: { Origin: 'https://evil.example' } });
    expect(response.headers()['access-control-allow-origin']).toBe('*');
    expect(response.headers()['access-control-allow-credentials']).toBeUndefined();
  });

  test('@regression JSON content type with a charset or different casing is accepted', async ({ request }) => {
    for (const contentType of ['application/json; charset=utf-8', 'APPLICATION/JSON', 'application/json;charset=UTF-8']) {
      const response = await request.post('/api/auth/login', {
        headers: { 'Content-Type': contentType, ...isolate() },
        data: Buffer.from(JSON.stringify({ email: 'user@qa.test', password: 'Passw0rd!' })),
      });
      expect(response.status(), contentType).toBe(200);
    }
  });

  test('@regression the token is never reflected in error responses', async ({ request }) => {
    const { token } = await login(request, 'user');
    const response = await request.get('/api/products/abc', { headers: bearer(token) });
    expect(await response.text()).not.toContain(token);
  });

  test('@regression password values are never echoed back in validation errors', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      headers: isolate(),
      data: { name: 'A', email: 'bad', password: 'SuperSecret-123', confirmPassword: 'other', acceptTerms: true },
    });
    expect(await response.text()).not.toContain('SuperSecret-123');
  });
});
