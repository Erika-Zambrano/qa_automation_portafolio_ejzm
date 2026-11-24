import { test, expect, type APIRequestContext } from '@playwright/test';
import { PRICES, expectError, expectFieldError } from '../../utils/playground-api';

type Item = { productId: number; quantity: number };
type Pricing = {
  lines: Array<{ productId: number; sku: string; name: string; artist: string; unitPrice: number; quantity: number; lineTotal: number }>;
  coupon: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
};

const price = (request: APIRequestContext, data: Record<string, unknown>) => request.post('/api/cart/price', { data });

async function priced(request: APIRequestContext, data: Record<string, unknown>): Promise<Pricing> {
  const response = await price(request, data);
  expect(response.status(), await response.text()).toBe(200);
  return response.json();
}

test.describe('Cart pricing: math', () => {
  test('@smoke a single artwork with standard shipping', async ({ request }) => {
    const result = await priced(request, { items: [{ productId: 1, quantity: 1 }] });
    expect(result).toMatchObject({ subtotal: 4500, discount: 0, shipping: 500, tax: 450, total: 5450, coupon: null, currency: 'USD' });
    expect(result.lines).toEqual([{ productId: 1, sku: 'AR-001', name: 'Paseo a orillas del mar', artist: 'Joaquín Sorolla', unitPrice: 4500, quantity: 1, lineTotal: 4500 }]);
  });

  test('@sanity express shipping costs more', async ({ request }) => {
    const result = await priced(request, { items: [{ productId: 1, quantity: 1 }], shippingMethod: 'express' });
    expect(result).toMatchObject({ shipping: 1500, tax: 450, total: 6450 });
  });

  test('@regression the default shipping method is standard', async ({ request }) => {
    const implicit = await priced(request, { items: [{ productId: 1, quantity: 1 }] });
    const explicit = await priced(request, { items: [{ productId: 1, quantity: 1 }], shippingMethod: 'standard' });
    expect(implicit).toEqual(explicit);
  });

  test('@regression line totals multiply price by quantity', async ({ request }) => {
    const result = await priced(request, { items: [{ productId: 1, quantity: 3 }, { productId: 5, quantity: 2 }] });
    expect(result.lines.map((l) => l.lineTotal)).toEqual([13500, 11800]);
    expect(result.subtotal).toBe(25300);
  });

  test('@regression the order of items is preserved', async ({ request }) => {
    const result = await priced(request, { items: [{ productId: 8, quantity: 1 }, { productId: 2, quantity: 1 }, { productId: 12, quantity: 1 }] });
    expect(result.lines.map((l) => l.productId)).toEqual([8, 2, 12]);
  });

  test('@regression free shipping applies at exactly 10000 and not at 9900', async ({ request }) => {
    const below = await priced(request, { items: [{ productId: 16, quantity: 1 }] });
    expect(below).toMatchObject({ subtotal: 9900, shipping: 500 });
    const exact = await priced(request, { items: [{ productId: 2, quantity: 1 }, { productId: 15, quantity: 1 }] });
    expect(exact).toMatchObject({ subtotal: 10000, shipping: 0, tax: 1000, total: 11000 });
  });

  test('@regression free shipping applies to express too', async ({ request }) => {
    const result = await priced(request, { items: [{ productId: 17, quantity: 1 }], shippingMethod: 'express' });
    expect(result.shipping).toBe(0);
  });

  test('@regression the free shipping threshold is evaluated after the discount', async ({ request }) => {
    const result = await priced(request, { items: [{ productId: 2, quantity: 1 }, { productId: 15, quantity: 1 }], coupon: 'SAVE10' });
    expect(result).toMatchObject({ subtotal: 10000, discount: 1000, shipping: 500, tax: 900, total: 10400 });
  });

  test('@regression SAVE10 takes 10 percent off before tax', async ({ request }) => {
    const result = await priced(request, { items: [{ productId: 1, quantity: 1 }], coupon: 'SAVE10' });
    expect(result).toMatchObject({ coupon: 'SAVE10', discount: 450, shipping: 500, tax: 405, total: 4955 });
  });

  test('@regression FIXED5 takes 500 off', async ({ request }) => {
    const result = await priced(request, { items: [{ productId: 1, quantity: 1 }], coupon: 'FIXED5' });
    expect(result).toMatchObject({ coupon: 'FIXED5', discount: 500, shipping: 500, tax: 400, total: 4900 });
  });

  test('@regression FREESHIP removes the shipping cost', async ({ request }) => {
    const result = await priced(request, { items: [{ productId: 1, quantity: 1 }], coupon: 'FREESHIP', shippingMethod: 'express' });
    expect(result).toMatchObject({ coupon: 'FREESHIP', discount: 0, shipping: 0, tax: 450, total: 4950 });
  });

  test('@regression coupons are case-insensitive and trimmed', async ({ request }) => {
    for (const code of ['save10', 'SaVe10', '  SAVE10  ']) {
      const result = await priced(request, { items: [{ productId: 1, quantity: 1 }], coupon: code });
      expect(result.coupon).toBe('SAVE10');
      expect(result.discount).toBe(450);
    }
  });

  test('@regression an empty or blank coupon is treated as no coupon', async ({ request }) => {
    for (const code of ['', '   ']) {
      const result = await priced(request, { items: [{ productId: 1, quantity: 1 }], coupon: code });
      expect(result.coupon).toBeNull();
      expect(result.discount).toBe(0);
    }
  });

  test('@regression the pricing is deterministic', async ({ request }) => {
    const body = { items: [{ productId: 9, quantity: 2 }], coupon: 'SAVE10', shippingMethod: 'express' };
    const [a, b, c] = await Promise.all([priced(request, body), priced(request, body), priced(request, body)]);
    expect(a).toEqual(b);
    expect(b).toEqual(c);
  });

  const matrix: Item[][] = [
    [{ productId: 1, quantity: 1 }],
    [{ productId: 2, quantity: 10 }],
    [{ productId: 16, quantity: 1 }],
    [{ productId: 2, quantity: 1 }, { productId: 15, quantity: 1 }],
    [{ productId: 4, quantity: 2 }, { productId: 6, quantity: 3 }, { productId: 14, quantity: 1 }],
    [{ productId: 17, quantity: 5 }],
    [{ productId: 12, quantity: 1 }, { productId: 13, quantity: 1 }, { productId: 14, quantity: 1 }],
  ];
  for (const [index, items] of matrix.entries()) {
    for (const coupon of [undefined, 'SAVE10', 'FIXED5', 'FREESHIP']) {
      for (const shippingMethod of ['standard', 'express']) {
        test(`@regression totals identity holds: cart ${index} coupon=${coupon ?? 'none'} shipping=${shippingMethod}`, async ({ request }) => {
          const result = await priced(request, { items, ...(coupon ? { coupon } : {}), shippingMethod });
          const subtotal = items.reduce((sum, item) => sum + PRICES[item.productId] * item.quantity, 0);
          expect(result.subtotal).toBe(subtotal);
          expect(result.total).toBe(result.subtotal - result.discount + result.shipping + result.tax);
          expect(result.tax).toBe(Math.round((result.subtotal - result.discount) * 0.1));
          expect(result.discount).toBeGreaterThanOrEqual(0);
          expect(result.discount).toBeLessThanOrEqual(result.subtotal);
          for (const line of result.lines) expect(line.lineTotal).toBe(line.unitPrice * line.quantity);
          expect([0, 500, 1500]).toContain(result.shipping);
        });
      }
    }
  }
});

test.describe('Cart pricing: coupons', () => {
  test('@regression an unknown coupon returns 422 COUPON_INVALID', async ({ request }) => {
    await expectError(await price(request, { items: [{ productId: 1, quantity: 1 }], coupon: 'NOPE' }), 422, 'COUPON_INVALID');
  });

  test('@regression the expired coupon returns 422 COUPON_EXPIRED', async ({ request }) => {
    await expectError(await price(request, { items: [{ productId: 1, quantity: 1 }], coupon: 'WINTER20' }), 422, 'COUPON_EXPIRED');
  });

  test('@regression a coupon longer than 32 characters is a validation error', async ({ request }) => {
    await expectFieldError(await price(request, { items: [{ productId: 1, quantity: 1 }], coupon: 'A'.repeat(33) }), 400, 'coupon', 'TOO_LONG');
  });

  test('@regression a coupon of the wrong type is a validation error', async ({ request }) => {
    await expectFieldError(await price(request, { items: [{ productId: 1, quantity: 1 }], coupon: 10 }), 400, 'coupon', 'INVALID_TYPE');
  });

  test('@regression coupon injection strings are just invalid coupons', async ({ request }) => {
    for (const code of ["' OR 1=1 --", '<script>alert(1)</script>', '../../etc/passwd']) {
      await expectError(await price(request, { items: [{ productId: 1, quantity: 1 }], coupon: code }), 422, 'COUPON_INVALID');
    }
  });
});

test.describe('Cart pricing: items validation', () => {
  const valid = { productId: 1, quantity: 1 };

  const cases: Array<[string, Record<string, unknown>, number, string, string]> = [
    ['missing items', {}, 400, 'items', 'REQUIRED'],
    ['items not an array', { items: 'a' }, 400, 'items', 'INVALID_TYPE'],
    ['items as object', { items: { productId: 1 } }, 400, 'items', 'INVALID_TYPE'],
    ['empty items', { items: [] }, 400, 'items', 'OUT_OF_RANGE'],
    ['21 items', { items: Array.from({ length: 21 }, (_, i) => ({ productId: (i % 18) + 1, quantity: 1 })) }, 400, 'items', 'OUT_OF_RANGE'],
    ['item not an object', { items: [5] }, 400, 'items[0]', 'INVALID_TYPE'],
    ['item as null', { items: [null] }, 400, 'items[0]', 'INVALID_TYPE'],
    ['productId as string', { items: [{ productId: '1', quantity: 1 }] }, 400, 'items[0].productId', 'INVALID_TYPE'],
    ['productId float', { items: [{ productId: 1.5, quantity: 1 }] }, 400, 'items[0].productId', 'INVALID_TYPE'],
    ['quantity as string', { items: [{ productId: 1, quantity: '1' }] }, 400, 'items[0].quantity', 'INVALID_TYPE'],
    ['quantity float', { items: [{ productId: 1, quantity: 1.5 }] }, 400, 'items[0].quantity', 'INVALID_TYPE'],
    ['quantity zero', { items: [{ productId: 1, quantity: 0 }] }, 400, 'items[0].quantity', 'OUT_OF_RANGE'],
    ['quantity negative', { items: [{ productId: 1, quantity: -1 }] }, 400, 'items[0].quantity', 'OUT_OF_RANGE'],
    ['quantity above 10', { items: [{ productId: 1, quantity: 11 }] }, 400, 'items[0].quantity', 'OUT_OF_RANGE'],
    ['duplicate product', { items: [valid, valid] }, 400, 'items[1].productId', 'DUPLICATE_ITEM'],
    ['invalid shipping', { items: [valid], shippingMethod: 'drone' }, 400, 'shippingMethod', 'INVALID_OPTION'],
    ['shipping as number', { items: [valid], shippingMethod: 1 }, 400, 'shippingMethod', 'INVALID_TYPE'],
    ['unknown field', { items: [valid], discount: 100 }, 400, 'discount', 'UNKNOWN_FIELD'],
  ];
  for (const [label, data, status, field, code] of cases) {
    test(`@regression ${label} returns ${status} ${field}:${code}`, async ({ request }) => {
      await expectFieldError(await price(request, data), status, field, code);
    });
  }

  test('@regression quantity boundaries 1 and 10 are accepted', async ({ request }) => {
    expect((await priced(request, { items: [{ productId: 2, quantity: 1 }] })).subtotal).toBe(3800);
    expect((await priced(request, { items: [{ productId: 2, quantity: 10 }] })).subtotal).toBe(38000);
  });

  test('@regression 20 different items are accepted', async ({ request }) => {
    const items = Array.from({ length: 18 }, (_, i) => ({ productId: i + 1, quantity: 1 })).filter((i) => i.productId !== 7);
    const result = await priced(request, { items });
    expect(result.lines).toHaveLength(17);
  });

  test('@regression an unknown product returns 404 PRODUCT_NOT_FOUND', async ({ request }) => {
    const error = await expectError(await price(request, { items: [{ productId: 999, quantity: 1 }] }), 404, 'PRODUCT_NOT_FOUND');
    expect(error.details).toEqual({ productId: 999 });
  });

  test('@regression a sold out artwork returns 409 INSUFFICIENT_STOCK with available 0', async ({ request }) => {
    const error = await expectError(await price(request, { items: [{ productId: 7, quantity: 1 }] }), 409, 'INSUFFICIENT_STOCK');
    expect(error.details).toEqual({ productId: 7, requested: 1, available: 0 });
  });

  test('@regression asking for more copies than available returns 409 with the numbers', async ({ request }) => {
    const error = await expectError(await price(request, { items: [{ productId: 3, quantity: 4 }] }), 409, 'INSUFFICIENT_STOCK');
    expect(error.details).toEqual({ productId: 3, requested: 4, available: 3 });
    expect(error.message).toContain('3');
  });

  test('@regression asking for exactly the available copies works and one more fails', async ({ request }) => {
    expect((await priced(request, { items: [{ productId: 9, quantity: 5 }] })).subtotal).toBe(44500);
    await expectError(await price(request, { items: [{ productId: 9, quantity: 6 }] }), 409, 'INSUFFICIENT_STOCK');
  });

  test('@regression pricing a cart never changes the stock', async ({ request }) => {
    const before = (await (await request.get('/api/products/3')).json()).data.stock;
    await priced(request, { items: [{ productId: 3, quantity: 3 }] });
    const after = (await (await request.get('/api/products/3')).json()).data.stock;
    expect(after).toBe(before);
  });

  test('@regression the first failing item is reported even when others are valid', async ({ request }) => {
    await expectError(await price(request, { items: [{ productId: 1, quantity: 1 }, { productId: 7, quantity: 1 }] }), 409, 'INSUFFICIENT_STOCK');
  });
});
