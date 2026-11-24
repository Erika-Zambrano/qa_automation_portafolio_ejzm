import { type Locator, type Page } from '@playwright/test';
import { type Lang } from '../portfolio/PortfolioBasePage';
import { CartPanel } from './components/CartPanel';
import { PlaygroundBasePage } from './PlaygroundBasePage';

export class ShopPage extends PlaygroundBasePage {
  readonly cart: CartPanel;
  readonly search: Locator;
  readonly artist: Locator;
  readonly category: Locator;
  readonly sort: Locator;
  readonly inStock: Locator;
  readonly clearFilters: Locator;
  readonly count: Locator;
  readonly empty: Locator;
  readonly cards: Locator;
  readonly error: Locator;
  readonly retry: Locator;
  readonly next: Locator;
  readonly previous: Locator;
  readonly currentPage: Locator;

  constructor(page: Page, lang: Lang = 'es') {
    super(page, lang);
    this.cart = new CartPanel(page);
    this.search = page.getByTestId('filter-q');
    this.artist = page.getByTestId('filter-artist');
    this.category = page.getByTestId('filter-category');
    this.sort = page.getByTestId('filter-sort');
    this.inStock = page.getByTestId('filter-instock');
    this.clearFilters = page.getByTestId('filters-clear');
    this.count = page.getByTestId('results-count');
    this.empty = page.getByTestId('shop-empty');
    this.cards = page.locator('[data-testid^="product-card-"]');
    this.error = page.getByTestId('shop-error');
    this.retry = page.getByTestId('shop-retry');
    this.next = page.getByTestId('page-next');
    this.previous = page.getByTestId('page-prev');
    this.currentPage = page.getByTestId('page-current');
  }

  async goto(query = ''): Promise<void> {
    await this.page.goto(`/playground/shop?lang=${this.lang}${query}`);
    await this.title.waitFor({ state: 'visible' });
  }

  card(id: number): Locator {
    return this.page.getByTestId(`product-card-${id}`);
  }

  name(id: number): Locator {
    return this.page.getByTestId(`product-name-${id}`);
  }

  price(id: number): Locator {
    return this.page.getByTestId(`product-price-${id}`);
  }

  stock(id: number): Locator {
    return this.page.getByTestId(`product-stock-${id}`);
  }

  add(id: number): Locator {
    return this.page.getByTestId(`product-add-${id}`);
  }
}
