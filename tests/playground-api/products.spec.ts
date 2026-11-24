import { test, expect } from '@playwright/test';
import { PRICES, expectError, expectFieldError } from '../../utils/playground-api';

type Product = { id: number; sku: string; name: string; artist: string; year: number; category: string; price: number; stock: number; rating: number };
type Listing = { data: Product[]; meta: { page: number; pageSize: number; total: number; totalPages: number } };

const CATEGORIES = ['impressionism', 'post-impressionism', 'expressionism', 'surrealism', 'cubism', 'baroque', 'abstract', 'historical', 'kinetic'];

async function list(request: import('@playwright/test').APIRequestContext, query = ''): Promise<Listing> {
  const response = await request.get(`/api/products${query}`);
  expect(response.status(), await response.text()).toBe(200);
  return response.json();
}

test.describe('Products: listing', () => {
  test('@smoke the default listing returns the first page of 5', async ({ request }) => {
    const { data, meta } = await list(request);
    expect(data).toHaveLength(5);
    expect(meta).toEqual({ page: 1, pageSize: 5, total: 18, totalPages: 4 });
    expect(data.map((p) => p.id)).toEqual([1, 2, 3, 4, 5]);
  });

  test('@sanity every product matches the schema', async ({ request }) => {
    const { data } = await list(request, '?pageSize=50');
    expect(data).toHaveLength(18);
    for (const product of data) {
      expect(product).toEqual({
        id: expect.any(Number),
        sku: expect.stringMatching(/^AR-\d{3}$/),
        name: expect.any(String),
        artist: expect.any(String),
        year: expect.any(Number),
        category: expect.any(String),
        price: expect.any(Number),
        stock: expect.any(Number),
        rating: expect.any(Number),
      });
      expect(Number.isInteger(product.price)).toBe(true);
      expect(Number.isInteger(product.stock)).toBe(true);
      expect(product.stock).toBeGreaterThanOrEqual(0);
      expect(product.rating).toBeGreaterThanOrEqual(0);
      expect(product.rating).toBeLessThanOrEqual(5);
      expect(CATEGORIES).toContain(product.category);
      expect(PRICES[product.id]).toBe(product.price);
    }
  });

  test('@regression ids and skus are unique', async ({ request }) => {
    const { data } = await list(request, '?pageSize=50');
    expect(new Set(data.map((p) => p.id)).size).toBe(18);
    expect(new Set(data.map((p) => p.sku)).size).toBe(18);
  });

  test('@regression the catalog includes the expected artists', async ({ request }) => {
    const { data } = await list(request, '?pageSize=50');
    const artists = new Set(data.map((p) => p.artist));
    for (const name of ['Joaquín Sorolla', 'Edvard Munch', 'Frida Kahlo', 'Vincent van Gogh', 'Pablo Picasso', 'Rembrandt van Rijn', 'Wassily Kandinsky', 'Arturo Michelena', 'Carlos Cruz-Diez']) {
      expect(artists, name).toContain(name);
    }
  });

  test('@regression the catalog includes the El grito, Guernica and Miranda en La Carraca artworks', async ({ request }) => {
    const { data } = await list(request, '?pageSize=50');
    const names = data.map((p) => p.name);
    expect(names).toEqual(expect.arrayContaining(['El grito', 'Guernica', 'Miranda en La Carraca', 'La noche estrellada']));
  });

  const pages: Array<[number, number, number, number[]]> = [
    [1, 5, 4, [1, 2, 3, 4, 5]],
    [2, 5, 4, [6, 7, 8, 9, 10]],
    [4, 5, 4, [16, 17, 18]],
    [1, 18, 1, Array.from({ length: 18 }, (_, i) => i + 1)],
    [2, 10, 2, [11, 12, 13, 14, 15, 16, 17, 18]],
    [1, 1, 18, [1]],
    [18, 1, 18, [18]],
  ];
  for (const [page, pageSize, totalPages, ids] of pages) {
    test(`@regression page=${page} pageSize=${pageSize} returns ids ${ids[0]}..${ids[ids.length - 1]}`, async ({ request }) => {
      const { data, meta } = await list(request, `?page=${page}&pageSize=${pageSize}`);
      expect(meta).toEqual({ page, pageSize, total: 18, totalPages });
      expect(data.map((p) => p.id)).toEqual(ids);
    });
  }

  test('@regression a page past the end returns an empty list with the real totals', async ({ request }) => {
    const { data, meta } = await list(request, '?page=99');
    expect(data).toEqual([]);
    expect(meta).toMatchObject({ page: 99, total: 18, totalPages: 4 });
  });

  test('@regression pages do not overlap and cover the whole catalog', async ({ request }) => {
    const ids: number[] = [];
    for (let page = 1; page <= 4; page += 1) ids.push(...(await list(request, `?page=${page}`)).data.map((p) => p.id));
    expect(ids).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
  });

  const badParams: Array<[string, string, string]> = [
    ['page=0', 'page', 'OUT_OF_RANGE'],
    ['page=-1', 'page', 'OUT_OF_RANGE'],
    ['page=1001', 'page', 'OUT_OF_RANGE'],
    ['page=abc', 'page', 'INVALID_TYPE'],
    ['page=1.5', 'page', 'INVALID_TYPE'],
    ['pageSize=0', 'pageSize', 'OUT_OF_RANGE'],
    ['pageSize=51', 'pageSize', 'OUT_OF_RANGE'],
    ['pageSize=ten', 'pageSize', 'INVALID_TYPE'],
    ['minPrice=-1', 'minPrice', 'OUT_OF_RANGE'],
    ['maxPrice=abc', 'maxPrice', 'INVALID_TYPE'],
    ['category=sculpture', 'category', 'INVALID_OPTION'],
    ['sort=popularity', 'sort', 'INVALID_OPTION'],
    ['inStock=yes', 'inStock', 'INVALID_TYPE'],
    ['minPrice=5000&maxPrice=1000', 'minPrice', 'INVALID_RANGE'],
  ];
  for (const [query, field, code] of badParams) {
    test(`@regression invalid query ?${query} returns 400 ${field}:${code}`, async ({ request }) => {
      await expectFieldError(await request.get(`/api/products?${query}`), 400, field, code);
    });
  }

  test('@regression the boundary values pageSize=50 and page=1000 are valid', async ({ request }) => {
    expect((await list(request, '?pageSize=50')).data).toHaveLength(18);
    expect((await list(request, '?page=1000')).data).toEqual([]);
  });

  test('@regression unknown query parameters are ignored', async ({ request }) => {
    const { meta } = await list(request, '?foo=bar&utm_source=x');
    expect(meta.total).toBe(18);
  });
});

test.describe('Products: filtering and sorting', () => {
  test('@sanity filtering by artist is a case-insensitive contains match', async ({ request }) => {
    for (const query of ['Picasso', 'picasso', 'PABLO']) {
      const { data } = await list(request, `?artist=${query}&pageSize=50`);
      expect(data.map((p) => p.name).sort()).toEqual(['Guernica', 'Las señoritas de Aviñón']);
    }
  });

  test('@regression filtering by artist with accents and spaces', async ({ request }) => {
    const { data } = await list(request, `?artist=${encodeURIComponent('Joaquín Sorolla')}&pageSize=50`);
    expect(data).toHaveLength(2);
    expect(data.every((p) => p.artist === 'Joaquín Sorolla')).toBe(true);
  });

  const byCategory: Array<[string, number]> = [
    ['impressionism', 2], ['post-impressionism', 2], ['expressionism', 1], ['surrealism', 2], ['cubism', 2],
    ['baroque', 2], ['abstract', 3], ['historical', 1], ['kinetic', 3],
  ];
  for (const [category, count] of byCategory) {
    test(`@regression category=${category} returns ${count} artworks`, async ({ request }) => {
      const { data, meta } = await list(request, `?category=${category}&pageSize=50`);
      expect(meta.total).toBe(count);
      expect(data.every((p) => p.category === category)).toBe(true);
    });
  }

  test('@regression the sum of all category totals equals the catalog size', async ({ request }) => {
    let total = 0;
    for (const category of CATEGORIES) total += (await list(request, `?category=${category}`)).meta.total;
    expect(total).toBe(18);
  });

  test('@regression q searches title and artist, ignoring case', async ({ request }) => {
    expect((await list(request, '?q=grito')).data.map((p) => p.id)).toEqual([3]);
    expect((await list(request, '?q=VAN GOGH')).meta.total).toBe(2);
    expect((await list(request, '?q=noche')).data.map((p) => p.name)).toEqual(expect.arrayContaining(['La noche estrellada', 'La ronda de noche']));
  });

  test('@regression q with no matches returns an empty list', async ({ request }) => {
    const { data, meta } = await list(request, '?q=zzzz');
    expect(data).toEqual([]);
    expect(meta).toEqual({ page: 1, pageSize: 5, total: 0, totalPages: 1 });
  });

  test('@regression q is not interpreted as a regular expression', async ({ request }) => {
    expect((await list(request, `?q=${encodeURIComponent('.*')}`)).meta.total).toBe(0);
    expect((await list(request, `?q=${encodeURIComponent('(')}`)).meta.total).toBe(0);
  });

  test('@regression price range filters are inclusive', async ({ request }) => {
    const { data } = await list(request, '?minPrice=3800&maxPrice=4500&pageSize=50');
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((p) => p.price >= 3800 && p.price <= 4500)).toBe(true);
    expect(data.map((p) => p.id)).toEqual(expect.arrayContaining([1, 2]));
    const exact = await list(request, '?minPrice=3800&maxPrice=3800');
    expect(exact.data.map((p) => p.id)).toEqual([2]);
  });

  test('@regression inStock=true hides sold out artworks and inStock=false shows only them', async ({ request }) => {
    const inStock = await list(request, '?inStock=true&pageSize=50');
    expect(inStock.data.every((p) => p.stock > 0)).toBe(true);
    expect(inStock.data.map((p) => p.id)).not.toContain(7);
    const soldOut = await list(request, '?inStock=false&pageSize=50');
    expect(soldOut.data.map((p) => p.id)).toEqual([7]);
  });

  test('@regression filters combine with AND', async ({ request }) => {
    const { data } = await list(request, '?artist=kandinsky&maxPrice=4600&pageSize=50');
    expect(data.map((p) => p.id).sort((a, b) => a - b)).toEqual([13, 14]);
  });

  test('@regression pagination applies after filtering', async ({ request }) => {
    const { data, meta } = await list(request, '?category=kinetic&pageSize=2&page=2');
    expect(meta).toEqual({ page: 2, pageSize: 2, total: 3, totalPages: 2 });
    expect(data).toHaveLength(1);
  });

  const sorts: Array<[string, (p: Product) => number | string, 'asc' | 'desc']> = [
    ['price', (p) => p.price, 'asc'],
    ['-price', (p) => p.price, 'desc'],
    ['year', (p) => p.year, 'asc'],
    ['-year', (p) => p.year, 'desc'],
    ['rating', (p) => p.rating, 'asc'],
    ['-rating', (p) => p.rating, 'desc'],
    ['name', (p) => p.name, 'asc'],
    ['-name', (p) => p.name, 'desc'],
  ];
  for (const [sort, pick, direction] of sorts) {
    test(`@regression sort=${sort} orders ${direction}ending`, async ({ request }) => {
      const { data } = await list(request, `?sort=${sort}&pageSize=50`);
      const values = data.map(pick);
      const expected = [...values].sort((a, b) => (typeof a === 'string' ? a.localeCompare(b as string) : (a as number) - (b as number)));
      if (direction === 'desc') expected.reverse();
      expect(values).toEqual(expected);
    });
  }

  test('@regression sorting is applied before pagination', async ({ request }) => {
    const { data } = await list(request, '?sort=-price&pageSize=3');
    expect(data.map((p) => p.id)).toEqual([17, 18, 16]);
  });
});

test.describe('Products: detail', () => {
  test('@smoke GET /products/:id returns the artwork', async ({ request }) => {
    const response = await request.get('/api/products/3');
    expect(response.status()).toBe(200);
    const { data } = await response.json();
    expect(data).toMatchObject({ id: 3, sku: 'AR-003', name: 'El grito', artist: 'Edvard Munch', year: 1893, category: 'expressionism', price: 5200 });
  });

  test('@regression the detail matches the listing entry', async ({ request }) => {
    const { data: all } = await list(request, '?pageSize=50');
    for (const product of all) {
      const { data } = await (await request.get(`/api/products/${product.id}`)).json();
      expect(data).toEqual(product);
    }
  });

  for (const id of ['0', '19', '999', '99999999999']) {
    test(`@regression an unknown id (${id}) returns 404 PRODUCT_NOT_FOUND`, async ({ request }) => {
      await expectError(await request.get(`/api/products/${id}`), 404, 'PRODUCT_NOT_FOUND');
    });
  }

  for (const id of ['abc', '-1', '1.5', '1e2', '%20', '1%20', 'true']) {
    test(`@regression a non-numeric id (${id}) returns 400 INVALID_ID`, async ({ request }) => {
      await expectError(await request.get(`/api/products/${id}`), 400, 'INVALID_ID');
    });
  }

  test('@regression a trailing slash still resolves the artwork', async ({ request }) => {
    expect((await request.get('/api/products/1/')).status()).toBe(200);
  });
});
