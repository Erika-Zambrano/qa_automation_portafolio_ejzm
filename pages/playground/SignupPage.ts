import { type Locator, type Page } from '@playwright/test';
import { type Lang } from '../portfolio/PortfolioBasePage';
import { PlaygroundBasePage } from './PlaygroundBasePage';

export type SignupData = { name: string; email: string; password: string; confirmPassword: string };

export class SignupPage extends PlaygroundBasePage {
  readonly submit: Locator;
  readonly success: Locator;
  readonly error: Locator;
  readonly terms: Locator;
  readonly termsToggle: Locator;
  readonly termsPanel: Locator;
  readonly termsError: Locator;
  readonly loginLink: Locator;

  constructor(page: Page, lang: Lang = 'es') {
    super(page, lang);
    this.submit = page.getByTestId('signup-submit');
    this.success = page.getByTestId('signup-success');
    this.error = page.getByTestId('signup-error');
    this.terms = page.getByTestId('input-acceptTerms');
    this.termsToggle = page.getByTestId('terms-toggle');
    this.termsPanel = page.getByTestId('terms-panel');
    this.termsError = page.getByTestId('error-acceptTerms');
    this.loginLink = page.getByTestId('link-login');
  }

  async goto(): Promise<void> {
    await this.open('/playground/signup');
  }

  field(name: string): Locator {
    return this.page.getByTestId(`input-${name}`);
  }

  fieldError(name: string): Locator {
    return this.page.getByTestId(`error-${name}`);
  }

  async fill(data: SignupData): Promise<void> {
    await this.field('name').fill(data.name);
    await this.field('email').fill(data.email);
    await this.field('password').fill(data.password);
    await this.field('confirmPassword').fill(data.confirmPassword);
  }
}
