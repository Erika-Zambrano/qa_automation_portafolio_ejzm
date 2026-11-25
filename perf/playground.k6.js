import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3100';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    'http_req_duration{endpoint:products}': ['p(95)<400'],
    'http_req_duration{endpoint:product}': ['p(95)<300'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const list = http.get(`${BASE}/api/products?pageSize=10&sort=-rating`, { tags: { endpoint: 'products' } });
  check(list, { 'list 200': (r) => r.status === 200 });

  const items = list.status === 200 ? list.json('data') : [];
  if (items.length > 0) {
    const detail = http.get(`${BASE}/api/products/${items[0].id}`, { tags: { endpoint: 'product' } });
    check(detail, { 'detail 200': (r) => r.status === 200 });
  }

  const health = http.get(`${BASE}/api/health`, { tags: { endpoint: 'health' } });
  check(health, { 'health ok': (r) => r.status === 200 });

  sleep(1);
}
