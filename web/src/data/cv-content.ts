import type { Lang } from '../i18n/translations';

type Area = { name: string; result: string; tags: string[]; href: string; proof: string };
type Step = { role: string; context: string; when: string; points: string[] };
type Freelance = { name: string; context: string; points: string[] };
type Group = { name: string; items: string[] };
type Project = { name: string; stack: string; text?: string; points?: string[]; href?: string; link?: string };

export type TabId = 'resumen' | 'que-hago' | 'stack' | 'experiencia' | 'proyectos';

export type CvContent = {
  title: string;
  tabs: Record<TabId, string>;
  linkedinCta: string;
  facts: Array<{ value: string; label: string }>;
  ciLabel: string;
  summary: string;
  areasTitle: string;
  areas: Area[];
  stackTitle: string;
  daily: string;
  used: string;
  dailyGroups: Group[];
  usedGroups: Group[];
  pathTitle: string;
  path: Step[];
  freelanceTitle: string;
  freelance: Freelance[];
  beforeTitle: string;
  beforeText: string;
  projectsTitle: string;
  projects: Project[];
  exploring: string;
  exploringText: string;
  baseTitle: string;
  base: string[];
  closeTitle: string;
  closeText: string;
  closeContact: string;
};

export const cvContent: Record<Lang, CvContent> = {
  es: {
    title: 'QA Automation Engineer. Playwright, TypeScript, CI/CD y testing asistido por IA.',
    tabs: { resumen: 'Resumen', 'que-hago': 'Qué hago', stack: 'Herramientas', experiencia: 'Experiencia', proyectos: 'Proyectos' },
    linkedinCta: 'Ver perfil completo en LinkedIn →',
    facts: [
      { value: '3 h → 45 min', label: 'validación de despliegue, tras automatizar la regresión' },
      { value: '7 años', label: 'en QA manual y automatizado' },
    ],
    ciLabel: 'tests pasando en el último run de CI',
    summary:
      'Automatizo la validación de releases en un producto EdTech SaaS usado por más de 40 millones de usuarios. Trabajo en la capa que une frameworks, CI/CD e integraciones complejas, y uso IA como herramienta de QA sin ceder la revisión.',
    areasTitle: 'Qué hago, y dónde verlo',
    areas: [
      {
        name: 'Automatización end-to-end',
        result: 'Suites smoke, sanity y regresión que sustituyen días de validación manual por minutos de ejecución.',
        tags: ['Playwright', 'TypeScript', 'Regresión'],
        href: '/playground',
        proof: 'Probar el playground',
      },
      {
        name: 'Ingeniería de framework',
        result: 'Migré de Protractor a Playwright y de JavaScript a TypeScript, y contribuí a un Core compartido entre dos repositorios de producto.',
        tags: ['Core compartido', 'Migraciones'],
        href: 'https://github.com/Erika-Zambrano',
        proof: 'Ver el código',
      },
      {
        name: 'CI/CD y puertas de calidad',
        result: 'Paso de ejecuciones programadas a pruebas disparadas por cada cambio, para que los checks clave bloqueen el merge a producción.',
        tags: ['GitLab CI', 'GitHub Actions'],
        href: '/reports',
        proof: 'Ver los resultados de CI',
      },
      {
        name: 'Integraciones y APIs',
        result: 'Pruebas por capas y API-first sobre micro-frontends en iframe, flujos entre aplicaciones, sesión y feature flags.',
        tags: ['REST', 'Postman', 'Feature flags'],
        href: '/reports',
        proof: 'Ver los tests de API',
      },
      {
        name: 'QA con IA',
        result: 'Pruebo funcionalidades con IA y construyo skills y plugins de QA con Claude Code, revisando todo lo generado contra requisitos y convenciones.',
        tags: ['Claude Code', 'Evaluación de LLMs'],
        href: '/reports',
        proof: 'Ver la evaluación de un LLM',
      },
    ],
    stackTitle: 'Herramientas',
    daily: 'A diario',
    used: 'Las he usado',
    dailyGroups: [
      { name: 'Testing', items: ['Playwright', 'TypeScript', 'Postman'] },
      { name: 'CI y control de versiones', items: ['GitLab CI', 'Git'] },
      { name: 'Gestión e IA', items: ['Jira', 'Claude Code'] },
    ],
    usedGroups: [
      { name: 'Testing', items: ['Cypress', 'Protractor', 'Vitest', 'HP ALM'] },
      { name: 'Frontend', items: ['React', 'Next.js', 'Vite', 'Tailwind CSS', 'shadcn/ui'] },
      { name: 'Backend', items: ['Node.js', 'tRPC', 'Better Auth', 'Zod'] },
      { name: 'Datos', items: ['PostgreSQL', 'Drizzle ORM', 'SQL / MySQL'] },
      { name: 'Entrega y despliegue', items: ['GitHub Actions', 'Docker Compose', 'ESLint', 'Vercel'] },
    ],
    pathTitle: 'Trayectoria',
    path: [
      {
        role: 'QA Automation Engineer',
        context: 'Plataforma EdTech SaaS · más de 40 M de usuarios',
        when: 'Nov 2020 – hoy',
        points: [
          'Validación de despliegue de 3 h a 45 min y unos 3 días menos de testing manual.',
          '48 tests activos en 41 specs sobre 18 features críticas.',
          'Lidero la migración a TypeScript y contribuyo al Core compartido entre dos productos.',
        ],
      },
      {
        role: 'Quality Assurance Tester',
        context: 'Consultora global · cliente de telecomunicaciones',
        when: 'Oct 2019 – Nov 2020',
        points: ['Planes y casos de prueba en web, desktop y móvil, con APIs en Postman y trabajo en Scrum.'],
      },
    ],
    freelanceTitle: 'Proyectos freelance',
    freelance: [
      {
        name: 'Refactor de un repositorio de automatización en Cypress',
        context: 'Empresa SaaS · Cypress',
        points: [
          'Reestructuré todo el repositorio: de no usar Page Object Model, repositorios de variables de producto ni builder de páginas, a adoptar los tres.',
          'Los archivos de una línea con componentes sueltos pasaron a una estructura consistente, fácil de leer y de mantener.',
        ],
      },
      {
        name: 'Testing manual de software de audio',
        context: 'Estudio de grabación de referencia mundial · aplicación de streaming de audio',
        points: ['Testing manual de la aplicación y de sus flujos de uso para un producto de audio profesional.'],
      },
    ],
    beforeTitle: 'Antes del QA: diez años de audiovisual',
    beforeText:
      'Producción de vídeo y fotografía para clientes y tres años enseñando fotografía digital. De ahí vienen tres hábitos que uso al testear: entregar a plazo fijo, explicar un fallo a quien no es técnico y mirar el resultado como lo vería el usuario.',
    projectsTitle: 'Proyectos propios',
    projects: [
      {
        name: 'CRM multi-organización para captar leads de Instagram y Meta',
        stack: 'Next.js · TypeScript · tRPC · Drizzle · PostgreSQL · shadcn/ui · Vitest · Playwright · GitHub Actions',
        points: [
          'Lo empecé desde cero y me encargué del frontend y del testing: Next.js (App Router) con TypeScript estricto, shadcn/ui, formularios validados con Zod y tema visual por organización.',
          'Pruebas con Vitest contra una base Postgres real y E2E con Playwright, en CI con GitHub Actions (tipos, lint, tests, build y auditoría de dependencias) y hooks de Git antes de cada commit y push.',
          'Monolito modular en monorepo pnpm (ui, contracts, api, core, db, auth, messaging) con reglas de dependencias entre capas impuestas con ESLint y aislamiento de datos entre organizaciones.',
          'Stack de backend: tRPC 11, Better Auth, Drizzle ORM sobre PostgreSQL (Neon), webhooks con firma HMAC e integración con la API de WhatsApp Business.',
          'Cuida accesibilidad (WCAG), diseño responsive y una política de seguridad de contenido (CSP) con nonce.',
        ],
      },
      {
        name: 'My English Teacher',
        stack: 'React 19 · Vite · TypeScript · API compatible con OpenAI · Vercel',
        text: 'Aplicación en producción que genera ejercicios de inglés con un LLM y valida las respuestas con coincidencia aproximada del 90 %.',
        href: 'https://english-teacher-five-pi.vercel.app',
        link: 'Abrir la aplicación',
      },
      {
        name: 'Este portafolio',
        stack: 'Playwright · TypeScript · CI/CD',
        text: 'Playground con endpoint de caos, 593 tests de API y un panel de resultados en vivo.',
        href: '/reports',
        link: 'Ver los resultados',
      },
    ],
    exploring: 'Explorando',
    exploringText:
      'Un repositorio de evaluaciones continuas de IA con alertas en Slack cuando una puntuación baja del umbral. Sigo evaluando Playwright frente a un framework específico; todavía no hay implementación.',
    baseTitle: 'Formación e idiomas',
    base: [
      'Comunicación Social, Artes Audiovisuales — UCAB, 2008',
      'Fullstack JavaScript — EANT, 2020–2021',
      'Software Tester QA — EducacionIT, 2019',
      'Español nativo · Inglés B2',
    ],
    closeTitle: '¿Hablamos?',
    closeText: 'Busco un rol de QA Automation donde la calidad sea parte del pipeline, no un paso final.',
    closeContact: 'Escribirme →',
  },
  en: {
    title: 'QA Automation Engineer. Playwright, TypeScript, CI/CD and AI-assisted testing.',
    tabs: { resumen: 'Summary', 'que-hago': 'What I do', stack: 'Tools', experiencia: 'Experience', proyectos: 'Projects' },
    linkedinCta: 'See the full profile on LinkedIn →',
    facts: [
      { value: '3 h → 45 min', label: 'deployment validation, after automating regression' },
      { value: '7 years', label: 'in manual and automated QA' },
    ],
    ciLabel: 'tests passing in the latest CI run',
    summary:
      'I automate release validation on an EdTech SaaS product used by more than 40 million users. I work where frameworks, CI/CD and complex integrations meet, and I use AI as a QA tool without giving up the review.',
    areasTitle: 'What I do, and where to see it',
    areas: [
      {
        name: 'End-to-end automation',
        result: 'Smoke, sanity and regression suites that turn days of manual validation into minutes of execution.',
        tags: ['Playwright', 'TypeScript', 'Regression'],
        href: '/playground',
        proof: 'Try the playground',
      },
      {
        name: 'Framework engineering',
        result: 'Migrated from Protractor to Playwright and from JavaScript to TypeScript, and contributed to a shared Core across two product repositories.',
        tags: ['Shared Core', 'Migrations'],
        href: 'https://github.com/Erika-Zambrano',
        proof: 'See the code',
      },
      {
        name: 'CI/CD and quality gates',
        result: 'Moving from scheduled runs to change-triggered checks, so key tests block merges to production.',
        tags: ['GitLab CI', 'GitHub Actions'],
        href: '/reports',
        proof: 'See the CI results',
      },
      {
        name: 'Integrations and APIs',
        result: 'Layered, API-first testing across iframe micro-frontends, cross-application flows, sessions and feature flags.',
        tags: ['REST', 'Postman', 'Feature flags'],
        href: '/reports',
        proof: 'See the API tests',
      },
      {
        name: 'AI-assisted QA',
        result: 'I test AI-powered features and build QA skills and plugins with Claude Code, reviewing everything generated against requirements and conventions.',
        tags: ['Claude Code', 'LLM evaluation'],
        href: '/reports',
        proof: 'See an LLM evaluation',
      },
    ],
    stackTitle: 'Tools',
    daily: 'Every day',
    used: 'Have used',
    dailyGroups: [
      { name: 'Testing', items: ['Playwright', 'TypeScript', 'Postman'] },
      { name: 'CI and version control', items: ['GitLab CI', 'Git'] },
      { name: 'Management and AI', items: ['Jira', 'Claude Code'] },
    ],
    usedGroups: [
      { name: 'Testing', items: ['Cypress', 'Protractor', 'Vitest', 'HP ALM'] },
      { name: 'Frontend', items: ['React', 'Next.js', 'Vite', 'Tailwind CSS', 'shadcn/ui'] },
      { name: 'Backend', items: ['Node.js', 'tRPC', 'Better Auth', 'Zod'] },
      { name: 'Data', items: ['PostgreSQL', 'Drizzle ORM', 'SQL / MySQL'] },
      { name: 'Delivery and deployment', items: ['GitHub Actions', 'Docker Compose', 'ESLint', 'Vercel'] },
    ],
    pathTitle: 'Path',
    path: [
      {
        role: 'QA Automation Engineer',
        context: 'EdTech SaaS platform · 40M+ users',
        when: 'Nov 2020 – present',
        points: [
          'Deployment validation cut from 3 h to 45 min, about 3 fewer days of manual testing.',
          '48 active tests across 41 specs covering 18 critical features.',
          'Leading the TypeScript migration and contributing to the Core shared by two products.',
        ],
      },
      {
        role: 'Quality Assurance Tester',
        context: 'Global consultancy · telecom client',
        when: 'Oct 2019 – Nov 2020',
        points: ['Test plans and cases across web, desktop and mobile, with Postman API checks and Scrum delivery.'],
      },
    ],
    freelanceTitle: 'Freelance projects',
    freelance: [
      {
        name: 'Cypress automation repository refactor',
        context: 'SaaS company · Cypress',
        points: [
          'Restructured the whole repository: from no Page Object Model, no product-variables repositories and no page builder to adopting all three.',
          'One-line files with loose components became a consistent structure that is easy to read and maintain.',
        ],
      },
      {
        name: 'Manual testing of audio software',
        context: 'World-renowned recording studio · audio streaming application',
        points: ['Manual testing of the application and its usage flows for a professional audio product.'],
      },
    ],
    beforeTitle: 'Before QA: ten years in audiovisual',
    beforeText:
      'Video and photography for clients, and three years teaching digital photography. Three habits came with it and I use them when testing: delivering to a fixed deadline, explaining a failure to someone non-technical and looking at the result the way the user would.',
    projectsTitle: 'Own projects',
    projects: [
      {
        name: 'Multi-organisation CRM that captures Instagram and Meta leads',
        stack: 'Next.js · TypeScript · tRPC · Drizzle · PostgreSQL · shadcn/ui · Vitest · Playwright · GitHub Actions',
        points: [
          'Started from scratch and owned the frontend and the testing: Next.js (App Router) with strict TypeScript, shadcn/ui, Zod-validated forms and per-organisation theming.',
          'Vitest tests against a real Postgres database and Playwright E2E, in GitHub Actions CI (types, lint, tests, build and dependency audit) with Git hooks before every commit and push.',
          'Modular monolith in a pnpm monorepo (ui, contracts, api, core, db, auth, messaging) with layer dependency rules enforced by ESLint and data isolation between organisations.',
          'Backend stack: tRPC 11, Better Auth, Drizzle ORM on PostgreSQL (Neon), HMAC-signed webhooks and the WhatsApp Business API.',
          'Covers accessibility (WCAG), responsive design and a nonce-based Content Security Policy.',
        ],
      },
      {
        name: 'My English Teacher',
        stack: 'React 19 · Vite · TypeScript · OpenAI-compatible API · Vercel',
        text: 'Production app that generates English exercises with an LLM and validates answers with 90% fuzzy matching.',
        href: 'https://english-teacher-five-pi.vercel.app',
        link: 'Open the app',
      },
      {
        name: 'This portfolio',
        stack: 'Playwright · TypeScript · CI/CD',
        text: 'A playground with a chaos endpoint, 593 API tests and a live results dashboard.',
        href: '/reports',
        link: 'See the results',
      },
    ],
    exploring: 'Exploring',
    exploringText:
      'A repository of continuous AI evaluations with Slack alerts when a score drops below an agreed threshold. I am still assessing Playwright versus a purpose-built framework; nothing is implemented yet.',
    baseTitle: 'Education and languages',
    base: [
      'Social Communication, Audiovisual Arts — UCAB, 2008',
      'Fullstack JavaScript — EANT, 2020–2021',
      'Software Tester QA — EducacionIT, 2019',
      'Spanish native · English B2',
    ],
    closeTitle: 'Shall we talk?',
    closeText: 'I am looking for a QA Automation role where quality is part of the pipeline, not a last step.',
    closeContact: 'Write to me →',
  },
};
