import { ApiError } from './errors';
import { type Req, type Res, route } from './http';
import chaos from '../_routes/chaos';
import checkout from '../_routes/checkout';
import health from '../_routes/health';
import reset from '../_routes/reset';
import login from '../_routes/auth/login';
import logout from '../_routes/auth/logout';
import me from '../_routes/auth/me';
import register from '../_routes/auth/register';
import price from '../_routes/cart/price';
import submit from '../_routes/forms/submit';
import order from '../_routes/orders/[id]';
import products from '../_routes/products/index';
import product from '../_routes/products/[id]';

type Handler = (req: Req, res: Res) => Promise<void>;

const table: Array<[string, Handler]> = [
  ['health', health],
  ['reset', reset],
  ['chaos', chaos],
  ['auth/register', register],
  ['auth/login', login],
  ['auth/logout', logout],
  ['auth/me', me],
  ['products', products],
  ['products/:id', product],
  ['cart/price', price],
  ['checkout', checkout],
  ['orders/:id', order],
  ['forms/submit', submit],
];

const routes = table.map(([spec, handler]) => {
  const keys: string[] = [];
  const pattern = spec
    .split('/')
    .map((segment) => {
      if (!segment.startsWith(':')) return segment;
      keys.push(segment.slice(1));
      return '([^/]+)';
    })
    .join('/');
  return { regex: new RegExp(`^/api/${pattern}/?$`), keys, handler };
});

const fail = () => {
  throw new ApiError(404, 'NOT_FOUND', 'Route not found');
};

const notFound = route({ GET: fail, POST: fail, PUT: fail, PATCH: fail, DELETE: fail });

export async function dispatch(req: Req, res: Res): Promise<void> {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  for (const entry of routes) {
    const match = entry.regex.exec(pathname);
    if (!match) continue;
    const params: Record<string, string> = {};
    entry.keys.forEach((key, index) => {
      params[key] = decodeURIComponent(match[index + 1]);
    });
    req.query = params;
    await entry.handler(req, res);
    return;
  }
  req.query = {};
  await notFound(req, res);
}
