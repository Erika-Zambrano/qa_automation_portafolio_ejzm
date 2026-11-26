import { useRef, useState, type KeyboardEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ButtonBar } from '../components/ButtonBar';
import { FolderHead } from '../components/FolderHead';
import { useLang } from '../context/LangContext';
import ci from '../data/ci-results.json';
import { cvContent, type TabId } from '../data/cv-content';
import { usePageTitle } from '../hooks/usePageTitle';
import '../css/cv.css';

const TAB_IDS: TabId[] = ['resumen', 'que-hago', 'stack', 'experiencia', 'proyectos'];

function Proof({ href, children }: { href: string; children: React.ReactNode }) {
  const { withLang } = useLang();
  if (href.startsWith('http')) {
    return <a href={href} target="_blank" rel="noopener">{children}</a>;
  }
  return <Link to={withLang(href)}>{children}</Link>;
}

export function Cv() {
  const { t, lang, withLang } = useLang();
  const c = cvContent[lang];
  const [params, setParams] = useSearchParams();
  const fromUrl = params.get('tab') as TabId | null;
  const [tab, setTab] = useState<TabId>(fromUrl && TAB_IDS.includes(fromUrl) ? fromUrl : 'resumen');
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({} as Record<TabId, HTMLButtonElement | null>);
  usePageTitle(lang === 'es' ? 'CV — Erika Zambrano' : 'Resume — Erika Zambrano');

  const select = (id: TabId, focus = false) => {
    setTab(id);
    const next = new URLSearchParams(params);
    next.set('tab', id);
    setParams(next, { replace: true });
    if (focus) tabRefs.current[id]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TAB_IDS.indexOf(tab);
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    if (e.key === 'Home') return select(TAB_IDS[0], true);
    if (e.key === 'End') return select(TAB_IDS[TAB_IDS.length - 1], true);
    if (e.key in moves) {
      e.preventDefault();
      select(TAB_IDS[(i + moves[e.key] + TAB_IDS.length) % TAB_IDS.length], true);
    }
  };

  const { passed, total } = ci.latest;
  const facts = [
    { value: `${passed} / ${total}`, label: c.ciLabel, href: '/reports' },
    ...c.facts.map((f) => ({ ...f, href: undefined as string | undefined })),
  ];

  return (
    <div className="cv-page">
      <FolderHead width={960}>
        <h1 className="page-title">Erika Zambrano</h1>
        <p className="page-desc">{c.title}</p>
      </FolderHead>

      <main className="cv-wrap">
        <div className="cv-tabs" role="tablist" aria-label={c.tabs.resumen} onKeyDown={onKey}>
          {TAB_IDS.map((id) => (
            <button
              key={id}
              ref={(el) => { tabRefs.current[id] = el; }}
              id={`cv-tab-${id}`}
              role="tab"
              type="button"
              className="cv-tab"
              aria-selected={tab === id}
              aria-controls="cv-panel"
              tabIndex={tab === id ? 0 : -1}
              onClick={() => select(id)}
            >
              {c.tabs[id]}
            </button>
          ))}
        </div>

        <div className="cv-panel" role="tabpanel" id="cv-panel" aria-labelledby={`cv-tab-${tab}`}>
          {tab === 'resumen' && (
            <>
              <section className="cv-intro" data-testid="section-profile">
                <p className="cv-summary">{c.summary}</p>
                <ButtonBar primary={{ label: c.linkedinCta, href: 'https://www.linkedin.com/in/erikazambrano/' }} />
                <ul className="cv-links">
                  <li><span>{t('location').replace('📍 ', '')}</span></li>
                  <li><a href="mailto:erikajzm@gmail.com">erikajzm@gmail.com</a></li>
                  <li><a href="https://github.com/Erika-Zambrano" target="_blank" rel="noopener">GitHub</a></li>
                </ul>
                <dl className="cv-facts">
                  {facts.map((f, i) => (
                    <div key={f.label} className={i === 0 ? 'lead' : undefined}>
                      <dt>{f.label}</dt>
                      <dd>{f.href ? <Link to={withLang(f.href)}>{f.value}</Link> : f.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="cv-block cv-before">
                <h2>{c.beforeTitle}</h2>
                <p>{c.beforeText}</p>
              </section>
              <section className="cv-block cv-base">
                <h2>{c.baseTitle}</h2>
                <ul>{c.base.map((b) => <li key={b}>{b}</li>)}</ul>
              </section>
            </>
          )}

          {tab === 'que-hago' && (
            <section className="cv-block">
              <h2>{c.areasTitle}</h2>
              <ul className="cv-areas">
                {c.areas.map((a) => (
                  <li key={a.name} className="cv-area">
                    <h3>{a.name}</h3>
                    <div>
                      <p>{a.result}</p>
                      <ul className="cv-tags">
                        {a.tags.map((tag) => <li key={tag}>{tag}</li>)}
                      </ul>
                      <p className="cv-proof"><Proof href={a.href}>{a.proof} →</Proof></p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tab === 'stack' && (
            <section className="cv-block">
              <h2>{c.stackTitle}</h2>
              <div className="cv-stack-group">
                <h3>{c.daily}</h3>
                {c.dailyGroups.map((g) => (
                  <div key={g.name} className="cv-group">
                    <h4>{g.name}</h4>
                    <ul className="cv-tags strong">{g.items.map((s) => <li key={s}>{s}</li>)}</ul>
                  </div>
                ))}
              </div>
              <div className="cv-stack-group">
                <h3>{c.used}</h3>
                {c.usedGroups.map((g) => (
                  <div key={g.name} className="cv-group">
                    <h4>{g.name}</h4>
                    <ul className="cv-tags">{g.items.map((s) => <li key={s}>{s}</li>)}</ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'experiencia' && (
            <>
              <section className="cv-block" data-testid="section-experience">
                <h2>{c.pathTitle}</h2>
                <ol className="cv-path">
                  {c.path.map((s) => (
                    <li key={s.role}>
                      <div className="cv-path-head">
                        <h3>{s.role}</h3>
                        <span className="cv-when">{s.when}</span>
                      </div>
                      <p className="cv-ctx">{s.context}</p>
                      <ul>{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="cv-block">
                <h2>{c.freelanceTitle}</h2>
                <ol className="cv-path cv-freelance">
                  {c.freelance.map((f) => (
                    <li key={f.name}>
                      <h3>{f.name}</h3>
                      <p className="cv-ctx">{f.context}</p>
                      <ul>{f.points.map((p) => <li key={p}>{p}</li>)}</ul>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}

          {tab === 'proyectos' && (
            <section className="cv-block" data-testid="section-projects">
              <h2>{c.projectsTitle}</h2>
              <ul className="cv-projects">
                {c.projects.map((p) => (
                  <li key={p.name}>
                    <h3>{p.name}</h3>
                    <p className="cv-ctx">{p.stack}</p>
                    {p.points ? (
                      <ul className="cv-bullets">{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                    ) : (
                      <p>{p.text}</p>
                    )}
                    {p.href && p.link && <p className="cv-proof"><Proof href={p.href}>{p.link} →</Proof></p>}
                  </li>
                ))}
              </ul>
              <aside className="cv-exploring">
                <h3>{c.exploring}</h3>
                <p>{c.exploringText}</p>
              </aside>
            </section>
          )}
        </div>
      </main>

      <section className="cv-close">
        <div className="cv-close-in">
          <h2>{c.closeTitle}</h2>
          <p>{c.closeText}</p>
          <ButtonBar variant="close" primary={{ label: c.closeContact, to: withLang('/contact') }}>
            <a className="close-mail" href="mailto:erikajzm@gmail.com">erikajzm@gmail.com</a>
          </ButtonBar>
        </div>
      </section>
    </div>
  );
}
