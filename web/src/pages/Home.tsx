import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Html } from '../components/Html';
import { useLang } from '../context/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import ciData from '../data/ci-results.json';
import '../css/home.css';

const fill = (text: string, values: Record<string, number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));

export function Home() {
  const { t, withLang } = useLang();
  const [badgeOk, setBadgeOk] = useState(true);
  usePageTitle('Erika Zambrano — QA Automation Portfolio');
  const { passed, total, failed, skipped } = ciData.latest;
  const proof = [
    { to: '/reports', result: `${passed}/${total}`, title: t('proof-ci-title'), desc: fill(t('proof-ci-desc'), { passed, total, failed, skipped }) },
    { to: '/playground', result: 'E2E · API', title: t('proof-pg-title'), desc: t('proof-pg-desc') },
    { to: '/reports', result: 'LLM', title: t('proof-eval-title'), desc: t('proof-eval-desc') },
    { to: '/cv', result: 'ES · EN', title: t('proof-cv-title'), desc: t('proof-cv-desc') },
  ];

  return (
    <div className="home-page">
      <header>
        <div className="container">
          <h1 className="header-name">Erika Zambrano</h1>
          <Html as="p" k="header-role" className="header-role" />
          <Link className="hero-proof" to={withLang('/reports')}>
            {fill(t('hero-proof'), { passed, total })}
          </Link>
          <nav className="header-links" aria-label="Contact links">
            <a href="https://www.linkedin.com/in/erikazambrano/" target="_blank" rel="noopener">LinkedIn</a>
            <a href="https://github.com/Erika-Zambrano" target="_blank" rel="noopener">GitHub</a>
            <a href="mailto:erikajzm@gmail.com">erikajzm@gmail.com</a>
          </nav>
        </div>
      </header>

      <section id="about">
        <div className="container">
          <Html as="p" k="about-text" className="about-text" />
          <div className="cta-row">
            <Link className="btn-primary" to={withLang('/contact')}>{t('home-cta')}</Link>
            <Link className="btn-link" to={withLang('/cv')}>{t('home-cv')}</Link>
          </div>
        </div>
      </section>

      <section id="proof">
        <div className="container">
          <h2 className="section-title">{t('proof-title')}</h2>
          <ul className="proof-list">
            {proof.map((item) => (
              <li key={item.to}>
                <Link className="proof-row" to={withLang(item.to)}>
                  <span className="proof-result">{item.result}</span>
                  <span className="proof-body">
                    <span className="proof-title">{item.title}</span>
                    <span className="proof-desc">{item.desc}</span>
                  </span>
                  <span className="proof-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="ci">
        <div className="container">
          <Html as="h2" k="ci-title" className="section-title" />
          <Html as="p" k="ci-desc" className="ci-description" />
          <div className="ci-badge-row">
            {badgeOk && (
              <img
                src="https://github.com/Erika-Zambrano/qa-automation-portfolio/actions/workflows/playwright.yml/badge.svg"
                alt="CI status badge"
                height="20"
                onError={() => setBadgeOk(false)}
              />
            )}
            <a href="https://github.com/Erika-Zambrano/qa-automation-portfolio" target="_blank" rel="noopener">
              {t('ci-link')}
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-inner">
            <span className="footer-copy">{t('footer-copy')}</span>
            <nav className="footer-links" aria-label="Footer links">
              <a href="https://www.linkedin.com/in/erikazambrano/" target="_blank" rel="noopener">LinkedIn</a>
              <a href="https://github.com/Erika-Zambrano" target="_blank" rel="noopener">GitHub</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
