import { test, expect, type APIRequestContext } from '@playwright/test';
import { CARDS, address, bearer, checkout, checkoutBody, credentials, expectError, isolate, json, login, newKey, payment, stockOf, type Order, type Pricing, type Product } from '../../../utils/playground-api';

const reset = async (request: APIRequestContext) => {
  const response = await request.post('/api/reset');
  expect(response.status()).toBe(204);
};

const buy = (productId: number, quantity: number, extra: Record<string, unknown> = {}) => checkoutBody({ items: [{ productId, quantity }], ...extra });

async function registerOther(request: APIRequestContext) {
  const response = await request.post('/api/auth/register', {
    headers: isolate(),
    data: { name: 'Other Collector', email: 'other@qa.test', password: 'Abcdef1!', confirmPassword: 'Abcdef1!', acceptTerms: true },
  });
  expect(response.status()).toBe(201);
  return (await json<{ token: string }>(response)).token;
}

let user = '';
let admin = '';

test.beforeAll(async ({ playwright, baseURL }) => {
  const request = await playwright.request.newContext({ baseURL });
  user = (await login(request, 'user')).token;
  admin = (await login(request, 'admin')).token;
  await request.dispose();
});

test.beforeEach(async ({ request }) => reset(request));

test.afterAll(async ({ playwright, baseURL }) => {
  const request = await playwright.request.newContext({ baseURL });
  await reset(request);
  await request.dispose();
});

test.describe('Checkout: successful orders', () => {
  test('@smoke a valid checkout creates a confirmed order', async ({ request }) => {
    const response = await checkout(request, user, buy(1, 1));
    expect(response.status(), await response.text()).toBe(201);
    const { data } = await json<{ data: Order }>(response);
    expect(data.id).toMatch(/^ord_[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{16}$/);
    expect(data).toMatchObject({ status: 'confirmed', shippingMethod: 'standard', cardLast4: '4242' });
    expect(data.shippingAddress).toEqual(address());
    expect(new Date(data.createdAt).getTime()).toBeLessThanOrEqual(Date.now() + 1000);
    expect(response.headers().location).toBe(`/api/orders/${data.id}`);
  });

  test('@sanity the order total matches the cart pricing endpoint', async ({ request }) => {
    const items = [{ productId: 2, quantity: 2 }, { productId: 5, quantity: 1 }];
    const quote = await json<Pricing>(await request.post('/api/cart/price', { data: { items, coupon: 'SAVE10', shippingMethod: 'express' } }));
    const { data } = await json<{ data: Order }>(await checkout(request, user, checkoutBody({ items, coupon: 'SAVE10', shippingMethod: 'express' })));
    expect(data.pricing).toEqual(quote);
  });

  for (const [coupon, shippingMethod] of [[undefined, 'standard'], ['SAVE10', 'standard'], ['FIXED5', 'express'], ['FREESHIP', 'express']] as const) {
    test(`@regression the order stores coupon=${coupon ?? 'none'} shipping=${shippingMethod}`, async ({ request }) => {
      const { data } = await json<{ data: Order }>(await checkout(request, user, buy(1, 1, { ...(coupon ? { coupon } : {}), shippingMethod })));
      expect(data.pricing.coupon).toBe(coupon ?? null);
      expect(data.shippingMethod).toBe(shippingMethod);
    });
  }

  test('@regression the order never exposes the card number, cvv or the internal user id', async ({ request }) => {
    const response = await checkout(request, user, buy(1, 1, { payment: payment({ cvv: '987' }) }));
    const text = await response.text();
    expect(text).not.toContain(CARDS.ok);
    expect(text).not.toContain('"cvv"');
    expect(text).not.toContain('987');
    expect(text).not.toContain('userId');
  });

  test('@regression the last four digits of other cards are stored', async ({ request }) => {
    const { data } = await json<{ data: Order }>(await checkout(request, user, buy(1, 1, { payment: payment({ cardNumber: '4012888888881881' }) })));
    expect(data.cardLast4).toBe('1881');
  });

  test('@regression an admin can also place orders', async ({ request }) => {
    expect((await checkout(request, admin, buy(1, 1))).status()).toBe(201);
  });
});

test.describe('Checkout: stock', () => {
  test('@smoke a confirmed order reduces the stock by the purchased quantity', async ({ request }) => {
    const before = await stockOf(request, 1);
    expect((await checkout(request, user, buy(1, 2))).status()).toBe(201);
    expect(await stockOf(request, 1)).toBe(before - 2);
  });

  test('@regression every line of the cart reduces its own stock', async ({ request }) => {
    const before = [await stockOf(request, 2), await stockOf(request, 4), await stockOf(request, 6)];
    const items = [{ productId: 2, quantity: 1 }, { productId: 4, quantity: 3 }, { productId: 6, quantity: 2 }];
    expect((await checkout(request, user, checkoutBody({ items }))).status()).toBe(201);
    expect([await stockOf(request, 2), await stockOf(request, 4), await stockOf(request, 6)]).toEqual([before[0] - 1, before[1] - 3, before[2] - 2]);
  });

  test('@regression the new stock is visible in the listing and in the detail', async ({ request }) => {
    await checkout(request, user, buy(1, 4));
    const detail = (await json<{ data: Product }>(await request.get('/api/products/1'))).data;
    const listing = (await json<{ data: Product[] }>(await request.get('/api/products?pageSize=50'))).data.find((p) => p.id === 1);
    expect(detail.stock).toBe(36);
    expect(listing?.stock).toBe(36);
  });

  test('@regression other artworks are not affected', async ({ request }) => {
    const before = await stockOf(request, 5);
    await checkout(request, user, buy(1, 1));
    expect(await stockOf(request, 5)).toBe(before);
  });

  test('@regression the last copies can be bought one order at a time until it is sold out', async ({ request }) => {
    expect(await stockOf(request, 3)).toBe(3);
    expect((await checkout(request, user, buy(3, 2))).status()).toBe(201);
    expect(await stockOf(request, 3)).toBe(1);

    const tooMany = await checkout(request, user, buy(3, 2));
    const error = await expectError(tooMany, 409, 'INSUFFICIENT_STOCK');
    expect(error.details).toEqual({ productId: 3, requested: 2, available: 1 });
    expect(await stockOf(request, 3)).toBe(1);

    expect((await checkout(request, user, buy(3, 1))).status()).toBe(201);
    expect(await stockOf(request, 3)).toBe(0);

    const soldOut = await checkout(request, user, buy(3, 1));
    expect((await expectError(soldOut, 409, 'INSUFFICIENT_STOCK')).details).toEqual({ productId: 3, requested: 1, available: 0 });
  });

  test('@regression a sold out artwork disappears from inStock=true and shows in inStock=false', async ({ request }) => {
    await checkout(request, user, buy(3, 3));
    const inStock = (await json<{ data: Product[] }>(await request.get('/api/products?inStock=true&pageSize=50'))).data.map((p) => p.id);
    const soldOut = (await json<{ data: Product[] }>(await request.get('/api/products?inStock=false&pageSize=50'))).data.map((p) => p.id);
    expect(inStock).not.toContain(3);
    expect(soldOut.sort()).toEqual([3, 7]);
  });

  test('@regression a sold out artwork can no longer be priced in the cart', async ({ request }) => {
    await checkout(request, user, buy(3, 3));
    await expectError(await request.post('/api/cart/price', { data: { items: [{ productId: 3, quantity: 1 }] } }), 409, 'INSUFFICIENT_STOCK');
  });

  test('@regression ten copies per order: four orders leave 0 and the fifth fails', async ({ request }) => {
    for (let i = 0; i < 4; i += 1) expect((await checkout(request, user, buy(1, 10))).status()).toBe(201);
    expect(await stockOf(request, 1)).toBe(0);
    await expectError(await checkout(request, user, buy(1, 1)), 409, 'INSUFFICIENT_STOCK');
  });

  test('@regression a failed multi-line order does not reduce any stock', async ({ request }) => {
    const before = [await stockOf(request, 1), await stockOf(request, 3)];
    const response = await checkout(request, user, checkoutBody({ items: [{ productId: 1, quantity: 1 }, { productId: 3, quantity: 4 }] }));
    expect(response.status()).toBe(409);
    expect([await stockOf(request, 1), await stockOf(request, 3)]).toEqual(before);
  });

  test('@regression a declined card does not reduce the stock', async ({ request }) => {
    const before = await stockOf(request, 1);
    await expectError(await checkout(request, user, buy(1, 1, { payment: payment({ cardNumber: CARDS.declined }) })), 402, 'CARD_DECLINED');
    expect(await stockOf(request, 1)).toBe(before);
  });

  test('@regression POST /api/reset restores the initial stock', async ({ request }) => {
    await checkout(request, user, buy(3, 3));
    await checkout(request, user, buy(9, 5));
    await reset(request);
    expect([await stockOf(request, 3), await stockOf(request, 9)]).toEqual([3, 5]);
  });
});

test.describe('Checkout: concurrency', () => {
  test('@regression six parallel orders for five copies sell exactly five', async ({ request }) => {
    const responses = await Promise.all(Array.from({ length: 6 }, () => checkout(request, user, buy(9, 1))));
    const statuses = responses.map((r) => r.status()).sort();
    expect(statuses).toEqual([201, 201, 201, 201, 201, 409]);
    expect(await stockOf(request, 9)).toBe(0);
  });

  test('@regression parallel orders from different users never oversell', async ({ request }) => {
    const responses = await Promise.all([
      ...Array.from({ length: 3 }, () => checkout(request, user, buy(3, 1))),
      ...Array.from({ length: 3 }, () => checkout(request, admin, buy(3, 1))),
    ]);
    expect(responses.filter((r) => r.status() === 201)).toHaveLength(3);
    expect(responses.filter((r) => r.status() === 409)).toHaveLength(3);
    expect(await stockOf(request, 3)).toBe(0);
  });

  test('@regression parallel orders with the same idempotency key create one order', async ({ request }) => {
    const key = newKey();
    const before = await stockOf(request, 1);
    const responses = await Promise.all(Array.from({ length: 5 }, () => checkout(request, user, buy(1, 1), key)));
    const statuses = responses.map((r) => r.status()).sort();
    expect(statuses).toEqual([200, 200, 200, 200, 201]);
    expect(await stockOf(request, 1)).toBe(before - 1);
    const ids = await Promise.all(responses.map(async (r) => (await json<{ data: Order }>(r)).data.id));
    expect(new Set(ids).size).toBe(1);
  });

  test('@regression one order for the last copy and concurrent price checks stay consistent', async ({ request }) => {
    await checkout(request, user, buy(3, 2));
    const [order, quote] = await Promise.all([
      checkout(request, user, buy(3, 1)),
      request.post('/api/cart/price', { data: { items: [{ productId: 3, quantity: 1 }] } }),
    ]);
    expect(order.status()).toBe(201);
    expect([200, 409]).toContain(quote.status());
    expect(await stockOf(request, 3)).toBe(0);
  });
});

test.describe('Checkout: idempotency', () => {
  test('@smoke repeating the same request with the same key returns the original order', async ({ request }) => {
    const key = newKey();
    const first = await checkout(request, user, buy(1, 1), key);
    const second = await checkout(request, user, buy(1, 1), key);
    expect(first.status()).toBe(201);
    expect(second.status()).toBe(200);
    expect(second.headers()['idempotent-replayed']).toBe('true');
    expect(first.headers()['idempotent-replayed']).toBeUndefined();
    expect(await json<unknown>(second)).toEqual(await json<unknown>(first));
  });

  test('@regression a replay does not reduce the stock again', async ({ request }) => {
    const key = newKey();
    const before = await stockOf(request, 1);
    await checkout(request, user, buy(1, 2), key);
    await checkout(request, user, buy(1, 2), key);
    await checkout(request, user, buy(1, 2), key);
    expect(await stockOf(request, 1)).toBe(before - 2);
  });

  test('@regression a replay still works after the stock ran out', async ({ request }) => {
    const key = newKey();
    expect((await checkout(request, user, buy(3, 3), key)).status()).toBe(201);
    const replay = await checkout(request, user, buy(3, 3), key);
    expect(replay.status()).toBe(200);
  });

  test('@regression the same key with a different body returns 422 IDEMPOTENCY_KEY_REUSED', async ({ request }) => {
    const key = newKey();
    await checkout(request, user, buy(1, 1), key);
    const before = await stockOf(request, 1);
    await expectError(await checkout(request, user, buy(1, 2), key), 422, 'IDEMPOTENCY_KEY_REUSED');
    expect(await stockOf(request, 1)).toBe(before);
  });

  test('@regression a different address with the same key is a different body', async ({ request }) => {
    const key = newKey();
    await checkout(request, user, buy(1, 1), key);
    await expectError(await checkout(request, user, buy(1, 1, { shippingAddress: address({ city: 'Madrid' }) }), key), 422, 'IDEMPOTENCY_KEY_REUSED');
  });

  test('@regression different keys create different orders', async ({ request }) => {
    const a = await json<{ data: Order }>(await checkout(request, user, buy(1, 1)));
    const b = await json<{ data: Order }>(await checkout(request, user, buy(1, 1)));
    expect(a.data.id).not.toBe(b.data.id);
  });

  test('@regression the idempotency key is scoped per user', async ({ request }) => {
    const key = newKey();
    expect((await checkout(request, user, buy(1, 1), key)).status()).toBe(201);
    expect((await checkout(request, admin, buy(1, 1), key)).status()).toBe(201);
  });

  test('@regression a failed attempt does not burn the key', async ({ request }) => {
    const key = newKey();
    await expectError(await checkout(request, user, buy(1, 1, { payment: payment({ cardNumber: CARDS.declined }) }), key), 402, 'CARD_DECLINED');
    const retry = await checkout(request, user, buy(1, 1), key);
    expect(retry.status()).toBe(201);
  });

  test('@regression POST /api/reset forgets the idempotency keys', async ({ request }) => {
    const key = newKey();
    expect((await checkout(request, user, buy(1, 1), key)).status()).toBe(201);
    await reset(request);
    expect((await checkout(request, user, buy(1, 1), key)).status()).toBe(201);
  });
});

test.describe('Orders: retrieval and access control', () => {
  async function place(request: APIRequestContext, token = user) {
    return (await json<{ data: Order }>(await checkout(request, token, buy(1, 1)))).data;
  }

  test('@smoke the owner can read the order', async ({ request }) => {
    const order = await place(request);
    const response = await request.get(`/api/orders/${order.id}`, { headers: bearer(user) });
    expect(response.status()).toBe(200);
    expect((await json<{ data: Order }>(response)).data).toEqual(order);
  });

  test('@sanity an admin can read any order', async ({ request }) => {
    const order = await place(request);
    const response = await request.get(`/api/orders/${order.id}`, { headers: bearer(admin) });
    expect(response.status()).toBe(200);
    expect((await json<{ data: Order }>(response)).data.id).toBe(order.id);
  });

  test('@sanity another user cannot read the order', async ({ request }) => {
    const order = await place(request);
    const other = await registerOther(request);
    await expectError(await request.get(`/api/orders/${order.id}`, { headers: bearer(other) }), 403, 'FORBIDDEN');
  });

  test('@regression reading an order requires authentication', async ({ request }) => {
    const order = await place(request);
    await expectError(await request.get(`/api/orders/${order.id}`), 401, 'UNAUTHORIZED');
    await expectError(await request.get(`/api/orders/${order.id}`, { headers: bearer('a.b.c') }), 401, 'TOKEN_INVALID');
  });

  test('@regression a user cannot read an order placed by an admin', async ({ request }) => {
    const order = await place(request, admin);
    await expectError(await request.get(`/api/orders/${order.id}`, { headers: bearer(user) }), 403, 'FORBIDDEN');
  });

  test('@regression the order id is a signed token: tampering returns 404', async ({ request }) => {
    const order = await place(request);
    const [payload, signature] = order.id.slice(4).split('.');
    const flipped = `${payload.slice(0, -2)}${payload.slice(-2) === 'AA' ? 'BB' : 'AA'}`;
    for (const forged of [`ord_${flipped}.${signature}`, `ord_${payload}.${'A'.repeat(16)}`, `ord_${payload}`, order.id.slice(0, -1)]) {
      await expectError(await request.get(`/api/orders/${forged}`, { headers: bearer(user) }), 404, 'ORDER_NOT_FOUND');
    }
  });

  test('@regression an order for a forged owner cannot be created by editing the payload', async ({ request }) => {
    const order = await place(request);
    const [payload, signature] = order.id.slice(4).split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
    decoded.userId = 'usr_attacker';
    const forged = `ord_${Buffer.from(JSON.stringify(decoded)).toString('base64url')}.${signature}`;
    await expectError(await request.get(`/api/orders/${forged}`, { headers: bearer(admin) }), 404, 'ORDER_NOT_FOUND');
  });

  test('@regression orders survive a stock reset because they are self-contained', async ({ request }) => {
    const order = await place(request);
    await reset(request);
    const response = await request.get(`/api/orders/${order.id}`, { headers: bearer(user) });
    expect(response.status()).toBe(200);
  });
});

test.describe('Reset endpoint', () => {
  test('@sanity reset returns 204 with an empty body', async ({ request }) => {
    const response = await request.post('/api/reset');
    expect(response.status()).toBe(204);
    expect(await response.text()).toBe('');
  });

  test('@regression reset clears the rate limit counters', async ({ request }) => {
    const headers = isolate();
    for (let i = 0; i < 6; i += 1) await request.post('/api/auth/login', { headers, data: credentials('user') });
    await expectError(await request.post('/api/auth/login', { headers, data: credentials('user') }), 429, 'RATE_LIMITED');
    await reset(request);
    expect((await request.post('/api/auth/login', { headers, data: credentials('user') })).status()).toBe(200);
  });

  test('@regression reset is idempotent', async ({ request }) => {
    await reset(request);
    await reset(request);
    expect(await stockOf(request, 1)).toBe(40);
  });
});
