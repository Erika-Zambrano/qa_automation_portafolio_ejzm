import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  use: {
    baseURL: 'https://practicesoftwaretesting.com',
    testIdAttribute: 'data-test',
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
        baseURL: 'https://qa-automation-portafolio-ejzm.vercel.app',
        testIdAttribute: 'data-testid',
      },
    },
    {
      name: 'chromium',
      testIgnore: ['tests/ui/portfolio/**/*.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
