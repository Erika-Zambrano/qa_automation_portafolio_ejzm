import { test, expect } from '@playwright/test';
import { PortfolioBasePage } from '../../../pages/portfolio/PortfolioBasePage';

test.describe('Portfolio navigation', () => {

  // ── Smoke ─────────────────────────────────────────────────────────────────

  test('@smoke homepage loads with title and topbar', async ({ page }) => {
    const base = new PortfolioBasePage(page);
    await base.navigate('/');

    await expect(page).toHaveTitle(/Erika Zambrano/i);
    await expect(base.topbar).toBeVisible();
  });

  test('@smoke topbar shows all 4 nav links on every page', async ({ page }) => {
    const base = new PortfolioBasePage(page);

    for (const path of ['/', '/cv', '/contact', '/reports']) {
      await base.navigate(path);
      await Promise.all([
        expect.soft(base.topbar).toBeVisible(),
        expect.soft(base.navHome).toBeVisible(),
        expect.soft(base.navCv).toBeVisible(),
        expect.soft(base.navContact).toBeVisible(),
        expect.soft(base.navReports).toBeVisible(),
      ]);
    }
  });

  test('@smoke /cv loads with profile section visible', async ({ page }) => {
    const base = new PortfolioBasePage(page);
    await base.navigate('/cv');

    await expect(page).toHaveURL(/\/cv/);
    await expect(page.getByTestId('section-profile')).toBeVisible();
  });

  test('@smoke /contact loads with form visible', async ({ page }) => {
    const base = new PortfolioBasePage(page);
    await base.navigate('/contact');

    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator('#contact-form')).toBeVisible();
  });

  test('@smoke /reports loads with a heading visible', async ({ page }) => {
    const base = new PortfolioBasePage(page);
    await base.navigate('/reports');

    await expect(page).toHaveURL(/\/reports/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  // ── Regression ────────────────────────────────────────────────────────────

  test('@regression active nav link reflects the current page', async ({ page }) => {
    const base = new PortfolioBasePage(page);

    await base.navigate('/cv');
    await expect(base.navCv).toHaveClass(/active/);

    await base.navigate('/contact');
    await expect(base.navContact).toHaveClass(/active/);

    await base.navigate('/reports');
    await expect(base.navReports).toHaveClass(/active/);
  });

  test('@regression lang switcher is visible and shows current language', async ({ page }) => {
    const base = new PortfolioBasePage(page);
    await base.navigate('/');

    await expect(base.langBtn).toBeVisible();
    await expect(base.langBtn).toContainText('ES');
  });
});
