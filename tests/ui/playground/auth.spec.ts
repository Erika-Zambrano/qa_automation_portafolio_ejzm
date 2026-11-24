import { randomUUID } from 'node:crypto';
import { USERS } from '../../../utils/playground-api';
import { test, expect } from '../fixtures/pomBuilder';
import { buttonName, messages } from '../test-data/playgroundTexts';

const strong = 'Abcdef1!x';
const uniqueEmail = () => `qa-${randomUUID().slice(0, 8)}@x.co`;

test.describe('Login', () => {
  test('Should navigate to the gallery after a valid login', { tag: '@smoke' }, async ({ page, guestPages }) => {
    await guestPages.loginPage.goto();
    await guestPages.loginPage.login(USERS.user.email, USERS.user.password);
    await Promise.all([
      expect.soft(page).toHaveURL(/\/playground\/shop/),
      expect.soft(guestPages.shopPage.session.user).toContainText(USERS.user.email),
    ]);
  });

  test('Should display an error for wrong credentials', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.loginPage.goto();
    await guestPages.loginPage.login(USERS.user.email, 'Wrong-pass1!');
    await Promise.all([
      expect.soft(guestPages.loginPage.error).toBeVisible(),
      expect.soft(guestPages.loginPage.error).toContainText(messages.invalidCredentials),
    ]);
  });

  test('Should display an error for a locked account', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.loginPage.goto();
    await guestPages.loginPage.login(USERS.locked.email, USERS.locked.password);
    await expect(guestPages.loginPage.error).toContainText(messages.accountLocked);
  });

  test('Should validate the empty form shows field errors', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.loginPage.goto();
    await guestPages.loginPage.generic.button(buttonName.login).click();
    await Promise.all([
      expect.soft(guestPages.loginPage.fieldError('email')).toBeVisible(),
      expect.soft(guestPages.loginPage.fieldError('password')).toBeVisible(),
    ]);
  });

  test('Should switch the password visibility with the toggle', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.loginPage.goto();
    await guestPages.loginPage.password.fill('secret');
    await expect.soft(guestPages.loginPage.password).toHaveAttribute('type', 'password');
    await guestPages.loginPage.togglePassword.click();
    await expect(guestPages.loginPage.password).toHaveAttribute('type', 'text');
  });

  test('Should navigate back to the requested page after logging in', { tag: '@regression' }, async ({ page, session, guestPages }) => {
    await session.seedCart([{ productId: 6, quantity: 1 }]);
    await guestPages.checkoutPage.goto();
    await guestPages.checkoutPage.loginLink.click();
    await guestPages.loginPage.login(USERS.user.email, USERS.user.password);
    await expect(page).toHaveURL(/\/playground\/checkout/);
  });

  test('Should display the logged out state after logging out', { tag: '@regression' }, async ({ customerPages }) => {
    await customerPages.shopPage.goto();
    await expect.soft(customerPages.shopPage.session.user).toContainText(USERS.user.email);
    await customerPages.shopPage.session.logout.click();
    await expect(customerPages.shopPage.session.login).toBeVisible();
  });

  test('Should display the login requirement when the token is rejected', { tag: '@regression' }, async ({ page, session, customerPages }) => {
    await session.seedCart([{ productId: 6, quantity: 1 }]);
    await page.route('**/api/checkout', (route) =>
      route.fulfill({ status: 401, json: { error: { code: 'TOKEN_EXPIRED', message: 'expired', requestId: 'req_1' } } }),
    );
    await customerPages.checkoutPage.goto();
    await customerPages.checkoutPage.fillAddress({ fullName: 'Ada Lovelace', street: 'Calle 1', city: 'Madrid', zip: '28001', country: 'ES' });
    await customerPages.checkoutPage.fillPayment({ cardNumber: '4242424242424242', expiry: '12/40', cvv: '123' });
    await customerPages.checkoutPage.submit.click();
    await expect(customerPages.checkoutPage.loginRequired).toBeVisible();
  });
});

test.describe('Sign up', () => {
  test('Should create an account and sign in when the terms are accepted', { tag: '@smoke' }, async ({ guestPages }) => {
    await guestPages.signupPage.goto();
    await guestPages.signupPage.fill({ name: 'Ada Lovelace', email: uniqueEmail(), password: strong, confirmPassword: strong });
    await guestPages.signupPage.terms.check();
    await guestPages.signupPage.submit.click();
    await Promise.all([
      expect.soft(guestPages.signupPage.success).toBeVisible(),
      expect.soft(guestPages.signupPage.session.user).toContainText('@x.co'),
    ]);
  });

  test('Should validate the terms are mandatory', { tag: '@smoke' }, async ({ guestPages }) => {
    await guestPages.signupPage.goto();
    await guestPages.signupPage.fill({ name: 'Ada Lovelace', email: uniqueEmail(), password: strong, confirmPassword: strong });
    await guestPages.signupPage.submit.click();
    await Promise.all([
      expect.soft(guestPages.signupPage.termsError).toBeVisible(),
      expect.soft(guestPages.signupPage.termsError).toContainText(messages.termsRequired),
      expect.soft(guestPages.signupPage.success).toBeHidden(),
    ]);
  });

  test('Should display the terms and conditions when expanding the link', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.signupPage.goto();
    await expect.soft(guestPages.signupPage.termsPanel).toBeHidden();
    await guestPages.signupPage.termsToggle.click();
    await Promise.all([
      expect.soft(guestPages.signupPage.termsPanel).toBeVisible(),
      expect.soft(guestPages.signupPage.termsToggle).toHaveAttribute('aria-expanded', 'true'),
      expect.soft(guestPages.signupPage.terms).not.toBeChecked(),
    ]);
  });

  test('Should validate the empty form shows every required error', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.signupPage.goto();
    await guestPages.signupPage.submit.click();
    for (const name of ['name', 'email', 'password', 'confirmPassword']) await expect.soft(guestPages.signupPage.fieldError(name)).toBeVisible();
    await expect(guestPages.signupPage.termsError).toBeVisible();
  });

  test('Should validate a weak password is rejected', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.signupPage.goto();
    await guestPages.signupPage.fill({ name: 'Ada Lovelace', email: uniqueEmail(), password: 'password', confirmPassword: 'password' });
    await guestPages.signupPage.terms.check();
    await guestPages.signupPage.submit.click();
    await expect(guestPages.signupPage.fieldError('password')).toBeVisible();
  });

  test('Should validate mismatched passwords are rejected', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.signupPage.goto();
    await guestPages.signupPage.fill({ name: 'Ada Lovelace', email: uniqueEmail(), password: strong, confirmPassword: `${strong}x` });
    await guestPages.signupPage.terms.check();
    await guestPages.signupPage.submit.click();
    await expect(guestPages.signupPage.fieldError('confirmPassword')).toBeVisible();
  });

  test('Should display an error when the email is already registered', { tag: '@regression' }, async ({ guestPages }) => {
    await guestPages.signupPage.goto();
    await guestPages.signupPage.fill({ name: 'Ada Lovelace', email: USERS.user.email, password: strong, confirmPassword: strong });
    await guestPages.signupPage.terms.check();
    await guestPages.signupPage.submit.click();
    await expect(guestPages.signupPage.error).toBeVisible();
  });

  test('Should display an error when the server fails during sign up', { tag: '@regression' }, async ({ page, guestPages }) => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({ status: 500, json: { error: { code: 'INTERNAL', message: 'boom', requestId: 'req_9' } } }),
    );
    await guestPages.signupPage.goto();
    await guestPages.signupPage.fill({ name: 'Ada Lovelace', email: uniqueEmail(), password: strong, confirmPassword: strong });
    await guestPages.signupPage.terms.check();
    await guestPages.signupPage.submit.click();
    await Promise.all([
      expect.soft(guestPages.signupPage.error).toBeVisible(),
      expect.soft(guestPages.signupPage.error).toContainText('req_9'),
    ]);
  });

  test('Should navigate between sign up and login', { tag: '@regression' }, async ({ page, guestPages }) => {
    await guestPages.signupPage.goto();
    await guestPages.signupPage.loginLink.click();
    await expect.soft(page).toHaveURL(/\/playground\/login/);
    await guestPages.loginPage.signupLink.click();
    await expect(page).toHaveURL(/\/playground\/signup/);
  });
});
