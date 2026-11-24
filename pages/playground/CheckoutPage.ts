import { type Locator, type Page } from '@playwright/test';
import { type Lang } from '../portfolio/PortfolioBasePage';
import { CartPanel } from './components/CartPanel';
import { PlaygroundBasePage } from './PlaygroundBasePage';

export type Address = { fullName: string; street: string; city: string; zip: string; country: string };
export type Payment = { cardNumber: string; expiry: string; cvv: string };

export class CheckoutPage extends PlaygroundBasePage {
  readonly cart: CartPanel;
  readonly form: Locator;
  readonly submit: Locator;
  readonly error: Locator;
  readonly loginRequired: Locator;
  readonly loginLink: Locator;
  readonly emptyNotice: Locator;
  readonly toShop: Locator;
  readonly confirmation: Locator;
  readonly orderId: Locator;
  readonly orderTotal: Locator;
  readonly continueShopping: Locator;

  constructor(page: Page, lang: Lang = 'es') {
    super(page, lang);
    this.cart = new CartPanel(page);
    this.form = page.getByTestId('checkout-form');
    this.submit = page.getByTestId('checkout-submit');
    this.error = page.getByTestId('checkout-error');
    this.loginRequired = page.getByTestId('checkout-login-required');
    this.loginLink = page.getByTestId('checkout-login-link');
    this.emptyNotice = page.getByTestId('checkout-empty');
    this.toShop = page.getByTestId('checkout-to-shop');
    this.confirmation = page.getByTestId('order-confirmation');
    this.orderId = page.getByTestId('order-id');
    this.orderTotal = page.getByTestId('order-total');
    this.continueShopping = page.getByTestId('order-continue');
  }

  async goto(): Promise<void> {
    await this.open('/playground/checkout');
  }

  field(name: string): Locator {
    return this.page.getByTestId(`input-${name}`);
  }

  fieldError(name: string): Locator {
    return this.page.getByTestId(`error-${name}`);
  }

  shippingOption(method: 'standard' | 'express'): Locator {
    return this.page.getByTestId(`ship-${method}`);
  }

  orderLine(productId: number): Locator {
    return this.page.getByTestId(`order-line-${productId}`);
  }

  async fillAddress(address: Address): Promise<void> {
    await this.field('fullName').fill(address.fullName);
    await this.field('street').fill(address.street);
    await this.field('city').fill(address.city);
    await this.field('zip').fill(address.zip);
    await this.field('country').selectOption(address.country);
  }

  async fillPayment(payment: Payment): Promise<void> {
    await this.field('cardNumber').fill(payment.cardNumber);
    await this.field('expiry').fill(payment.expiry);
    await this.field('cvv').fill(payment.cvv);
  }
}
