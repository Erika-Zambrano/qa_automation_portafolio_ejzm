import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import type { Lang } from '../i18n/translations';
import '../css/topbar.css';

const links = [
  { to: '/', id: 'nav-home', key: 'nav-home' as const },
  { to: '/cv', id: 'nav-cv', key: null },
  { to: '/contact', id: 'nav-contact', key: 'nav-contact' as const },
  { to: '/reports', id: 'nav-reports', key: 'nav-reports' as const },
];

const options: Array<{ lang: Lang; label: string }> = [
  { lang: 'es', label: 'ES — Español' },
  { lang: 'en', label: 'EN — English' },
];

export function Topbar() {
  const { lang, setLang, t, withLang } = useLang();
  const [open, setOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <nav className="topbar" aria-label="Main navigation" data-testid="topbar">
      <div className="topbar-inner">
        {links.map((link) => (
          <NavLink
            key={link.id}
            to={withLang(link.to)}
            end={link.to === '/'}
            className={({ isActive }) => `topbar-link${isActive ? ' active' : ''}`}
            data-testid={link.id}
          >
            {link.key ? t(link.key) : 'CV'}
          </NavLink>
        ))}
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
