import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import type { Translations } from '../../i18n/translations';
import { api, errorMessage } from '../api';
import { FormStatus } from '../components/FormStatus';
import { PlaygroundLayout } from '../components/PlaygroundLayout';

const pages: Array<{ to: string; id: string; title: keyof Translations; desc: keyof Translations }> = [
  { to: '/playground/shop', id: 'shop', title: 'pg-nav-shop', desc: 'pg-home-shop-desc' },
  { to: '/playground/checkout', id: 'checkout', title: 'pg-nav-checkout', desc: 'pg-home-checkout-desc' },
  { to: '/playground/forms', id: 'forms', title: 'pg-nav-forms', desc: 'pg-home-forms-desc' },
  { to: '/playground/login', id: 'login', title: 'pg-nav-login', desc: 'pg-home-login-desc' },
  { to: '/playground/signup', id: 'signup', title: 'pg-nav-signup', desc: 'pg-home-signup-desc' },
];

const data: Array<[keyof Translations, keyof Translations]> = [
  ['pg-home-users', 'pg-home-users-value'],
  ['pg-home-coupons', 'pg-home-coupons-value'],
  ['pg-home-cards', 'pg-home-cards-value'],
];

const tips: Array<keyof Translations> = ['pg-dt-network', 'pg-dt-console', 'pg-dt-storage', 'pg-dt-throttle', 'pg-dt-block', 'pg-dt-token'];

export function PlaygroundHome() {
  const { t, withLang } = useLang();
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  async function reset() {
    try {
      await api('/reset', { method: 'POST' });
      setStatus({ kind: 'success', text: t('pg-home-reset-done') });
    } catch (failure) {
      setStatus({ kind: 'error', text: errorMessage(failure, t) });
    }
  }

  return (
    <PlaygroundLayout title="pg-home-title" desc="pg-home-desc" testId="playground-home">
      <h2 className="pg-h2">{t('pg-home-pages')}</h2>
      <div className="pg-home-grid">
        {pages.map((page) => (
          <Link key={page.id} to={withLang(page.to)} className="pg-home-card" data-testid={`home-card-${page.id}`}>
            <strong>{t(page.title)}</strong>
            <span>{t(page.desc)}</span>
          </Link>
        ))}
      </div>

      <h2 className="pg-h2">{t('pg-home-data')}</h2>
      <dl className="pg-data" data-testid="test-data">
        {data.map(([label, value]) => (
          <div key={label}>
            <dt>{t(label)}</dt>
            <dd>{t(value)}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="pg-btn secondary" data-testid="reset-btn" onClick={() => void reset()}>
        {t('pg-home-reset')}
      </button>
      {status && <FormStatus kind={status.kind} text={status.text} testId="reset-status" />}

      <h2 className="pg-h2">{t('pg-home-devtools')}</h2>
      <ul className="pg-tips" data-testid="devtools-guide">
        {tips.map((tip) => (
          <li key={tip}>{t(tip)}</li>
        ))}
      </ul>
    </PlaygroundLayout>
  );
}
