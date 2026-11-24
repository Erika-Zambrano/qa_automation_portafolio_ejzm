import { test, expect } from '@playwright/test';
import { USERS, bearer, credentials, decodeJwt, expectError, expectFieldError, isolate, login, signJwt } from '../../utils/playground-api';

test.describe('Auth: login', () => {
  test('@smoke valid credentials return a token and the user', async ({ request }) => {
    const body = await login(request, 'user');
    expect(body.user).toEqual({ id: expect.stringMatching(/^usr_[0-9a-f]{12}$/), name: 'Standard User', email: 'user@qa.test', role: 'user' });
    expect(body.token.split('.')).toHaveLength(3);
    expect(body.expiresIn).toBe(900);
  });

  test('@sanity the JWT has HS256 header and the expected claims', async ({ request }) => {
    const { token, user } = await login(request, 'user');
    const { header, payload } = decodeJwt(token);
    expect(header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(payload).toMatchObject({ sub: user.id, email: 'user@qa.test', name: 'Standard User', role: 'user' });
    expect((payload.exp as number) - (payload.iat as number)).toBe(900);
  });

  test('@sanity the admin account carries the admin role', async ({ request }) => {
    const { token, user } = await login(request, 'admin');
    expect(user.role).toBe('admin');
    expect(decodeJwt(token).payload.role).toBe('admin');
  });

  test('@regression the same user always gets the same id', async ({ request }) => {
    const first = await login(request, 'user');
    const second = await login(request, 'user');
    expect(first.user.id).toBe(second.user.id);
    expect(first.token).toBeTruthy();
  });

  test('@regression email matching is case-insensitive', async ({ request }) => {
    const response = await request.post('/api/auth/login', { headers: isolate(), data: { email: 'USER@QA.TEST', password: USERS.user.password } });
    expect(response.status()).toBe(200);
  });

  test('@regression a custom ttl controls expiresIn and exp', async ({ request }) => {
    const { token, expiresIn } = await login(request, 'user', 120);
    expect(expiresIn).toBe(120);
    const { payload } = decodeJwt(token);
    expect((payload.exp as number) - (payload.iat as number)).toBe(120);
  });

  test('@regression wrong password returns 401 INVALID_CREDENTIALS', async ({ request }) => {
    const response = await request.post('/api/auth/login', { headers: isolate(), data: { email: 'user@qa.test', password: 'Wrong123!' } });
    await expectError(response, 401, 'INVALID_CREDENTIALS');
  });

  test('@regression passwords are case-sensitive', async ({ request }) => {
    const response = await request.post('/api/auth/login', { headers: isolate(), data: { email: 'user@qa.test', password: 'passw0rd!' } });
    await expectError(response, 401, 'INVALID_CREDENTIALS');
  });

  test('@regression unknown email and wrong password are indistinguishable', async ({ request }) => {
    const unknown = await request.post('/api/auth/login', { headers: isolate(), data: { email: 'ghost@qa.test', password: 'Wrong123!' } });
    const wrong = await request.post('/api/auth/login', { headers: isolate(), data: { email: 'user@qa.test', password: 'Wrong123!' } });
    const a = await expectError(unknown, 401, 'INVALID_CREDENTIALS');
    const b = await expectError(wrong, 401, 'INVALID_CREDENTIALS');
    expect(a.message).toBe(b.message);
  });

  test('@regression a locked account returns 423 ACCOUNT_LOCKED even with the right password', async ({ request }) => {
    const response = await request.post('/api/auth/login', { headers: isolate(), data: credentials('locked') });
    await expectError(response, 423, 'ACCOUNT_LOCKED');
  });

  test('@regression a locked account with a wrong password still returns 401', async ({ request }) => {
    const response = await request.post('/api/auth/login', { headers: isolate(), data: { email: USERS.locked.email, password: 'nope' } });
    await expectError(response, 401, 'INVALID_CREDENTIALS');
  });

  const invalid: Array<[string, Record<string, unknown>, string, string]> = [
    ['missing email', { password: 'x' }, 'email', 'REQUIRED'],
    ['missing password', { email: 'user@qa.test' }, 'password', 'REQUIRED'],
    ['empty email', { email: '', password: 'x' }, 'email', 'REQUIRED'],
    ['blank email', { email: '   ', password: 'x' }, 'email', 'REQUIRED'],
    ['email as number', { email: 42, password: 'x' }, 'email', 'INVALID_TYPE'],
    ['password as number', { email: 'user@qa.test', password: 123 }, 'password', 'INVALID_TYPE'],
    ['password as object', { email: 'user@qa.test', password: { a: 1 } }, 'password', 'INVALID_TYPE'],
    ['null email', { email: null, password: 'x' }, 'email', 'REQUIRED'],
    ['email too long', { email: `${'a'.repeat(121)}`, password: 'x' }, 'email', 'TOO_LONG'],
    ['password too long', { email: 'user@qa.test', password: 'p'.repeat(73) }, 'password', 'TOO_LONG'],
    ['ttl zero', { email: 'user@qa.test', password: 'x', ttl: 0 }, 'ttl', 'OUT_OF_RANGE'],
    ['ttl above max', { email: 'user@qa.test', password: 'x', ttl: 3601 }, 'ttl', 'OUT_OF_RANGE'],
    ['ttl negative', { email: 'user@qa.test', password: 'x', ttl: -5 }, 'ttl', 'OUT_OF_RANGE'],
    ['ttl float', { email: 'user@qa.test', password: 'x', ttl: 1.5 }, 'ttl', 'INVALID_TYPE'],
    ['ttl string', { email: 'user@qa.test', password: 'x', ttl: '60' }, 'ttl', 'INVALID_TYPE'],
    ['unknown field', { email: 'user@qa.test', password: 'x', admin: true }, 'admin', 'UNKNOWN_FIELD'],
    ['__proto__ field', JSON.parse('{"email":"user@qa.test","password":"x","__proto__":{"role":"admin"}}'), '__proto__', 'UNKNOWN_FIELD'],
  ];

  for (const [label, data, field, code] of invalid) {
    test(`@regression validation: ${label} returns 400 ${field}:${code}`, async ({ request }) => {
      const response = await request.post('/api/auth/login', { headers: isolate(), data });
      await expectFieldError(response, 400, field, code);
    });
  }

  test('@regression ttl at the boundaries 1 and 3600 is accepted', async ({ request }) => {
    expect((await login(request, 'user', 1)).expiresIn).toBe(1);
    expect((await login(request, 'user', 3600)).expiresIn).toBe(3600);
  });

  test('@regression several validation problems are reported together', async ({ request }) => {
    const response = await request.post('/api/auth/login', { headers: isolate(), data: { ttl: 0, extra: 1 } });
    const error = await expectError(response, 400, 'VALIDATION_ERROR');
    const fields = error.details?.map((d) => d.field) ?? [];
    expect(fields).toEqual(expect.arrayContaining(['email', 'password', 'ttl', 'extra']));
  });

  test('@regression SQL injection style credentials are just a failed login', async ({ request }) => {
    const response = await request.post('/api/auth/login', { headers: isolate(), data: { email: "' OR '1'='1", password: "' OR '1'='1" } });
    await expectError(response, 401, 'INVALID_CREDENTIALS');
  });
});

test.describe('Auth: rate limiting', () => {
  test('@sanity login exposes rate limit headers that count down', async ({ request }) => {
    const headers = isolate();
    const first = await request.post('/api/auth/login', { headers, data: credentials('user') });
    const second = await request.post('/api/auth/login', { headers, data: credentials('user') });
    expect(first.headers()['x-ratelimit-limit']).toBe('5');
    expect(first.headers()['x-ratelimit-remaining']).toBe('4');
    expect(second.headers()['x-ratelimit-remaining']).toBe('3');
  });

  test('@regression the sixth attempt in a window is blocked with 429 and Retry-After', async ({ request }) => {
    const headers = isolate();
    for (let i = 0; i < 5; i += 1) {
      const response = await request.post('/api/auth/login', { headers, data: { email: USERS.user.email, password: 'wrong' } });
      expect(response.status()).toBe(401);
    }
    const blocked = await request.post('/api/auth/login', { headers, data: credentials('user') });
    const error = await expectError(blocked, 429, 'RATE_LIMITED');
    expect(Number(blocked.headers()['retry-after'])).toBeGreaterThan(0);
    expect(Number(blocked.headers()['retry-after'])).toBeLessThanOrEqual(60);
    expect(blocked.headers()['x-ratelimit-remaining']).toBe('0');
    expect(error.details).toMatchObject({ retryAfter: expect.any(Number) });
  });

  test('@regression a blocked client cannot log in even with valid credentials', async ({ request }) => {
    const headers = isolate();
    for (let i = 0; i < 6; i += 1) await request.post('/api/auth/login', { headers, data: credentials('user') });
    await expectError(await request.post('/api/auth/login', { headers, data: credentials('user') }), 429, 'RATE_LIMITED');
  });

  test('@regression different rate limit keys are tracked independently', async ({ request }) => {
    const exhausted = isolate();
    for (let i = 0; i < 6; i += 1) await request.post('/api/auth/login', { headers: exhausted, data: credentials('user') });
    const other = await request.post('/api/auth/login', { headers: isolate(), data: credentials('user') });
    expect(other.status()).toBe(200);
  });

  test('@regression validation failures also consume the quota', async ({ request }) => {
    const headers = isolate();
    for (let i = 0; i < 5; i += 1) await request.post('/api/auth/login', { headers, data: {} });
    await expectError(await request.post('/api/auth/login', { headers, data: credentials('user') }), 429, 'RATE_LIMITED');
  });

  test('@regression the register limit is separate from the login limit', async ({ request }) => {
    const headers = isolate();
    for (let i = 0; i < 6; i += 1) await request.post('/api/auth/login', { headers, data: credentials('user') });
    const response = await request.post('/api/auth/register', { headers, data: {} });
    expect(response.status()).toBe(400);
  });
});

test.describe('Auth: sessions and tokens', () => {
  test('@smoke GET /me returns the user for a valid token', async ({ request }) => {
    const { token, user } = await login(request, 'user');
    const response = await request.get('/api/auth/me', { headers: bearer(token) });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.user).toEqual(user);
    expect(new Date(body.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  test('@regression expiresAt matches the token ttl', async ({ request }) => {
    const { token } = await login(request, 'user', 600);
    const body = await (await request.get('/api/auth/me', { headers: bearer(token) })).json();
    const remaining = (new Date(body.expiresAt).getTime() - Date.now()) / 1000;
    expect(remaining).toBeGreaterThan(590);
    expect(remaining).toBeLessThanOrEqual(600);
  });

  test('@regression GET /me without Authorization returns 401 with a WWW-Authenticate challenge', async ({ request }) => {
    const response = await request.get('/api/auth/me');
    await expectError(response, 401, 'UNAUTHORIZED');
    expect(response.headers()['www-authenticate']).toBe('Bearer');
  });

  for (const [label, value] of [
    ['Basic scheme', 'Basic dXNlcjpwYXNz'],
    ['no scheme', 'abc.def.ghi'],
    ['lowercase token only', 'bearer'],
    ['two tokens', 'Bearer a.b.c d.e.f'],
    ['empty bearer', 'Bearer '],
  ] as const) {
    test(`@regression Authorization with ${label} returns 401`, async ({ request }) => {
      const response = await request.get('/api/auth/me', { headers: { Authorization: value } });
      expect(response.status()).toBe(401);
      expect((await response.json()).error.code).toBe('UNAUTHORIZED');
    });
  }

  test('@regression the Bearer scheme is case-insensitive', async ({ request }) => {
    const { token } = await login(request, 'user');
    const response = await request.get('/api/auth/me', { headers: { Authorization: `bEaReR ${token}` } });
    expect(response.status()).toBe(200);
  });

  for (const [label, token] of [
    ['one segment', 'abc'],
    ['two segments', 'abc.def'],
    ['four segments', 'a.b.c.d'],
    ['non-base64 header', '%%%.e30.sig'],
    ['non-JSON header', `${Buffer.from('not json').toString('base64url')}.e30.sig`],
  ] as const) {
    test(`@regression a malformed token (${label}) returns 401 TOKEN_INVALID`, async ({ request }) => {
      await expectError(await request.get('/api/auth/me', { headers: bearer(token) }), 401, 'TOKEN_INVALID');
    });
  }

  test('@regression a token with a tampered payload is rejected', async ({ request }) => {
    const { token } = await login(request, 'user');
    const [header, , signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ sub: 'usr_x', email: 'user@qa.test', name: 'x', role: 'admin', iat: 1, exp: 9999999999 })).toString('base64url');
    await expectError(await request.get('/api/auth/me', { headers: bearer(`${header}.${forged}.${signature}`) }), 401, 'TOKEN_INVALID');
  });

  test('@regression a token with a corrupted signature is rejected', async ({ request }) => {
    const { token } = await login(request, 'user');
    const tampered = `${token.slice(0, -4)}AAAA`;
    await expectError(await request.get('/api/auth/me', { headers: bearer(tampered) }), 401, 'TOKEN_INVALID');
  });

  test('@regression a token signed with another secret is rejected', async ({ request }) => {
    const now = Math.floor(Date.now() / 1000);
    const forged = signJwt({ sub: 'usr_x', email: 'a@b.co', name: 'x', role: 'admin', iat: now, exp: now + 600 }, 'attacker-secret');
    await expectError(await request.get('/api/auth/me', { headers: bearer(forged) }), 401, 'TOKEN_INVALID');
  });

  test('@regression the alg=none attack is rejected', async ({ request }) => {
    const now = Math.floor(Date.now() / 1000);
    const part = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url');
    const none = `${part({ alg: 'none', typ: 'JWT' })}.${part({ sub: 'usr_x', email: 'a@b.co', name: 'x', role: 'admin', iat: now, exp: now + 600 })}.`;
    await expectError(await request.get('/api/auth/me', { headers: bearer(none) }), 401, 'TOKEN_INVALID');
  });

  test('@regression an HS512 header is rejected as an unsupported algorithm', async ({ request }) => {
    const now = Math.floor(Date.now() / 1000);
    const forged = signJwt({ sub: 'usr_x', exp: now + 600 }, 'qa-playground-dev-secret', { alg: 'HS512', typ: 'JWT' });
    await expectError(await request.get('/api/auth/me', { headers: bearer(forged) }), 401, 'TOKEN_INVALID');
  });

  test('@regression an expired token returns 401 TOKEN_EXPIRED', async ({ request }) => {
    const { token } = await login(request, 'user', 1);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await expectError(await request.get('/api/auth/me', { headers: bearer(token) }), 401, 'TOKEN_EXPIRED');
  });

  test('@regression a token is usable before it expires', async ({ request }) => {
    const { token } = await login(request, 'user', 5);
    expect((await request.get('/api/auth/me', { headers: bearer(token) })).status()).toBe(200);
  });

  test('@regression logout returns 204 with an empty body', async ({ request }) => {
    const { token } = await login(request, 'user');
    const response = await request.post('/api/auth/logout', { headers: bearer(token) });
    expect(response.status()).toBe(204);
    expect(await response.text()).toBe('');
  });

  test('@regression logout requires a valid token', async ({ request }) => {
    await expectError(await request.post('/api/auth/logout'), 401, 'UNAUTHORIZED');
    await expectError(await request.post('/api/auth/logout', { headers: bearer('a.b.c') }), 401, 'TOKEN_INVALID');
  });

  test('@regression tokens are stateless: a token still works after logout', async ({ request }) => {
    const { token } = await login(request, 'user');
    await request.post('/api/auth/logout', { headers: bearer(token) });
    expect((await request.get('/api/auth/me', { headers: bearer(token) })).status()).toBe(200);
  });
});
