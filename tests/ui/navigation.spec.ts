import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe('Navigation', () => {
  test('@smoke Verify homepage loads correctly', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate('/');
    await home.waitForLoad();

    const title = await home.getTitle();
    expect(title.toLowerCase()).toContain('practice');
    await expect(home.logo).toBeVisible();
  });

  test('@smoke Product catalog shows at least one product', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate('/');
    await home.waitForLoad();

    const count = await home.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('@smoke Navigation menu contains expected links', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation').first();
    await expect(nav).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
  });

  test('@smoke Contact page is accessible', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/contact/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});
