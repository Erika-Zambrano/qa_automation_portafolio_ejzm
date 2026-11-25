import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Html } from '../components/Html';
import { useLang } from '../context/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import ciData from '../data/ci-results.json';
import '../css/home.css';

const fill = (text: string, values: Record<string, number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));

function FolderLink({ to, className, children }: { to: string; className: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const start = (document as Document & { startViewTransition?: (cb: () => void) => unknown }).startViewTransition;
    if (!start || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.style.viewTransitionName = 'folder-open';
    document.querySelectorAll<HTMLElement>('.folder .tab[data-vt]').forEach((el) => {
      el.style.viewTransitionName = `tab-${el.dataset.vt}`;
    });
    start.call(document, () => flushSync(() => navigate(to)));
  };
  return <Link to={to} className={className} onClick={onClick}>{children}</Link>;
}

export function Home() {
  const { t, withLang } = useLang();
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  usePageTitle('Erika Zambrano — QA Automation Portfolio');
  const { passed, total, failed, skipped } = ciData.latest;
  const ciDesc = fill(t('proof-ci-desc'), { passed, total, failed, skipped });

  const proof = [
    { to: '/reports', result: `${passed}/${total}`, title: t('proof-ci-title'), desc: ciDesc, shot: '/shots/reports.jpg', alt: 'Reports dashboard with the latest CI run' },
    { to: '/playground', result: 'E2E / API', title: t('proof-pg-title'), desc: t('proof-pg-desc'), shot: '/shots/shop.jpg', alt: 'QA Playground shop with filters and product cards' },
    { to: '/reports', result: 'LLM', title: t('proof-eval-title'), desc: t('proof-eval-desc'), shot: '/shots/reports.jpg', alt: 'Reports dashboard with the AI evaluation tab' },
    { to: '/cv', result: 'ES / EN', title: t('proof-cv-title'), desc: t('proof-cv-desc'), shot: '/shots/cv.jpg', alt: 'Curriculum vitae page' },
  ];
  const folders = [
    { to: '/cv', result: proof[3].result, vt: 'cv', tab: 'CV' },
    { to: '/playground', result: proof[1].result, vt: 'playground', tab: t('pg-nav') },
    { to: '/contact', result: t('home-cta'), vt: 'contact', tab: t('nav-contact') },
  ];
  const front = proof[0];

  useEffect(() => {
    setReady(true);
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const stack = root?.querySelector<HTMLElement>('.stack');
    const home = document.querySelector<HTMLElement>('[data-testid="nav-home"]');
    if (!stack || !home) return;
    const tabs = Array.from(stack.querySelectorAll<HTMLElement>('.tab'));
    let slots: number[] = [];
    let dockTop = 12;
    let tabH = 44;
    const onScroll = () => {
      const stackLeft = stack.getBoundingClientRect().left;
      tabs.forEach((tab, i) => {
        const top = (tab.parentElement as HTMLElement).getBoundingClientRect().top - tabH;
        const docked = top <= dockTop;
        tab.classList.toggle('docked', docked);
        tab.style.left = `${docked ? slots[i] : slots[i] - stackLeft}px`;
      });
    };
    const layout = () => {
      const narrow = window.innerWidth <= 600;
      const gap = narrow ? 2 : 6;
      dockTop = narrow ? 8 : 12;
      tabH = tabs[0].offsetHeight;
      let x = home.getBoundingClientRect().right + gap;
      slots = tabs.map((tab) => {
        const at = x;
        x += tab.offsetWidth + gap;
        return at;
      });
      onScroll();
    };
    layout();
    document.fonts?.ready.then(layout);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', layout);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', layout);
    };
  }, []);

  return (
    <div className={`home-page${ready ? ' rv' : ''}`} ref={rootRef}>
      <section className="hero" aria-labelledby="home-title">
        <h1 id="home-title" className="hero-name reveal">Erika Zambrano</h1>
        <p className="hero-sub reveal">
          <strong>{t('header-role')}.</strong> <Html as="span" k="about-text" />
        </p>
        <div className="cta-row reveal">
          <Link className="btn-primary" to={withLang('/contact')}>{t('home-cta')}</Link>
        </div>

        <div className="stack">
          {folders.map((f, i) => (
            <FolderLink key={f.vt} className={`folder folder-${i + 1} reveal`} to={withLang(f.to)}>
              <span className="tab" data-vt={f.vt}>{f.tab}{f.vt === 'playground' && <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 4l4 4 4-4" /></svg>}</span>
              <span className="folder-result">{f.result}</span>
            </FolderLink>
          ))}
          <div className="folder folder-front reveal">
            <h2 className="tab">{t('nav-reports')}</h2>
            <div className="front-grid">
              <div className="front-copy">
                <p className="front-result">{front.result}</p>
                <p className="front-desc">{front.desc}</p>
                <Link className="btn-link" to={withLang('/reports')}>{fill(t('hero-proof'), { passed, total })}</Link>
              </div>
              <img className="front-shot reveal" src="/shots/reports.jpg" alt={front.alt} width="1280" height="800" />
            </div>
          </div>
        </div>
      </section>

      <section className="index" id="proof" aria-labelledby="proof-heading">
        <h2 id="proof-heading" className="index-title reveal">{t('proof-title')}</h2>
        <div className="index-grid">
          <ul className="index-list">
            {proof.map((item, i) => (
              <li key={item.title} className="reveal">
                <Link
                  className={`index-row${active === i ? ' on' : ''}`}
                  to={withLang(item.to)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <span className="index-result">{item.result}</span>
                  <span className="index-body">
                    <span className="index-name">{item.title}</span>
                    <span className="index-desc">{item.desc}</span>
                  </span>
                </Link>
                <img className="index-inline" src={item.shot} alt={item.alt} loading="lazy" width="1280" height="800" />
              </li>
            ))}
          </ul>
          <div className="index-frame reveal" aria-hidden="true">
            {proof.map((item, i) => (
              <img
                key={item.title}
                className={`frame-img${active === i ? ' on' : ''}`}
                src={item.shot}
                alt=""
                loading="lazy"
                width="1280"
                height="800"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="close" id="contact" aria-labelledby="close-heading">
        <h2 id="close-heading" className="close-title reveal">{t('home-cta')}</h2>
        <div className="close-row reveal">
          <a className="close-mail" href="mailto:erikajzm@gmail.com">erikajzm@gmail.com</a>
          <Link className="btn-primary" to={withLang('/contact')}>{t('home-cta')}</Link>
          <Link className="btn-link light" to={withLang('/cv')}>{t('home-cv')}</Link>
        </div>
      </section>

      <footer className="back">
        <p className="back-name reveal">Erika Zambrano</p>
        <div className="footer-inner">
          <span className="footer-copy">{t('footer-copy')}</span>
          <nav className="footer-links" aria-label="Footer links">
            <a href="https://www.linkedin.com/in/erikazambrano/" target="_blank" rel="noopener">LinkedIn</a>
            <a href="https://github.com/Erika-Zambrano" target="_blank" rel="noopener">GitHub</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
