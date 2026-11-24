import { CARDS } from '../../../utils/playground-api';
import { test, expect } from '../fixtures/pomBuilder';
import { messages } from '../test-data/playgroundTexts';

const address = { fullName: 'Ada Lovelace', street: 'Calle Mayor 1', city: 'Madrid', zip: '28001', country: 'ES' };
const payment = { cardNumber: CARDS.ok, expiry: '12/40', cvv: '123' };

test.describe('Checkout access', () => {
  test('Should display the login requirement for a guest', { tag: '@smoke' }, async ({ session, guestPages }) => {
    await session.seedCart([{ productId: 6, quantity: 1 }]);
    await guestPages.checkoutPage.goto();
    await Promise.all([
      expect.soft(guestPages.checkoutPage.loginRequired).toBeVisible(),
      expect.soft(guestPages.checkoutPage.form).toBeHidden(),
    ]);
  });

  test('Should display the empty cart notice for a logged in user', { tag: '@regression' }, async ({ customerPages }) => {
    await customerPages.checkoutPage.goto();
    await expect.soft(customerPages.checkoutPage.emptyNotice).toBeVisible();
    await customerPages.checkoutPage.toShop.click();
    await expect(customerPages.shopPage.title).toBeVisible();
  });
});

test.describe('Checkout purchase', () => {
  test.beforeEach(async ({ session }) => {
    await session.seedCart([{ productId: 6, quantity: 2 }]);
  });

  test('Should create an order when the payment succeeds', { tag: '@smoke' }, async ({ customerPages }) => {
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.fillAddress(address);
    await customerPages.checkoutPage.fillPayment(payment);
    await customerPages.checkoutPage.submit.click();
    await Promise.all([
      expect.soft(customerPages.checkoutPage.confirmation).toBeVisible(),
      expect.soft(customerPages.checkoutPage.orderId).toContainText('ord_'),
      expect.soft(customerPages.checkoutPage.orderLine(6)).toBeVisible(),
      expect.soft(customerPages.checkoutPage.session.cartCount).toHaveText('0'),
    ]);
  });

  test('Should validate the empty form shows the required errors', { tag: '@regression' }, async ({ customerPages }) => {
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.submit.click();
    for (const name of ['fullName', 'street', 'city', 'zip', 'country', 'cardNumber', 'expiry', 'cvv']) {
      await expect.soft(customerPages.checkoutPage.fieldError(name)).toBeVisible();
    }
  });

  test('Should validate a card that fails the Luhn check is rejected', { tag: '@regression' }, async ({ customerPages }) => {
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.fillAddress(address);
    await customerPages.checkoutPage.fillPayment({ ...payment, cardNumber: '4242424242424241' });
    await customerPages.checkoutPage.submit.click();
    await expect(customerPages.checkoutPage.fieldError('cardNumber')).toBeVisible();
  });

  test('Should validate an expired card is rejected', { tag: '@regression' }, async ({ customerPages }) => {
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.fillAddress(address);
    await customerPages.checkoutPage.fillPayment({ ...payment, expiry: '01/20' });
    await customerPages.checkoutPage.submit.click();
    await expect(customerPages.checkoutPage.fieldError('expiry')).toBeVisible();
  });

  test('Should display an error when the card is declined', { tag: '@regression' }, async ({ customerPages }) => {
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.fillAddress(address);
    await customerPages.checkoutPage.fillPayment({ ...payment, cardNumber: CARDS.declined });
    await customerPages.checkoutPage.submit.click();
    await Promise.all([
      expect.soft(customerPages.checkoutPage.error).toContainText(messages.cardDeclined),
      expect.soft(customerPages.checkoutPage.confirmation).toBeHidden(),
    ]);
  });

  test('Should display an error when the card has no funds', { tag: '@regression' }, async ({ customerPages }) => {
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.fillAddress(address);
    await customerPages.checkoutPage.fillPayment({ ...payment, cardNumber: CARDS.noFunds });
    await customerPages.checkoutPage.submit.click();
    await expect(customerPages.checkoutPage.error).toContainText(messages.insufficientFunds);
  });

  test('Should validate the cart is kept after a declined payment', { tag: '@regression' }, async ({ customerPages }) => {
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.fillAddress(address);
    await customerPages.checkoutPage.fillPayment({ ...payment, cardNumber: CARDS.declined });
    await customerPages.checkoutPage.submit.click();
    await Promise.all([
      expect.soft(customerPages.checkoutPage.error).toBeVisible(),
      expect.soft(customerPages.checkoutPage.session.cartCount).toHaveText('2'),
    ]);
  });

  test('Should switch the shipping cost when choosing express', { tag: '@regression' }, async ({ customerPages }) => {
    await customerPages.checkoutPage.goto();
    await expect.soft(customerPages.checkoutPage.cart.shipping).toHaveText(customerPages.checkoutPage.money(500));
    await customerPages.checkoutPage.shippingOption('express').check();
    await expect(customerPages.checkoutPage.cart.shipping).toHaveText(customerPages.checkoutPage.money(1500));
  });

  test('Should validate the checkout request carries an idempotency key and the payload', { tag: '@regression' }, async ({ page, customerPages }) => {
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.fillAddress(address);
    await customerPages.checkoutPage.fillPayment(payment);
    const request = page.waitForRequest('**/api/checkout');
    await customerPages.checkoutPage.submit.click();
    const sent = await request;
    expect.soft(sent.headers()['idempotency-key']).toMatch(/^[\w-]{8,64}$/);
    expect.soft(sent.headers()['authorization']).toMatch(/^Bearer /);
    expect(sent.postDataJSON()).toMatchObject({ items: [{ productId: 6, quantity: 2 }], shippingMethod: 'standard' });
  });

  test('Should display an error when the checkout request times out', { tag: '@regression' }, async ({ page, customerPages }) => {
    await page.route('**/api/checkout', (route) => route.abort('timedout'));
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.fillAddress(address);
    await customerPages.checkoutPage.fillPayment(payment);
    await customerPages.checkoutPage.submit.click();
    await Promise.all([
      expect.soft(customerPages.checkoutPage.error).toBeVisible(),
      expect.soft(customerPages.checkoutPage.confirmation).toBeHidden(),
    ]);
  });

  test('Should display an error when the stock runs out before paying', { tag: '@regression' }, async ({ page, customerPages }) => {
    await page.route('**/api/checkout', (route) =>
      route.fulfill({ status: 409, json: { error: { code: 'INSUFFICIENT_STOCK', message: 'no stock', requestId: 'req_s' } } }),
    );
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.fillAddress(address);
    await customerPages.checkoutPage.fillPayment(payment);
    await customerPages.checkoutPage.submit.click();
    await expect(customerPages.checkoutPage.error).toContainText(messages.insufficientStock);
  });

  test('Should create an order with the coupon discount applied', { tag: '@regression' }, async ({ session, customerPages }) => {
    await session.seedCart([{ productId: 6, quantity: 1 }], 'SAVE10');
    await customerPages.checkoutPage.goto();
    await expect.soft(customerPages.checkoutPage.cart.discount).toBeVisible();
    await customerPages.checkoutPage.fillAddress(address);
    await customerPages.checkoutPage.fillPayment(payment);
    await customerPages.checkoutPage.submit.click();
    await expect(customerPages.checkoutPage.orderTotal).toHaveText(customerPages.checkoutPage.money(5351));
  });

  test('Should validate the available stock is reduced after a purchase', { tag: '@regression' }, async ({ customerPages, session }) => {
    await session.seedCart([{ productId: 5, quantity: 1 }]);
    await customerPages.shopPage.goto('&q=columna');
    const before = Number(((await customerPages.shopPage.stock(5).textContent()) ?? '').match(/\d+/)?.[0]);
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.fillAddress(address);
    await customerPages.checkoutPage.fillPayment(payment);
    await customerPages.checkoutPage.submit.click();
    await expect.soft(customerPages.checkoutPage.confirmation).toBeVisible();
    await customerPages.checkoutPage.continueShopping.click();
    await customerPages.shopPage.goto('&q=columna');
    await expect(customerPages.shopPage.stock(5)).toContainText(String(before - 1));
  });
});
