import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe('Forms & Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
  });

  test('@regression Login with invalid credentials shows an error', async ({ page }) => {
    await page.getByTestId('email').fill('invalid@example.com');
    await page.getByTestId('password').fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('@regression Login form contains required email and password fields', async ({ page }) => {
    await expect(page.getByTestId('email')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('@regression Email field rejects an invalid format', async ({ page }) => {
    const emailInput = page.getByTestId('email');
    await emailInput.fill('not-a-valid-email');
    await page.getByRole('button', { name: /login/i }).click();

    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isInvalid).toBe(true);
  });

  test('@regression Search returns results for a valid query', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate('/');
    await home.waitForLoad();
    await home.searchProduct('hammer');
    await page.waitForLoadState('networkidle');

    const results = page.getByTestId('product-name');
    await expect(results.first()).toBeVisible({ timeout: 10_000 });
    expect(await results.count()).toBeGreaterThan(0);
  });
});
