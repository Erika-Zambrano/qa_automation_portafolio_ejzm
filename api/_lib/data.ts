import { createHash } from 'node:crypto';

export type SeedUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  locked: boolean;
};

export const userId = (email: string) => `usr_${createHash('sha1').update(email.toLowerCase()).digest('hex').slice(0, 12)}`;

const seed = (name: string, email: string, password: string, role: 'user' | 'admin', locked = false): SeedUser => ({
  id: userId(email),
  name,
  email,
  password,
  role,
  locked,
});

export const USERS: SeedUser[] = [
  seed('Standard User', 'user@qa.test', 'Passw0rd!', 'user'),
  seed('Admin User', 'admin@qa.test', 'Adm1nPass!', 'admin'),
  seed('Locked User', 'locked@qa.test', 'Passw0rd!', 'user', true),
];

export const CATEGORIES = [
  'impressionism',
  'post-impressionism',
  'expressionism',
  'surrealism',
  'cubism',
  'baroque',
  'abstract',
  'historical',
  'kinetic',
] as const;

export type Product = {
  id: number;
  sku: string;
  name: string;
  artist: string;
  year: number;
  category: (typeof CATEGORIES)[number];
  price: number;
  stock: number;
  rating: number;
};

const art = (
  id: number,
  name: string,
  artist: string,
  year: number,
  category: Product['category'],
  price: number,
  stock: number,
  rating: number,
): Product => ({ id, sku: `AR-${String(id).padStart(3, '0')}`, name, artist, year, category, price, stock, rating });

export const PRODUCTS: Product[] = [
  art(1, 'Paseo a orillas del mar', 'Joaquín Sorolla', 1909, 'impressionism', 4500, 40, 4.6),
  art(2, 'Niños en la playa', 'Joaquín Sorolla', 1910, 'impressionism', 3800, 30, 4.4),
  art(3, 'El grito', 'Edvard Munch', 1893, 'expressionism', 5200, 3, 4.8),
  art(4, 'Las dos Fridas', 'Frida Kahlo', 1939, 'surrealism', 6900, 12, 4.8),
  art(5, 'La columna rota', 'Frida Kahlo', 1944, 'surrealism', 5900, 18, 4.7),
  art(6, 'La noche estrellada', 'Vincent van Gogh', 1889, 'post-impressionism', 4900, 70, 4.9),
  art(7, 'Guernica', 'Pablo Picasso', 1937, 'cubism', 7500, 0, 4.9),
  art(8, 'Las señoritas de Aviñón', 'Pablo Picasso', 1907, 'cubism', 6400, 22, 4.5),
  art(9, 'La ronda de noche', 'Rembrandt van Rijn', 1642, 'baroque', 8900, 5, 4.7),
  art(10, 'Los girasoles', 'Vincent van Gogh', 1888, 'post-impressionism', 4200, 55, 4.6),
  art(11, 'La lección de anatomía del Dr. Tulp', 'Rembrandt van Rijn', 1632, 'baroque', 5600, 14, 4.3),
  art(12, 'Composición VII', 'Wassily Kandinsky', 1913, 'abstract', 5400, 25, 4.5),
  art(13, 'Amarillo-rojo-azul', 'Wassily Kandinsky', 1925, 'abstract', 4600, 33, 4.4),
  art(14, 'Sobre blanco II', 'Wassily Kandinsky', 1923, 'abstract', 3900, 28, 4.2),
  art(15, 'Miranda en La Carraca', 'Arturo Michelena', 1896, 'historical', 6200, 9, 4.3),
  art(16, 'Cromointerferencia de color aditivo', 'Carlos Cruz-Diez', 1974, 'kinetic', 9900, 10, 4.7),
  art(17, 'Physichromie', 'Carlos Cruz-Diez', 1959, 'kinetic', 11900, 6, 4.6),
  art(18, 'Cromosaturación', 'Carlos Cruz-Diez', 1965, 'kinetic', 10500, 7, 4.5),
];

export type Coupon =
  | { code: string; kind: 'percent'; value: number }
  | { code: string; kind: 'fixed'; value: number; minSubtotal: number }
  | { code: string; kind: 'freeship' }
  | { code: string; kind: 'expired' };

export const COUPONS: Coupon[] = [
  { code: 'SAVE10', kind: 'percent', value: 10 },
  { code: 'FIXED5', kind: 'fixed', value: 500, minSubtotal: 2000 },
  { code: 'FREESHIP', kind: 'freeship' },
  { code: 'WINTER20', kind: 'expired' },
];

export const COUNTRIES = ['AR', 'BR', 'CL', 'CO', 'MX', 'US', 'ES'] as const;
export const GENDERS = ['female', 'male', 'nonbinary', 'undisclosed'] as const;
export const INTERESTS = ['information', 'appraisal', 'commission', 'framing', 'shipping'] as const;
export const SHIPPING_METHODS = ['standard', 'express'] as const;
