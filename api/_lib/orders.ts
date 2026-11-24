import { ApiError } from './errors';
import { sign } from './jwt';
import type { Pricing } from './pricing';

export type Order = {
  userId: string;
  status: 'confirmed';
  createdAt: string;
  shippingMethod: 'standard' | 'express';
  shippingAddress: Record<string, string>;
  cardLast4: string;
  pricing: Pricing;
};

export function encodeOrderId(order: Order): string {
  const payload = Buffer.from(JSON.stringify(order)).toString('base64url');
  return `ord_${payload}.${sign(payload).slice(0, 16)}`;
}

export function decodeOrderId(id: string): Order {
  const match = /^ord_([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{16})$/.exec(id);
  if (!match || sign(match[1]).slice(0, 16) !== match[2]) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order does not exist');
  try {
    return JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8')) as Order;
  } catch {
    throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order does not exist');
  }
}

export function luhn(number: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}
