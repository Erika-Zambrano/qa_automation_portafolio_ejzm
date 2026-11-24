import { randomUUID } from 'node:crypto';
import { test as base, expect, type Page } from '@playwright/test';
import { CheckoutPage } from '../../../pages/playground/CheckoutPage';
import { FormsPage } from '../../../pages/playground/FormsPage';
import { LoginPage } from '../../../pages/playground/LoginPage';
import { PlaygroundBasePage } from '../../../pages/playground/PlaygroundBasePage';
import { ShopPage } from '../../../pages/playground/ShopPage';
import { SignupPage } from '../../../pages/playground/SignupPage';
import { ContactPage } from '../../../pages/portfolio/ContactPage';
import { CvPage } from '../../../pages/portfolio/CvPage';
import { PortfolioBasePage, type Lang } from '../../../pages/portfolio/PortfolioBasePage';
import { createPlaygroundSession, type PlaygroundSession } from './playgroundSession';

export function pageObjectsInstantiation(page: Page, lang: Lang) {
  return {
    basePage: new PortfolioBasePage(page, lang),
    cvPage: new CvPage(page, lang),
    contactPage: new ContactPage(page, lang),
    playgroundPage: new PlaygroundBasePage(page, lang),
    shopPage: new ShopPage(page, lang),
    checkoutPage: new CheckoutPage(page, lang),
    formsPage: new FormsPage(page, lang),
    loginPage: new LoginPage(page, lang),
    signupPage: new SignupPage(page, lang),
  };
}

export type PageObjects = ReturnType<typeof pageObjectsInstantiation>;

type Fixtures = { guestPages: PageObjects; customerPages: PageObjects; session: PlaygroundSession; isolatedRateLimit: void };
type Options = { lang: Lang };

export const test = base.extend<Fixtures & Options>({
  lang: ['es', { option: true }],
  guestPages: async ({ page, lang }, use) => use(pageObjectsInstantiation(page, lang)),
  customerPages: async ({ page, lang, session }, use) => {
    await session.signIn('user');
    await use(pageObjectsInstantiation(page, lang));
  },
  isolatedRateLimit: [
    async ({ page }, use) => {
      const key = randomUUID();
      await page.route('**/api/**', (route) => route.continue({ headers: { ...route.request().headers(), 'x-ratelimit-key': key } }));
      await use();
    },
    { auto: true },
  ],
  session: async ({ page }, use) => use(createPlaygroundSession(page)),
});

export { expect };
