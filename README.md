![CI](https://github.com/YOUR_GITHUB_USERNAME/qa-automation-portfolio/actions/workflows/playwright.yml/badge.svg)

> **Note:** Replace `YOUR_GITHUB_USERNAME` with your GitHub username after pushing.

# QA Automation Portfolio — Erika Zambrano

A production-quality automation suite demonstrating real-world QA engineering skills: UI testing with Page Object Model, API testing, a purpose-built QA Playground, accessibility checks, and full CI/CD integration via GitHub Actions — all in TypeScript with Playwright.

---

## Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev) | Test automation framework |
| TypeScript | Strict-mode type safety |
| GitHub Actions | CI/CD pipeline |
| Page Object Model | Maintainable UI abstraction |

---

## Project structure

```
qa-automation-portfolio/
├── .github/workflows/
│   └── playwright.yml        CI pipeline (GitHub Actions)
├── tests/
│   ├── ui/
│   │   ├── fixtures/             pomBuilder (guestPages / customerPages), session helpers
│   │   ├── test-data/            UI texts taken from the web i18n dictionary
│   │   ├── portfolio/            navigation, cv
│   │   └── playground/           navigation, shop + cart, checkout, forms, login + sign up
│   ├── api/
│   │   └── public-api.spec.ts    @sanity — REST API GET/POST tests
│   └── playground-api/           593 API tests for the playground backend (+ stateful/)
├── pages/
│   ├── portfolio/                Page Objects for the portfolio site
│   └── playground/               Page Objects + reusable components (menu, session bar, cart, generic)
├── api/                      playground backend (one Vercel function, handlers in api/_routes/)
├── eslint-rules/             custom ESLint rules (expect-style)
├── docs/                     qa-playground.md (plan) and qa-playground-api.md (API contract)
├── utils/
│   └── helpers.ts            reusable utilities
├── evals/
│   ├── cases.ts              golden cases + tutor system prompt
│   ├── checks.ts             deterministic checks (structure, bilingual, A2 level)
│   └── run.ts                eval runner (subject model + LLM judge)
├── scripts/
│   └── summarize-playwright.ts   Playwright JSON -> dashboard data
├── web/                      portfolio site (React + Chakra UI + React Router, bundled by Vite)
│   ├── index.html            single entry (SPA)
│   ├── src/main.tsx          providers: Router, Chakra, language context
│   ├── src/App.tsx           routes: /, /cv, /contact, /reports
│   ├── src/pages/            Home, Cv, Contact, Reports
│   ├── src/components/       Topbar, Html helpers, reports/ReportsDashboard (Chakra)
│   ├── src/context/          LangContext (es/en, ?lang= and localStorage)
│   ├── src/i18n/             translations.ts
│   ├── src/css/              page styles (scoped per page)
│   ├── src/data/             recorded results (eval-results.json, ci-results.json)
│   └── vite.config.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Running tests locally

```bash
# Install dependencies
npm install
npx playwright install chromium

# Run all tests
npx playwright test

# Run by project
npx playwright test --project=playground            # playground E2E (starts API + web)
npx playwright test --project=api-playground        # playground API, parallel
npx playwright test --project=api-playground-stateful
npm run dev                                          # API (3100) + web (5173) together
npm run lint && npm run typecheck                    # ESLint (type-aware) and tsc

# Run by suite
npx playwright test --grep @smoke       # smoke tests
npx playwright test --grep @sanity      # API sanity tests
npx playwright test --grep @regression  # regression tests

# Open HTML report
npx playwright show-report
```

---

## Test suites

| Suite | File | Type | Tag |
|---|---|---|---|
| Portfolio navigation | `tests/ui/portfolio/navigation.spec.ts` | UI | `@smoke`, `@regression` |
| CV & language | `tests/ui/portfolio/cv.spec.ts` | UI | `@smoke`, `@regression` |
| Public API | `tests/api/public-api.spec.ts` | API | `@sanity` |
| Playground E2E | `tests/ui/playground/*.spec.ts` | UI | `@smoke`, `@regression` |
| Playground API | `tests/playground-api/**/*.spec.ts` | API | `@smoke`, `@sanity`, `@regression` |

---

## QA Playground

Under the **Playground** dropdown in the topbar: an art-reproductions gallery with a shop, cart, checkout, request form, login and sign up (mandatory terms). It exists to practice E2E, API and DevTools testing against a stateless backend (JWT, idempotency keys, rate limiting, limited stock, a `chaos` endpoint for 5xx, latency and malformed responses).

- Plan, phases and decisions: [`docs/qa-playground.md`](docs/qa-playground.md)
- API contract: [`docs/qa-playground-api.md`](docs/qa-playground-api.md)
- Seed users, cards and coupons are listed on the playground home page.
- Test style (enforced by ESLint in `tests/ui/`): titles start with `Should validate|create|navigate|display|switch`, page objects come from the `guestPages` / `customerPages` fixtures, and expects follow `local/expect-style` (grouped in `Promise.all` with `expect.soft`, last expect hard).

---

## Portfolio site

[View live →](https://qa-automation-portafolio-ejzm.vercel.app)

React single-page app using [Chakra UI](https://chakra-ui.com) as the component library (dashboard, contact form, suite cards), React Router for navigation and Vite as bundler. Page layout and typography live in scoped CSS files.

`web/index.html` is the source entry and cannot be opened directly. To browse the site without a server, build the `file://` version and open its output:

```bash
cd web && npm run build:file
open dist-file/index.html
```

That build uses relative paths, a single classic script and hash routing (`index.html#/cv`). The production build (`npm run build`) uses normal routes.

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # output in web/dist
npm run preview    # serve web/dist
```

Language is handled by `LangContext` (`?lang=es|en`, persisted in `localStorage`). Deployment: Vercel runs `vite build`, serves `web/dist` and rewrites every route to `index.html` (see `vercel.json`).

Run the portfolio tests against the local server:

```bash
cd web && npm run dev
PORTFOLIO_URL=http://localhost:5173 npx playwright test --project=portfolio
```

---

## Reports dashboard

`/reports` only reads recorded JSON; it never calls an API live.

| Data file | Produced by | Command |
|---|---|---|
| `web/src/data/ci-results.json` | Playwright JSON reporter, summarized. Published twice a day (06:00 and 18:00 UTC) to the `ci-data` branch by the Scheduled Run workflow; `/reports` reads it live and falls back to the bundled copy | `npx playwright test && npm run report:summarize` |
| `web/src/data/eval-results.json` | LLM eval harness | `ANTHROPIC_API_KEY=... npm run eval` |

### LLM evals

`npm run eval` sends 35 golden cases (corrections, Spanish interference and false friends, already-correct sentences, guardrails: prompt injection, role change, prompt leak, off-topic, harmful requests, PII) to an English-tutor system prompt, 3 runs each. Each run is scored by deterministic checks and an LLM judge (pass = all checks pass and judge score >= 4).

Models can be overridden with `EVAL_SUBJECT_MODEL`, `EVAL_JUDGE_MODEL` and `EVAL_RUNS`. In CI, the `llm-eval` job runs on manual dispatch and needs the `ANTHROPIC_API_KEY` secret.

### Load test (k6)

`perf/playground.k6.js` ramps the playground API from 10 to 100 virtual users against `GET /api/products`, `GET /api/products/:id` and `GET /api/health`. Thresholds: error rate < 1%, p95 < 500 ms, p99 < 1 s (list p95 < 400 ms, detail p95 < 300 ms).

```bash
npm run dev:api
k6 run perf/playground.k6.js
BASE_URL=https://<deploy> k6 run perf/playground.k6.js
```

Method and how to read the results: [docs/perf-k6.md](docs/perf-k6.md). Only run it against your own deployment.

---

## Decisions

| Decision | Why | What I would do differently |
|---|---|---|
| Playwright for UI and API in one runner | One config, one report, shared fixtures and auth state; the app has multiple browser contexts (cart, session) | Add contract checks generated from an OpenAPI schema instead of hand-written assertions |
| Playground API with deterministic seed data and a reset endpoint | Tests never depend on third-party sites; stateful specs run serially and isolate state | Split stateful and stateless specs into separate CI jobs to shorten the critical path |
| Negative and boundary cases first | Happy paths are cheap; validation, auth, stock and chaos behavior are where bugs live | Track mutation score to prove the negative cases actually fail when code breaks |
| Evals with deterministic checks plus an LLM judge | Checks catch structure, language and level regressions for free; the judge covers meaning | Calibrate the judge against human-labeled cases and report agreement |
| Eval pass = every check passes AND judge >= 4, 3 runs per case | A single sample hides nondeterminism; pass rate per case shows flakiness | Raise runs on failing cases only and add a cost report |
| CI results published to a `ci-data` branch | The dashboard reads live data without redeploying the site | Add trend lines across runs instead of the latest snapshot |
| Load test thresholds as pass/fail | A load test without thresholds is a demo, not a gate | Run it nightly and chart p95 over time |

---

## Contact

- **LinkedIn:** [linkedin.com/in/YOUR_PROFILE](https://linkedin.com/in/YOUR_PROFILE)
- **GitHub:** [github.com/YOUR_GITHUB_USERNAME](https://github.com/YOUR_GITHUB_USERNAME)
- **Email:** erikajzm@gmail.com
