import { type Locator, type Page } from '@playwright/test';
import { type Lang } from '../portfolio/PortfolioBasePage';
import { Generic } from './components/Generic';
import { PlaygroundMenu } from './components/PlaygroundMenu';
import { SessionBar } from './components/SessionBar';

export class PlaygroundBasePage {
  readonly topbar: Locator;
  readonly title: Locator;
  readonly menu: PlaygroundMenu;
  readonly session: SessionBar;
  readonly generic: Generic;

  constructor(
    protected readonly page: Page,
    protected readonly lang: Lang = 'es',
  ) {
    this.topbar = page.getByTestId('topbar');
    this.title = page.getByTestId('page-title');
    this.menu = new PlaygroundMenu(page);
    this.session = new SessionBar(page);
    this.generic = new Generic(page);
  }

  protected async open(path: string): Promise<void> {
    await this.page.goto(`${path}?lang=${this.lang}`);
    await this.title.waitFor({ state: 'visible' });
  }

  money(cents: number): string {
    return new Intl.NumberFormat(this.lang === 'es' ? 'es-ES' : 'en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  }
}
