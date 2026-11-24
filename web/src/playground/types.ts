export type Product = {
  id: number;
  sku: string;
  name: string;
  artist: string;
  year: number;
  category: string;
  price: number;
  stock: number;
  rating: number;
};

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

export type SessionUser = { id: string; name: string; email: string; role: 'user' | 'admin' };

export type ShippingMethod = 'standard' | 'express';

export const CATEGORIES = ['impressionism', 'post-impressionism', 'expressionism', 'surrealism', 'cubism', 'baroque', 'abstract', 'historical', 'kinetic'] as const;
export const COUNTRIES = ['AR', 'BR', 'CL', 'CO', 'MX', 'US', 'ES'] as const;
export const GENDERS = ['female', 'male', 'nonbinary', 'undisclosed'] as const;
export const INTERESTS = ['information', 'appraisal', 'commission', 'framing', 'shipping'] as const;
