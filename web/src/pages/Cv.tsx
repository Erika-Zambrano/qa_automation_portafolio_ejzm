import { FolderHead } from '../components/FolderHead';
import { Html, HtmlList } from '../components/Html';
import { useLang } from '../context/LangContext';
import { usePageTitle } from '../hooks/usePageTitle';
import type { Translations } from '../i18n/translations';
import '../css/cv.css';

type JobProps = {
  title: React.ReactNode;
  company: React.ReactNode;
  date: React.ReactNode;
  location: React.ReactNode;
  bullets: keyof Translations;
};

function Job({ title, company, date, location, bullets }: JobProps) {
  return (
    <div className="cv-job">
      <div className="cv-job-header">
        <div>
          <div className="cv-job-title">{title}</div>
          <div className="cv-job-company">{company}</div>
        </div>
        <div>
          <div className="cv-job-date">{date}</div>
          <div className="cv-job-location">{location}</div>
        </div>
      </div>
      <HtmlList k={bullets} />
    </div>
  );
}

function Edu({ degree, school, year }: { degree: string; school: string; year: string }) {
  return (
    <div className="cv-edu-item">
      <div>
        <div className="cv-edu-degree">{degree}</div>
        <div className="cv-edu-school">{school}</div>
      </div>
      <div className="cv-edu-year">{year}</div>
    </div>
  );
}

const skills: Array<[keyof Translations, keyof Translations]> = [
  ['skill-quality', 'skill-quality-value'],
  ['skill-ai-conv', 'skill-ai-conv-value'],
  ['skill-automation', 'skill-automation-value'],
  ['skill-integration', 'skill-integration-value'],
  ['skill-data', 'skill-data-value'],
  ['skill-ai', 'skill-ai-value'],
  ['skill-mgmt', 'skill-mgmt-value'],
];

export function Cv() {
  const { t } = useLang();
  usePageTitle('CV — Erika Zambrano');

  return (
    <div className="cv-page">
      <FolderHead width={800}>
        <p className="page-title">{t('proof-cv-title')}</p>
        <p className="page-desc">{t('proof-cv-desc')}</p>
      </FolderHead>
      <div className="page">
        <header className="cv-header">
          <h1 className="cv-name">Erika Zambrano</h1>
          <p className="cv-title">Quality Engineer &nbsp;|&nbsp; Conversational AI &amp; LLM Quality · Playwright · TypeScript · API Testing · CI/CD</p>
          <div className="cv-contact">
            <span>{t('location')}</span>
            <span className="sep">·</span>
            <span><a href="mailto:erikajzm@gmail.com">erikajzm@gmail.com</a></span>
            <span className="sep">·</span>
            <span><a href="https://www.linkedin.com/in/erikazambrano/" target="_blank" rel="noopener">linkedin.com/in/erikazambrano</a></span>
            <span className="sep">·</span>
            <span><a href="https://github.com/Erika-Zambrano" target="_blank" rel="noopener">github.com/Erika-Zambrano</a></span>
          </div>
        </header>

        <section className="cv-section" data-testid="section-profile">
          <Html as="h2" k="section-profile" className="cv-section-title" />
          <Html as="p" k="profile-text" className="cv-summary" />
        </section>

        <section className="cv-section" data-testid="section-experience">
          <Html as="h2" k="section-experience" className="cv-section-title" />
          <Job
            title={t('job1-title')}
            company={<>PSh | Providing Digital Transformation &nbsp;·&nbsp; <em>Nearpod (EdTech SaaS)</em></>}
            date={t('job1-date')}
            location={t('job1-location')}
            bullets="job1-bullets"
          />
          <Job
            title="Quality Assurance Tester"
            company={<>Cognizant &nbsp;·&nbsp; <em>{t('job2-client')}</em></>}
            date="Oct 2019 – Nov 2020"
            location="Buenos Aires"
            bullets="job2-bullets"
          />
          <Job
            title={t('job3-title')}
            company={t('job3-company')}
            date="2008 – 2018"
            location="Caracas, Venezuela"
            bullets="job3-bullets"
          />
        </section>

        <section className="cv-section" data-testid="section-projects">
          <Html as="h2" k="section-projects" className="cv-section-title" />
          <div className="cv-project">
            <div className="cv-project-header">
              <span className="cv-project-name">My English Teacher</span>
              <span className="cv-project-tech">React 19 · Vite · TypeScript · OpenAI-compatible API · Vercel Serverless</span>
            </div>
            <div>
              <a href="https://english-teacher-five-pi.vercel.app" target="_blank" rel="noopener">english-teacher-five-pi.vercel.app</a>
              &nbsp;·&nbsp;
              <a href="https://github.com/Erika-Zambrano" target="_blank" rel="noopener">github.com/Erika-Zambrano</a>
            </div>
            <Html as="p" k="project1-desc" />
          </div>
        </section>

        <section className="cv-section" data-testid="section-skills">
          <Html as="h2" k="section-skills" className="cv-section-title" />
          <div className="skills-grid">
            {skills.map(([label, value]) => (
              <SkillRow key={label} label={t(label)} value={t(value)} />
            ))}
          </div>
        </section>

        <section className="cv-section" data-testid="section-education">
          <Html as="h2" k="section-education" className="cv-section-title" />
          <Edu degree={t('edu1-degree')} school="EducacionIT" year="2019" />
          <Edu degree={t('edu2-degree')} school="EducacionIT" year="2019" />
          <Edu degree={t('edu3-degree')} school="EducacionIT" year="2019" />
          <Edu degree={t('edu4-degree')} school="EANT – Escuela Argentina de Nuevas Tecnologías · Fullstack JS (53h) · HTML5 & CSS3 (50h)" year="2020–2021" />
          <Edu degree={t('edu5-degree')} school="UCAB – Universidad Católica Andrés Bello, Venezuela" year="2003–2008" />
        </section>

        <section className="cv-section" data-testid="section-languages">
          <Html as="h2" k="section-languages" className="cv-section-title" />
          <div className="languages-row">
            <div className="lang-item">
              <strong>{t('lang-spanish')}</strong>
              <span className="lang-level">{t('lang-spanish-level')}</span>
            </div>
            <div className="lang-item">
              <strong>{t('lang-english')}</strong>
              <span className="lang-level">{t('lang-english-level')}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SkillRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="skill-category">{label}</span>
      <span>{value}</span>
    </>
  );
}
