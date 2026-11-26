import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';

type CheckResult = { id: string; pass: boolean; detail: string };
type EvalRun = { output: string; checks: CheckResult[]; judge: { score: number; reason: string }; pass: boolean };
type EvalCase = { id: string; title: string; category: string; input: string; passRate: number; avgJudge: number; runs: EvalRun[] };
export type EvalData = {
  generatedAt: string;
  subjectModel: string;
  judgeModel: string;
  runsPerCase: number;
  judgePassScore: number;
  summary: { cases: number; totalRuns: number; passRate: number; avgJudge: number; deterministicChecks: number; deterministicPassed: number };
  cases: EvalCase[];
};

type CiRun = { generatedAt: string; commit: string | null; trigger?: string; runUrl?: string | null; total: number; passed: number; failed: number; flaky: number; skipped: number; wallDuration: number };
type CiFile = { file: string; total: number; passed: number; failed: number; flaky: number; duration: number; tags: string[] };
type CiTest = { file: string; title: string; project: string; status: string; duration: number; tags: string[] };
type CiProject = { name: string; total: number; passed: number; failed: number; flaky: number; duration: number };
export type CiData = { latest: CiRun; projects?: CiProject[]; files: CiFile[]; tests: CiTest[]; history: CiRun[] };

type Props = { lang: 'es' | 'en'; evalData: EvalData | null; ciData: CiData | null };

const copy = {
  es: {
    tabEval: 'Evaluación de IA',
    tabCi: 'Tests en CI',
    passing: 'Pasan',
    failed: 'Fallan',
    flaky: 'Flaky',
    skipped: 'Omitidos',
    duration: 'Duración',
    ofSuite: 'de la suite',
    lastRun: 'Última corrida',
    nextRun: 'Próxima',
    scheduleNote: 'Dos veces al día (06:00 y 18:00 UTC) en GitHub Actions. Esta página solo lee resultados grabados.',
    viewRun: 'Ver corrida en GitHub',
    triggerSchedule: 'programada',
    triggerManual: 'manual',
    triggerOther: 'automática',
    byProject: 'Por proyecto',
    project: 'Proyecto',
    tests: 'Tests',
    allTests: 'Todos los tests',
    searchTests: 'Buscar por nombre',
    allProjects: 'Todos los proyectos',
    allStatuses: 'Todos los estados',
    showing: 'Mostrando',
    of: 'de',
    noMatches: 'Ningún test coincide con los filtros.',
    failing: 'Tests que fallan',
    noFailing: 'Ningún test falla en la última corrida.',
    emptyCi: 'Aún no hay resultados de CI. Ejecuta npx playwright test y npm run report:summarize.',
    status: { passed: 'Pasa', failed: 'Falla', flaky: 'Flaky', skipped: 'Omitido' } as Record<string, string>,
    judge: 'Puntaje del juez',
    cases: 'Casos',
    runs: 'ejecuciones',
    checks: 'Checks deterministas',
    subject: 'Modelo evaluado',
    judgeModel: 'Modelo juez',
    generated: 'Generado',
    input: 'Entrada',
    output: 'Salida del modelo',
    verdict: 'Veredicto del juez',
    emptyEvalTitle: 'Resultados de evaluación próximamente',
    emptyEvalDesc: 'El arnés evalúa un tutor conversacional con casos golden, checks deterministas y un juez LLM. El código está en la carpeta evals/ del repositorio; los resultados aparecerán aquí cuando se grabe una ejecución.',
    category: { correction: 'Corrección', 'no-op': 'Sin error', interference: 'Interferencia', guardrail: 'Guardarraíl' } as Record<string, string>,
    seconds: 's',
    minutes: 'min',
  },
  en: {
    tabEval: 'AI evaluation',
    tabCi: 'CI tests',
    passing: 'Passing',
    failed: 'Failed',
    flaky: 'Flaky',
    skipped: 'Skipped',
    duration: 'Duration',
    ofSuite: 'of the suite',
    lastRun: 'Last run',
    nextRun: 'Next',
    scheduleNote: 'Twice a day (06:00 and 18:00 UTC) on GitHub Actions. This page only reads recorded results.',
    viewRun: 'View run on GitHub',
    triggerSchedule: 'scheduled',
    triggerManual: 'manual',
    triggerOther: 'automatic',
    byProject: 'By project',
    project: 'Project',
    tests: 'Tests',
    allTests: 'All tests',
    searchTests: 'Search by name',
    allProjects: 'All projects',
    allStatuses: 'All statuses',
    showing: 'Showing',
    of: 'of',
    noMatches: 'No tests match the filters.',
    failing: 'Failing tests',
    noFailing: 'No tests failing in the latest run.',
    emptyCi: 'No CI results yet. Run npx playwright test and npm run report:summarize.',
    status: { passed: 'Pass', failed: 'Fail', flaky: 'Flaky', skipped: 'Skipped' } as Record<string, string>,
    judge: 'Judge score',
    cases: 'Cases',
    runs: 'runs',
    checks: 'Deterministic checks',
    subject: 'Evaluated model',
    judgeModel: 'Judge model',
    generated: 'Generated',
    input: 'Input',
    output: 'Model output',
    verdict: 'Judge verdict',
    emptyEvalTitle: 'Evaluation results coming soon',
    emptyEvalDesc: 'The harness evaluates a conversational tutor with golden cases, deterministic checks and an LLM judge. The code lives in the repository evals/ folder; results will appear here once a run is recorded.',
    category: { correction: 'Correction', 'no-op': 'No error', interference: 'Interference', guardrail: 'Guardrail' } as Record<string, string>,
    seconds: 's',
    minutes: 'min',
  },
};

type Copy = typeof copy.es;

const SCHEDULE_HOURS_UTC = [6, 18];

function nextScheduledRun(from: Date): Date {
  for (let dayOffset = 0; dayOffset < 2; dayOffset += 1) {
    for (const hour of SCHEDULE_HOURS_UTC) {
      const candidate = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + dayOffset, hour));
      if (candidate > from) return candidate;
    }
  }
  return from;
}

const num = (n: number, lang: string, digits = 0): string => n.toLocaleString(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits });
const stamp = (date: Date, lang: string): string => date.toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' });
const dur = (ms: number, t: Copy, lang: string): string =>
  ms < 50 ? `<${num(0.1, lang, 1)} ${t.seconds}` : ms >= 60000 ? `${Math.floor(ms / 60000)} ${t.minutes} ${Math.round((ms % 60000) / 1000)} ${t.seconds}` : `${num(ms / 1000, lang, 1)} ${t.seconds}`;

function Kpis({ cells }: { cells: Array<{ label: string; value: string; unit?: string; help?: string; lead?: boolean; bad?: boolean }> }) {
  return (
    <dl className="rp-kpis">
      {cells.map((cell) => (
        <div key={cell.label} className={`rp-kpi${cell.lead ? ' lead' : ''}`}>
          <dt>{cell.label}</dt>
          <dd className={cell.bad ? 'bad' : undefined}>
            {cell.value}
            {cell.unit && <span className="unit">{cell.unit}</span>}
          </dd>
          {cell.help && <p className="help">{cell.help}</p>}
        </div>
      ))}
    </dl>
  );
}

function StatusMark({ status, t }: { status: string; t: Copy }) {
  const label = t.status[status] ?? status;
  return <span className={`rp-status ${status}`}>{label}</span>;
}

function EvalPanel({ data, t, lang }: { data: EvalData | null; t: Copy; lang: string }) {
  if (!data) {
    return (
      <section className="rp-section">
        <h2>{t.emptyEvalTitle}</h2>
        <p className="rp-empty">{t.emptyEvalDesc}</p>
      </section>
    );
  }
  const s = data.summary;
  return (
    <>
      <Kpis
        cells={[
          { label: t.passing, value: num(s.passRate * 100, lang, 1), unit: '%', lead: true, help: `${s.cases} ${t.cases.toLowerCase()} · ${s.totalRuns} ${t.runs}` },
          { label: t.judge, value: num(s.avgJudge, lang, 1), unit: '/ 5' },
          { label: t.cases, value: num(s.cases, lang) },
          { label: t.checks, value: `${num(s.deterministicPassed, lang)}`, unit: `/ ${num(s.deterministicChecks, lang)}` },
        ]}
      />
      <p className="rp-stamp">
        {t.subject}: {data.subjectModel} · {t.judgeModel}: {data.judgeModel} · {t.generated}: {stamp(new Date(data.generatedAt), lang)}
      </p>
      <section className="rp-section">
        <h2>{t.cases}</h2>
        <div className="rp-list">
          {data.cases.map((c) => (
            <details key={c.id} className="rp-row">
              <summary>
                <span className="name">{c.title}</span>
                <span className="meta">{t.category[c.category] ?? c.category}</span>
                <span className="fig">{num(c.passRate * 100, lang)} %</span>
                <span className="fig muted">{num(c.avgJudge, lang, 1)} / 5</span>
              </summary>
              <div className="rp-detail">
                <p className="rp-label">{t.input}</p>
                <p className="rp-well">{c.input}</p>
                {c.runs.map((r, i) => (
                  <div key={i} className="rp-run">
                    <p className="rp-runhead">
                      <StatusMark status={r.pass ? 'passed' : 'failed'} t={t} />
                      <span className="muted">#{i + 1}</span>
                      {r.checks.map((ch) => (
                        <span key={ch.id} className={`rp-check${ch.pass ? '' : ' bad'}`} title={ch.detail}>{ch.id}</span>
                      ))}
                    </p>
                    <p className="rp-label">{t.output}</p>
                    <p className="rp-well pre">{r.output}</p>
                    <p className="rp-verdict"><b>{t.verdict}:</b> {r.judge.score}/5 — {r.judge.reason}</p>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

function SuiteBar({ data, t, lang }: { data: CiData; t: Copy; lang: string }) {
  const l = data.latest;
  const projects = data.projects ?? [];
  const total = l.total || 1;
  const parts = projects.length ? projects.filter((p) => p.passed > 0) : [{ name: t.passing, passed: l.passed }];
  return (
    <>
    <p className="rp-legend">
      <span><i className="dot pass" />{t.passing} {num(l.passed, lang)}</span>
      {l.flaky > 0 && <span><i className="dot flaky" />{t.flaky} {num(l.flaky, lang)}</span>}
      {l.failed > 0 && <span><i className="dot fail" />{t.failed} {num(l.failed, lang)}</span>}
      {l.skipped > 0 && <span><i className="dot skip" />{t.skipped} {num(l.skipped, lang)}</span>}
    </p>
    <div className="rp-bar" role="img" aria-label={`${t.passing} ${l.passed}, ${t.skipped} ${l.skipped}`}>
      {parts.map((p) => (
        <span key={p.name} className="seg pass" style={{ flexGrow: p.passed }} title={`${p.name}: ${num(p.passed, lang)}`} />
      ))}
      {l.flaky > 0 && <span className="seg flaky" style={{ flexGrow: l.flaky }} title={`${t.flaky}: ${l.flaky}`} />}
      {l.failed > 0 && <span className="seg fail" style={{ flexGrow: l.failed }} title={`${t.failed}: ${l.failed}`} />}
      {l.skipped > 0 && <span className="seg skip" style={{ flexGrow: l.skipped, minWidth: `${Math.max((l.skipped / total) * 100, 0.6)}%` }} title={`${t.skipped}: ${l.skipped}`} />}
    </div>
    </>
  );
}

function AllTests({ tests, files, t, lang }: { tests: CiTest[]; files: CiFile[]; t: Copy; lang: string }) {
  const [query, setQuery] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState('');
  const projects = useMemo(() => [...new Set(tests.map((x) => x.project))].sort(), [tests]);
  const statuses = useMemo(() => [...new Set(tests.map((x) => x.status))].sort(), [tests]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tests.filter((x) => (!project || x.project === project) && (!status || x.status === status) && (!needle || x.title.toLowerCase().includes(needle)));
  }, [tests, query, project, status]);
  const byFile = useMemo(() => {
    const groups = new Map<string, CiTest[]>();
    for (const test of filtered) groups.set(test.file, [...(groups.get(test.file) ?? []), test]);
    return [...groups.entries()];
  }, [filtered]);
  const fileInfo = useMemo(() => new Map(files.map((f) => [f.file, f])), [files]);

  return (
    <section className="rp-section" data-testid="all-tests">
      <h2>{t.allTests}</h2>
      <div className="rp-toolbar">
        <input className="rp-input" type="search" placeholder={t.searchTests} aria-label={t.searchTests} value={query} data-testid="all-tests-search" onChange={(event) => setQuery(event.target.value)} />
        <select className="reports-select" value={project} aria-label={t.project} data-testid="all-tests-project" onChange={(event) => setProject(event.target.value)}>
          <option value="">{t.allProjects}</option>
          {projects.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <select className="reports-select" value={status} aria-label={t.status.passed} data-testid="all-tests-status" onChange={(event) => setStatus(event.target.value)}>
          <option value="">{t.allStatuses}</option>
          {statuses.map((name) => <option key={name} value={name}>{t.status[name] ?? name}</option>)}
        </select>
        <p className="rp-count" data-testid="all-tests-count">{t.showing} {filtered.length} {t.of} {tests.length}</p>
      </div>
      {byFile.length === 0 ? (
        <p className="rp-empty">{t.noMatches}</p>
      ) : (
        <div className="rp-list">
          {byFile.map(([file, own]) => {
            const info = fileInfo.get(file);
            return (
              <details key={file} className="rp-row">
                <summary>
                  <span className="name">{file}</span>
                  <span className="meta">{info?.tags.join(' ')}</span>
                  <span className="fig">{own.filter((x) => x.status === 'passed').length}/{own.length}</span>
                  <span className="fig muted">{info ? dur(info.duration, t, lang) : ''}</span>
                </summary>
                <ul className="rp-tests">
                  {own.map((x, index) => (
                    <li key={`${x.title}:${x.project}:${index}`}>
                      <StatusMark status={x.status} t={t} />
                      <span className="title">{x.title}</span>
                      <span className="meta">{x.project}</span>
                      <span className="fig muted">{dur(x.duration, t, lang)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CiPanel({ data, t, lang }: { data: CiData | null; t: Copy; lang: string }) {
  if (!data) {
    return (
      <section className="rp-section">
        <p className="rp-empty">{t.emptyCi}</p>
      </section>
    );
  }
  const l = data.latest;
  const rate = l.total ? (l.passed / l.total) * 100 : 0;
  const failing = data.tests.filter((x) => x.status === 'failed');
  const trigger = l.trigger === 'schedule' ? t.triggerSchedule : l.trigger === 'workflow_dispatch' ? t.triggerManual : t.triggerOther;
  return (
    <>
      <Kpis
        cells={[
          { label: t.passing, value: num(l.passed, lang), unit: `/ ${num(l.total, lang)}`, lead: true, help: `${num(rate, lang, 1)} % ${t.ofSuite}` },
          { label: t.failed, value: num(l.failed, lang), bad: l.failed > 0 },
          { label: t.flaky, value: num(l.flaky, lang) },
          { label: t.skipped, value: num(l.skipped, lang) },
          { label: t.duration, value: dur(l.wallDuration, t, lang) },
        ]}
      />
      <p className="rp-stamp">
        {t.lastRun}: {stamp(new Date(l.generatedAt), lang)} · {trigger}
        {l.commit ? ` · ${l.commit}` : ''}
        {l.runUrl && <> · <a href={l.runUrl} target="_blank" rel="noreferrer">{t.viewRun}</a></>}
        <br />
        {t.nextRun}: {stamp(nextScheduledRun(new Date()), lang)} · {t.scheduleNote}
      </p>

      {data.projects && data.projects.length > 0 && (
        <section className="rp-section">
          <h2>{t.byProject}</h2>
          <SuiteBar data={data} t={t} lang={lang} />
          <table className="rp-table">
            <thead>
              <tr>
                <th scope="col">{t.project}</th>
                <th scope="col" className="num">{t.passing}</th>
                <th scope="col" className="num">{t.duration}</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((p) => {
                const skipped = p.total - p.passed - p.failed - p.flaky;
                return (
                  <tr key={p.name}>
                    <th scope="row">
                      {p.name}
                      {(skipped > 0 || p.failed > 0 || p.flaky > 0) && (
                        <span className="sub">
                          {[p.failed ? `${p.failed} ${t.failed.toLowerCase()}` : '', p.flaky ? `${p.flaky} ${t.flaky.toLowerCase()}` : '', skipped ? `${skipped} ${t.skipped.toLowerCase()}` : ''].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </th>
                    <td className="num">{num(p.passed, lang)}/{num(p.total, lang)}</td>
                    <td className="num muted">{dur(p.duration, t, lang)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      <AllTests tests={data.tests} files={data.files} t={t} lang={lang} />

      {failing.length > 0 && (
        <section className="rp-section">
          <h2>{t.failing}</h2>
          <ul className="rp-tests">
            {failing.map((x) => (
              <li key={`${x.file}:${x.title}`}>
                <StatusMark status="failed" t={t} />
                <span className="title">{x.title}</span>
                <span className="meta">{x.project}</span>
                <span className="fig muted">{x.file}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function ReportsDashboard({ lang, evalData, ciData }: Props) {
  const t = copy[lang];
  const base = useId();
  const order = evalData ? (['eval', 'ci'] as const) : (['ci', 'eval'] as const);
  const [tab, setTab] = useState<'eval' | 'ci'>(order[0]);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const label = { eval: t.tabEval, ci: t.tabCi };

  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const index = order.indexOf(tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? order.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + order.length) % order.length;
    setTab(order[next]);
    refs.current[order[next]]?.focus();
  };

  return (
    <div className="rp" data-testid="reports-dashboard">
      <div className="rp-tabs" role="tablist">
        {order.map((key) => (
          <button
            key={key}
            ref={(el) => { refs.current[key] = el; }}
            type="button"
            role="tab"
            id={`${base}-${key}-tab`}
            aria-selected={tab === key}
            aria-controls={`${base}-${key}-panel`}
            tabIndex={tab === key ? 0 : -1}
            data-testid={`tab-${key}`}
            className="rp-tab"
            onClick={() => setTab(key)}
            onKeyDown={onKey}
          >
            {label[key]}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${base}-${tab}-panel`} aria-labelledby={`${base}-${tab}-tab`} className="rp-panel">
        {tab === 'eval' ? <EvalPanel data={evalData} t={t} lang={lang} /> : <CiPanel data={ciData} t={t} lang={lang} />}
      </div>
    </div>
  );
}
