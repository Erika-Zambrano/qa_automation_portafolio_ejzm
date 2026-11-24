![CI](https://github.com/YOUR_GITHUB_USERNAME/qa-automation-portfolio/actions/workflows/playwright.yml/badge.svg)

> **Note:** Replace `YOUR_GITHUB_USERNAME` with your GitHub username after pushing.

# QA Automation Portfolio — Erika Zambrano

A production-quality automation suite demonstrating real-world QA engineering skills: UI testing with Page Object Model, API testing, accessibility checks, and full CI/CD integration via GitHub Actions — all in TypeScript with Playwright.

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
│   ├── ui/portfolio/
│   │   ├── navigation.spec.ts    @smoke/@regression — topbar, routes, active link, lang switcher
│   │   └── cv.spec.ts            @smoke/@regression — CV sections, language switch and persistence
│   └── api/
│       └── public-api.spec.ts    @sanity — REST API GET/POST tests
├── pages/portfolio/          Page Objects for the portfolio site
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
| `web/src/data/ci-results.json` | Playwright JSON reporter, summarized | `npx playwright test && npm run report:summarize` |
| `web/src/data/eval-results.json` | LLM eval harness | `ANTHROPIC_API_KEY=... npm run eval` |

### LLM evals

`npm run eval` sends 6 golden cases (past tense, articles, Spanish interference, already-correct sentence, prompt injection, off-topic) to an English-tutor system prompt, 3 runs each. Each run is scored by deterministic checks and an LLM judge (pass = all checks pass and judge score >= 4).

Models can be overridden with `EVAL_SUBJECT_MODEL`, `EVAL_JUDGE_MODEL` and `EVAL_RUNS`. In CI, the `llm-eval` job runs on manual dispatch and needs the `ANTHROPIC_API_KEY` secret.

---

## Contact

- **LinkedIn:** [linkedin.com/in/YOUR_PROFILE](https://linkedin.com/in/YOUR_PROFILE)
- **GitHub:** [github.com/YOUR_GITHUB_USERNAME](https://github.com/YOUR_GITHUB_USERNAME)
- **Email:** erikajzm@gmail.com
