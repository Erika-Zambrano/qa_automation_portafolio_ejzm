import { test, expect } from '../fixtures/pomBuilder';

test.describe('Portfolio navigation', () => {
  test('Should display the homepage with its title and topbar', { tag: '@smoke' }, async ({ page, guestPages }) => {
    await guestPages.basePage.navigate('/');

    await Promise.all([
      expect.soft(page).toHaveTitle(/Erika Zambrano/i),
      expect.soft(guestPages.basePage.topbar).toBeVisible(),
    ]);
  });

  test('Should display all 4 nav links on every page', { tag: '@smoke' }, async ({ guestPages }) => {
    for (const path of ['/', '/cv', '/contact', '/reports']) {
      await guestPages.basePage.navigate(path);
      await Promise.all([
        expect.soft(guestPages.basePage.topbar).toBeVisible(),
        expect.soft(guestPages.basePage.navHome).toBeVisible(),
        expect.soft(guestPages.basePage.navCv).toBeVisible(),
        expect.soft(guestPages.basePage.navContact).toBeVisible(),
        expect.soft(guestPages.basePage.navReports).toBeVisible(),
      ]);
    }
  });

  test('Should navigate to /cv and display the profile section', { tag: '@smoke' }, async ({ page, guestPages }) => {
    await guestPages.basePage.navigate('/cv');

    await Promise.all([
      expect.soft(page).toHaveURL(/\/cv/),
      expect.soft(page.getByTestId('section-profile')).toBeVisible(),
    ]);
  });

  test('Should navigate to /contact and display the contact form', { tag: '@smoke' }, async ({ page, guestPages }) => {
    await guestPages.basePage.navigate('/contact');

    await Promise.all([
      expect.soft(page).toHaveURL(/\/contact/),
      expect.soft(page.locator('#contact-form')).toBeVisible(),
    ]);
  });

  test('Should navigate to /reports and display a heading', { tag: '@smoke' }, async ({ page, guestPages }) => {
    await guestPages.basePage.navigate('/reports');

    await Promise.all([
      expect.soft(page).toHaveURL(/\/reports/),
      expect.soft(page.getByRole('heading').first()).toBeVisible(),
    ]);
  });

  test('Should validate that the active nav link reflects the current page', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.basePage.navigate('/cv');
    await expect.soft(guestPages.basePage.navCv).toHaveClass(/active/);

    await guestPages.basePage.navigate('/contact');
    await expect.soft(guestPages.basePage.navContact).toHaveClass(/active/);

    await guestPages.basePage.navigate('/reports');
    await expect(guestPages.basePage.navReports).toHaveClass(/active/);
  });

  test('Should display the language switcher with the current language', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.basePage.navigate('/');

    await Promise.all([
      expect.soft(guestPages.basePage.langBtn).toBeVisible(),
      expect.soft(guestPages.basePage.langBtn).toContainText('ES'),
    ]);
  });
});
