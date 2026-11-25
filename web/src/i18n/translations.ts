import { pgEn, pgEs, type PgKey } from './playground';

export type Lang = 'es' | 'en';

export type Translations = Record<PgKey, string> & {
  /* Topbar */
  'nav-home': string;
  'nav-contact': string;
  'nav-reports': string;

  /* Index */
  'header-role': string;
  'about-label': string;
  'about-text': string;
  'suites-label': string;
  'suites-title': string;
  'card1-title': string;
  'card2-title': string;
  'card3-title': string;
  'ci-label': string;
  'ci-title': string;
  'ci-desc': string;
  'ci-link': string;
  'stack-label': string;
  'stack-title': string;
  'stack-pw': string;
  'stack-ts': string;
  'stack-pom': string;
  'stack-api': string;
  'footer-copy': string;
  'home-cta': string;
  'hero-proof': string;
  'home-cv': string;
  'proof-title': string;
  'proof-ci-title': string;
  'proof-ci-desc': string;
  'proof-pg-title': string;
  'proof-pg-desc': string;
  'proof-eval-title': string;
  'proof-eval-desc': string;
  'proof-cv-title': string;
  'proof-cv-desc': string;
  'folder-pg-line': string;
  'folder-contact-line': string;
  'front-desc': string;
  'front-link': string;
  'close-title': string;
  'cta-cv': string;
  'close-line': string;
  'folder-contact-result': string;
  'alt-reports': string;
  'alt-shop': string;
  'alt-eval': string;
  'alt-cv': string;
  'hero-art-alt': string;
  'peek-cv-1': string;
  'peek-cv-2': string;
  'peek-pg-1': string;
  'peek-pg-2': string;
  'peek-ct-1': string;
  'peek-ct-2': string;
  'alt-contact': string;

  /* Contact */
  'contact-label': string;
  'contact-title': string;
  'contact-desc': string;
  'form-subject': string;
  'form-label-name': string;
  'form-placeholder-name': string;
  'form-label-email': string;
  'form-placeholder-email': string;
  'form-label-message': string;
  'form-placeholder-message': string;
  'form-submit': string;
  'form-sending': string;
  'form-success': string;
  'form-error': string;
  'field-error-name': string;
  'field-error-email': string;
  'field-error-message': string;

  /* Reports */
  'reports-label': string;
  'reports-title': string;
  'reports-desc': string;

  /* CV */
  'location': string;
  'section-profile': string;
  'profile-text': string;
  'section-experience': string;
  'job1-title': string;
  'job1-date': string;
  'job1-location': string;
  'job1-bullets': string[];
  'job2-client': string;
  'job2-bullets': string[];
  'job3-title': string;
  'job3-company': string;
  'job3-bullets': string[];
  'section-projects': string;
  'project1-desc': string;
  'section-skills': string;
  'skill-quality': string;
  'skill-quality-value': string;
  'skill-ai-conv': string;
  'skill-ai-conv-value': string;
  'skill-automation': string;
  'skill-automation-value': string;
  'skill-integration': string;
  'skill-integration-value': string;
  'skill-data': string;
  'skill-data-value': string;
  'skill-ai': string;
  'skill-ai-value': string;
  'skill-mgmt': string;
  'skill-mgmt-value': string;
  'section-education': string;
  'edu1-degree': string;
  'edu2-degree': string;
  'edu3-degree': string;
  'edu4-degree': string;
  'edu5-degree': string;
  'section-languages': string;
  'lang-spanish': string;
  'lang-spanish-level': string;
  'lang-english': string;
  'lang-english-level': string;
};

export const translations: Record<Lang, Translations> = {
  es: {
    ...pgEs,
    /* Topbar */
    'nav-home':    'Inicio',
    'nav-contact': 'Contacto',
    'nav-reports': 'Resultados',

    /* Index */
    'header-role':  'QA Automation Engineer',
    'about-label':  'Sobre este portfolio',
    'about-text':   'Calidad de IA conversacional y automatización QA con evidencia que se puede verificar: cada afirmación de este sitio enlaza a algo que corre.',
    'suites-label': 'Suites de tests',
    'suites-title': 'Qué se testea',
    'card1-title':  'Navegación',
    'card2-title':  'CV e idioma',
    'card3-title':  'API Pública',
    'ci-label':     'Pipeline CI/CD',
    'ci-title':     'Automatizado en cada push',
    'ci-desc':      'Los tests se ejecutan automáticamente en cada push a <code>main</code> vía GitHub Actions. El reporte HTML completo de Playwright se almacena como artefacto de build por 30 días, así los resultados están siempre a un clic después de cada ejecución.',
    'ci-link':      'Ver repositorio en GitHub →',
    'stack-label':  'Stack tecnológico',
    'stack-title':  'Herramientas & patrones',
    'stack-pw':     'Automatización de tests',
    'stack-ts':     'Tipado estricto',
    'stack-pom':    'Abstracción mantenible de UI',
    'stack-api':    'Playwright request context',
    'footer-copy':  'Hecho por Erika Zambrano usando Claude Code como herramienta · 2026',
    'home-cta': 'Hablemos →',
    'hero-proof': '{passed}/{total} tests pasan en CI →',
    'home-cv': 'Ver CV',
    'proof-title': 'Evidencia ejecutable',
    'proof-ci-title': 'Suite en CI',
    'proof-ci-desc': '{passed} de {total} tests pasan, {failed} fallan, {skipped} omitidos. Resultados grabados de la última ejecución.',
    'proof-pg-title': 'QA Playground',
    'proof-pg-desc': 'App propia con tienda, carrito, checkout, login y un endpoint de caos para practicar E2E, API y DevTools.',
    'proof-eval-title': 'Arnés de evaluación de IA',
    'proof-eval-desc': 'Casos golden, checks deterministas y un juez LLM sobre un tutor conversacional.',
    'proof-cv-title': 'CV',
    'proof-cv-desc': 'Experiencia, proyectos y herramientas, en español e inglés.',
    'folder-pg-line': 'Tienda, carrito, checkout y login para practicar E2E y API.',
    'folder-contact-line': 'Agenda una conversación o escríbeme directo.',
    'front-desc': '{failed} fallan, {skipped} omitidos. Resultados grabados de la última ejecución.',
    'front-link': 'Ver reporte completo →',
    'close-title': '¿Buscas QA Automation? Hablemos.',
    'cta-cv': 'Ver CV →',
    'close-line': 'Disponible para entrevistas.',
    'folder-contact-result': 'Disponible',
    'alt-reports': 'Panel de reportes con la última ejecución de CI',
    'alt-shop': 'Tienda del QA Playground con filtros y tarjetas de obras',
    'alt-eval': 'Panel de reportes en la pestaña de evaluación de IA',
    'alt-cv': 'Página del CV',
    'hero-art-alt': 'Archivador de oficina de los años 80 con cajones de CV, laboratorio, contacto y resultados; el monitor de encima muestra cuántos tests pasan.',
    'peek-cv-1': 'Quality Engineer con casi 7 años en productos SaaS.',
    'peek-cv-2': 'Playwright · TypeScript · API testing · CI/CD',
    'peek-pg-1': '{api} casos de API y {e2e} tests E2E sobre una tienda real.',
    'peek-pg-2': 'Carrito, cupones, stock, login y un endpoint de caos.',
    'peek-ct-1': 'Disponible para entrevistas.',
    'peek-ct-2': 'Escríbeme en español o en inglés.',
    'alt-contact': 'Página de contacto con el formulario',

    /* Contact */
    'contact-label':            'Contacto',
    'contact-title':            'Hablemos',
    'contact-desc':             '¿Tienes una propuesta, pregunta o simplemente quieres saludar? Déjame tu mensaje y te respondo pronto.',
    'form-subject':             'Nuevo mensaje desde el portfolio',
    'form-label-name':          'Nombre',
    'form-placeholder-name':    'Tu nombre',
    'form-label-email':         'Email',
    'form-placeholder-email':   'tu@email.com',
    'form-label-message':       'Mensaje',
    'form-placeholder-message': 'Tu mensaje...',
    'form-submit':              'Enviar mensaje',
    'form-sending':             'Enviando…',
    'form-success':             '¡Mensaje enviado! Te respondo pronto.',
    'form-error':               'Algo salió mal. Intenta de nuevo o escríbeme a erikajzm@gmail.com',
    'field-error-name':         'Por favor, ingresa tu nombre.',
    'field-error-email':        'Por favor, ingresa un email válido.',
    'field-error-message':      'El mensaje debe tener al menos 10 caracteres.',

    /* Reports */
    'reports-label': 'Reportes',
    'reports-title': 'Calidad medible',
    'reports-desc':  'Evaluación de un LLM con checks deterministas y juez LLM, más el estado de la suite de Playwright. Todo versionado en el repo.',

    /* CV */
    'location':           '📍 València, España',
    'section-profile':    'Perfil profesional',
    'profile-text':       'Quality Engineer con casi 7 años de experiencia mejorando la confianza en los releases de productos SaaS mediante testing funcional, validación de APIs y automatización con Playwright. Experiencia testeando flujos de producto con IA y múltiples servicios, identificando riesgos de integración de forma temprana y convirtiéndolos en prácticas de calidad pragmáticas. Interés en IA conversacional, outputs dinámicos y procesos de release confiables para productos basados en LLMs.',
    'section-experience': 'Experiencia profesional',
    'job1-title':         'QA Automation Engineer',
    'job1-date':          'Nov 2020 – Presente',
    'job1-location':      'Remoto',
    'job1-bullets': [
      '<strong>Aumenté la confianza en los releases</strong> de una funcionalidad emergente de AI Teacher Tools, contribuyendo a una estrategia de testing por capas y API-first para un micro-frontend conversacional con dependencias de servicio en evolución.',
      '<strong>Reduje el riesgo de integración temprana</strong> validando contratos de API, usando mocks de Playwright para servicios inestables y probando el comportamiento de feature flags antes de depender de una cobertura E2E frágil.',
      '<strong>Protegí flujos críticos del docente</strong> validando la comunicación entre iframes, los flujos de asignación por <code>postMessage</code> y el comportamiento de autenticación JWT-to-session de la experiencia embebida con IA.',
      '<strong>Mejoré la cobertura de calidad automatizada</strong> mediante la migración de Protractor a Playwright y el mantenimiento de <strong>48 tests activos en 41 spec files</strong>, cubriendo 18 features críticas del producto.',
      '<strong>Ayudé a reducir el testing manual</strong> en aproximadamente 3 días y la validación de despliegue de <strong>3 horas a 45 minutos</strong>, mediante mantenimiento de la suite de regresión, validación en CI y colaboración temprana con Producto e Ingeniería.',
    ],
    'job2-client': 'cliente: Telecom Argentina',
    'job2-bullets': [
      'Diseño y ejecución de planes y casos de prueba funcionales para proyectos Telco en aplicaciones web, desktop y mobile.',
      'Mejora de la trazabilidad de defectos mediante reportes de bugs estructurados, testing end-to-end y documentación de pruebas usando <strong>Jira y HP ALM</strong>.',
      'Validación de APIs REST con <strong>Postman</strong> y colaboración con equipos de delivery bajo prácticas <strong>Scrum</strong>.',
    ],
    'job3-title':   'Freelance Audiovisual Producer, Photography Assistant & Teacher',
    'job3-company': 'Trabajo independiente para distintas compañías y fotógrafos',
    'job3-bullets': [
      'Entrega de proyectos audiovisuales de cara al cliente con especial atención al detalle, plazos y estándares de entrega reproducibles.',
      'Docencia de fotografía digital durante más de 3 años, fortaleciendo habilidades de comunicación, explicación técnica, feedback estructurado y mentoría.',
    ],
    'section-projects': 'Proyecto destacado con IA',
    'project1-desc':    'Producto de IA orientado al usuario final para explorar cómo hacer confiable contenido generado por IA en un flujo de interacción real. Diseñé validación en torno a nivel de idioma, estructura esperada, consistencia bilingüe, evaluación de respuestas con fuzzy matching y recuperación del usuario ante respuestas imperfectas o variables. <strong>Resultado:</strong> una aplicación en producción que demuestra consideraciones prácticas de calidad para contenido generado por IA, incluyendo guardarraíles de cara al usuario, criterios de comportamiento esperado y manejo de edge cases.',
    'section-skills':   'Habilidades técnicas',
    'skill-quality':        'Ingeniería de calidad',
    'skill-quality-value':  'Testing basado en riesgo · Preparación para release · Estrategia de regresión · Testing exploratorio · Investigación de defectos',
    'skill-ai-conv':         'IA y calidad conversacional',
    'skill-ai-conv-value':   'Flujos conversacionales · Outputs dinámicos · Verificación de consistencia · Criterios de comportamiento esperado · Flujos de trabajo asistidos por IA',
    'skill-automation':       'Automatización de tests',
    'skill-automation-value': 'Playwright · TypeScript · JavaScript · Page Object Model · Regresión visual · Validación API-first',
    'skill-integration':       'Integración y arquitectura',
    'skill-integration-value': 'APIs REST/JSON · Contratos de API · Mock data · Micro-frontends · iframes · postMessage · Feature flags · Flujos de auth/sesión',
    'skill-data':       'API, datos y entrega',
    'skill-data-value': 'Postman · Códigos de estado HTTP · SQL · MySQL · GitLab CI · GitHub Actions',
    'skill-ai':         'Exposición a IA y plataformas',
    'skill-ai-value':   'Claude Code · Skills/plugins de QA · APIs compatibles con OpenAI · NestJS · FastAPI · Exposición a AWS Bedrock / OpenSearch',
    'skill-mgmt':       'Colaboración',
    'skill-mgmt-value': 'Jira · HP ALM · Scrum · Comunicación de riesgos técnicos · Colaboración con Producto e Ingeniería',
    'section-education': 'Formación',
    'edu1-degree':       'Software Tester QA',
    'edu2-degree':       'Análisis Funcional IT',
    'edu3-degree':       'Introducción a Base de Datos y SQL',
    'edu4-degree':       'Fullstack Developer – JavaScript',
    'edu5-degree':       'Licenciatura en Comunicación Social, mención Artes Audiovisuales',
    'section-languages': 'Idiomas',
    'lang-spanish':       'Español',
    'lang-spanish-level': 'Nativo',
    'lang-english':       'Inglés',
    'lang-english-level': 'B2 Upper Intermediate · Formación presencial en Vancouver, Canadá (iTTTi, 2014–2015)',
  },

  en: {
    ...pgEn,
    /* Topbar */
    'nav-home':    'Home',
    'nav-contact': 'Contact',
    'nav-reports': 'Results',

    /* Index */
    'header-role':  'QA Automation Engineer',
    'about-label':  'About this portfolio',
    'about-text':   'Conversational AI quality and QA automation with evidence you can verify: every claim on this site links to something that runs.',
    'suites-label': 'Test suites',
    'suites-title': "What's tested",
    'card1-title':  'Navigation',
    'card2-title':  'CV & language',
    'card3-title':  'Public API',
    'ci-label':     'CI/CD Pipeline',
    'ci-title':     'Automated on every push',
    'ci-desc':      'Tests run automatically on every push to <code>main</code> via GitHub Actions. The full Playwright HTML report is stored as a build artifact for 30 days, so results are always one click away after any run.',
    'ci-link':      'View repository on GitHub →',
    'stack-label':  'Tech stack',
    'stack-title':  'Tools & patterns',
    'stack-pw':     'Test Automation',
    'stack-ts':     'Strict-mode type safety',
    'stack-pom':    'Maintainable UI abstraction',
    'stack-api':    'Playwright request context',
    'footer-copy':  'Built by Erika Zambrano using Claude Code as a tool · 2026',
    'home-cta': 'Let\'s talk →',
    'hero-proof': '{passed}/{total} tests passing in CI →',
    'home-cv': 'View CV',
    'proof-title': 'Executable evidence',
    'proof-ci-title': 'CI suite',
    'proof-ci-desc': '{passed} of {total} tests pass, {failed} fail, {skipped} skipped. Recorded results from the latest run.',
    'proof-pg-title': 'QA Playground',
    'proof-pg-desc': 'A purpose-built app with shop, cart, checkout, login and a chaos endpoint to practice E2E, API and DevTools.',
    'proof-eval-title': 'AI evaluation harness',
    'proof-eval-desc': 'Golden cases, deterministic checks and an LLM judge over a conversational tutor.',
    'proof-cv-title': 'CV',
    'proof-cv-desc': 'Experience, projects and tools, in Spanish and English.',
    'folder-pg-line': 'Shop, cart, checkout and login to practice E2E and API.',
    'folder-contact-line': 'Book a conversation or write to me directly.',
    'front-desc': '{failed} failed, {skipped} skipped. Recorded results from the latest run.',
    'front-link': 'See the full report →',
    'close-title': 'Hiring for QA automation? Let\'s talk.',
    'cta-cv': 'View CV →',
    'close-line': 'Open to interviews.',
    'folder-contact-result': 'Available',
    'alt-reports': 'Reports dashboard with the latest CI run',
    'alt-shop': 'QA Playground shop with filters and artwork cards',
    'alt-eval': 'Reports dashboard on the AI evaluation tab',
    'alt-cv': 'Curriculum vitae page',
    'hero-art-alt': '1980s office filing cabinet with drawers for CV, test lab, contact and results; the monitor on top shows how many tests pass.',
    'peek-cv-1': 'Quality Engineer with nearly 7 years on SaaS products.',
    'peek-cv-2': 'Playwright · TypeScript · API testing · CI/CD',
    'peek-pg-1': '{api} API cases and {e2e} E2E tests on a working shop.',
    'peek-pg-2': 'Cart, coupons, stock, login and a chaos endpoint.',
    'peek-ct-1': 'Open to interviews.',
    'peek-ct-2': 'Write to me in Spanish or English.',
    'alt-contact': 'Contact page with the form',

    /* Contact */
    'contact-label':            'Contact',
    'contact-title':            "Let's talk",
    'contact-desc':             "Have a proposal, a question, or just want to say hi? Leave me a message and I'll get back to you soon.",
    'form-subject':             'New message from the portfolio',
    'form-label-name':          'Name',
    'form-placeholder-name':    'Your name',
    'form-label-email':         'Email',
    'form-placeholder-email':   'you@email.com',
    'form-label-message':       'Message',
    'form-placeholder-message': 'Your message...',
    'form-submit':              'Send message',
    'form-sending':             'Sending…',
    'form-success':             "Message sent! I'll get back to you soon.",
    'form-error':               'Something went wrong. Try again or email me at erikajzm@gmail.com',
    'field-error-name':         'Please enter your name.',
    'field-error-email':        'Please enter a valid email address.',
    'field-error-message':      'The message must be at least 10 characters.',

    /* Reports */
    'reports-label': 'Reports',
    'reports-title': 'Measurable quality',
    'reports-desc':  'LLM evaluation with deterministic checks and an LLM judge, plus the state of the Playwright suite. All versioned in the repo.',

    /* CV */
    'location':           '📍 Valencia, Spain',
    'section-profile':    'Professional Profile',
    'profile-text':       'Quality Engineer with nearly 7 years of experience improving release confidence for SaaS products through functional testing, API validation, and Playwright automation. Experienced in testing AI-powered, multi-service product flows, identifying integration risks early, and turning them into pragmatic quality practices. Interested in conversational AI, dynamic outputs, and reliable release processes for LLM-powered products.',
    'section-experience': 'Professional Experience',
    'job1-title':         'QA Automation Engineer',
    'job1-date':          'Nov 2020 – Present',
    'job1-location':      'Remote',
    'job1-bullets': [
      '<strong>Increased release confidence</strong> for an emerging AI Teacher Tools feature by contributing to an API-first, layered testing strategy for a conversational micro-frontend with evolving service dependencies.',
      '<strong>Reduced early integration risk</strong> by validating API contracts, using Playwright mocks for unstable services, and testing feature-flag behaviour before relying on fragile end-to-end coverage.',
      '<strong>Protected critical teacher workflows</strong> by validating iframe communication, <code>postMessage</code> assignment flows, and JWT-to-session authentication behaviour for the embedded AI experience.',
      '<strong>Improved automated quality coverage</strong> through the Protractor-to-Playwright migration and maintenance of <strong>48 active tests across 41 spec files</strong>, covering 18 critical product features.',
      '<strong>Helped reduce manual testing</strong> by approximately 3 days and deployment validation from <strong>3 hours to 45 minutes</strong>, through regression-suite maintenance, CI validation, and early collaboration with Product and Engineering.',
    ],
    'job2-client': 'client: Telecom Argentina',
    'job2-bullets': [
      'Designed and executed functional test plans and test cases for Telco projects across web, desktop, and mobile applications.',
      'Improved defect traceability through structured bug reporting, end-to-end testing, and test documentation using <strong>Jira and HP ALM</strong>.',
      'Validated REST APIs with <strong>Postman</strong> and collaborated with delivery teams under <strong>Scrum</strong> practices.',
    ],
    'job3-title':   'Freelance Audiovisual Producer, Photography Assistant & Teacher',
    'job3-company': 'Independent work for various companies and photographers',
    'job3-bullets': [
      'Delivered client-facing audiovisual projects with strong attention to detail, deadlines, and reproducible delivery standards.',
      'Taught digital photography for more than 3 years, strengthening communication, technical explanation, structured feedback, and mentoring skills.',
    ],
    'section-projects': 'Selected AI Project',
    'project1-desc':    'User-facing AI learning product built to explore how generated content can be made reliable in a real interaction flow. Designed validation around language level, expected structure, bilingual consistency, fuzzy-answer evaluation, and user recovery from imperfect or variable responses. <strong>Result:</strong> a working production application demonstrating practical quality considerations for AI-generated content, including user-facing guardrails, expected-behaviour criteria, and edge-case handling.',
    'section-skills':   'Technical Skills',
    'skill-quality':        'Quality Engineering',
    'skill-quality-value':  'Risk-based testing · Release readiness · Regression strategy · Exploratory testing · Defect investigation',
    'skill-ai-conv':         'AI & Conversational Quality',
    'skill-ai-conv-value':   'Conversational flows · Dynamic outputs · Consistency checks · Expected-behaviour criteria · AI-assisted workflows',
    'skill-automation':       'Test Automation',
    'skill-automation-value': 'Playwright · TypeScript · JavaScript · Page Object Model · Visual regression · API-first validation',
    'skill-integration':       'Integration & Architecture',
    'skill-integration-value': 'REST/JSON APIs · API contracts · Mock data · Micro-frontends · iframes · postMessage · Feature flags · Auth/session flows',
    'skill-data':       'API, Data & Delivery',
    'skill-data-value': 'Postman · HTTP status codes · SQL · MySQL · GitLab CI · GitHub Actions',
    'skill-ai':         'AI & Platform Exposure',
    'skill-ai-value':   'Claude Code · QA skills/plugins · OpenAI-compatible APIs · NestJS · FastAPI · AWS Bedrock / OpenSearch exposure',
    'skill-mgmt':       'Collaboration',
    'skill-mgmt-value': 'Jira · HP ALM · Scrum · Technical risk communication · Product and engineering collaboration',
    'section-education': 'Education',
    'edu1-degree':       'Software Tester QA',
    'edu2-degree':       'IT Functional Analysis',
    'edu3-degree':       'Introduction to Databases and SQL',
    'edu4-degree':       'Fullstack Developer – JavaScript',
    'edu5-degree':       'BA in Social Communication, Audiovisual Arts',
    'section-languages': 'Languages',
    'lang-spanish':       'Spanish',
    'lang-spanish-level': 'Native',
    'lang-english':       'English',
    'lang-english-level': 'B2 Upper Intermediate · In-person immersion in Vancouver, Canada (iTTTi, 2014–2015)',
  },
};
