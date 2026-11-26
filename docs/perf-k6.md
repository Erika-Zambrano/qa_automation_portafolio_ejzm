# Load test: QA Playground API

Script: `perf/playground.k6.js`. Target: the playground API (`npm run dev:api`, port 3100) or your own deployment.

## Scenario

| Stage | Duration | Virtual users |
|---|---|---|
| Warm-up | 30 s | 0 → 10 |
| Ramp | 1 m | 10 → 50 |
| Peak | 30 s | 50 → 100 |
| Ramp-down | 30 s | 100 → 0 |

Each iteration: list products (10 per page, sorted by rating), fetch the first product, check health, sleep 1 s.

## Thresholds

| Metric | Limit |
|---|---|
| `http_req_failed` | < 1% |
| `http_req_duration` p95 / p99 | < 500 ms / < 1 s |
| list endpoint p95 | < 400 ms |
| detail endpoint p95 | < 300 ms |
| checks | > 99% |

## Reading the result

1. **Errors first.** Any `http_req_failed` above the limit invalidates the latency numbers.
2. **Percentiles, not averages.** Compare p50 vs p95 vs p99: a wide gap means a long tail (cold starts, GC, lock contention), not general slowness.
3. **Find the knee.** Note the stage where p95 starts climbing faster than the user count; that is the practical capacity.
4. **Per-endpoint tags.** If only `endpoint:products` degrades, suspect the filter and sort path (full in-memory scan and sort per request); if all degrade together, suspect the runtime or the host.
5. **What to investigate next.** Add pagination limits and caching to the list path, rerun against the deployed serverless function to separate cold-start latency from steady-state, and add a soak test (30 min at 30 users) to detect memory growth.

## Results

Run: k6 v2.4.0, local API (`npm run dev:api`, Node on macOS), 2m30s, up to 100 VUs, 5,699 iterations, 17,097 requests (~114 req/s). All thresholds passed.

| Endpoint | p50 | p95 | max |
|---|---|---|---|
| all requests | 0.40 ms | 1.27 ms | 96 ms |
| `GET /api/products` | 0.58 ms | 1.54 ms | 96 ms |
| `GET /api/products/:id` | 0.35 ms | 1.29 ms | 95 ms |

- Errors: 0 of 17,097 requests; checks 100%.
- No knee: p95 stayed flat from 10 to 100 VUs. At ~114 req/s a single local Node process is nowhere near saturation, so this run proves the thresholds hold, not the capacity limit.
- The 96 ms max is a one-off outlier (likely first request or GC), well inside the p99 of 3.6 ms.
- Local loopback excludes network and serverless cold starts, so these numbers are a floor, not what a visitor sees.

Next: raise the arrival rate (`constant-arrival-rate` executor at 500-2000 req/s) to find the real knee, then rerun against the deployed function to separate cold starts from steady state.
