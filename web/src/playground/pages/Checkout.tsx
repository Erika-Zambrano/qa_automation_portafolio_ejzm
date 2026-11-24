import { useRef, useState, type FormEvent } from 'react';
import { Button, Input } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import type { Translations } from '../../i18n/translations';
import { api, ApiFailure, errorMessage, fieldErrors, formatMoney } from '../api';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { CartSummary } from '../components/CartSummary';
import { FormField } from '../components/FormField';
import { FormStatus } from '../components/FormStatus';
import { PlaygroundLayout } from '../components/PlaygroundLayout';
import { COUNTRIES, type Pricing, type ShippingMethod } from '../types';

type Order = { id: string; createdAt: string; pricing: Pricing; cardLast4: string };

const ADDRESS_FIELDS = ['fullName', 'street', 'city', 'zip', 'country'];

const empty = { fullName: '', street: '', city: '', zip: '', country: '', cardNumber: '', expiry: '', cvv: '' };

export function Checkout() {
  const { t, lang, withLang } = useLang();
  const { session, signOut } = useAuth();
  const { items, coupon, clear } = useCart();
  const [values, setValues] = useState(empty);
  const [method, setMethod] = useState<ShippingMethod>('standard');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [sending, setSending] = useState(false);
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);

  const update = (field: keyof typeof empty) => (value: string) => setValues((prev) => ({ ...prev, [field]: value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!session) return;
    const body = {
      items: items.map((e) => ({ productId: e.product.id, quantity: e.quantity })),
      ...(coupon ? { coupon } : {}),
      shippingMethod: method,
      shippingAddress: { fullName: values.fullName, street: values.street, city: values.city, zip: values.zip, country: values.country },
      payment: { cardNumber: values.cardNumber.replace(/\s/g, ''), expiry: values.expiry, cvv: values.cvv },
    };
    const fingerprint = JSON.stringify(body);
    if (!attempt.current || attempt.current.fingerprint !== fingerprint) {
      attempt.current = { fingerprint, key: crypto.randomUUID() };
    }
    setSending(true);
    setFailure(null);
    setErrors({});
    try {
      const { data } = await api<{ data: Order }>('/checkout', {
        method: 'POST',
        body,
        token: session.token,
        headers: { 'Idempotency-Key': attempt.current.key },
      });
      setOrder(data.data);
      clear();
      attempt.current = null;
    } catch (error) {
      const found = error as ApiFailure;
      setFailure(found);
      setErrors(fieldErrors(error, t));
      if (['UNAUTHORIZED', 'TOKEN_INVALID', 'TOKEN_EXPIRED'].includes(found.code)) void signOut();
    } finally {
      setSending(false);
    }
  }

  if (order) {
    return (
      <PlaygroundLayout title="pg-checkout-title" testId="playground-checkout">
        <section className="pg-confirmation" data-testid="order-confirmation">
          <FormStatus kind="success" text={t('pg-order-ok')} testId="order-status" />
          <dl className="pg-data">
            <div>
              <dt>{t('pg-order-id')}</dt>
              <dd><code data-testid="order-id">{order.id}</code></dd>
            </div>
            <div>
              <dt>{t('pg-order-total')}</dt>
              <dd data-testid="order-total">{formatMoney(order.pricing.total, lang)}</dd>
            </div>
          </dl>
          <ul className="pg-cart-list">
            {order.pricing.lines.map((line) => (
              <li key={line.productId} className="pg-cart-item" data-testid={`order-line-${line.productId}`}>
                <div className="pg-cart-info"><strong>{line.name}</strong><span className="pg-meta">{line.artist}</span></div>
                <span>× {line.quantity}</span>
                <span className="pg-line-total">{formatMoney(line.lineTotal, lang)}</span>
              </li>
            ))}
          </ul>
          <Link to={withLang('/playground/shop')} className="pg-btn" data-testid="order-continue">{t('pg-order-again')}</Link>
        </section>
      </PlaygroundLayout>
    );
  }

  if (!session) {
    return (
      <PlaygroundLayout title="pg-checkout-title" desc="pg-checkout-desc" testId="playground-checkout">
        <p data-testid="checkout-login-required">{t('pg-checkout-login')}</p>
        <Link to={`${withLang('/playground/login')}&next=${encodeURIComponent('/playground/checkout')}`} className="pg-btn" data-testid="checkout-login-link">
          {t('pg-nav-login')}
        </Link>
      </PlaygroundLayout>
    );
  }

  if (items.length === 0) {
    return (
      <PlaygroundLayout title="pg-checkout-title" desc="pg-checkout-desc" testId="playground-checkout">
        <p data-testid="checkout-empty">{t('pg-checkout-empty')}</p>
        <Link to={withLang('/playground/shop')} className="pg-btn" data-testid="checkout-to-shop">{t('pg-nav-shop')}</Link>
      </PlaygroundLayout>
    );
  }

  const text = (name: keyof typeof empty, label: keyof Translations, extra: { autoComplete?: string; placeholder?: string; inputMode?: 'numeric' } = {}) => (
    <FormField name={name} label={t(label)} error={errors[ADDRESS_FIELDS.includes(name) ? `shippingAddress.${name}` : `payment.${name}`]} required>
      <Input id={name} name={name} bg="white" value={values[name]} data-testid={`input-${name}`} onChange={(e) => update(name)(e.target.value)} {...extra} />
    </FormField>
  );

  return (
    <PlaygroundLayout title="pg-checkout-title" desc="pg-checkout-desc" testId="playground-checkout" wide>
      <div className="pg-shop">
        <form id="checkout-form" noValidate onSubmit={onSubmit} className="pg-form" data-testid="checkout-form">
          <h2 className="pg-h2">{t('pg-ship-title')}</h2>
          {text('fullName', 'pg-f-fullname', { autoComplete: 'name' })}
          {text('street', 'pg-f-street', { autoComplete: 'street-address' })}
          {text('city', 'pg-f-city', { autoComplete: 'address-level2' })}
          {text('zip', 'pg-f-zip', { autoComplete: 'postal-code' })}
          <FormField name="country" label={t('pg-f-country')} error={errors['shippingAddress.country']} required>
            <select id="country" name="country" className="pg-select" value={values.country} data-testid="input-country" onChange={(e) => update('country')(e.target.value)}>
              <option value="">{t('pg-select')}</option>
              {COUNTRIES.map((code) => (
                <option key={code} value={code}>{t(`pg-country-${code}` as keyof Translations)}</option>
              ))}
            </select>
          </FormField>

          <fieldset className="pg-fieldset" data-testid="group-shippingMethod">
            <legend>{t('pg-ship-method')}</legend>
            <div className="pg-choices">
              {(['standard', 'express'] as const).map((option) => (
                <div className="pg-choice" key={option}>
                  <input id={`ship-${option}`} type="radio" name="shippingMethod" value={option} checked={method === option} data-testid={`ship-${option}`} onChange={() => setMethod(option)} />
                  <label htmlFor={`ship-${option}`}>{t(`pg-ship-${option}` as keyof Translations)}</label>
                </div>
              ))}
            </div>
          </fieldset>

          <h2 className="pg-h2">{t('pg-pay-title')}</h2>
          {text('cardNumber', 'pg-pay-card', { autoComplete: 'cc-number', inputMode: 'numeric', placeholder: '4242424242424242' })}
          {text('expiry', 'pg-pay-expiry', { autoComplete: 'cc-exp', placeholder: '12/30' })}
          {text('cvv', 'pg-pay-cvv', { autoComplete: 'cc-csc', inputMode: 'numeric' })}

          <Button type="submit" colorPalette="teal" loading={sending} loadingText={t('pg-paying')} data-testid="checkout-submit">
            {t('pg-pay-submit')}
          </Button>
          {failure && (
            <FormStatus
              kind="error"
              text={failure.code === 'VALIDATION_ERROR' ? t('pg-err-VALIDATION_ERROR') : errorMessage(failure, t)}
              requestId={failure.requestId}
              testId="checkout-error"
            />
          )}
        </form>
        <CartSummary shippingMethod={method} readonly />
      </div>
    </PlaygroundLayout>
  );
}
