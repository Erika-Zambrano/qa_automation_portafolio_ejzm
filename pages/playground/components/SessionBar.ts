import { type Locator, type Page } from '@playwright/test';

export class SessionBar {
  readonly user: Locator;
  readonly cartCount: Locator;
  readonly cartLink: Locator;
  readonly logout: Locator;
  readonly login: Locator;

  constructor(page: Page) {
    this.user = page.getByTestId('session-user');
    this.cartCount = page.getByTestId('cart-count');
    this.cartLink = page.getByTestId('session-cart');
    this.logout = page.getByTestId('logout-btn');
    this.login = page.getByTestId('session-login');
  }
}
