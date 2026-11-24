import { Badge, Card } from '@chakra-ui/react';
import { Html } from '../components/Html';
import { useLang } from '../context/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import type { Translations } from '../i18n/translations';
import '../css/home.css';

const suites: Array<{ key: keyof Translations; type: string; tag: string; file: string }> = [
  { key: 'card1-title', type: 'UI', tag: '@smoke', file: 'tests/ui/portfolio/navigation.spec.ts' },
  { key: 'card2-title', type: 'UI', tag: '@regression', file: 'tests/ui/portfolio/cv.spec.ts' },
  { key: 'card3-title', type: 'API', tag: '@sanity', file: 'tests/api/public-api.spec.ts' },
];

const stack: Array<{ name: string; key?: keyof Translations; text?: string }> = [
  { name: 'Playwright', key: 'stack-pw' },
  { name: 'TypeScript', key: 'stack-ts' },
  { name: 'GitHub Actions', text: 'CI/CD' },
  { name: 'Page Object Model', key: 'stack-pom' },
  { name: 'REST API Testing', key: 'stack-api' },
];

export function Home() {
  const { t } = useLang();
  usePageTitle('Erika Zambrano — QA Automation Portfolio');

  return (
    <div className="home-page">
      <header>
        <div className="container">
          <h1 className="header-name">Erika Zambrano</h1>
          <Html as="p" k="header-role" className="header-role" />
          <nav className="header-links" aria-label="Contact links">
            <a href="https://www.linkedin.com/in/erikazambrano/" target="_blank" rel="noopener">LinkedIn</a>
            <a href="https://github.com/Erika-Zambrano" target="_blank" rel="noopener">GitHub</a>
            <a href="mailto:erikajzm@gmail.com">erikajzm@gmail.com</a>
          </nav>
        </div>
      </header>

      <section id="about">
        <div className="container">
          <Html as="p" k="about-label" className="section-label" />
          <Html as="p" k="about-text" />
        </div>
      </section>

      <section id="suites">
        <div className="container">
          <Html as="p" k="suites-label" className="section-label" />
          <Html as="h2" k="suites-title" className="section-title" />
          <div className="cards">
            {suites.map((suite) => (
              <Card.Root key={suite.file} variant="elevated" bg="white">
                <Card.Body gap="1" p="5">
                  <div className="card-header">
                    <span className="card-title">{t(suite.key)}</span>
                    <div className="badges">
                      <Badge variant="subtle">{suite.type}</Badge>
                      <Badge colorPalette="teal" variant="subtle">{suite.tag}</Badge>
                    </div>
                  </div>
                  <p className="card-file">{suite.file}</p>
                </Card.Body>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>

      <section id="ci">
        <div className="container">
          <Html as="p" k="ci-label" className="section-label" />
          <Html as="h2" k="ci-title" className="section-title" />
          <Html as="p" k="ci-desc" className="ci-description" />
          <div className="ci-badge-row">
            <img
              src="https://github.com/Erika-Zambrano/qa-automation-portfolio/actions/workflows/playwright.yml/badge.svg"
              alt="CI status badge"
              height="20"
            />
            <a href="https://github.com/Erika-Zambrano/qa-automation-portfolio" target="_blank" rel="noopener">
              {t('ci-link')}
            </a>
          </div>
        </div>
      </section>

      <section id="stack">
        <div className="container">
          <Html as="p" k="stack-label" className="section-label" />
          <Html as="h2" k="stack-title" className="section-title" />
          <ul className="stack-list">
            {stack.map((item) => (
              <li key={item.name} className="stack-item">
                <span className="stack-name">{item.name}</span>
                <span className="stack-desc">{item.key ? t(item.key) : item.text}</span>
              </li>
            ))}
          </ul>
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
