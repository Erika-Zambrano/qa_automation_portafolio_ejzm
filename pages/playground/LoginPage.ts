import { type Locator, type Page } from '@playwright/test';
import { type Lang } from '../portfolio/PortfolioBasePage';
import { PlaygroundBasePage } from './PlaygroundBasePage';

export class LoginPage extends PlaygroundBasePage {
  readonly email: Locator;
  readonly password: Locator;
  readonly togglePassword: Locator;
  readonly submit: Locator;
  readonly error: Locator;
  readonly signupLink: Locator;

  constructor(page: Page, lang: Lang = 'es') {
    super(page, lang);
    this.email = page.getByTestId('input-email');
    this.password = page.getByTestId('input-password');
    this.togglePassword = page.getByTestId('toggle-password');
    this.submit = page.getByTestId('login-submit');
    this.error = page.getByTestId('login-error');
    this.signupLink = page.getByTestId('link-signup');
  }

  async goto(next?: string): Promise<void> {
    await this.page.goto(`/playground/login?lang=${this.lang}${next ? `&next=${encodeURIComponent(next)}` : ''}`);
    await this.title.waitFor({ state: 'visible' });
  }

  fieldError(name: string): Locator {
    return this.page.getByTestId(`error-${name}`);
  }

  async login(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
