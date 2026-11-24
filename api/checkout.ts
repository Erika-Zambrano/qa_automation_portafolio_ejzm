import { COUNTRIES } from './_lib/data';
import { ApiError, Issues } from './_lib/errors';
import { type Result, route } from './_lib/http';
import { fingerprint, lookup, save } from './_lib/idempotency';
import { reserve } from './_lib/inventory';
import { requireAuth } from './_lib/jwt';
import { encodeOrderId, luhn } from './_lib/orders';
import { parseCoupon, parseItems, parseShipping, price } from './_lib/pricing';
import { asObject, isObj, rejectUnknown, str } from './_lib/validate';

const DECLINED = '4000000000000002';
const NO_FUNDS = '4000000000009995';

export default route({
  POST: (ctx) => {
    const auth = requireAuth(ctx);
    const key = ctx.header('idempotency-key');
    if (!key || !/^[\w-]{8,64}$/.test(key)) {
      throw new ApiError(400, 'IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key header (8-64 chars: letters, digits, _ or -) is required');
    }
    const issues = new Issues();
    const body = asObject(ctx.body, issues);
    rejectUnknown(body, ['items', 'coupon', 'shippingMethod', 'shippingAddress', 'payment'], issues);
    const items = parseItems(body.items, issues);
    const coupon = parseCoupon(body, issues);
    const method = parseShipping(body, issues, true);

    const address: Record<string, string> = {};
    if (!isObj(body.shippingAddress)) {
      issues.add('shippingAddress', 'REQUIRED', 'shippingAddress is required');
    } else {
      const a = body.shippingAddress;
      rejectUnknown(a, ['fullName', 'street', 'city', 'zip', 'country'], issues, 'shippingAddress.');
      address.fullName = str(a, 'fullName', issues, { min: 2, max: 80 }, 'shippingAddress.') ?? '';
      address.street = str(a, 'street', issues, { min: 3, max: 120 }, 'shippingAddress.') ?? '';
      address.city = str(a, 'city', issues, { min: 2, max: 60 }, 'shippingAddress.') ?? '';
      address.zip = str(a, 'zip', issues, { pattern: /^[A-Za-z0-9 -]{3,10}$/ }, 'shippingAddress.') ?? '';
      address.country = str(a, 'country', issues, { oneOf: COUNTRIES }, 'shippingAddress.') ?? '';
    }

    let cardNumber = '';
    if (!isObj(body.payment)) {
      issues.add('payment', 'REQUIRED', 'payment is required');
    } else {
      const p = body.payment;
      rejectUnknown(p, ['cardNumber', 'expiry', 'cvv'], issues, 'payment.');
      cardNumber = (str(p, 'cardNumber', issues, { pattern: /^\d{13,19}$/ }, 'payment.') ?? '').replace(/\s/g, '');
      if (cardNumber && /^\d{13,19}$/.test(cardNumber) && !luhn(cardNumber)) issues.add('payment.cardNumber', 'INVALID_CARD', 'cardNumber fails the Luhn check');
      const expiry = str(p, 'expiry', issues, { pattern: /^(0[1-9]|1[0-2])\/\d{2}$/ }, 'payment.');
      if (expiry && /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        const [month, year] = expiry.split('/').map(Number);
        const now = new Date();
        const currentYear = now.getUTCFullYear() % 100;
        if (year < currentYear || (year === currentYear && month < now.getUTCMonth() + 1)) issues.add('payment.expiry', 'CARD_EXPIRED', 'Card is expired');
      }
      str(p, 'cvv', issues, { pattern: /^\d{3,4}$/ }, 'payment.');
    }
    issues.throwIfAny(422);

    const scopeKey = `${auth.sub}:${key}`;
    const requestFingerprint = fingerprint(body);
    const replay = lookup(scopeKey, requestFingerprint);
    if (replay) return { status: 200, body: replay.body, headers: { 'Idempotent-Replayed': 'true' } } as Result;

    const pricing = price(items, coupon, method);
    if (cardNumber === DECLINED) throw new ApiError(402, 'CARD_DECLINED', 'The card was declined');
    if (cardNumber === NO_FUNDS) throw new ApiError(402, 'INSUFFICIENT_FUNDS', 'The card has insufficient funds');

    reserve(items);
    const createdAt = new Date().toISOString();
    const order = {
      userId: auth.sub,
      status: 'confirmed' as const,
      createdAt,
      shippingMethod: method,
      shippingAddress: address,
      cardLast4: cardNumber.slice(-4),
      pricing,
    };
    const responseBody = { data: { id: encodeOrderId(order), ...order, userId: undefined } };
    save(scopeKey, { fingerprint: requestFingerprint, status: 201, body: responseBody });
    return { status: 201, body: responseBody, headers: { Location: `/api/orders/${responseBody.data.id}` } };
  },
});
