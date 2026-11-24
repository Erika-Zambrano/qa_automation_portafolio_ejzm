import { useLang } from '../../context/LangContext';
import type { Translations } from '../../i18n/translations';
import { formatMoney } from '../api';
import type { Product } from '../types';

type Props = { product: Product; inCart: number; onAdd: (product: Product) => void };

export function ProductCard({ product, inCart, onAdd }: Props) {
  const { t, lang } = useLang();
  const soldOut = product.stock === 0;
  const available = product.stock - inCart;
  const lastCopies = !soldOut && product.stock <= 5;

  return (
    <article className="pg-card" aria-label={product.name} data-testid={`product-card-${product.id}`}>
      <div className={`pg-art cat-${product.category}`} aria-hidden="true">
        <span>{product.year}</span>
      </div>
      <div className="pg-card-body">
        <h3 data-testid={`product-name-${product.id}`}>{product.name}</h3>
        <p className="pg-artist" data-testid={`product-artist-${product.id}`}>{product.artist}</p>
        <p className="pg-meta">{t(`pg-cat-${product.category}` as keyof Translations)} · ★ {product.rating.toFixed(1)}</p>
        <p className="pg-price" data-testid={`product-price-${product.id}`}>{formatMoney(product.price, lang)}</p>
        <p className={`pg-stock${soldOut ? ' out' : lastCopies ? ' low' : ''}`} data-testid={`product-stock-${product.id}`}>
          {soldOut ? t('pg-sold-out') : `${product.stock} ${t('pg-stock')}${lastCopies ? ` · ${t('pg-last-units')}` : ''}`}
        </p>
        <button
          type="button"
          className="pg-btn"
          disabled={soldOut || available <= 0}
          data-testid={`product-add-${product.id}`}
          onClick={() => onAdd(product)}
        >
          {t('pg-add')}
        </button>
      </div>
    </article>
  );
}
