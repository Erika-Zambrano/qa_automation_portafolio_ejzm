import { type Locator, type Page } from '@playwright/test';

export class CartPanel {
  readonly root: Locator;
  readonly empty: Locator;
  readonly items: Locator;
  readonly subtotal: Locator;
  readonly discount: Locator;
  readonly shipping: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly couponInput: Locator;
  readonly couponApply: Locator;
  readonly couponApplied: Locator;
  readonly couponError: Locator;
  readonly goCheckout: Locator;
  readonly clear: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByTestId('cart-summary');
    this.empty = page.getByTestId('cart-empty');
    this.items = page.getByTestId('cart-list').locator('li');
    this.subtotal = page.getByTestId('total-subtotal');
    this.discount = page.getByTestId('total-discount');
    this.shipping = page.getByTestId('total-shipping');
    this.tax = page.getByTestId('total-tax');
    this.total = page.getByTestId('total-total');
    this.couponInput = page.getByTestId('coupon-input');
    this.couponApply = page.getByTestId('coupon-apply');
    this.couponApplied = page.getByTestId('coupon-applied');
    this.couponError = page.getByTestId('coupon-error');
    this.goCheckout = page.getByTestId('go-checkout');
    this.clear = page.getByTestId('cart-clear');
  }

  quantity(id: number): Locator {
    return this.page.getByTestId(`cart-item-qty-${id}`).last();
  }

  increase(id: number): Locator {
    return this.page.getByTestId(`cart-inc-${id}`);
  }

  decrease(id: number): Locator {
    return this.page.getByTestId(`cart-dec-${id}`);
  }

  remove(id: number): Locator {
    return this.page.getByTestId(`cart-remove-${id}`);
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.couponApply.click();
  }
}
