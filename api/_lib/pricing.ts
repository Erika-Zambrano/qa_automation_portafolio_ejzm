import { ApiError, Issues } from './errors';
import { COUPONS, SHIPPING_METHODS } from './data';
import { findProduct } from './inventory';
import { type Obj, isObj, str } from './validate';

export type Line = { productId: number; sku: string; name: string; artist: string; unitPrice: number; quantity: number; lineTotal: number };

export type Pricing = {
  lines: Line[];
  coupon: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: 'USD';
};

const TAX_RATE = 0.1;
const FREE_SHIPPING_THRESHOLD = 10000;
const SHIPPING_COST = { standard: 500, express: 1500 } as const;

export function parseItems(raw: unknown, issues: Issues): Array<{ productId: number; quantity: number }> {
  if (!Array.isArray(raw)) {
    issues.add('items', raw === undefined ? 'REQUIRED' : 'INVALID_TYPE', 'items must be a non-empty array');
    return [];
  }
  if (raw.length === 0 || raw.length > 20) {
    issues.add('items', 'OUT_OF_RANGE', 'items must contain between 1 and 20 entries');
    return [];
  }
  const seen = new Set<number>();
  const out: Array<{ productId: number; quantity: number }> = [];
  raw.forEach((entry, index) => {
    const prefix = `items[${index}].`;
    if (!isObj(entry)) {
      issues.add(`items[${index}]`, 'INVALID_TYPE', 'Item must be an object');
      return;
    }
    const { productId, quantity } = entry as Obj;
    if (typeof productId !== 'number' || !Number.isInteger(productId)) {
      issues.add(`${prefix}productId`, 'INVALID_TYPE', 'productId must be an integer');
      return;
    }
    if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
      issues.add(`${prefix}quantity`, 'INVALID_TYPE', 'quantity must be an integer');
      return;
    }
    if (quantity < 1 || quantity > 10) {
      issues.add(`${prefix}quantity`, 'OUT_OF_RANGE', 'quantity must be between 1 and 10');
      return;
    }
    if (seen.has(productId)) {
      issues.add(`${prefix}productId`, 'DUPLICATE_ITEM', `productId ${productId} appears more than once`);
      return;
    }
    seen.add(productId);
    out.push({ productId, quantity });
  });
  return out;
}

export function parseCoupon(body: Obj, issues: Issues): string | undefined {
  const code = str(body, 'coupon', issues, { required: false, max: 32 });
  return code ? code.toUpperCase() : undefined;
}

export function parseShipping(body: Obj, issues: Issues, required = false): 'standard' | 'express' {
  const value = str(body, 'shippingMethod', issues, { required, oneOf: SHIPPING_METHODS });
  return (value as 'standard' | 'express' | undefined) ?? 'standard';
}

export function price(items: Array<{ productId: number; quantity: number }>, couponCode: string | undefined, method: 'standard' | 'express'): Pricing {
  const lines: Line[] = [];
  for (const item of items) {
    const product = findProduct(item.productId);
    if (!product) throw new ApiError(404, 'PRODUCT_NOT_FOUND', `Product ${item.productId} does not exist`, { productId: item.productId });
    if (product.stock < item.quantity) {
      throw new ApiError(409, 'INSUFFICIENT_STOCK', `Only ${product.stock} units of ${product.name} available`, {
        productId: product.id,
        requested: item.quantity,
        available: product.stock,
      });
    }
    lines.push({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      artist: product.artist,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    });
  }
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  let discount = 0;
  let freeShipping = false;
  if (couponCode) {
    const coupon = COUPONS.find((c) => c.code === couponCode);
    if (!coupon) throw new ApiError(422, 'COUPON_INVALID', `Coupon ${couponCode} does not exist`);
    if (coupon.kind === 'expired') throw new ApiError(422, 'COUPON_EXPIRED', `Coupon ${couponCode} has expired`);
    if (coupon.kind === 'percent') discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.kind === 'fixed') {
      if (subtotal < coupon.minSubtotal) {
        throw new ApiError(422, 'COUPON_MIN_NOT_MET', `Coupon ${couponCode} requires a subtotal of at least ${coupon.minSubtotal}`, { minSubtotal: coupon.minSubtotal });
      }
      discount = Math.min(coupon.value, subtotal);
    }
    if (coupon.kind === 'freeship') freeShipping = true;
  }
  const taxable = subtotal - discount;
  const shipping = freeShipping || taxable >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST[method];
  const tax = Math.round(taxable * TAX_RATE);
  return {
    lines,
    coupon: couponCode ?? null,
    subtotal,
    discount,
    shipping,
    tax,
    total: taxable + shipping + tax,
    currency: 'USD',
  };
}
