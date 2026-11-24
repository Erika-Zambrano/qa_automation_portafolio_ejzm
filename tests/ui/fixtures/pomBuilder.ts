import { test as base, expect, type Page } from '@playwright/test';
import { ContactPage } from '../../../pages/portfolio/ContactPage';
import { CvPage } from '../../../pages/portfolio/CvPage';
import { PortfolioBasePage, type Lang } from '../../../pages/portfolio/PortfolioBasePage';

class PomBuilder {
  private readonly instances = new Map<string, unknown>();

  constructor(
    private readonly page: Page,
    private readonly lang: Lang,
  ) {}

  private resolve<T>(key: string, create: () => T): T {
    if (!this.instances.has(key)) this.instances.set(key, create());
    return this.instances.get(key) as T;
  }

  get base(): PortfolioBasePage {
    return this.resolve('base', () => new PortfolioBasePage(this.page, this.lang));
  }

  get cv(): CvPage {
    return this.resolve('cv', () => new CvPage(this.page, this.lang));
  }

  get contact(): ContactPage {
    return this.resolve('contact', () => new ContactPage(this.page, this.lang));
  }
}

type Fixtures = { pom: PomBuilder };
type Options = { lang: Lang };

export const test = base.extend<Fixtures & Options>({
  lang: ['es', { option: true }],
  pom: async ({ page, lang }, use) => {
    await use(new PomBuilder(page, lang));
  },
});

export { expect };
