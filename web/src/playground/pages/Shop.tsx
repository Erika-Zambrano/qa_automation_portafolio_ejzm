import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import type { Translations } from '../../i18n/translations';
import { api, ApiFailure, errorMessage } from '../api';
import { useCart } from '../CartContext';
import { CartSummary } from '../components/CartSummary';
import { FormStatus } from '../components/FormStatus';
import { Pagination } from '../components/Pagination';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES, type Product } from '../types';

type Meta = { page: number; pageSize: number; total: number; totalPages: number };
type Result = { data: Product[]; meta: Meta };

const SORTS: Array<[string, keyof Translations]> = [
  ['', 'pg-sort-default'],
  ['price', 'pg-sort-price-asc'],
  ['-price', 'pg-sort-price-desc'],
  ['year', 'pg-sort-year-asc'],
  ['-year', 'pg-sort-year-desc'],
  ['-rating', 'pg-sort-rating-desc'],
];

const FILTER_KEYS = ['q', 'artist', 'category', 'sort', 'inStock', 'page'];

export function Shop() {
  const { t } = useLang();
  const { items, add } = useCart();
  const [params, setParams] = useSearchParams();
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);

  const query = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  if (!query.has('pageSize')) query.set('pageSize', '6');
  const queryString = query.toString();

  useEffect(() => {
    api<Result>('/products?pageSize=50')
      .then(({ data }) => setArtists([...new Set(data.data.map((p) => p.artist))].sort()))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api<Result>(`/products?${queryString}`, { signal: controller.signal })
      .then(({ data }) => {
        setResult(data);
        setFailure(null);
      })
      .catch((error) => {
        if (error instanceof DOMException) return;
        setFailure(error as ApiFailure);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [queryString, attempt]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }

  function clearFilters() {
    const next = new URLSearchParams(params);
    FILTER_KEYS.forEach((key) => next.delete(key));
    setParams(next);
  }

  const hasFilters = FILTER_KEYS.some((key) => key !== 'page' && params.get(key));

  return (
    <PlaygroundLayout title="pg-shop-title" desc="pg-shop-desc" testId="playground-shop" wide>
      <div className="pg-shop">
        <div>
          <form className="pg-filters" role="search" onSubmit={(event) => event.preventDefault()} data-testid="filters">
            <label>
              {t('pg-filter-search')}
              <input type="search" value={params.get('q') ?? ''} placeholder={t('pg-filter-search-ph')} data-testid="filter-q" onChange={(event) => setFilter('q', event.target.value)} />
            </label>
            <label>
              {t('pg-filter-artist')}
              <select value={params.get('artist') ?? ''} data-testid="filter-artist" onChange={(event) => setFilter('artist', event.target.value)}>
                <option value="">{t('pg-filter-all')}</option>
                {artists.map((artist) => (
                  <option key={artist} value={artist}>{artist}</option>
                ))}
              </select>
            </label>
            <label>
              {t('pg-filter-category')}
              <select value={params.get('category') ?? ''} data-testid="filter-category" onChange={(event) => setFilter('category', event.target.value)}>
                <option value="">{t('pg-filter-all')}</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{t(`pg-cat-${category}` as keyof Translations)}</option>
                ))}
              </select>
            </label>
            <label>
              {t('pg-filter-sort')}
              <select value={params.get('sort') ?? ''} data-testid="filter-sort" onChange={(event) => setFilter('sort', event.target.value)}>
                {SORTS.map(([value, label]) => (
                  <option key={value} value={value}>{t(label)}</option>
                ))}
              </select>
            </label>
            <label className="pg-inline">
              <input type="checkbox" checked={params.get('inStock') === 'true'} data-testid="filter-instock" onChange={(event) => setFilter('inStock', event.target.checked ? 'true' : '')} />
              {t('pg-filter-instock')}
            </label>
            {hasFilters && (
              <button type="button" className="pg-link" data-testid="filters-clear" onClick={clearFilters}>
                {t('pg-clear')}
              </button>
            )}
          </form>

          {failure && (
            <>
              <FormStatus kind="error" text={errorMessage(failure, t)} requestId={failure.requestId} testId="shop-error" />
              <button type="button" className="pg-btn secondary" data-testid="shop-retry" onClick={() => setAttempt((n) => n + 1)}>
                {t('pg-retry')}
              </button>
            </>
          )}

          {!failure && (
            <section aria-busy={loading} aria-label={t('pg-shop-title')}>
              <p className="pg-muted" role="status" data-testid="results-count">
                {loading && !result ? t('pg-loading') : `${result?.meta.total ?? 0} ${t('pg-results')}`}
              </p>
              {result && result.data.length === 0 && <p data-testid="shop-empty">{t('pg-empty')}</p>}
              <div className="pg-grid" data-testid="product-grid">
                {result?.data.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    inCart={items.find((entry) => entry.product.id === product.id)?.quantity ?? 0}
                    onAdd={add}
                  />
                ))}
              </div>
              {result && result.meta.totalPages > 1 && (
                <Pagination page={result.meta.page} totalPages={result.meta.totalPages} onChange={(page) => setFilter('page', String(page))} />
              )}
            </section>
          )}
        </div>
        <CartSummary showCheckout />
      </div>
    </PlaygroundLayout>
  );
}
