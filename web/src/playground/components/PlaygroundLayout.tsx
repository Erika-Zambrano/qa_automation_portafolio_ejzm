import type { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { Translations } from '../../i18n/translations';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import '../../css/playground.css';

type Props = { title: keyof Translations; desc?: keyof Translations; testId: string; wide?: boolean; children: ReactNode };

export function PlaygroundLayout({ title, desc, testId, wide, children }: Props) {
  const { t, withLang } = useLang();
  const { session, signOut } = useAuth();
  const { count } = useCart();
  usePageTitle(`${t(title)} — QA Playground`);

  return (
    <div className="pg-page" data-testid={testId}>
      <div className={`pg-wrapper${wide ? ' wide' : ''}`}>
        <div className="pg-session" data-testid="session-bar">
          <span className="pg-session-user" data-testid="session-user">
            {session ? `${t('pg-session-as')}: ${session.user.email}` : t('pg-session-guest')}
          </span>
          <span className="pg-session-actions">
            <Link to={withLang('/playground/shop')} className="pg-session-cart" data-testid="session-cart">
              {t('pg-cart')} <span className="pg-badge" data-testid="cart-count">{count}</span>
            </Link>
            {session ? (
              <button type="button" className="pg-link" data-testid="logout-btn" onClick={() => void signOut()}>
                {t('pg-logout')}
              </button>
            ) : (
              <Link to={withLang('/playground/login')} data-testid="session-login">
                {t('pg-login-link')}
              </Link>
            )}
          </span>
        </div>
        <p className="page-label">{t('pg-label')}</p>
        <h1 className="page-title" data-testid="page-title">{t(title)}</h1>
        {desc && <p className="page-desc">{t(desc)}</p>}
        <Box className="chakra-scope">{children}</Box>
      </div>
    </div>
  );
}
