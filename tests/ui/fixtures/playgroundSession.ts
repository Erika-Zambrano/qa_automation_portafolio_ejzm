import { randomUUID } from 'node:crypto';
import { expect, type Page } from '@playwright/test';
import { credentials, isolate, json, type Product, type USERS } from '../../../utils/playground-api';

export type CartSeed = { productId: number; quantity: number };

export type PlaygroundSession = {
  signIn: (who: keyof typeof USERS) => Promise<void>;
  seedCart: (items: CartSeed[], coupon?: string) => Promise<void>;
};

export function createPlaygroundSession(page: Page): PlaygroundSession {
  const seed = (key: string, value: unknown) =>
    page.addInitScript(
      ([storageKey, payload, id]) => {
        const marker = `seeded-${id}`;
        if (sessionStorage.getItem(marker)) return;
        sessionStorage.setItem(marker, '1');
        localStorage.setItem(storageKey, payload);
      },
      [key, JSON.stringify(value), randomUUID()] as const,
    );

  return {
    async signIn(who) {
      const response = await page.request.post('/api/auth/login', { data: credentials(who), headers: isolate() });
      expect(response.status()).toBe(200);
      const body = await json<{ token: string; user: unknown }>(response);
      await seed('pg-auth', { token: body.token, user: body.user });
    },
    async seedCart(items, coupon) {
      const entries = await Promise.all(
        items.map(async ({ productId, quantity }) => {
          const response = await page.request.get(`/api/products/${productId}`);
          const body = await json<{ data?: Product } & Product>(response);
          return { product: body.data ?? body, quantity };
        }),
      );
      await seed('pg-cart', { items: entries, coupon: coupon ?? null });
    },
  };
}
