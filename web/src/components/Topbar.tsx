import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import type { Lang } from '../i18n/translations';
import '../css/topbar.css';

const links = [
  { to: '/', id: 'nav-home', key: 'nav-home' as const },
  { to: '/cv', id: 'nav-cv', key: null },
  { to: '/contact', id: 'nav-contact', key: 'nav-contact' as const },
  { to: '/reports', id: 'nav-reports', key: 'nav-reports' as const },
];

const playgroundLinks = [
  { to: '/playground', id: 'home', key: 'pg-nav-home' as const },
  { to: '/playground/shop', id: 'shop', key: 'pg-nav-shop' as const },
  { to: '/playground/checkout', id: 'checkout', key: 'pg-nav-checkout' as const },
  { to: '/playground/forms', id: 'forms', key: 'pg-nav-forms' as const },
  { to: '/playground/login', id: 'login', key: 'pg-nav-login' as const },
  { to: '/playground/signup', id: 'signup', key: 'pg-nav-signup' as const },
];

const options: Array<{ lang: Lang; label: string }> = [
  { lang: 'es', label: 'ES — Español' },
  { lang: 'en', label: 'EN — English' },
];

export function Topbar() {
  const { lang, setLang, t, withLang } = useLang();
  const [open, setOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const inPlayground = pathname.startsWith('/playground');
  const isHome = pathname === '/';
  const tabName = (id: string) => (isHome ? undefined : { viewTransitionName: `tab-${id}` });

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const renderLink = (link: (typeof links)[number]) => (
    <NavLink
      key={link.id}
      to={withLang(link.to)}
      end={link.to === '/'}
      className={({ isActive }) => `topbar-link${isActive ? ' active' : ''}`}
      data-testid={link.id}
      style={tabName(link.id.replace('nav-', ''))}
    >
      {link.key ? t(link.key) : 'CV'}
    </NavLink>
  );

  return (
    <nav className={`topbar${isHome ? ' is-home' : ''}`} aria-label="Main navigation" data-testid="topbar">
      <div className="topbar-inner">
        {links.slice(0, 2).map(renderLink)}
        <div className="nav-menu" data-testid="nav-playground-menu" ref={menuRef}>
          <button
            type="button"
            className={`topbar-link nav-menu-btn${inPlayground ? ' active' : ''}${menuOpen ? ' open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="nav-playground-list"
            data-testid="nav-playground"
            style={tabName('playground')}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {t('pg-nav')}
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>
          <div className={`nav-menu-list${menuOpen ? ' open' : ''}`} id="nav-playground-list" role="menu" data-testid="nav-playground-list">
            {playgroundLinks.map((link) => (
              <NavLink
                key={link.id}
                to={withLang(link.to)}
                end={link.to === '/playground'}
                role="menuitem"
                className={({ isActive }) => `nav-menu-item${isActive ? ' active' : ''}`}
                data-testid={`nav-playground-${link.id}`}
              >
                {t(link.key)}
              </NavLink>
            ))}
          </div>
        </div>
        {links.slice(2).map(renderLink)}
        <div className="topbar-spacer" />
        <div className="lang-switcher" data-testid="lang-switcher" ref={switcherRef}>
          <button
            className={`lang-btn${open ? ' open' : ''}`}
            id="lang-btn"
            aria-haspopup="listbox"
            aria-expanded={open}
            data-testid="lang-btn"
            onClick={() => setOpen((v) => !v)}
          >
            <span id="lang-label">{lang.toUpperCase()}</span>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>
          <div className={`lang-dropdown${open ? ' open' : ''}`} id="lang-dropdown" role="listbox" data-testid="lang-dropdown">
            {options.map((option) => (
              <button
                key={option.lang}
                className={`lang-option${lang === option.lang ? ' selected' : ''}`}
                role="option"
                aria-selected={lang === option.lang}
                data-testid={`lang-option-${option.lang}`}
                onClick={() => {
                  setLang(option.lang);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
