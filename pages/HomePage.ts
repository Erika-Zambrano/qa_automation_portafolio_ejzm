import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly logo: Locator;
  readonly navMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.locator('a.navbar-brand');
    this.navMenu = page.getByRole('navigation').first();
  }

  async searchProduct(query: string): Promise<void> {
    await this.page.getByTestId('search-query').fill(query);
    await this.page.getByTestId('search-query').press('Enter');
  }

  async getProductCount(): Promise<number> {
    const products = this.page.getByTestId('product-name');
    await products.first().waitFor({ timeout: 10_000 });
    return products.count();
  }
}
