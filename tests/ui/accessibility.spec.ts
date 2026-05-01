import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('@regression All images on the homepage have an alt attribute', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const imagesWithoutAlt = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img'))
        .filter(img => img.getAttribute('alt') === null)
        .length
    );
    expect(imagesWithoutAlt).toBe(0);
  });

  test('@regression Action buttons have accessible text or aria-label', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = page.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const hasAccessibleName =
        (text?.trim().length ?? 0) > 0 || (ariaLabel?.length ?? 0) > 0;
      expect(hasAccessibleName).toBe(true);
    }
  });

  test('@regression Login form inputs have accessible labels', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const results = await page.evaluate(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>(
        'input:not([type="hidden"]):not([type="submit"])'
      );
      return Array.from(inputs).map(el => ({
        id: el.id,
        type: el.type,
        hasLabel: !!(el.id && document.querySelector(`label[for="${el.id}"]`)),
        hasAriaLabel: !!el.getAttribute('aria-label'),
        hasAriaLabelledBy: !!el.getAttribute('aria-labelledby'),
        hasPlaceholder: !!el.placeholder,
      }));
    });

    for (const input of results) {
      const isAccessible =
        input.hasLabel ||
        input.hasAriaLabel ||
        input.hasAriaLabelledBy ||
        input.hasPlaceholder;
      expect(isAccessible).toBe(true);
    }
  });
});
