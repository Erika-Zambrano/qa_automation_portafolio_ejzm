import { useEffect, useState } from 'react';
import { FolderHead } from '../components/FolderHead';
import { Html } from '../components/Html';
import ReportsDashboard, { type CiData, type EvalData } from '../components/reports/ReportsDashboard';
import { useLang } from '../context/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import '../css/reports.css';

const evalFiles = import.meta.glob<EvalData>('../data/eval-results.json', { eager: true, import: 'default' });
const ciFiles = import.meta.glob<CiData>('../data/ci-results.json', { eager: true, import: 'default' });
const evalData = Object.values(evalFiles)[0] ?? null;
const bundledCiData = Object.values(ciFiles)[0] ?? null;
const LIVE_CI_URL = 'https://raw.githubusercontent.com/Erika-Zambrano/qa_automation_portafolio_ejzm/ci-data/ci-results.json';

export function Reports() {
  const { lang, t } = useLang();
  usePageTitle(`${t('reports-label')} — Erika Zambrano`);
  const [ciData, setCiData] = useState<CiData | null>(bundledCiData);

  useEffect(() => {
    const controller = new AbortController();
    fetch(LIVE_CI_URL, { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<CiData>) : null))
      .then((data) => {
        if (data?.latest) setCiData(data);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);


  return (
    <div className="reports-page">
      <FolderHead width={1000}>
        <Html as="h1" k="reports-title" className="page-title" />
        <Html as="p" k="reports-desc" className="page-desc" />
      </FolderHead>
      <div className="container">
        <ReportsDashboard lang={lang} evalData={evalData} ciData={ciData} />
      </div>
    </div>
  );
}
