import { test, expect } from '../fixtures/pomBuilder';
import { buttonName } from '../test-data/playgroundTexts';

test.describe('Gallery', () => {
  test('Should display the first page of artworks with pagination', { tag: '@smoke' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await Promise.all([
      expect.soft(guestPages.shopPage.cards).toHaveCount(6),
      expect.soft(guestPages.shopPage.name(1)).toHaveText('Paseo a orillas del mar'),
      expect.soft(guestPages.shopPage.price(1)).toHaveText(guestPages.shopPage.money(4500)),
    ]);
  });

  test('Should navigate between result pages', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await expect.soft(guestPages.shopPage.previous).toBeDisabled();
    await guestPages.shopPage.next.click();
    await Promise.all([
      expect.soft(guestPages.shopPage.currentPage).toContainText('2'),
      expect.soft(guestPages.shopPage.previous).toBeEnabled(),
    ]);
  });

  test('Should validate the search filter narrows the results', { tag: '@regression' }, async ({ page, guestPages }) => {
    await guestPages.shopPage.goto();
    await guestPages.shopPage.search.fill('grito');
    await Promise.all([
      expect.soft(guestPages.shopPage.cards).toHaveCount(1),
      expect.soft(guestPages.shopPage.name(3)).toHaveText('El grito'),
      expect.soft(page).toHaveURL(/q=grito/),
    ]);
  });

  test('Should display the empty state when no artwork matches', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await guestPages.shopPage.search.fill('zzzz-no-match');
    await Promise.all([
      expect.soft(guestPages.shopPage.empty).toBeVisible(),
      expect.soft(guestPages.shopPage.cards).toHaveCount(0),
    ]);
  });

  test('Should validate the artist filter keeps only that artist', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await expect.soft(guestPages.shopPage.artist.locator('option')).not.toHaveCount(1);
    await guestPages.shopPage.artist.selectOption('Frida Kahlo');
    await Promise.all([
      expect.soft(guestPages.shopPage.cards).toHaveCount(2),
      expect.soft(guestPages.shopPage.cards.first().getByText('Frida Kahlo')).toBeVisible(),
    ]);
  });

  test('Should validate the price sort orders the artworks ascending', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto('&sort=price');
    await expect(guestPages.shopPage.cards.first()).toHaveAttribute('data-testid', 'product-card-2');
  });

  test('Should display a sold out artwork with its add button disabled', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto('&q=Guernica');
    await expect(guestPages.shopPage.add(7)).toBeDisabled();
  });

  test('Should validate the in stock filter hides sold out artworks', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto('&q=Guernica');
    await guestPages.shopPage.inStock.click();
    await expect(guestPages.shopPage.empty).toBeVisible();
  });

  test('Should validate clearing the filters restores the full catalog', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto('&q=grito');
    await guestPages.shopPage.clearFilters.click();
    await Promise.all([
      expect.soft(guestPages.shopPage.cards).toHaveCount(6),
      expect.soft(guestPages.shopPage.search).toHaveValue(''),
    ]);
  });

  test('Should display an error and recover when the catalog request fails', { tag: '@regression' }, async ({ page, guestPages }) => {
    let fail = true;
    await page.route('**/api/products?**', (route) => (fail ? route.fulfill({ status: 500, json: { error: { code: 'CHAOS_REQUESTED', message: 'x', requestId: 'req_x' } } }) : route.continue()));
    await guestPages.shopPage.goto();
    await expect.soft(guestPages.shopPage.error).toBeVisible();
    fail = false;
    await guestPages.shopPage.retry.click();
    await expect(guestPages.shopPage.cards).toHaveCount(6);
  });

  test('Should display a loading-safe state when the catalog is slow', { tag: '@regression' }, async ({ page, guestPages }) => {
    await page.route('**/api/products?**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });
    await guestPages.shopPage.goto();
    await expect(guestPages.shopPage.cards).toHaveCount(6, { timeout: 10_000 });
  });
});

test.describe('Cart', () => {
  test('Should create a cart line and update the badge when adding an artwork', { tag: '@smoke' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await expect.soft(guestPages.shopPage.session.cartCount).toHaveText('0');
    await guestPages.shopPage.card(1).getByRole('button', { name: buttonName.addToCart }).click();
    await Promise.all([
      expect.soft(guestPages.shopPage.session.cartCount).toHaveText('1'),
      expect.soft(guestPages.shopPage.cart.items).toHaveCount(1),
      expect.soft(guestPages.shopPage.cart.subtotal).toHaveText(guestPages.shopPage.money(4500)),
    ]);
  });

  test('Should validate the totals include tax and shipping', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await guestPages.shopPage.add(1).click();
    await Promise.all([
      expect.soft(guestPages.shopPage.cart.shipping).toHaveText(guestPages.shopPage.money(500)),
      expect.soft(guestPages.shopPage.cart.tax).toHaveText(guestPages.shopPage.money(450)),
      expect.soft(guestPages.shopPage.cart.total).toHaveText(guestPages.shopPage.money(5450)),
    ]);
  });

  test('Should validate shipping is free above the threshold', { tag: '@regression' }, async ({ session, guestPages }) => {
    await session.seedCart([{ productId: 17, quantity: 1 }]);
    await guestPages.shopPage.goto();
    await Promise.all([
      expect.soft(guestPages.shopPage.cart.shipping).not.toContainText('$'),
      expect.soft(guestPages.shopPage.cart.total).toHaveText(guestPages.shopPage.money(11900 + 1190)),
    ]);
  });

  test('Should validate quantity controls update the line and the total', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await guestPages.shopPage.add(2).click();
    await guestPages.shopPage.cart.increase(2).click();
    await expect.soft(guestPages.shopPage.cart.subtotal).toHaveText(guestPages.shopPage.money(7600));
    await guestPages.shopPage.cart.decrease(2).click();
    await Promise.all([
      expect.soft(guestPages.shopPage.cart.subtotal).toHaveText(guestPages.shopPage.money(3800)),
      expect.soft(guestPages.shopPage.cart.decrease(2)).toBeDisabled(),
    ]);
  });

  test('Should validate a limited edition cannot exceed its stock', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto('&q=grito');
    for (let i = 0; i < 3; i += 1) await guestPages.shopPage.add(3).click();
    await Promise.all([
      expect.soft(guestPages.shopPage.add(3)).toBeDisabled(),
      expect.soft(guestPages.shopPage.cart.increase(3)).toBeDisabled(),
    ]);
  });

  test('Should validate removing a line empties the cart', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await guestPages.shopPage.add(1).click();
    await guestPages.shopPage.cart.remove(1).click();
    await Promise.all([
      expect.soft(guestPages.shopPage.cart.empty).toBeVisible(),
      expect.soft(guestPages.shopPage.session.cartCount).toHaveText('0'),
    ]);
  });

  test('Should validate the cart persists after a reload', { tag: '@regression' }, async ({ page, guestPages }) => {
    await guestPages.shopPage.goto();
    await guestPages.shopPage.add(1).click();
    await page.reload();
    await expect(guestPages.shopPage.cart.items).toHaveCount(1);
  });

  test('Should validate the SAVE10 coupon applies a discount', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await guestPages.shopPage.add(1).click();
    await guestPages.shopPage.cart.applyCoupon('SAVE10');
    await Promise.all([
      expect.soft(guestPages.shopPage.cart.couponApplied).toBeVisible(),
      expect.soft(guestPages.shopPage.cart.discount).toContainText(guestPages.shopPage.money(450)),
    ]);
  });

  test('Should display an error for an unknown coupon', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await guestPages.shopPage.add(1).click();
    await guestPages.shopPage.cart.applyCoupon('NOPE');
    await Promise.all([
      expect.soft(guestPages.shopPage.cart.couponError).toBeVisible(),
      expect.soft(guestPages.shopPage.cart.couponApplied).toBeHidden(),
    ]);
  });

  test('Should display an error for an expired coupon', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await guestPages.shopPage.add(1).click();
    await guestPages.shopPage.cart.applyCoupon('WINTER20');
    await expect(guestPages.shopPage.cart.couponError).toBeVisible();
  });

  test('Should validate the cart totals come from the pricing endpoint', { tag: '@regression' }, async ({ page, guestPages }) => {
    await page.route('**/api/cart/price', (route) =>
      route.fulfill({
        json: { lines: [], coupon: null, subtotal: 100, discount: 0, shipping: 0, tax: 10, total: 110, currency: 'USD' },
      }),
    );
    await guestPages.shopPage.goto();
    await guestPages.shopPage.add(1).click();
    await expect(guestPages.shopPage.cart.total).toHaveText(guestPages.shopPage.money(110));
  });
});

test.describe('Gallery in English', () => {
  test.use({ lang: 'en' });

  test('Should switch the prices to the English format', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.shopPage.goto();
    await expect(guestPages.shopPage.price(1)).toHaveText('$45.00');
  });
});
