import { useLang } from '../../context/LangContext';
import { formatMoney } from '../api';
import { MAX_QTY, useCart, type CartEntry } from '../CartContext';

export function CartItem({ entry, readonly }: { entry: CartEntry; readonly?: boolean }) {
  const { t, lang } = useLang();
  const { setQuantity, remove } = useCart();
  const { product, quantity } = entry;
  const id = product.id;
  const max = Math.min(MAX_QTY, product.stock);

  return (
    <li className="pg-cart-item" data-testid={`cart-item-${id}`}>
      <div className="pg-cart-info">
        <strong data-testid={`cart-item-name-${id}`}>{product.name}</strong>
        <span className="pg-meta">{product.artist}</span>
      </div>
      {readonly ? (
        <span data-testid={`cart-item-qty-${id}`}>× {quantity}</span>
      ) : (
        <div className="pg-qty" role="group" aria-label={t('pg-qty')}>
          <button type="button" aria-label={t('pg-qty-dec')} disabled={quantity <= 1} data-testid={`cart-dec-${id}`} onClick={() => setQuantity(id, quantity - 1)}>
            −
          </button>
          <output aria-live="polite" data-testid={`cart-item-qty-${id}`}>{quantity}</output>
          <button type="button" aria-label={t('pg-qty-inc')} disabled={quantity >= max} data-testid={`cart-inc-${id}`} onClick={() => setQuantity(id, quantity + 1)}>
            +
          </button>
        </div>
      )}
      <span className="pg-line-total" data-testid={`cart-item-total-${id}`}>{formatMoney(product.price * quantity, lang)}</span>
      {!readonly && (
        <button type="button" className="pg-link" data-testid={`cart-remove-${id}`} onClick={() => remove(id)}>
          {t('pg-remove')}
        </button>
      )}
    </li>
  );
}
