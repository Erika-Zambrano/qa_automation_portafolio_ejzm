import { createHmac, randomUUID } from 'node:crypto';
import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

export const USERS = {
  user: { email: 'user@qa.test', password: 'Passw0rd!', role: 'user' },
  admin: { email: 'admin@qa.test', password: 'Adm1nPass!', role: 'admin' },
  locked: { email: 'locked@qa.test', password: 'Passw0rd!', role: 'user' },
} as const;

export const credentials = (who: keyof typeof USERS) => ({ email: USERS[who].email, password: USERS[who].password });

export const CARDS = {
  ok: '4242424242424242',
  declined: '4000000000000002',
  noFunds: '4000000000009995',
} as const;

export const PRICES: Record<number, number> = {
  1: 4500, 2: 3800, 3: 5200, 4: 6900, 5: 5900, 6: 4900, 7: 7500, 8: 6400, 9: 8900,
  10: 4200, 11: 5600, 12: 5400, 13: 4600, 14: 3900, 15: 6200, 16: 9900, 17: 11900, 18: 10500,
};

export const newKey = () => randomUUID();
export const isolate = (extra: Record<string, string> = {}) => ({ 'X-RateLimit-Key': randomUUID(), ...extra });
export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export type ApiErrorBody = { error: { code: string; message: string; details?: Array<{ field: string; code: string; message: string }>; requestId: string } };

export async function expectError(response: APIResponse, status: number, code: string) {
  expect(response.status(), await response.text()).toBe(status);
  expect(response.headers()['content-type']).toContain('application/json');
  const body = (await response.json()) as ApiErrorBody;
  expect(body.error.code).toBe(code);
  expect(typeof body.error.message).toBe('string');
  expect(body.error.requestId).toBeTruthy();
  expect(response.headers()['x-request-id']).toBe(body.error.requestId);
  return body.error;
}

export async function expectFieldError(response: APIResponse, status: number, field: string, code: string) {
  const error = await expectError(response, status, 'VALIDATION_ERROR');
  const match = error.details?.find((d) => d.field === field && d.code === code);
  expect(match, `expected ${field}:${code} in ${JSON.stringify(error.details)}`).toBeTruthy();
  return error;
}

export async function login(request: APIRequestContext, who: keyof typeof USERS = 'user', ttl?: number) {
  const { email, password } = USERS[who];
  const response = await request.post('/api/auth/login', {
    headers: isolate(),
    data: { email, password, ...(ttl !== undefined ? { ttl } : {}) },
  });
  expect(response.status(), await response.text()).toBe(200);
  const body = (await response.json()) as { token: string; expiresIn: number; user: { id: string; email: string; name: string; role: string } };
  return body;
}

export const decodeJwt = (token: string) => ({
  header: JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf8')) as Record<string, unknown>,
  payload: JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8')) as Record<string, unknown>,
});

export function signJwt(payload: Record<string, unknown>, secret: string, header: Record<string, unknown> = { alg: 'HS256', typ: 'JWT' }) {
  const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const data = `${part(header)}.${part(payload)}`;
  return `${data}.${createHmac('sha256', secret).update(data).digest('base64url')}`;
}

export const address = (overrides: Record<string, unknown> = {}) => ({
  fullName: 'Ada Lovelace',
  street: 'Calle Mayor 1',
  city: 'Valencia',
  zip: '46001',
  country: 'ES',
  ...overrides,
});

export const payment = (overrides: Record<string, unknown> = {}) => ({
  cardNumber: CARDS.ok,
  expiry: '12/45',
  cvv: '123',
  ...overrides,
});

export function checkoutBody(overrides: Record<string, unknown> = {}) {
  return {
    items: [{ productId: 1, quantity: 1 }],
    shippingMethod: 'standard',
    shippingAddress: address(),
    payment: payment(),
    ...overrides,
  };
}

export function formBody(overrides: Record<string, unknown> = {}) {
  return {
    fullName: 'Ada Lovelace',
    email: 'Ada@Example.com',
    country: 'AR',
    gender: 'female',
    interests: ['appraisal', 'framing'],
    birthDate: '1990-05-20',
    collectingYears: 5,
    message: 'Quiero tasar un cuadro.',
    newsletter: true,
    acceptTerms: true,
    ...overrides,
  };
}

export function without<T extends Record<string, unknown>>(source: T, key: string): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...source };
  delete copy[key];
  return copy;
}

export async function checkout(request: APIRequestContext, token: string, body: unknown, key: string = newKey()) {
  return request.post('/api/checkout', { headers: { ...bearer(token), 'Idempotency-Key': key }, data: body });
}

export async function stockOf(request: APIRequestContext, id: number): Promise<number> {
  const response = await request.get(`/api/products/${id}`);
  return ((await response.json()) as { data: { stock: number } }).data.stock;
}
