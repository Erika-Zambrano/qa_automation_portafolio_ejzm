import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { api, ApiFailure, errorMessage, formatMoney } from '../api';
import { useCart } from '../CartContext';
import { usePricing } from '../usePricing';
import type { Pricing, ShippingMethod } from '../types';
import { CartItem } from './CartItem';
import { FormStatus } from './FormStatus';

type Props = { shippingMethod?: ShippingMethod; readonly?: boolean; showCheckout?: boolean };

export function CartSummary({ shippingMethod = 'standard', readonly, showCheckout }: Props) {
  const { t, lang, withLang } = useLang();
  const { items, coupon, setCoupon, clear } = useCart();
  const { pricing, error, loading } = usePricing(shippingMethod);
  const [draft, setDraft] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  async function applyCoupon() {
    const code = draft.trim().toUpperCase();
    if (!code) return;
    try {
      await api<Pricing>('/cart/price', {
        method: 'POST',
        body: { items: items.map((e) => ({ productId: e.product.id, quantity: e.quantity })), coupon: code, shippingMethod },
      });
      setCoupon(code);
      setCouponError(null);
      setDraft('');
    } catch (failure) {
      setCouponError(errorMessage(failure, t));
    }
  }

  const money = (cents: number) => formatMoney(cents, lang);

  return (
    <aside className="pg-cart" aria-label={t('pg-cart-title')} data-testid="cart-summary">
      <h2>{t('pg-cart-title')}</h2>
      {items.length === 0 ? (
        <p className="pg-muted" data-testid="cart-empty">{t('pg-cart-empty')}</p>
      ) : (
        <>
          <ul className="pg-cart-list" data-testid="cart-list">
            {items.map((entry) => (
              <CartItem key={entry.product.id} entry={entry} readonly={readonly} />
            ))}
          </ul>

          {!readonly && (
            <div className="pg-coupon">
              {coupon ? (
                <p data-testid="coupon-applied">
                  {t('pg-coupon-applied')}: <strong>{coupon}</strong>{' '}
                  <button type="button" className="pg-link" data-testid="coupon-remove" onClick={() => setCoupon(null)}>
                    {t('pg-coupon-remove')}
                  </button>
                </p>
              ) : (
                <div className="pg-coupon-row">
                  <input
                    id="coupon"
                    aria-label={t('pg-coupon')}
                    placeholder={t('pg-coupon')}
                    value={draft}
                    data-testid="coupon-input"
                    onChange={(event) => setDraft(event.target.value)}
                  />
                  <button type="button" className="pg-btn secondary" data-testid="coupon-apply" onClick={() => void applyCoupon()}>
                    {t('pg-coupon-apply')}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="pg-error" role="alert" data-testid="coupon-error">
                  {couponError}
                </p>
              )}
            </div>
          )}

          {error && <FormStatus kind="error" text={errorMessage(error, t)} requestId={error instanceof ApiFailure ? error.requestId : undefined} testId="cart-error" />}

          {pricing && (
            <dl className="pg-totals" data-testid="cart-totals" aria-busy={loading}>
              <div><dt>{t('pg-subtotal')}</dt><dd data-testid="total-subtotal">{money(pricing.subtotal)}</dd></div>
              {pricing.discount > 0 && <div><dt>{t('pg-discount')}</dt><dd data-testid="total-discount">−{money(pricing.discount)}</dd></div>}
              <div><dt>{t('pg-shipping')}</dt><dd data-testid="total-shipping">{pricing.shipping === 0 ? t('pg-free') : money(pricing.shipping)}</dd></div>
              <div><dt>{t('pg-tax')}</dt><dd data-testid="total-tax">{money(pricing.tax)}</dd></div>
              <div className="grand"><dt>{t('pg-total')}</dt><dd data-testid="total-total">{money(pricing.total)}</dd></div>
            </dl>
          )}

          {!readonly && (
            <div className="pg-cart-actions">
              {showCheckout && (
                <Link to={withLang('/playground/checkout')} className="pg-btn" aria-disabled={!pricing} data-testid="go-checkout">
                  {t('pg-go-checkout')}
                </Link>
              )}
              <button type="button" className="pg-link" data-testid="cart-clear" onClick={clear}>
                {t('pg-clear-cart')}
              </button>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
