import { test, expect } from '../fixtures/pomBuilder';

test.describe('Playground navigation', () => {
  test('Should navigate to every playground page from the topbar dropdown', { tag: '@smoke' }, async ({ page, guestPages }) => {
    await guestPages.shopPage.goto();
    const targets = [
      ['home', '/playground'],
      ['forms', '/playground/forms'],
      ['login', '/playground/login'],
      ['signup', '/playground/signup'],
      ['checkout', '/playground/checkout'],
      ['shop', '/playground/shop'],
    ] as const;
    for (const [link, path] of targets) {
      await guestPages.playgroundPage.menu.goTo(link);
      await expect.soft(page).toHaveURL(new RegExp(`${path}(\\?|$)`));
    }
  });

  test('Should display the dropdown items only after opening it', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await expect.soft(guestPages.playgroundPage.menu.toggle).toHaveAttribute('aria-expanded', 'false');
    await guestPages.playgroundPage.menu.open();
    await Promise.all([
      expect.soft(guestPages.playgroundPage.menu.toggle).toHaveAttribute('aria-expanded', 'true'),
      expect.soft(guestPages.playgroundPage.menu.item('signup')).toBeVisible(),
    ]);
  });

  test('Should display the guest session bar when nobody is logged in', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await Promise.all([
	     expect.soft(guestPages.shopPage.session.login).toBeVisible(),
       expect.soft(guestPages.shopPage.session.logout).toBeHidden(),
		]);
  });
});
