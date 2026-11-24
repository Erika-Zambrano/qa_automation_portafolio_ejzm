import { CATEGORIES, type Product } from '../_lib/data';
import { listProducts } from '../_lib/inventory';
import { Issues } from '../_lib/errors';
import { route } from '../_lib/http';
import { queryInt } from '../_lib/validate';

const SORTS: Record<string, (a: Product, b: Product) => number> = {
  price: (a, b) => a.price - b.price,
  '-price': (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
  '-name': (a, b) => b.name.localeCompare(a.name),
  year: (a, b) => a.year - b.year,
  '-year': (a, b) => b.year - a.year,
  rating: (a, b) => a.rating - b.rating,
  '-rating': (a, b) => b.rating - a.rating,
};

export default route({
  GET: (ctx) => {
    const issues = new Issues();
    const page = queryInt(ctx.query, 'page', issues, { min: 1, max: 1000, fallback: 1 });
    const pageSize = queryInt(ctx.query, 'pageSize', issues, { min: 1, max: 50, fallback: 5 });
    const minPrice = queryInt(ctx.query, 'minPrice', issues, { min: 0, max: 10_000_000, fallback: 0 });
    const maxPrice = queryInt(ctx.query, 'maxPrice', issues, { min: 0, max: 10_000_000, fallback: 10_000_000 });
    const { category, artist, sort, q, inStock } = ctx.query;
    if (category !== undefined && !(CATEGORIES as readonly string[]).includes(category)) issues.add('category', 'INVALID_OPTION', `category must be one of: ${CATEGORIES.join(', ')}`);
    if (sort !== undefined && !SORTS[sort]) issues.add('sort', 'INVALID_OPTION', `sort must be one of: ${Object.keys(SORTS).join(', ')}`);
    if (inStock !== undefined && inStock !== 'true' && inStock !== 'false') issues.add('inStock', 'INVALID_TYPE', 'inStock must be true or false');
    if (minPrice > maxPrice) issues.add('minPrice', 'INVALID_RANGE', 'minPrice must be <= maxPrice');
    issues.throwIfAny();
    let result = listProducts().filter((p) => p.price >= minPrice && p.price <= maxPrice);
    if (category) result = result.filter((p) => p.category === category);
    if (artist) result = result.filter((p) => p.artist.toLowerCase().includes(artist.toLowerCase()));
    if (q) result = result.filter((p) => `${p.name} ${p.artist}`.toLowerCase().includes(q.toLowerCase()));
    if (inStock === 'true') result = result.filter((p) => p.stock > 0);
    if (inStock === 'false') result = result.filter((p) => p.stock === 0);
    if (sort) result = [...result].sort(SORTS[sort]);
    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const data = result.slice((page - 1) * pageSize, page * pageSize);
    return { status: 200, body: { data, meta: { page, pageSize, total, totalPages } } };
  },
});
