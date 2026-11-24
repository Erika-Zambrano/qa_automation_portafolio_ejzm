# QA Playground

Sección propia del portafolio con páginas y endpoints típicos de automatización, sin depender de terceros. Sirve para practicar y demostrar E2E por UI, tests de backend y uso de DevTools.

## Concepto

Todo el playground gira en torno a una galería que vende reproducciones de obras de arte (Sorolla, Munch, Frida Kahlo, Van Gogh, Picasso, Rembrandt, Kandinsky, Michelena, Carlos Cruz-Diez). Es un solo concepto con distintas páginas, no sitios separados.

- Cada obra es una copia con unidades limitadas: `stock` baja al confirmar un checkout y se restaura con `POST /api/reset`.
- Textos, ejemplos, datos de prueba y mensajes usan el lenguaje de la galería (obra, artista, coleccionista, pedido).
- Cada página es una parte del recorrido del coleccionista:

| Página | Papel en la galería |
|---|---|
| `/playground/shop` | Catálogo de obras con filtros por artista y movimiento, y carrito |
| `/playground/checkout` | Compra de las obras con envío y pago |
| `/playground/forms` | Solicitud de información, tasación o encargo de una obra, con todos los tipos de input |
| `/playground/login` | Acceso de coleccionistas |
| `/playground/signup` | Registro de coleccionistas con términos y condiciones |

## Decisiones

| Tema | Decisión |
|---|---|
| Persistencia | A: stateless. JWT firmado y carrito en el cliente, validado por el servidor. El stock, la idempotencia y los límites viven en memoria por instancia |
| Navegación | Dropdown "Playground" en la topbar |
| Backend | Una sola función serverless de Vercel (`api/[...path].ts`) que despacha a los handlers de `api/_routes/`. Se unificó por el límite de 12 funciones del plan Hobby |
| Tests de API | Locales contra `npm run dev:api` (servidor Node que monta los mismos handlers de `/api`, sin login ni link a Vercel; determinista, también en CI) |
| i18n | ES y EN, igual que el resto del sitio |
| Selectores | `data-testid` consistente en todos los componentes |

## Estrategia de branches

- Una branch por fase: `feat/qa-playground-<n>-<nombre>`, creada desde `main` actualizado.
- Cada fase se publica con su propio MR hacia `main`, que solo contiene lo de esa fase.
- Al mergear se registran los commits y el MR en la tabla de la fase y se actualiza el estado.
- No hay branch paraguas: se descartó para que `main` reciba cada fase por separado.

## Alcance

### Frontend: `/playground/*`

| Ruta | Contenido |
|---|---|
| `/playground` | Índice con guía de DevTools |
| `/playground/shop` | Catálogo, carrito (agregar, quitar, cantidad, cupón, totales) |
| `/playground/checkout` | Envío, pago, confirmación, errores |
| `/playground/forms` | Todos los tipos de input, validaciones, estados enviando, éxito y error |
| `/playground/login` | Credenciales inválidas, usuario bloqueado, rate limit |
| `/playground/signup` | Validación de contraseña, checkbox obligatorio de términos y condiciones |

Componentes reutilizables: `Field`, `PasswordInput`, `TermsCheckbox`, `ProductCard`, `CartItem`, `CartSummary`, `FormStatus`, `PlaygroundLayout`.

### Backend: `/api/*`

| Endpoint | Función |
|---|---|
| `POST /api/auth/register` | Alta con validación y términos aceptados |
| `POST /api/auth/login` | Emite JWT, bloqueo y rate limit |
| `POST /api/auth/logout` | Cierre de sesión |
| `GET /api/auth/me` | Usuario del token |
| `GET /api/products` | Listado con filtros y paginación |
| `GET /api/products/:id` | Detalle |
| `POST /api/cart/price` | Valida carrito, aplica cupón, calcula totales |
| `POST /api/checkout` | Crea orden, idempotente por `Idempotency-Key` |
| `GET /api/orders/:id` | Consulta de orden |
| `POST /api/forms/submit` | Recibe formulario con todos los tipos |
| `GET /api/chaos` | `status`, `delay`, `malformed` para simular fallos |
| `GET /api/health` | Estado |

Convenciones:

- Formato de error único: `{ error: { code, message, details? } }`.
- Cabecera `X-Request-Id` en todas las respuestas.
- Cabeceras de rate limit: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.
- Contratos documentados en `docs/qa-playground-api.md`.

### Tests

| Tipo | Proyecto Playwright | Cobertura |
|---|---|---|
| API | `api-playground` | Contratos y esquemas, auth (token expirado, manipulado, ausente), validación (límites, tipos, inyección, unicode, payloads grandes), idempotencia, concurrencia, reglas de negocio (cupones, stock, totales), rate limit, headers, CORS, chaos |
| E2E UI | `playground` | Carrito a checkout, formularios, login, signup con términos |
| Híbridos | `playground` | Setup por API y verificación por UI, `page.route` para simular fallos |

## Fases

### Fase 1: Backend y contratos

Branch: `feat/qa-playground-1-backend`

- Estructura `/api`, utilidades compartidas (errores, JWT, rate limit, validación).
- Todos los endpoints de la tabla, con catálogo de obras de arte e inventario que baja al confirmar un checkout.
- Ajuste de `vercel.json`: excluir `/api/*` del rewrite a `index.html`.
- Documento de contratos (`docs/qa-playground-api.md`).
- Script `npm run dev:api` (`scripts/dev-api.ts`) que usa el mismo router que Vercel en `localhost:3100`.
- Refactor a una sola función serverless por el límite de 12 funciones del plan Hobby.

MR: [#4](https://github.com/Erika-Zambrano/qa_automation_portafolio_ejzm/pull/4)

| Commit | Mensaje |
|---|---|
| `ba50736` | feat(api): add QA playground backend with auth, art catalog, stock, cart, checkout, forms and chaos endpoints |
| `6452a99` | refactor(api): route all endpoints through a single serverless function |
| `678e73a` | Merge pull request #4 from Erika-Zambrano/feat/qa-playground-1-backend |

### Fase 2: Componentes y páginas del Playground

Branch: `feat/qa-playground-2-frontend`

- Dropdown "Playground" en la topbar (con `data-testid`).
- Rutas `/playground/*` en `App.tsx`.
- Componentes reutilizables y las 5 pantallas.
- Traducciones ES y EN.
- Página índice con guía de DevTools (Network, Console, Storage, `X-Request-Id`).
- Proxy de `/api` hacia `localhost:3100` en `web/vite.config.ts` para desarrollo local.
- Campos del formulario alineados con la galería: `interests` (`information`, `appraisal`, `commission`, `framing`, `shipping`), `collectingYears` y `message`. Ya vienen en `main`.

| Commit | Mensaje |
|---|---|
| | |

### Fase 3: Tests de API

Branch: `feat/qa-playground-3-api-tests`

- Proyecto `api-playground` en `playwright.config.ts` con `webServer` sobre `npm run dev:api`.
- Suites por área: auth, products, cart, checkout, forms, chaos, seguridad, headers.
- Tags `@smoke`, `@sanity`, `@regression`.

| Commit | Mensaje |
|---|---|
| | |

### Fase 4: Tests E2E por UI

Branch: `feat/qa-playground-4-e2e-tests`

- Page objects en `pages/playground/`.
- Specs: shop y checkout, forms, login, signup con términos.
- Híbridos: login por API, `page.route` para errores 500, latencia y respuestas malformadas.

| Commit | Mensaje |
|---|---|
| | |

### Fase 5: CI y reports

Branch: `feat/qa-playground-5-ci-reports`

- Workflow de CI levantando `npm run dev:api` antes de los tests.
- Resultados del playground en el dashboard `/reports`.
- Actualizar README y `DESIGN.md` si aplica.

| Commit | Mensaje |
|---|---|
| | |

## Estado

| Fase | Branch | Estado | Merge |
|---|---|---|---|
| 1 | `feat/qa-playground-1-backend` | Hecha | MR #4 (`678e73a`) |
| 2 | `feat/qa-playground-2-frontend` | En curso | |
| 3 | `feat/qa-playground-3-api-tests` | Pendiente | |
| 4 | `feat/qa-playground-4-e2e-tests` | Pendiente | |
| 5 | `feat/qa-playground-5-ci-reports` | Pendiente | |
