import { type Locator, type Page } from '@playwright/test';
import { type Lang } from '../portfolio/PortfolioBasePage';
import { PlaygroundBasePage } from './PlaygroundBasePage';

export type RequestData = {
  fullName: string;
  email: string;
  country: string;
  gender: string;
  interests: string[];
  birthDate: string;
  collectingYears?: string;
  message?: string;
  newsletter?: boolean;
};

export class FormsPage extends PlaygroundBasePage {
  readonly form: Locator;
  readonly submit: Locator;
  readonly success: Locator;
  readonly receiptId: Locator;
  readonly reset: Locator;
  readonly error: Locator;
  readonly terms: Locator;
  readonly termsToggle: Locator;
  readonly termsPanel: Locator;
  readonly termsError: Locator;
  readonly attachment: Locator;

  constructor(page: Page, lang: Lang = 'es') {
    super(page, lang);
    this.form = page.getByTestId('request-form');
    this.submit = page.getByTestId('forms-submit');
    this.success = page.getByTestId('forms-success');
    this.receiptId = page.getByTestId('forms-receipt-id');
    this.reset = page.getByTestId('forms-reset');
    this.error = page.getByTestId('forms-error');
    this.terms = page.getByTestId('input-acceptTerms');
    this.termsToggle = page.getByTestId('terms-toggle');
    this.termsPanel = page.getByTestId('terms-panel');
    this.termsError = page.getByTestId('error-acceptTerms');
    this.attachment = page.getByTestId('input-attachment');
  }

  async goto(): Promise<void> {
    await this.open('/playground/forms');
  }

  field(name: string): Locator {
    return this.page.getByTestId(`input-${name}`);
  }

  fieldError(name: string): Locator {
    return this.page.getByTestId(`error-${name}`);
  }

  gender(value: string): Locator {
    return this.page.getByTestId(`gender-${value}`);
  }

  interest(value: string): Locator {
    return this.page.getByTestId(`interest-${value}`);
  }

  async fill(data: RequestData): Promise<void> {
    await this.field('fullName').fill(data.fullName);
    await this.field('email').fill(data.email);
    await this.field('country').selectOption(data.country);
    await this.gender(data.gender).check();
    for (const interest of data.interests) await this.interest(interest).check();
    await this.field('birthDate').fill(data.birthDate);
    if (data.collectingYears) await this.field('collectingYears').fill(data.collectingYears);
    if (data.message) await this.field('message').fill(data.message);
    if (data.newsletter) await this.field('newsletter').check();
  }
}
