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
| Lint | ESLint con reglas de tipo (type-aware) y `eslint-plugin-playwright`, para reglas obligatorias que se amplían con el tiempo. Regla propia `local/expect-style` en `tests/ui/` (ver fase 4) |
| Page objects | `pageObjectsInstantiation` en `tests/ui/fixtures/pomBuilder.ts` crea todos los page objects en un solo objeto, entregado por fixtures según el contexto: `guestPages` (sin sesión) y `customerPages` (con login por API). Los specs no importan page objects: `customerPages.checkoutPage.fillAddress(...)`. Cada page object expone `generic` (`button`, `link`, `textbox`, `checkbox`, `heading`, `text`, `testId`). Solo UI |
| Títulos de tests | `Should validate`, `create`, `navigate`, `display` o `switch`, en inglés, con ID y etiquetas en `tag`. Se exige desde la fase 4 (los tests de API de la fase 3 conservan su formato) |

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
- `npm run dev` en la raíz levanta la API y la web juntas.

MR: [#5](https://github.com/Erika-Zambrano/qa_automation_portafolio_ejzm/pull/5)

| Commit | Mensaje |
|---|---|
| `c0a00b9` | docs: add QA playground plan and phases |
| `ed5407d` | feat(web): add QA playground with gallery, checkout, forms, login and signup pages |
| `638ce75` | chore: add npm run dev to start the API and web together |
| `62cc4e7` | Merge pull request #5 from Erika-Zambrano/feat/qa-playground-2-frontend |

### Fase 3: Tests de API

Branch: `feat/qa-playground-3-api-tests`

- Proyectos de Playwright en `playwright.config.ts`, con `webServer` sobre `npm run dev:api` (o `PLAYGROUND_API_URL` para apuntar a otro servidor):
  - `api-playground`: suites sin estado compartido, en paralelo.
  - `api-playground-stateful`: depende del anterior y corre en serie, porque cambia el stock y las claves de idempotencia.
- Suites en `tests/playground-api/`: convenciones (headers, CORS, 405, 415, 413, JSON inválido), auth (login, JWT manipulado, `alg=none`, expiración, rate limit), productos (paginación, filtros, orden), precios del carrito (matriz de totales y cupones), validación de checkout, formularios y adjuntos, chaos, seguridad (inyecciones, prototype pollution, mass assignment) y, en `stateful/`, checkout con stock, concurrencia, idempotencia y control de acceso a órdenes.
- Utilidades en `utils/playground-api.ts` (login, tokens falsificados, cuerpos válidos, aserciones de error).
- Aislamiento: el rate limit se separa por test con la cabecera `X-RateLimit-Key` y el stock se restaura con `POST /api/reset`.
- Script `npm run test:playground-api`.
- Tags `@smoke`, `@sanity`, `@regression`.
- Corrección de backend que salió de los tests: un body de más de 100 KB cortaba la conexión en vez de responder 413.
- ESLint (`eslint.config.mjs`): reglas con tipos (`typescript-eslint` type-checked), `eslint-plugin-playwright` y reglas propias (`no-floating-promises`, `no-explicit-any`, `consistent-type-imports`, `expect-expect`, `no-wait-for-timeout`, `valid-title`). Scripts `npm run lint` y `npm run typecheck`, ambos en CI con `--max-warnings 0`.
- `PomBuilder` (`tests/ui/fixtures/pomBuilder.ts`) con opción `lang`. Los specs de portafolio migraron a él y a los títulos `Should …` con `tag`. En la fase 4 se reemplazó el fixture `pom` por `guestPages` y `customerPages`.
- La regla de títulos `Should …` solo aplica a `tests/ui/`.

| Commit | Mensaje |
|---|---|
| `afb76b7` | fix(api): respond 413 instead of dropping the connection on oversized bodies |
| `4e84944` | test(api): add QA playground API test suites |
| `ec93105` | refactor(ui): add PomBuilder fixture and migrate portfolio specs to Should titles |
| `263053b` | chore: add ESLint with type-aware and Playwright rules, and fix existing findings |
| `5362540` | docs: record ESLint and PomBuilder in the QA playground plan |

### Fase 4: Tests E2E por UI

Branch: `feat/qa-playground-4-e2e-ui`

- Proyecto `playground` en `playwright.config.ts` (`testIdAttribute: data-testid`, `baseURL` `http://localhost:5173` o `PLAYGROUND_WEB_URL`). El `webServer` levanta la API (`npm run dev:api`) y la web (Vite con proxy `/api`), reutilizando los que ya estén corriendo.
- Page objects en `pages/playground/`: `PlaygroundBasePage`, `ShopPage`, `CheckoutPage`, `FormsPage`, `LoginPage`, `SignupPage`. Componentes reutilizables en `pages/playground/components/`: `PlaygroundMenu` (dropdown de la topbar), `SessionBar`, `CartPanel` y `Generic`.
- Fixtures en `tests/ui/fixtures/`:
  - `guestPages` y `customerPages`.
  - `session.signIn(who)` y `session.seedCart(items, coupon)`: precargan sesión y carrito en `localStorage` con `addInitScript`.
  - `isolatedRateLimit` (automático): añade `X-RateLimit-Key` único a las llamadas del navegador. El login por API del fixture también lo envía.
- Textos de los tests (`buttonName`, `messages`) en `tests/ui/test-data/playgroundTexts.ts`, tomados del diccionario i18n de la web.
- Specs en `tests/ui/playground/`: `navigation`, `shop` (catálogo, filtros, paginación, carrito, cupones), `checkout` (acceso, tarjeta, envío, stock, idempotencia), `forms`, `auth` (login y signup con términos obligatorios).
- Híbridos: login por API, `page.route` para 401/409/500/503, timeouts, latencia y respuestas malformadas.
- Regla propia de ESLint `local/expect-style` (`eslint-rules/expect-style.mjs`, solo `tests/ui/`, con autofix):
  - Dos o más `await expect` seguidos van en `await Promise.all([...])` con `expect.soft`.
  - Dentro de un `Promise.all` o de un bucle (`for`, `while`, `forEach`, `map`), siempre `.soft`.
  - El último `expect` suelto de un test no lleva `.soft`; los demás sí.
- `valid-title` exige el vocabulario `Should …`; `prefer-locator` está apagada en `tests/ui/` porque confunde `shopPage` con `page`.
- Limitaciones: el stock vive en memoria del servidor local, así que `checkout` lo consume (usa la obra 6, con 70 copias).

| Commit | Mensaje |
|---|---|
| `d1b5474` | chore(lint): add expect-style rule for soft and grouped expects in UI tests |
| `fffb7cd` | test(ui): add QA playground E2E specs, page objects and guest/customer fixtures |
| `26a2a36` | docs: record phase 3 as done and describe phase 4 in the QA playground plan |

### Fase 5: CI y reports

Branch: `feat/qa-playground-5-ci-reports`

- CI: el `webServer` de Playwright levanta la API (`npm run dev:api`) y Vite; el workflow instala las dependencias de `web/` (corregido en la fase 4). Se verificó en el run del MR.
- Dashboard `/reports`: el resumen (`scripts/summarize-playwright.ts`) añade `projects` (totales por proyecto de Playwright) y `ReportsDashboard` los muestra en "Por proyecto". Las suites del playground aparecen también en la tabla por archivo.
- Corrida programada (`.github/workflows/scheduled-run.yml`): cron `0 6,18 * * *` (UTC) y disparo manual. Corre la suite completa, resume los resultados (con `trigger` y `runUrl`) y los publica en la rama `ci-data` como `ci-results.json`, sin ensuciar `main` ni redesplegar el sitio. El job queda en rojo si algún test falla, pero publica igual.
- `/reports` lee ese JSON desde `raw.githubusercontent.com/.../ci-data/ci-results.json` al cargar y, si falla la petición, usa el JSON empaquetado en el sitio. Muestra la última corrida (fecha, disparador, commit y enlace al run) y la próxima corrida programada.
- `web/src/data/ci-results.json` regenerado con la suite completa (respaldo empaquetado).
- Tests de la API pública de terceros (`tests/api/public-api.spec.ts`): `api.restful-api.dev` limita a 50 peticiones por día por IP y responde 405 al agotarse. Ahora los tests se omiten (`test.skip` condicional) en ese caso, en vez de fallar; ESLint permite `skip` condicional.
- Notas: GitHub puede retrasar el cron y lo desactiva tras 60 días sin actividad en el repo, por eso queda el disparo manual. El repo debe ser público para que la página lea el JSON.
- README: estructura, comandos por proyecto, sección QA Playground y estilo de tests.
- `DESIGN.md` no existe en el repo, no aplica.

| Commit | Mensaje |
|---|---|
| | |

## Estado

| Fase | Branch | Estado | Merge |
|---|---|---|---|
| 1 | `feat/qa-playground-1-backend` | Hecha | MR #4 (`678e73a`) |
| 2 | `feat/qa-playground-2-frontend` | Hecha | MR #5 (`62cc4e7`) |
| 3 | `feat/qa-playground-3-api-tests` | Hecha | MR #6 (`762e250`) |
| 4 | `feat/qa-playground-4-e2e-ui` | Hecha | MR #7 (`387d050`) |
| 5 | `feat/qa-playground-5-ci-reports` | En curso | |
