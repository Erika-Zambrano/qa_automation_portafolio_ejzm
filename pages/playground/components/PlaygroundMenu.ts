import { expect, type Locator, type Page } from '@playwright/test';

export type PlaygroundLink = 'home' | 'shop' | 'checkout' | 'forms' | 'login' | 'signup';

export class PlaygroundMenu {
  readonly toggle: Locator;
  readonly list: Locator;

  constructor(private readonly page: Page) {
    this.toggle = page.getByTestId('nav-playground');
    this.list = page.getByTestId('nav-playground-list');
  }

  item(link: PlaygroundLink): Locator {
    return this.page.getByTestId(`nav-playground-${link}`);
  }

  async open(): Promise<void> {
    if ((await this.toggle.getAttribute('aria-expanded')) !== 'true') await this.toggle.click();
  }

  async goTo(link: PlaygroundLink): Promise<void> {
    await this.open();
    await this.item(link).click();
    await expect(this.toggle).toHaveAttribute('aria-expanded', 'false');
  }
}
