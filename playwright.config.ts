import { defineConfig, devices } from '@playwright/test';

const PLAYGROUND_WEB_URL = process.env.PLAYGROUND_WEB_URL ?? 'http://localhost:5173';
const PLAYGROUND_API_URL = process.env.PLAYGROUND_API_URL ?? 'http://localhost:3100';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['json', { outputFile: 'playwright-results.json' }]]
    : [['html', { outputFolder: 'playwright-report', open: 'never' }], ['json', { outputFile: 'playwright-results.json' }], ['list']],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'portfolio',
      testMatch: ['tests/ui/portfolio/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PORTFOLIO_URL ?? 'https://qa-automation-portafolio-ejzm.vercel.app',
        testIdAttribute: 'data-testid',
      },
    },
    {
      name: 'playground',
      testMatch: ['tests/ui/playground/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: PLAYGROUND_WEB_URL,
        testIdAttribute: 'data-testid',
      },
    },
    {
      name: 'api',
      testMatch: ['tests/api/**/*.spec.ts'],
    },
    {
      name: 'api-playground',
      testMatch: ['tests/playground-api/**/*.spec.ts'],
      testIgnore: ['tests/playground-api/stateful/**'],
      use: { baseURL: PLAYGROUND_API_URL },
    },
    {
      name: 'api-playground-stateful',
      testMatch: ['tests/playground-api/stateful/**/*.spec.ts'],
      dependencies: ['api-playground'],
      fullyParallel: false,
      use: { baseURL: PLAYGROUND_API_URL },
    },
  ],
  webServer: [
    ...(process.env.PLAYGROUND_API_URL
      ? []
      : [
          {
            command: 'npm run dev:api',
            url: `${PLAYGROUND_API_URL}/api/health`,
            reuseExistingServer: !process.env.CI,
            timeout: 30_000,
          },
        ]),
    ...(process.env.PLAYGROUND_WEB_URL
      ? []
      : [
          {
            command: 'npm --prefix web run dev -- --port 5173 --strictPort',
            url: PLAYGROUND_WEB_URL,
            reuseExistingServer: !process.env.CI,
            timeout: 60_000,
          },
        ]),
  ],
});
