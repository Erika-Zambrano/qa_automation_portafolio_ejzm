import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Html } from '../components/Html';
import { useLang } from '../context/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import ciData from '../data/ci-results.json';

const evalFiles = import.meta.glob<{ summary: { cases: number } }>('../data/eval-results.json', { eager: true, import: 'default' });
const EVAL_CASES = Object.values(evalFiles)[0]?.summary.cases ?? 35;
import '../css/home.css';

const fill = (text: string, values: Record<string, number | string>) =>
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
  const { t, withLang, lang } = useLang();
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  usePageTitle('Erika Zambrano — QA Automation Portfolio');
  const { passed, total, failed, skipped } = ciData.latest;

  const pgApi = ciData.projects.filter((p) => p.name.startsWith('api-playground')).reduce((n, p) => n + p.total, 0);
  const pgE2e = ciData.projects.find((p) => p.name === 'playground')?.total ?? 0;
  const proof = [
    { to: '/playground', result: `${pgApi} API + ${pgE2e} E2E`, title: t('proof-pg-title'), desc: t('proof-pg-desc'), shot: `/shots/shop-${lang}.jpg`, alt: t('alt-shop') },
    { to: '/reports', result: 'LLM', title: t('proof-eval-title'), desc: t('proof-eval-desc'), shot: `/shots/eval-${lang}.jpg`, alt: t('alt-eval') },
    { to: '/cv', result: 'ES / EN', title: t('proof-cv-title'), desc: t('proof-cv-desc'), shot: `/shots/cv-${lang}.jpg`, alt: t('alt-cv') },
  ];
  const front = { result: `${passed}/${total}`, desc: fill(t('front-desc'), { failed, skipped }), shot: `/shots/reports-${lang}.jpg`, alt: t('alt-reports') };
  const folders = [
    { to: '/cv', result: 'ES / EN', line: t('proof-cv-desc'), vt: 'cv', tab: 'CV', peek: [t('peek-cv-1'), t('peek-cv-2')], shot: `/shots/cv-${lang}.jpg`, alt: t('alt-cv') },
    { to: '/playground', result: `${pgApi} API + ${pgE2e} E2E + ${EVAL_CASES} evals`, line: t('folder-pg-line'), vt: 'playground', tab: t('pg-nav'), peek: [fill(t('peek-pg-1'), { api: pgApi, e2e: pgE2e, evals: EVAL_CASES }), t('peek-pg-2')], shot: `/shots/shop-${lang}.jpg`, alt: t('alt-shop') },
    { to: '/contact', result: t('folder-contact-result'), line: t('folder-contact-line'), vt: 'contact', tab: t('nav-contact'), peek: [t('peek-ct-1'), t('peek-ct-2')], shot: `/shots/contact-${lang}.jpg`, alt: t('alt-contact') },
  ];

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
    const observer = new ResizeObserver(() => layout());
    observer.observe(home);
    tabs.forEach((tab) => observer.observe(tab));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', layout);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', layout);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const bg = video?.parentElement;
    if (!video || !bg) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      return;
    }
    const onTime = () => bg.classList.toggle('fade', video.duration - video.currentTime < 0.9);
    const onEnded = () => {
      video.currentTime = 0;
      void video.play();
      window.setTimeout(() => bg.classList.remove('fade'), 60);
    };
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEnded);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    const hero = rootRef.current?.querySelector<HTMLElement>('.hero');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (window.scrollY < window.innerHeight * 1.4) hero.style.setProperty('--sy', String(window.scrollY));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const stack = rootRef.current?.querySelector<HTMLElement>('.stack');
    if (!stack) return;
    const folders = Array.from(stack.querySelectorAll<HTMLElement>('.folder-1, .folder-2, .folder-3'));
    let current = -1;
    const open = (index: number) => {
      current = index;
      folders.forEach((f, i) => f.classList.toggle('is-open', i === index));
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      if (current >= 0) {
        const r = folders[current].getBoundingClientRect();
        const peek = folders[current].querySelector<HTMLElement>('.peek');
        const top = r.top - 44 - (peek?.offsetHeight ?? 0);
        if (event.clientY >= top && event.clientY <= r.bottom) return;
      }
      let hit = -1;
      folders.forEach((f, i) => {
        const r = f.getBoundingClientRect();
        if (event.clientY >= r.top - 44 && event.clientY <= r.bottom) hit = i;
      });
      if (hit !== current) open(hit);
    };
    const onLeave = () => open(-1);
    stack.addEventListener('pointermove', onMove);
    stack.addEventListener('pointerleave', onLeave);
    return () => {
      stack.removeEventListener('pointermove', onMove);
      stack.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className={`home-page${ready ? ' rv' : ''}`} ref={rootRef}>
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-bg" aria-hidden="true">
          <video ref={videoRef} muted playsInline autoPlay preload="auto" poster="/hero-folders-poster.webp">
            <source src="/hero-folders.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-copy">
          <h1 id="home-title" className="hero-name reveal">Erika Zambrano</h1>
          <p className="hero-sub reveal">
            <strong>{t('header-role')}.</strong> <Html as="span" k="about-text" />
          </p>
          <div className="cta-row reveal">
            <Link className="btn-primary" to={withLang('/cv')}>{t('cta-cv')}</Link>
          </div>
          <Link className="hero-proof reveal" to={withLang('/reports')}>
            {fill(t('chip-tests'), { n: `${passed}/${total}` })} + {fill(t('chip-evals'), { n: EVAL_CASES })}
          </Link>
        </div>
      </section>

      <section className="stack-section" aria-label={t('proof-title')}>
        <div className="stack">
          {folders.map((f, i) => (
            <FolderLink key={f.vt} className={`folder folder-${i + 1}`} to={withLang(f.to)}>
              <span className="tab" data-vt={f.vt}>{f.tab}{f.vt === 'playground' && <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 4l4 4 4-4" /></svg>}</span>
              <span className="folder-line">{f.line}</span>
              <span className="folder-result">{f.result}</span>
              <span className="peek" aria-hidden="true">
                <span className="peek-text">
                  <span className="peek-lead">{f.peek[0]}</span>
                  <span className="peek-sub">{f.peek[1]}</span>
                </span>
                <span className="peek-shot"><img src={f.shot} alt="" loading="lazy" width="1280" height="800" /></span>
              </span>
            </FolderLink>
          ))}
          <div className="folder folder-front">
            <Link className="tab" to={withLang('/reports')}>{t('nav-reports')}</Link>
            <h2 className="sr-only">{t('proof-ci-title')}</h2>
            <div className="front-grid">
              <div className="front-copy">
                <p className="front-result reveal">{front.result}</p>
                <p className="front-desc reveal">{front.desc}</p>
                <Link className="btn-link" to={withLang('/reports')}>{t('front-link')}</Link>
              </div>
              <Link className="front-shot-link" to={withLang('/reports')}>
                <img className="front-shot reveal" src={front.shot} alt={front.alt} width="1280" height="800" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="index" id="proof" aria-labelledby="proof-heading">
        <h2 id="proof-heading" className="index-title reveal">{t('proof-title')}</h2>
        <p className="sr-only" aria-live="polite">{proof[active].title}</p>
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
        <h2 id="close-heading" className="close-title reveal">{t('close-title')}</h2>
        <p className="close-line reveal">{t('close-line')}</p>
        <div className="close-row reveal">
          <Link className="btn-primary" to={withLang('/cv')}>{t('cta-cv')}</Link>
          <a className="close-mail" href="mailto:erikajzm@gmail.com">erikajzm@gmail.com</a>
        </div>
        <footer className="close-foot">
          <span className="footer-copy">{t('footer-copy')}</span>
          <nav className="footer-links" aria-label="Footer links">
            <a href="https://www.linkedin.com/in/erikazambrano/" target="_blank" rel="noopener">LinkedIn</a>
            <a href="https://github.com/Erika-Zambrano" target="_blank" rel="noopener">GitHub</a>
          </nav>
        </footer>
      </section>

    </div>
  );
}
