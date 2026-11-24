import { test, expect } from '../fixtures/pomBuilder';

test.describe('Portfolio navigation', () => {
  test('Should display the homepage with its title and topbar', { tag: '@smoke' }, async ({ page, pom }) => {
    await pom.base.navigate('/');

    await expect(page).toHaveTitle(/Erika Zambrano/i);
    await expect(pom.base.topbar).toBeVisible();
  });

  test('Should display all 4 nav links on every page', { tag: '@smoke' }, async ({ pom }) => {
    const { base } = pom;

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

  test('Should navigate to /cv and display the profile section', { tag: '@smoke' }, async ({ page, pom }) => {
    await pom.base.navigate('/cv');

    await expect(page).toHaveURL(/\/cv/);
    await expect(page.getByTestId('section-profile')).toBeVisible();
  });

  test('Should navigate to /contact and display the contact form', { tag: '@smoke' }, async ({ page, pom }) => {
    await pom.base.navigate('/contact');

    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator('#contact-form')).toBeVisible();
  });

  test('Should navigate to /reports and display a heading', { tag: '@smoke' }, async ({ page, pom }) => {
    await pom.base.navigate('/reports');

    await expect(page).toHaveURL(/\/reports/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('Should validate that the active nav link reflects the current page', { tag: '@regression' }, async ({ pom }) => {
    const { base } = pom;

    await base.navigate('/cv');
    await expect(base.navCv).toHaveClass(/active/);

    await base.navigate('/contact');
    await expect(base.navContact).toHaveClass(/active/);

    await base.navigate('/reports');
    await expect(base.navReports).toHaveClass(/active/);
  });

  test('Should display the language switcher with the current language', { tag: '@regression' }, async ({ pom }) => {
    await pom.base.navigate('/');

    await expect(pom.base.langBtn).toBeVisible();
    await expect(pom.base.langBtn).toContainText('ES');
  });
});
