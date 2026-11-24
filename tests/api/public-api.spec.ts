import { test, expect, type APIResponse } from '@playwright/test';

interface ApiObject {
  id: string;
  name: string;
  data?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = 'https://api.restful-api.dev';

async function skipWhenQuotaExhausted(response: APIResponse): Promise<void> {
  const quotaExhausted = response.status() === 405 && (await response.text()).includes('daily request limit');
  test.skip(quotaExhausted, 'The public API allows 50 requests per day per IP and the quota is exhausted');
}

test.describe('Public REST API', () => {
  test('@sanity GET /objects returns 200 with a non-empty array', async ({ request }) => {
    const response = await request.get(`${API_BASE}/objects`);
    await skipWhenQuotaExhausted(response);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as ApiObject[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('@sanity GET /objects/:id returns 200 with id and name fields', async ({ request }) => {
    const response = await request.get(`${API_BASE}/objects/7`);
    await skipWhenQuotaExhausted(response);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as ApiObject;
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name');
    expect(typeof body.id).toBe('string');
    expect(typeof body.name).toBe('string');
  });

  test('@sanity POST /objects creates an object with the sent name', async ({ request }) => {
    const payload = {
      name: 'QA Portfolio Test Item',
      data: { category: 'automation-test', created: new Date().toISOString() },
    };

    const response = await request.post(`${API_BASE}/objects`, { data: payload });
    await skipWhenQuotaExhausted(response);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as ApiObject;
    expect(body).toHaveProperty('id');
    expect(body.name).toBe(payload.name);
  });

  test('@sanity GET /objects with multiple ids returns exactly 3 items', async ({ request }) => {
    const response = await request.get(`${API_BASE}/objects?id=3&id=5&id=10`);
    await skipWhenQuotaExhausted(response);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as ApiObject[];
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(3);
  });
});
