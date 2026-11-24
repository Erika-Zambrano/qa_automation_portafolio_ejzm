import { test, expect, type APIRequestContext } from '@playwright/test';
import { CARDS, address, bearer, checkout, checkoutBody, expectError, expectFieldError, login, newKey, payment, stockOf, without } from '../../utils/playground-api';

let token = '';

test.beforeAll(async ({ playwright, baseURL }) => {
  const request = await playwright.request.newContext({ baseURL });
  token = (await login(request, 'user')).token;
  await request.dispose();
});

const post = (request: APIRequestContext, data: unknown, key: string | null = newKey(), auth: string | null = token) =>
  request.post('/api/checkout', { headers: { ...(auth ? bearer(auth) : {}), ...(key ? { 'Idempotency-Key': key } : {}) }, data });

test.describe('Checkout: authentication and idempotency key', () => {
  test('@smoke checkout requires a token', async ({ request }) => {
    await expectError(await post(request, checkoutBody(), newKey(), null), 401, 'UNAUTHORIZED');
  });

  test('@regression an invalid token is rejected before anything else', async ({ request }) => {
    await expectError(await post(request, {}, null, 'a.b.c'), 401, 'TOKEN_INVALID');
  });

  test('@regression a missing Idempotency-Key returns 400 IDEMPOTENCY_KEY_REQUIRED', async ({ request }) => {
    await expectError(await post(request, checkoutBody(), null), 400, 'IDEMPOTENCY_KEY_REQUIRED');
  });

  for (const [label, key] of [
    ['too short', 'abc1234'],
    ['65 characters', 'a'.repeat(65)],
    ['spaces', 'has spaces here'],
    ['symbols', 'key!@#$%^&*'],
    ['accents', 'clavé-ñandú-1'],
  ] as const) {
    test(`@regression an Idempotency-Key that is ${label} is rejected`, async ({ request }) => {
      await expectError(await post(request, checkoutBody(), key), 400, 'IDEMPOTENCY_KEY_REQUIRED');
    });
  }

  for (const [label, key] of [['8 characters', 'abcd1234'], ['64 characters', 'a'.repeat(64)], ['with dashes and underscores', 'key_with-dash_1']] as const) {
    test(`@regression an Idempotency-Key with ${label} is accepted (validation runs next)`, async ({ request }) => {
      await expectError(await post(request, { items: [] }, key), 422, 'VALIDATION_ERROR');
    });
  }

  test('@regression the key is checked before the body is validated', async ({ request }) => {
    await expectError(await post(request, { items: 'invalid' }, null), 400, 'IDEMPOTENCY_KEY_REQUIRED');
  });

  test('@regression a body that is not an object returns 400', async ({ request }) => {
    const response = await request.post('/api/checkout', { headers: { ...bearer(token), 'Idempotency-Key': newKey(), 'Content-Type': 'application/json' }, data: Buffer.from('[1,2]') });
    await expectFieldError(response, 400, 'body', 'INVALID_TYPE');
  });
});

test.describe('Checkout: body validation', () => {
  const valid = checkoutBody();

  const cases: Array<[string, Record<string, unknown>, string, string]> = [
    ['missing items', without(valid, 'items'), 'items', 'REQUIRED'],
    ['empty items', { ...valid, items: [] }, 'items', 'OUT_OF_RANGE'],
    ['quantity above 10', { ...valid, items: [{ productId: 1, quantity: 11 }] }, 'items[0].quantity', 'OUT_OF_RANGE'],
    ['duplicate items', { ...valid, items: [{ productId: 1, quantity: 1 }, { productId: 1, quantity: 2 }] }, 'items[1].productId', 'DUPLICATE_ITEM'],
    ['missing shippingMethod', without(valid, 'shippingMethod'), 'shippingMethod', 'REQUIRED'],
    ['invalid shippingMethod', { ...valid, shippingMethod: 'drone' }, 'shippingMethod', 'INVALID_OPTION'],
    ['missing shippingAddress', without(valid, 'shippingAddress'), 'shippingAddress', 'REQUIRED'],
    ['shippingAddress as string', { ...valid, shippingAddress: 'Calle 1' }, 'shippingAddress', 'REQUIRED'],
    ['missing payment', without(valid, 'payment'), 'payment', 'REQUIRED'],
    ['unknown top-level field', { ...valid, total: 1 }, 'total', 'UNKNOWN_FIELD'],
    ['missing fullName', { ...valid, shippingAddress: without(address(), 'fullName') }, 'shippingAddress.fullName', 'REQUIRED'],
    ['one-letter fullName', { ...valid, shippingAddress: address({ fullName: 'A' }) }, 'shippingAddress.fullName', 'TOO_SHORT'],
    ['81-letter fullName', { ...valid, shippingAddress: address({ fullName: 'A'.repeat(81) }) }, 'shippingAddress.fullName', 'TOO_LONG'],
    ['short street', { ...valid, shippingAddress: address({ street: 'ab' }) }, 'shippingAddress.street', 'TOO_SHORT'],
    ['121-char street', { ...valid, shippingAddress: address({ street: 's'.repeat(121) }) }, 'shippingAddress.street', 'TOO_LONG'],
    ['short city', { ...valid, shippingAddress: address({ city: 'V' }) }, 'shippingAddress.city', 'TOO_SHORT'],
    ['zip too short', { ...valid, shippingAddress: address({ zip: 'ab' }) }, 'shippingAddress.zip', 'INVALID_FORMAT'],
    ['zip too long', { ...valid, shippingAddress: address({ zip: '12345678901' }) }, 'shippingAddress.zip', 'INVALID_FORMAT'],
    ['zip with symbols', { ...valid, shippingAddress: address({ zip: '46#01' }) }, 'shippingAddress.zip', 'INVALID_FORMAT'],
    ['invalid country', { ...valid, shippingAddress: address({ country: 'XX' }) }, 'shippingAddress.country', 'INVALID_OPTION'],
    ['lowercase country', { ...valid, shippingAddress: address({ country: 'es' }) }, 'shippingAddress.country', 'INVALID_OPTION'],
    ['unknown address field', { ...valid, shippingAddress: address({ planet: 'Mars' }) }, 'shippingAddress.planet', 'UNKNOWN_FIELD'],
    ['card number with letters', { ...valid, payment: payment({ cardNumber: '4242abcd42424242' }) }, 'payment.cardNumber', 'INVALID_FORMAT'],
    ['card number with spaces', { ...valid, payment: payment({ cardNumber: '4242 4242 4242 4242' }) }, 'payment.cardNumber', 'INVALID_FORMAT'],
    ['card number too short', { ...valid, payment: payment({ cardNumber: '424242424242' }) }, 'payment.cardNumber', 'INVALID_FORMAT'],
    ['card number too long', { ...valid, payment: payment({ cardNumber: '42424242424242424242' }) }, 'payment.cardNumber', 'INVALID_FORMAT'],
    ['card number failing Luhn', { ...valid, payment: payment({ cardNumber: '4242424242424241' }) }, 'payment.cardNumber', 'INVALID_CARD'],
    ['card number as number', { ...valid, payment: payment({ cardNumber: 4242424242424242 }) }, 'payment.cardNumber', 'INVALID_TYPE'],
    ['expiry month 13', { ...valid, payment: payment({ expiry: '13/45' }) }, 'payment.expiry', 'INVALID_FORMAT'],
    ['expiry month 00', { ...valid, payment: payment({ expiry: '00/45' }) }, 'payment.expiry', 'INVALID_FORMAT'],
    ['expiry with 4-digit year', { ...valid, payment: payment({ expiry: '12/2045' }) }, 'payment.expiry', 'INVALID_FORMAT'],
    ['expiry without slash', { ...valid, payment: payment({ expiry: '1245' }) }, 'payment.expiry', 'INVALID_FORMAT'],
    ['expired card', { ...valid, payment: payment({ expiry: '01/20' }) }, 'payment.expiry', 'CARD_EXPIRED'],
    ['cvv with 2 digits', { ...valid, payment: payment({ cvv: '12' }) }, 'payment.cvv', 'INVALID_FORMAT'],
    ['cvv with 5 digits', { ...valid, payment: payment({ cvv: '12345' }) }, 'payment.cvv', 'INVALID_FORMAT'],
    ['cvv with letters', { ...valid, payment: payment({ cvv: '12a' }) }, 'payment.cvv', 'INVALID_FORMAT'],
    ['missing cvv', { ...valid, payment: without(payment(), 'cvv') }, 'payment.cvv', 'REQUIRED'],
    ['unknown payment field', { ...valid, payment: payment({ holder: 'Ada' }) }, 'payment.holder', 'UNKNOWN_FIELD'],
  ];

  for (const [label, data, field, code] of cases) {
    test(`@regression ${label} returns 422 ${field}:${code}`, async ({ request }) => {
      await expectFieldError(await post(request, data), 422, field, code);
    });
  }

  test('@regression the card expiry of the current month is still valid (no 422 for expiry)', async ({ request }) => {
    const now = new Date();
    const expiry = `${String(now.getUTCMonth() + 1).padStart(2, '0')}/${String(now.getUTCFullYear() % 100).padStart(2, '0')}`;
    const response = await post(request, checkoutBody({ items: [{ productId: 7, quantity: 1 }], payment: payment({ expiry }) }));
    await expectError(response, 409, 'INSUFFICIENT_STOCK');
  });

  test('@regression card number boundaries of 13 and 19 digits pass the format check', async ({ request }) => {
    for (const cardNumber of ['4222222222222', '4012888888881881', '6011111111111117']) {
      const response = await post(request, checkoutBody({ items: [{ productId: 7, quantity: 1 }], payment: payment({ cardNumber }) }));
      expect(response.status(), cardNumber).toBe(409);
    }
  });

  test('@regression all problems are reported together', async ({ request }) => {
    const response = await post(request, { items: [], shippingMethod: 'x', shippingAddress: {}, payment: {}, extra: 1 });
    const error = await expectError(response, 422, 'VALIDATION_ERROR');
    const fields = error.details?.map((d) => d.field) ?? [];
    expect(fields).toEqual(expect.arrayContaining(['items', 'shippingMethod', 'shippingAddress.fullName', 'payment.cardNumber', 'payment.expiry', 'payment.cvv', 'extra']));
  });
});

test.describe('Checkout: business rules that must not create an order', () => {
  test('@sanity an unknown product returns 404', async ({ request }) => {
    await expectError(await post(request, checkoutBody({ items: [{ productId: 999, quantity: 1 }] })), 404, 'PRODUCT_NOT_FOUND');
  });

  test('@sanity a sold out artwork returns 409 INSUFFICIENT_STOCK', async ({ request }) => {
    const error = await expectError(await post(request, checkoutBody({ items: [{ productId: 7, quantity: 1 }] })), 409, 'INSUFFICIENT_STOCK');
    expect(error.details).toEqual({ productId: 7, requested: 1, available: 0 });
  });

  test('@regression asking for more than the stock returns 409', async ({ request }) => {
    await expectError(await post(request, checkoutBody({ items: [{ productId: 3, quantity: 4 }] })), 409, 'INSUFFICIENT_STOCK');
  });

  test('@regression an invalid coupon returns 422 COUPON_INVALID', async ({ request }) => {
    await expectError(await post(request, checkoutBody({ coupon: 'NOPE' })), 422, 'COUPON_INVALID');
  });

  test('@regression the expired coupon returns 422 COUPON_EXPIRED', async ({ request }) => {
    await expectError(await post(request, checkoutBody({ coupon: 'WINTER20' })), 422, 'COUPON_EXPIRED');
  });

  test('@sanity a declined card returns 402 CARD_DECLINED', async ({ request }) => {
    await expectError(await post(request, checkoutBody({ payment: payment({ cardNumber: CARDS.declined }) })), 402, 'CARD_DECLINED');
  });

  test('@sanity a card without funds returns 402 INSUFFICIENT_FUNDS', async ({ request }) => {
    await expectError(await post(request, checkoutBody({ payment: payment({ cardNumber: CARDS.noFunds }) })), 402, 'INSUFFICIENT_FUNDS');
  });

  test('@regression stock is checked before the card is charged', async ({ request }) => {
    const response = await post(request, checkoutBody({ items: [{ productId: 7, quantity: 1 }], payment: payment({ cardNumber: CARDS.declined }) }));
    await expectError(response, 409, 'INSUFFICIENT_STOCK');
  });

  test('@regression a declined payment does not reduce the stock', async ({ request }) => {
    const before = await stockOf(request, 1);
    await post(request, checkoutBody({ payment: payment({ cardNumber: CARDS.declined }) }));
    await post(request, checkoutBody({ payment: payment({ cardNumber: CARDS.noFunds }) }));
    expect(await stockOf(request, 1)).toBe(before);
  });

  test('@regression a decline is not cached: the same key can be retried with a good card', async ({ request }) => {
    const key = newKey();
    const first = await checkout(request, token, checkoutBody({ items: [{ productId: 7, quantity: 1 }], payment: payment({ cardNumber: CARDS.declined }) }), key);
    expect(first.status()).toBe(409);
    const second = await checkout(request, token, checkoutBody({ items: [{ productId: 7, quantity: 1 }] }), key);
    expect(second.status()).toBe(409);
  });

  test('@regression the error response never echoes the card data', async ({ request }) => {
    const response = await post(request, checkoutBody({ payment: payment({ cardNumber: CARDS.declined, cvv: '987' }) }));
    const text = await response.text();
    expect(text).not.toContain(CARDS.declined);
    expect(text).not.toContain('987');
  });
});
