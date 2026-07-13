import { Page, Locator } from '@playwright/test';

export class PortfolioBasePage {
  readonly topbar: Locator;
  readonly navHome: Locator;
  readonly navCv: Locator;
  readonly navContact: Locator;
  readonly navReports: Locator;
  readonly langBtn: Locator;
  readonly langDropdown: Locator;
  readonly langOptionEs: Locator;
  readonly langOptionEn: Locator;

  constructor(protected readonly page: Page) {
    this.topbar = page.getByTestId('topbar');
    this.navHome = page.getByTestId('nav-home');
    this.navCv = page.getByTestId('nav-cv');
    this.navContact = page.getByTestId('nav-contact');
    this.navReports = page.getByTestId('nav-reports');
    this.langBtn = page.getByTestId('lang-btn');
    this.langDropdown = page.getByTestId('lang-dropdown');
    this.langOptionEs = page.getByTestId('lang-option-es');
    this.langOptionEn = page.getByTestId('lang-option-en');
  }

  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async setLang(lang: 'es' | 'en'): Promise<void> {
    await this.page.evaluate((l) => localStorage.setItem('cv-lang', l), lang);
    await this.page.goto(this.page.url().split('?')[0] + `?lang=${lang}`);
    await this.page.waitForLoadState('networkidle');
  }

  async switchLangViaUI(lang: 'es' | 'en'): Promise<void> {
    await this.langBtn.click();
    await (lang === 'en' ? this.langOptionEn : this.langOptionEs).click();
    await this.page.waitForLoadState('networkidle');
  }

  async getCurrentLang(): Promise<string> {
    return this.page.locator('html').getAttribute('lang').then(v => v ?? 'es');
  }
}
