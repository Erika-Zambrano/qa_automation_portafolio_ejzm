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
│   ├── ui/
│   │   ├── navigation.spec.ts    @smoke — homepage, catalog, nav links
│   │   ├── forms.spec.ts         @regression — login validation, search
│   │   └── accessibility.spec.ts @regression — alt text, labels, buttons
│   └── api/
│       └── public-api.spec.ts    @sanity — REST API GET/POST tests
├── pages/
│   ├── BasePage.ts           navigate, waitForLoad, getTitle
│   └── HomePage.ts           logo, navMenu, searchProduct, getProductCount
├── utils/
│   └── helpers.ts            reusable utilities
├── web/
│   └── index.html            portfolio landing page (deployed on Vercel)
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
| Navigation | `tests/ui/navigation.spec.ts` | UI | `@smoke` |
| Forms & Validation | `tests/ui/forms.spec.ts` | UI | `@regression` |
| Accessibility | `tests/ui/accessibility.spec.ts` | UI | `@regression` |
| Public API | `tests/api/public-api.spec.ts` | API | `@sanity` |

---

## Portfolio landing page

[View live →](https://YOUR_VERCEL_URL) ← _update after deploying to Vercel_

---

## Contact

- **LinkedIn:** [linkedin.com/in/YOUR_PROFILE](https://linkedin.com/in/YOUR_PROFILE)
- **GitHub:** [github.com/YOUR_GITHUB_USERNAME](https://github.com/YOUR_GITHUB_USERNAME)
- **Email:** erikajzm@gmail.com
