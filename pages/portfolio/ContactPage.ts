import { Page, Locator } from '@playwright/test';
import { PortfolioBasePage } from './PortfolioBasePage';

export class ContactPage extends PortfolioBasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly messageInput: Locator;
  readonly submitBtn: Locator;
  readonly formStatus: Locator;
  readonly errorName: Locator;
  readonly errorEmail: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('#name');
    this.emailInput = page.locator('#email');
    this.messageInput = page.locator('#message');
    this.submitBtn = page.locator('#form-submit-btn');
    this.formStatus = page.locator('#form-status');
    this.errorName = page.locator('#error-name');
    this.errorEmail = page.locator('#error-email');
    this.errorMessage = page.locator('#error-message');
  }

  async goto(lang: 'es' | 'en' = 'es'): Promise<void> {
    await this.navigate(`/contact?lang=${lang}`);
  }

  async fillForm(name: string, email: string, message: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.messageInput.fill(message);
  }

  async submit(): Promise<void> {
    await this.submitBtn.click();
  }

  async submitForm(name: string, email: string, message: string): Promise<void> {
    await this.fillForm(name, email, message);
    await this.submit();
  }
}
