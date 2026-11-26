import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const head = {
  name: 'Erika Zambrano',
  contact: 'Valencia, Spain · erikajzm@gmail.com · linkedin.com/in/erikazambrano · github.com/Erika-Zambrano · qa-automation-portafolio-ejzm.vercel.app',
};

const cv = {
  en: {
    file: 'Erika_Zambrano_CV_EN.pdf',
    lang: 'en',
    role: 'QA Automation Engineer | Playwright · TypeScript · CI/CD · AI-Assisted Testing',
    sections: [
      ['Summary', [['p', 'QA Automation Engineer with 7 years of experience in manual and automated testing for SaaS and EdTech products. Builds and maintains Playwright and TypeScript suites, reduces regression effort and shortens release validation in GitLab CI. Contributed to the Protractor-to-Playwright migration and a shared automation Core across two product repositories; led the JavaScript-to-TypeScript migration. Tests AI-powered features and complex integrations (iframe micro-frontends, REST APIs, feature flags) and uses Claude Code to build QA skills and plugins.']]],
      ['Core Skills', [['ul', [
        'Test automation: Playwright, Cypress, Vitest, Protractor (legacy), smoke, sanity, regression and end-to-end suites, test maintenance',
        'Languages: TypeScript, JavaScript, SQL, MySQL',
        'Framework engineering: shared automation Core, reusable utilities, framework migrations',
        'API and integration testing: REST APIs, Postman, multi-service integrations, iframe and cross-application flows',
        'Functional testing: web, mobile, iOS, exploratory, regression, release validation, defect reporting',
        'AI-assisted QA: Claude Code, QA skills and plugins, AI-powered feature testing, generative AI API integration',
        'CI/CD and DevOps: GitLab CI, GitHub Actions, quality gates, Git',
        'Test management: Jira, HP ALM, Scrum, test case design, test documentation',
        'Frontend and deployment: React, Next.js, Vite, Tailwind CSS, HTML5, CSS3, Vercel Serverless',
      ]]]],
      ['Professional Experience', [
        ['job', 'QA Automation Engineer', 'PSh | Providing Digital Transformation — Nearpod (EdTech SaaS)', 'Remote · November 2020 – Present', [
          'Reduced deployment validation time from 3 hours to 45 minutes and cut manual testing effort by about 3 days in the test environment.',
          'Contributed to the migration from Protractor to Playwright. Developed and maintained 48 active automated tests across 41 spec files, covering 18 critical product features in smoke, sanity and regression suites.',
          'Contributed to a shared automation Core (2025) for the Nearpod and Flocabulary test repositories, reducing duplication while keeping product-specific coverage separate.',
          'Led the JavaScript-to-TypeScript migration (completed July–August 2026), improving type safety and framework maintainability.',
          'Contributing to the move from scheduled runs to CI/CD-triggered execution, so key automated checks gate production merges.',
          'Tested an emerging AI Teacher Tools feature: iframe micro-frontend integration, APIs, cross-application assignment flows, authentication and session behaviour, and feature flags, with a layered, API-first approach.',
          'Develop QA skills and plugins with Claude Code, reviewing generated code and outputs against requirements and repository conventions.',
          'Functional and regression testing across web, mobile and iOS; API testing with Postman; release validation in GitLab CI.',
          'Proposed (planned for 2027) a repository for continuous AI evaluations with Slack alerts when scores fall below agreed thresholds. Assessing Playwright versus a purpose-built evaluation framework; implementation not yet started.',
        ]],
        ['job', 'Quality Assurance Tester', 'Cognizant — Client: Telecom Argentina', 'Buenos Aires, Argentina · October 2019 – November 2020', [
          'Designed and executed test plans and test cases for telecommunications projects across web, desktop and mobile applications.',
          'Supported defect investigation and traceability through end-to-end testing and structured bug reports; managed test cases in Jira and HP ALM.',
          'Tested APIs with Postman and collaborated with delivery teams in Scrum.',
        ]],
        ['job', 'Freelance Audiovisual Producer and Photography Assistant', 'Independent work for companies and photographers', 'Caracas, Venezuela · 2008 – 2018', [
          'Delivered photography and video projects for corporate and individual clients, including recording, editing and coordination of technical deliverables.',
          'Taught digital photography for more than 3 years, building technical communication and mentoring skills.',
        ]],
      ]],
      ['Freelance Projects', [
        ['job', 'Cypress Automation Repository Refactor', 'SaaS company · Cypress', 'Freelance', [
          'Refactored the entire automation repository: moved from no Page Object Model, no product-variables repositories and no POM builder to adopting all three (pomsetup).',
          'Replaced one-line files with loose components by a consistent structure that is easier to read and maintain.',
        ]],
        ['job', 'Manual Testing — Audio Software', 'Abbey Road Studios — audiomover.com', 'Freelance', [
          'Manual testing of the application and its usage flows for a professional audio streaming product.',
        ]],
      ]],
      ['Selected Projects', [
        ['job', 'Multi-Organisation CRM for Instagram and Meta Leads', 'Next.js · TypeScript · tRPC · Drizzle · PostgreSQL · shadcn/ui · Vitest · Playwright · GitHub Actions', 'Freelance', [
          'Started from scratch and owned the frontend and testing: Next.js (App Router), strict TypeScript, Zod-validated forms and per-organisation theming.',
          'Vitest tests against a real Postgres database and Playwright E2E, run in GitHub Actions (typecheck, lint, tests, build, dependency audit) with pre-commit and pre-push Git hooks.',
          'Modular monolith in a pnpm monorepo (ui, contracts, api, core, db, auth, messaging) with layer dependency rules enforced by ESLint and data isolation between organisations.',
          'Backend: tRPC 11, Better Auth, Drizzle ORM on PostgreSQL (Neon), HMAC-signed webhooks and the WhatsApp Business API.',
          'Accessibility (WCAG), responsive design and a nonce-based Content Security Policy.',
        ]],
        ['job', 'My English Teacher — AI-Powered Learning Application', 'React 19 · Vite · TypeScript · Tailwind CSS · OpenAI SDK · Vercel Serverless', 'english-teacher-five-pi.vercel.app', [
          'Built and deployed a production app that generates C1-level English exercises with an LLM through an OpenAI-compatible API.',
          'Spanish/English support, answer validation with 90% fuzzy matching, fill-in-the-blank practice and session feedback.',
        ]],
        ['job', 'QA Automation Portfolio', 'Playwright · TypeScript · CI/CD · Claude Code', 'qa-automation-portafolio-ejzm.vercel.app', [
          'Practical portfolio demonstrating test automation structure, maintainability and CI execution.',
          'Used Claude Code to support implementation while retaining ownership of testing decisions and code review.',
        ]],
      ]],
      ['Education', [['ul', [
        'Fullstack Developer (JavaScript) — EANT · 2020–2021',
        'Software Tester QA; IT Functional Analysis; Introduction to Databases and SQL — EducacionIT · 2019',
        'Degree in Social Communication, Audiovisual Arts — UCAB, Venezuela · 2003–2008',
      ]]]],
      ['Languages', [['ul', ['Spanish: Native', 'English: B2 (Upper Intermediate); immersion programme in Vancouver, Canada, 2014–2015']]]],
    ],
  },
  es: {
    file: 'Erika_Zambrano_CV_ES.pdf',
    lang: 'es',
    role: 'QA Automation Engineer | Playwright · TypeScript · CI/CD · Testing asistido por IA',
    sections: [
      ['Perfil', [['p', 'QA Automation Engineer con 7 años de experiencia en testing manual y automatizado de productos SaaS y EdTech. Construye y mantiene suites de Playwright y TypeScript, reduce el esfuerzo de regresión y acorta la validación de releases en GitLab CI. Contribuyó a la migración de Protractor a Playwright y a un Core de automatización compartido entre dos repositorios de producto; lideró la migración de JavaScript a TypeScript. Prueba funcionalidades con IA e integraciones complejas (micro-frontends en iframe, APIs REST, feature flags) y usa Claude Code para crear skills y plugins de QA.']]],
      ['Habilidades', [['ul', [
        'Automatización: Playwright, Cypress, Vitest, Protractor (legacy), suites smoke, sanity, regresión y end-to-end, mantenimiento de tests',
        'Lenguajes: TypeScript, JavaScript, SQL, MySQL',
        'Ingeniería de framework: Core de automatización compartido, utilidades reutilizables, migraciones de framework',
        'APIs e integración: APIs REST, Postman, integraciones multi-servicio, flujos con iframes y entre aplicaciones',
        'Testing funcional: web, móvil, iOS, exploratorio, regresión, validación de releases, reporte de defectos',
        'QA con IA: Claude Code, skills y plugins de QA, testing de funcionalidades con IA, integración de APIs de IA generativa',
        'CI/CD y DevOps: GitLab CI, GitHub Actions, quality gates, Git',
        'Gestión de pruebas: Jira, HP ALM, Scrum, diseño de casos de prueba, documentación',
        'Frontend y despliegue: React, Next.js, Vite, Tailwind CSS, HTML5, CSS3, Vercel Serverless',
      ]]]],
      ['Experiencia profesional', [
        ['job', 'QA Automation Engineer', 'PSh | Providing Digital Transformation — Nearpod (EdTech SaaS)', 'Remoto · Noviembre 2020 – Presente', [
          'Reduje el tiempo de validación de despliegue de 3 horas a 45 minutos y el esfuerzo de testing manual en unos 3 días en el entorno de pruebas.',
          'Contribuí a la migración de Protractor a Playwright. Desarrollo y mantengo 48 tests automatizados activos en 41 spec files, cubriendo 18 funcionalidades críticas en suites smoke, sanity y regresión.',
          'Contribuí a un Core de automatización compartido (2025) para los repositorios de Nearpod y Flocabulary, reduciendo duplicación y manteniendo separada la cobertura específica de cada producto.',
          'Lideré la migración de JavaScript a TypeScript (completada en julio–agosto de 2026), mejorando la seguridad de tipos y la mantenibilidad del framework.',
          'Contribuyo a pasar de ejecuciones programadas a ejecución disparada por CI/CD, para que los checks clave bloqueen los merges a producción.',
          'Testeé una funcionalidad emergente de AI Teacher Tools: micro-frontend en iframe, APIs, flujos de asignación entre aplicaciones, autenticación y sesión, y feature flags, con un enfoque por capas y API-first.',
          'Desarrollo skills y plugins de QA con Claude Code, revisando el código y los resultados generados contra requisitos y convenciones del repositorio.',
          'Testing funcional y de regresión en web, móvil e iOS; testing de APIs con Postman; validación de releases en GitLab CI.',
          'Propuse (previsto para 2027) un repositorio de evaluaciones continuas de IA con alertas en Slack cuando las puntuaciones bajan de los umbrales acordados. Evalúo Playwright frente a un framework específico; la implementación aún no ha empezado.',
        ]],
        ['job', 'Quality Assurance Tester', 'Cognizant — Cliente: Telecom Argentina', 'Buenos Aires, Argentina · Octubre 2019 – Noviembre 2020', [
          'Diseño y ejecución de planes y casos de prueba para proyectos de telecomunicaciones en aplicaciones web, desktop y móviles.',
          'Apoyo a la investigación y trazabilidad de defectos mediante testing end-to-end y reportes de bugs estructurados; gestión de casos en Jira y HP ALM.',
          'Pruebas de APIs con Postman y colaboración con equipos de delivery en Scrum.',
        ]],
        ['job', 'Productora audiovisual freelance y asistente de fotografía', 'Trabajo independiente para empresas y fotógrafos', 'Caracas, Venezuela · 2008 – 2018', [
          'Entrega de proyectos de fotografía y vídeo para clientes corporativos e individuales, incluyendo grabación, edición y coordinación de entregables técnicos.',
          'Docencia de fotografía digital durante más de 3 años, desarrollando comunicación técnica y mentoría.',
        ]],
      ]],
      ['Proyectos freelance', [
        ['job', 'Refactor de repositorio de automatización en Cypress', 'Empresa SaaS · Cypress', 'Freelance', [
          'Refactoricé todo el repositorio de automatización: pasó de no usar Page Object Model, repositorios de variables de producto ni builder de POM a adoptar los tres (pomsetup).',
          'Sustituí archivos de una línea con componentes sueltos por una estructura consistente, más fácil de leer y mantener.',
        ]],
        ['job', 'Testing manual — software de audio', 'Abbey Road Studios — audiomover.com', 'Freelance', [
          'Testing manual de la aplicación y de sus flujos de uso para un producto profesional de streaming de audio.',
        ]],
      ]],
      ['Proyectos destacados', [
        ['job', 'CRM multi-organización para leads de Instagram y Meta', 'Next.js · TypeScript · tRPC · Drizzle · PostgreSQL · shadcn/ui · Vitest · Playwright · GitHub Actions', 'Freelance', [
          'Lo empecé desde cero y me encargué del frontend y el testing: Next.js (App Router), TypeScript estricto, formularios validados con Zod y tema visual por organización.',
          'Tests con Vitest contra una base Postgres real y E2E con Playwright, ejecutados en GitHub Actions (tipos, lint, tests, build, auditoría de dependencias) con hooks de Git pre-commit y pre-push.',
          'Monolito modular en monorepo pnpm (ui, contracts, api, core, db, auth, messaging) con reglas de dependencias entre capas impuestas con ESLint y aislamiento de datos entre organizaciones.',
          'Backend: tRPC 11, Better Auth, Drizzle ORM sobre PostgreSQL (Neon), webhooks con firma HMAC e integración con la API de WhatsApp Business.',
          'Accesibilidad (WCAG), diseño responsive y política de seguridad de contenido (CSP) con nonce.',
        ]],
        ['job', 'My English Teacher — Aplicación de aprendizaje con IA', 'React 19 · Vite · TypeScript · Tailwind CSS · OpenAI SDK · Vercel Serverless', 'english-teacher-five-pi.vercel.app', [
          'Construí y desplegué una app en producción que genera ejercicios de inglés nivel C1 con un LLM mediante una API compatible con OpenAI.',
          'Soporte español/inglés, validación de respuestas con fuzzy matching del 90 %, ejercicios de completar huecos y feedback de sesión.',
        ]],
        ['job', 'Portafolio de QA Automation', 'Playwright · TypeScript · CI/CD · Claude Code', 'qa-automation-portafolio-ejzm.vercel.app', [
          'Portafolio práctico que demuestra estructura de automatización, mantenibilidad y ejecución en CI.',
          'Uso de Claude Code como apoyo a la implementación, conservando las decisiones de testing y la revisión de código.',
        ]],
      ]],
      ['Formación', [['ul', [
        'Fullstack Developer (JavaScript) — EANT · 2020–2021',
        'Software Tester QA; Análisis Funcional IT; Introducción a Base de Datos y SQL — EducacionIT · 2019',
        'Licenciatura en Comunicación Social, Artes Audiovisuales — UCAB, Venezuela · 2003–2008',
      ]]]],
      ['Idiomas', [['ul', ['Español: nativo', 'Inglés: B2 (Upper Intermediate); formación presencial en Vancouver, Canadá, 2014–2015']]]],
    ],
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const block = (b) => {
  if (b[0] === 'p') return `<p>${esc(b[1])}</p>`;
  if (b[0] === 'ul') return `<ul>${b[1].map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
  const [, title, sub, meta, bullets] = b;
  return `<div class="job"><h3>${esc(title)}</h3><p class="sub">${esc(sub)}</p><p class="meta">${esc(meta)}</p><ul>${bullets.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`;
};

const html = (c) => `<!doctype html><html lang="${c.lang}"><meta charset="utf-8"><style>
@page { size: A4; margin: 16mm 16mm 16mm; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 9.6pt; line-height: 1.42; color: #181818; }
h1 { font-size: 22pt; font-weight: 400; margin: 0; }
.role { font-weight: 600; margin: 2px 0 4px; }
.contact { font-size: 8.5pt; color: #434343; margin: 0 0 10px; }
h2 { font-size: 10pt; text-transform: uppercase; letter-spacing: 0.08em; margin: 14px 0 6px; padding-bottom: 2px; border-bottom: 1px solid #181818; }
h3 { font-size: 10.2pt; margin: 8px 0 0; }
p { margin: 0 0 4px; }
.sub { font-style: italic; margin: 0; }
.meta { font-size: 8.6pt; color: #434343; margin: 0 0 3px; }
ul { margin: 2px 0 4px; padding-left: 16px; }
li { margin-bottom: 2px; }
.job { break-inside: avoid-page; }
</style><h1>${head.name}</h1><p class="role">${esc(c.role)}</p><p class="contact">${esc(head.contact)}</p>
${c.sections.map(([t, bs]) => `<h2>${esc(t)}</h2>${bs.map(block).join('')}`).join('')}</html>`;

mkdirSync('web/public', { recursive: true });
const browser = await chromium.launch();
for (const c of Object.values(cv)) {
  const page = await browser.newPage();
  await page.setContent(html(c));
  await page.pdf({ path: `web/public/${c.file}`, format: 'A4', printBackground: true });
  await page.close();
}
await browser.close();
