import { test, expect } from '@playwright/test';

test.describe('cv.html', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv.html');
    // Force ES as starting language so tests are deterministic
    // regardless of browser locale
    await page.evaluate(() => localStorage.setItem('cv-lang', 'es'));
    await page.reload();
  });

  // ── Smoke ─────────────────────────────────────────────────────────────────

  test('@smoke Should be able to access the topbar and all 4 navigation links', async ({ page }) => {
    await Promise.all([   
      expect.soft(page.getByTestId('topbar')).toBeVisible(),
      expect.soft(page.getByTestId('nav-home')).toBeVisible(),
      expect.soft(page.getByTestId('nav-cv')).toBeVisible(),
      expect.soft(page.getByTestId('nav-contact')).toBeVisible(),
      expect.soft(page.getByTestId('nav-reports')).toBeVisible(),
    ]);
  });

  test('@smoke Should be able to navigate to correct pages from the topbar', async ({ page }) => {
    
    await page.getByTestId('nav-contact').click();
    await expect(page).toHaveURL(/contact/);

    await page.goto('/cv.html');
    await page.getByTestId('nav-reports').click();
    await expect(page).toHaveURL(/reports/);

    await page.goto('/cv.html');
    await page.getByTestId('nav-home').click();
    await expect(page).toHaveURL(/index|\/$/);
  });

  test('@smoke all 6 CV sections are visible in Spanish', async ({ page }) => {
    await Promise.all([
      expect.soft(page.getByTestId('section-profile')).toBeVisible(),
      expect.soft(page.getByTestId('section-experience')).toBeVisible(),
      expect.soft(page.getByTestId('section-projects')).toBeVisible(),
      expect.soft(page.getByTestId('section-skills')).toBeVisible(),
      expect.soft(page.getByTestId('section-education')).toBeVisible(),
      expect.soft(page.getByTestId('section-languages')).toBeVisible(),
    ]);
  });

  // ── Regression ────────────────────────────────────────────────────────────

  test('@regression Should be able to change the language to English', async ({ page }) => {
    await page.getByTestId('lang-btn').click();
    await page.getByTestId('lang-option-en').click();

    await Promise.all([
      expect.soft(page.getByTestId('section-profile')).toContainText('Professional Profile'),
      expect.soft(page.getByTestId('section-experience')).toContainText('Professional Experience'),
      expect.soft(page.getByTestId('section-projects')).toContainText('Personal Projects'),
      expect.soft(page.getByTestId('section-skills')).toContainText('Technical Skills'),
      expect.soft(page.getByTestId('section-education')).toContainText('Education'),
      expect.soft(page.getByTestId('section-languages')).toContainText('Languages'),
    ]);
  });

  test('@regression Should be able to persist the language preference after page reload', async ({ page }) => {
    await page.getByTestId('lang-btn').click();
    await page.getByTestId('lang-option-en').click();
    await page.reload();

    await Promise.all([
      expect.soft(page.getByTestId('lang-btn')).toContainText('EN'),
      expect.soft(page.getByTestId('section-profile')).toContainText('Professional Profile'),
      expect.soft(page.getByTestId('section-experience')).toContainText('Professional Experience'),
      expect.soft(page.getByTestId('section-projects')).toContainText('Personal Projects'),
      expect.soft(page.getByTestId('section-skills')).toContainText('Technical Skills'),
      expect.soft(page.getByTestId('section-education')).toContainText('Education'),
      expect.soft(page.getByTestId('section-languages')).toContainText('Languages'),
    ]);
  });

  test('@regression Should be able to update the <html lang> attribute when language changes', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await page.getByTestId('lang-btn').click();
    await page.getByTestId('lang-option-en').click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
