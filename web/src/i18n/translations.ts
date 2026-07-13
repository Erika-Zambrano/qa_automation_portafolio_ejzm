export type Lang = 'es' | 'en';

export type Translations = {
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
  'card4-title': string;
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
  'skill-automation': string;
  'skill-languages': string;
  'skill-manual': string;
  'skill-ai': string;
  'skill-ai-value': string;
  'skill-db': string;
  'skill-mgmt': string;
  'section-education': string;
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
    /* Topbar */
    'nav-home':    'Inicio',
    'nav-contact': 'Contacto',
    'nav-reports': 'Reportes',

    /* Index */
    'header-role':  'QA Automation Engineer',
    'about-label':  'Sobre este portfolio',
    'about-text':   'Este repositorio demuestra habilidades reales de automatización QA usando Playwright y TypeScript, incluyendo testing de UI, testing de API, Page Object Model e integración continua con GitHub Actions.',
    'suites-label': 'Suites de tests',
    'suites-title': 'Qué se testea',
    'card1-title':  'Navegación',
    'card2-title':  'Formularios & Validación',
    'card3-title':  'Accesibilidad',
    'card4-title':  'API Pública',
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
    'reports-title': 'Próximamente',
    'reports-desc':  'Esta sección está en construcción.',

    /* CV */
    'location':           '📍 València, España',
    'section-profile':    'Perfil profesional',
    'profile-text':       'QA Engineer con casi 7 años de experiencia en testing manual y automatización, especializada en <strong>Playwright con JavaScript/TypeScript</strong> en entornos <strong>EdTech SaaS</strong>. Participé activamente en la migración del framework de testing de Protractor a Playwright, contribuyendo en decisiones técnicas y mejoras del repositorio. Actualmente involucrada en la transición del stack completo de JavaScript a TypeScript. Experiencia práctica con <strong>Claude Code</strong> para el desarrollo de skills y plugins orientados a testing. Sólida base en testing web, mobile, iOS, API y CI/CD. Inglés B2 con experiencia de inmersión en Canadá.',
    'section-experience': 'Experiencia profesional',
    'job1-title':         'QA Automation Engineer',
    'job1-date':          'Nov 2020 – Presente',
    'job1-location':      'Remoto',
    'job1-bullets': [
      'Participé activamente en la migración del framework de testing de <strong>Protractor a Playwright</strong>, contribuyendo en decisiones técnicas y mejoras del repositorio.',
      'Desarrollo y mantenimiento de <strong>48 tests automatizados activos</strong> en 41 spec files cubriendo 18 features críticas del producto (suites @sanity, @regression y @smoke).',
      'Contribución a la reducción del tiempo de testing manual en <strong>~3 días</strong> en entorno de pruebas y del ciclo de deploy de <strong>3 horas a 45 minutos</strong> por despliegue.',
      'Involucrada en la <strong>migración del stack de JavaScript a TypeScript</strong>, con participación en decisiones técnicas del repositorio core y del repositorio principal de Nearpod.',
      'Desarrollo de <strong>skills y plugins con Claude Code</strong> para mejorar la velocidad y eficiencia del equipo QA.',
      'Testing manual de aplicaciones web, mobile e iOS; API testing con <strong>Postman</strong>; integración continua con <strong>GitLab CI</strong>.',
    ],
    'job2-client': 'cliente: Telecom Argentina',
    'job2-bullets': [
      'Diseño, creación y ejecución de planes y casos de prueba para múltiples proyectos del sector Telco.',
      'Testing web, desktop y mobile; E2E testing; gestión de bugs con <strong>Jira y HP ALM</strong>.',
      'API testing con <strong>Postman</strong>; metodología <strong>Scrum</strong>.',
    ],
    'job3-title':   'Freelance Audiovisual Producer, Photography Assistant & Teacher',
    'job3-company': 'Trabajo independiente para distintas compañías y fotógrafos',
    'job3-bullets': [
      'Trabajo freelance para distintas compañías y fotógrafos como asistente y segunda cámara en proyectos de fotografía y video.',
      'Realización de grabaciones, edición de video y coordinación de entregables técnicos para clientes corporativos e individuales.',
      'Docencia de fotografía digital durante más de 3 años, desarrollando habilidades de comunicación, explicación clara de procesos y acompañamiento técnico.',
    ],
    'section-projects': 'Proyectos personales',
    'project1-desc':    'Aplicación web en producción para aprender frases idiomáticas en inglés (nivel C1) mediante IA. Incluye validación con fuzzy matching al 90%, mini conversaciones fill-in-the-blank, i18n español/inglés automático, diseño responsive y backend serverless con integración a API de IA (KIMI vía OpenAI SDK).',
    'section-skills':   'Habilidades técnicas',
    'skill-automation': 'Automatización',
    'skill-languages':  'Lenguajes',
    'skill-manual':     'Testing Manual',
    'skill-ai':         'IA & Tooling',
    'skill-ai-value':   'Claude Code, desarrollo de skills y plugins',
    'skill-db':         'Bases de datos',
    'skill-mgmt':       'Gestión',
    'section-education': 'Formación',
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
    /* Topbar */
    'nav-home':    'Home',
    'nav-contact': 'Contact',
    'nav-reports': 'Reports',

    /* Index */
    'header-role':  'QA Automation Engineer',
    'about-label':  'About this portfolio',
    'about-text':   'This repository demonstrates real-world QA automation skills using Playwright and TypeScript, including UI testing, API testing, Page Object Model, and CI/CD integration via GitHub Actions.',
    'suites-label': 'Test suites',
    'suites-title': "What's tested",
    'card1-title':  'Navigation',
    'card2-title':  'Forms & Validation',
    'card3-title':  'Accessibility',
    'card4-title':  'Public API',
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
    'reports-title': 'Coming soon',
    'reports-desc':  'This section is under construction.',

    /* CV */
    'location':           '📍 Valencia, Spain',
    'section-profile':    'Professional Profile',
    'profile-text':       'QA Engineer with nearly 7 years of experience in manual and automated testing, specializing in <strong>Playwright with JavaScript/TypeScript</strong> in <strong>EdTech SaaS</strong> environments. Actively contributed to the migration of the testing framework from Protractor to Playwright, with input on technical decisions and repository improvements. Currently involved in the full stack migration from JavaScript to TypeScript. Hands-on experience with <strong>Claude Code</strong> for developing skills and plugins focused on testing. Strong background in web, mobile, iOS, API testing, and CI/CD. B2 English with immersion experience in Canada.',
    'section-experience': 'Professional Experience',
    'job1-title':         'QA Automation Engineer',
    'job1-date':          'Nov 2020 – Present',
    'job1-location':      'Remote',
    'job1-bullets': [
      'Actively contributed to the migration of the testing framework from <strong>Protractor to Playwright</strong>, providing input on technical decisions and repository improvements.',
      'Developed and maintain <strong>48 active automated tests</strong> across 41 spec files covering 18 critical product features (suites: @sanity, @regression, and @smoke).',
      'Contributed to reducing manual testing time by <strong>~3 days</strong> in the test environment and cutting deploy testing cycles from <strong>3 hours to 45 minutes</strong>.',
      'Actively involved in the <strong>JavaScript to TypeScript migration</strong>, contributing to technical decisions for both the core repository and the main Nearpod test repository.',
      'Developed <strong>skills and plugins using Claude Code</strong> to improve QA team velocity and efficiency.',
      'Manual testing of web, mobile, and iOS applications; API testing with <strong>Postman</strong>; CI/CD integration with <strong>GitLab CI</strong>.',
    ],
    'job2-client': 'client: Telecom Argentina',
    'job2-bullets': [
      'Design, creation, and execution of test plans and test cases for multiple projects in the Telco sector.',
      'Web, desktop, and mobile testing; E2E testing; bug tracking and test case management with <strong>Jira and HP ALM</strong>.',
      'API testing with <strong>Postman</strong>; <strong>Scrum</strong> methodology.',
    ],
    'job3-title':   'Freelance Audiovisual Producer, Photography Assistant & Teacher',
    'job3-company': 'Independent work for various companies and photographers',
    'job3-bullets': [
      'Freelance work as assistant and second camera operator on photography and video projects for multiple companies and independent photographers.',
      'Video recording, editing, and technical deliverable coordination for corporate and individual clients.',
      'Taught digital photography for over 3 years, building strong communication, process explanation, and technical mentoring skills.',
    ],
    'section-projects': 'Personal Projects',
    'project1-desc':    'Production web app for learning C1-level English idioms through AI. Features 90% fuzzy matching validation, fill-in-the-blank mini conversations, automatic Spanish/English i18n, responsive design, and a serverless backend integrating an AI API (KIMI via OpenAI SDK).',
    'section-skills':   'Technical Skills',
    'skill-automation': 'Test Automation',
    'skill-languages':  'Languages',
    'skill-manual':     'Manual Testing',
    'skill-ai':         'AI & Tooling',
    'skill-ai-value':   'Claude Code, skills and plugin development',
    'skill-db':         'Databases',
    'skill-mgmt':       'Management',
    'section-education': 'Education',
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
