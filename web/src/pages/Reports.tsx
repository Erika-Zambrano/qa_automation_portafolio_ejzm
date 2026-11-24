import { Html } from '../components/Html';
import ReportsDashboard, { type CiData, type EvalData } from '../components/reports/ReportsDashboard';
import { useLang } from '../context/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import '../css/reports.css';

const evalFiles = import.meta.glob<EvalData>('../data/eval-results.json', { eager: true, import: 'default' });
const ciFiles = import.meta.glob<CiData>('../data/ci-results.json', { eager: true, import: 'default' });
const evalData = Object.values(evalFiles)[0] ?? null;
const ciData = Object.values(ciFiles)[0] ?? null;

export function Reports() {
  const { lang, t } = useLang();
  usePageTitle(`${t('reports-label')} — Erika Zambrano`);

  return (
    <div className="reports-page">
      <div className="container">
        <Html as="p" k="reports-label" className="page-label" />
        <Html as="h1" k="reports-title" className="page-title" />
        <Html as="p" k="reports-desc" className="page-desc" />
        <ReportsDashboard lang={lang} evalData={evalData} ciData={ciData} />
      </div>
    </div>
  );
}
