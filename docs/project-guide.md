# Guía completa del proyecto — QA Automation Portfolio

Esta guía explica **qué hace cada parte del proyecto, por qué se tomó cada decisión y cómo explicarlo en una entrevista**. Léela de arriba a abajo la primera vez; después úsala como referencia rápida.

---

## 1. Qué es este proyecto y por qué existe

Es un repositorio de automatización de pruebas construido con **Playwright + TypeScript**. El objetivo no es testear una app tuya, sino **demostrar en público que sabes hacer QA automation de nivel profesional**:

- Tests UI con Page Object Model
- Tests de API REST
- CI/CD con GitHub Actions (los tests corren solos en cada push)
- Código TypeScript estricto, sin atajos

Cuando un technical lead lo abra, verá tests reales corriendo contra un sitio real, con un badge verde en el README que prueba que el pipeline funciona.

---

## 2. Por qué se eligió cada tecnología

### Playwright (no Cypress, no Selenium)
Playwright es el estándar moderno en automatización UI. Ventajas clave que debes poder mencionar:
- **Auto-wait nativo**: Playwright espera automáticamente a que un elemento sea visible, estable, y habilitado antes de interactuar. No necesitas `sleep()` ni `waitFor()` explícitos en la mayoría de casos.
- **API de test y API HTTP en un solo framework**: el mismo tool corre tests de UI con navegador y tests de API REST con `request` — sin dependencias extras.
- **Locators robustos**: `getByRole`, `getByLabel`, `getByTestId` están alineados con cómo los usuarios y los screen readers perciben la página, no con selectores CSS frágiles.
- **Multi-browser**: corre en Chromium, Firefox y WebKit. En este proyecto usamos solo Chromium para mantener el CI rápido.

### TypeScript (no JavaScript)
TypeScript añade tipado estático. En QA automation esto importa porque:
- El compilador te avisa si usas mal una API de Playwright (ej: pasar `string` donde se espera `Locator`).
- Los Page Objects son más seguros: si cambias un método, TypeScript marca todos los lugares que lo usan.
- En entrevistas seniores, escribir en JS puro puede verse como falta de rigor.

### GitHub Actions (no Jenkins, no CircleCI)
- Es gratuito para repos públicos.
- Está integrado en GitHub: el badge de estado y los artifacts del reporte están en el mismo lugar que el código.
- El workflow se define en un archivo YAML versionado junto al código — la infraestructura de CI es parte del repo.

---

## 3. Estructura de carpetas explicada

```
qa-automation-portfolio/
├── .github/workflows/playwright.yml   ← pipeline de CI
├── tests/
│   ├── ui/                            ← tests que abren un navegador
│   │   ├── navigation.spec.ts
│   │   ├── forms.spec.ts
│   │   └── accessibility.spec.ts
│   └── api/                           ← tests de API HTTP (sin navegador)
│       └── public-api.spec.ts
├── pages/                             ← Page Object Model
│   ├── BasePage.ts
│   └── HomePage.ts
├── utils/
│   └── helpers.ts                     ← funciones reutilizables
├── web/
│   └── index.html                     ← landing page del portfolio
├── docs/
│   └── project-guide.md              ← este archivo
├── playwright.config.ts               ← configuración central de Playwright
├── tsconfig.json                      ← configuración del compilador TypeScript
└── package.json                       ← dependencias y scripts npm
```

La separación `tests/ui/` vs `tests/api/` no es obligatoria en Playwright, pero comunica intención: cualquier persona que abra el repo entiende en 5 segundos qué tipo de tests hay y dónde están.

---

## 4. Archivo por archivo

### `playwright.config.ts`

Es el cerebro de la configuración. Lo más importante:

```typescript
timeout: 30_000          // cada test tiene máximo 30 segundos antes de fallar
expect: { timeout: 5_000 } // cada aserción (expect) tiene 5 segundos
retries: process.env.CI ? 1 : 0  // en CI reintenta 1 vez si falla; en local no
```

**Por qué `retries: 1` en CI y `0` en local:**  
En CI pueden ocurrir fallos de red o lentitud del runner que en local no pasan. Un retry en CI evita falsos negativos. En local, un retry ocultaría un bug real que sí deberías ver.

**`baseURL: 'https://practicesoftwaretesting.com'`:**  
Permite escribir `page.goto('/')` en vez de la URL completa en cada test. Si la URL base cambia, se cambia en un solo lugar.

**`testIdAttribute: 'data-test'`:**  
El sitio de práctica usa `data-test="email"` como atributo HTML. Al declararlo aquí, `page.getByTestId('email')` busca ese atributo automáticamente.

**Reporters:**
- En CI: `['github', 'html']` — el reporter `github` formatea los errores para que aparezcan anotados directamente en el diff del PR.
- En local: `['html', 'list']` — `list` muestra los resultados en la terminal en tiempo real; `html` genera el reporte visual.

**`screenshot: 'only-on-failure'` y `video: 'retain-on-failure'`:**  
Playwright guarda evidencia (captura + video) solo cuando un test falla. Esto es crucial para debugging en CI donde no puedes ver el navegador.

**`trace: 'on-first-retry'`:**  
El trace de Playwright es como una "caja negra" del test: graba cada acción, network request, y estado del DOM. Se activa solo en el primer reintento para no llenar disco en runs normales. Puedes abrirlo con `npx playwright show-trace`.

---

### `tsconfig.json`

```json
"strict": true
```
Activa todas las verificaciones estrictas de TypeScript: no puedes usar `any` implícito, no puedes ignorar valores potencialmente `null`, etc. Esto fuerza código más robusto.

```json
"include": ["tests/**/*", "pages/**/*", "utils/**/*"]
```
Le dice a TypeScript qué carpetas compilar. La carpeta `web/` no se incluye porque es HTML puro, no TypeScript.

---

### `pages/BasePage.ts`

Implementa el **patrón Page Object Model (POM)**. La idea central: **separar los selectores y acciones de la página de la lógica de los tests**.

```typescript
export class BasePage {
  constructor(protected readonly page: Page) {}
  // ...
}
```

- `protected`: la propiedad `page` es accesible desde las clases hijas (ej: `HomePage`) pero no desde fuera.
- `readonly`: el objeto `page` no puede ser reasignado después de la construcción.

**Métodos:**
- `navigate(url)`: wrappea `page.goto()`. Si mañana quieres añadir lógica extra (ej: logging), lo cambias aquí y afecta a todas las páginas.
- `waitForLoad()`: espera a que la red esté en calma (`networkidle`). Útil para SPAs que cargan datos asíncronamente.
- `getTitle()`: devuelve el título del documento. Se usa en tests de smoke para verificar que cargó la página correcta.

**Por qué POM y no poner los selectores directo en los tests:**
Si el selector del botón de login cambia, sin POM tendrías que buscar y cambiar ese selector en cada test que lo use. Con POM, lo cambias en un solo lugar (`HomePage.ts`) y todos los tests se actualizan.

---

### `pages/HomePage.ts`

Extiende `BasePage` y añade elementos y acciones específicos de la home.

```typescript
this.logo = page.locator('a.navbar-brand');
```
El logo del sitio es un SVG dentro de un `<a class="navbar-brand">` — no una imagen `<img>`. Por eso el selector apunta al enlace, no a una imagen.

```typescript
async searchProduct(query: string): Promise<void> {
  await this.page.getByTestId('search-query').fill(query);
  await this.page.getByTestId('search-query').press('Enter');
}
```
`fill()` limpia el campo y escribe el texto. `press('Enter')` simula pulsar la tecla — igual que haría un usuario real.

```typescript
async getProductCount(): Promise<number> {
  const products = this.page.getByTestId('product-name');
  await products.first().waitFor({ timeout: 10_000 });
  return products.count();
}
```
Espera explícitamente a que aparezca al menos el primer producto (la lista carga de forma asíncrona) antes de contar. Sin ese `waitFor`, `count()` podría devolver 0 porque la lista todavía no ha llegado del servidor.

---

### `utils/helpers.ts`

Funciones utilitarias que no pertenecen a ninguna página específica:

- `waitForNetworkIdle`: wrappea la espera de red — útil si quieres parametrizar el timeout.
- `getTextContent`: extrae el texto de un locator y hace `trim()` para quitar espacios. Evita fallos por espacios invisibles.
- `generateTestEmail`: genera emails únicos con timestamp (`qa+1714000000@example.com`). Útil para tests de registro donde no puede haber emails duplicados.
- `countVisibleElements`: cuenta cuántos elementos con un `data-test` dado están en la página.

---

### `tests/ui/navigation.spec.ts` — suite `@smoke`

**¿Qué es un test de smoke?**  
Son los tests más básicos: verifican que la aplicación arranca y las funcionalidades principales existen. Si fallan los smoke tests, no tiene sentido correr el resto.

**Los 4 tests:**

1. **Homepage loads correctly**: navega a `/`, verifica que el título contiene "practice" (insensible a mayúsculas) y que el logo es visible. Confirma que la home existe y cargó.

2. **Product catalog shows at least one product**: verifica que hay productos en la home. Si la API de productos fallara, este test lo detectaría.

3. **Navigation menu contains expected links**: usa `getByRole('link', { name: /sign in/i })`. `getByRole` es el locator más robusto: busca elementos por su rol semántico HTML y su texto accesible — igual que lo haría un screen reader. La expresión `/sign in/i` es una regex case-insensitive.

4. **Contact page is accessible**: navega a `/contact` y verifica que la URL contiene "contact" y que hay un heading visible. Confirma que la ruta existe y renderiza contenido.

---

### `tests/ui/forms.spec.ts` — suite `@regression`

**¿Qué es una suite de regression?**  
Tests que verifican que funcionalidades existentes no se han roto. Se corren después de cambios en el código para detectar regresiones.

**`test.beforeEach`:**  
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');
});
```
Cada test de esta suite empieza en la página de login. `beforeEach` evita duplicar ese código en cada test. Playwright garantiza que cada test recibe una página fresca (nueva pestaña), así que no hay estado compartido entre tests.

**Test de login inválido:**  
Rellena email y password con credenciales incorrectas, hace click en login, y verifica que aparece `data-test="login-error"`. Este atributo lo pone el sitio de práctica para facilitar la automatización — en un sitio real buscarías el mensaje de error por su rol o texto.

**Test de validación de email:**  
```typescript
const isInvalid = await emailInput.evaluate(
  (el: HTMLInputElement) => !el.validity.valid
);
```
`evaluate()` ejecuta código JavaScript **dentro del navegador** (no en Node.js). Aquí accede a la API nativa del navegador `validity.valid` del input, que el navegador marca como `false` cuando el formato del email no es válido. Es una forma de testear validación HTML5 sin depender de mensajes de texto que podrían cambiar.

---

### `tests/ui/accessibility.spec.ts` — suite `@regression`

Tests básicos de accesibilidad. No reemplazan un audit completo con axe, pero demuestran conciencia de a11y.

**Test de imágenes sin alt:**
```typescript
const imagesWithoutAlt = await page.evaluate(() =>
  Array.from(document.querySelectorAll('img'))
    .filter(img => img.getAttribute('alt') === null)
    .length
);
expect(imagesWithoutAlt).toBe(0);
```
Nota: `getAttribute('alt') === null` detecta ausencia total del atributo. Una imagen con `alt=""` (alt vacío) es válida para imágenes decorativas. Solo fallaría si el atributo no existe en absoluto.

**Test de botones accesibles:**  
Itera los primeros 5 botones de la página y verifica que cada uno tiene texto visible O `aria-label`. Un botón sin nombre accesible es invisible para screen readers.

**Test de labels en formulario:**  
Inspecciona cada input del login y verifica que tiene al menos una de: label asociado por `for/id`, `aria-label`, `aria-labelledby`, o `placeholder`. El `placeholder` es el criterio más permisivo — en producción preferirías labels reales, pero para este portfolio demuestra el patrón de verificación.

---

### `tests/api/public-api.spec.ts` — suite `@sanity`

**¿Qué es una suite de sanity?**  
Verifica que los componentes básicos del sistema funcionan correctamente antes de correr tests más complejos. En APIs: status codes correctos, estructura de respuesta válida.

**Fixture `{ request }`:**  
A diferencia de los tests UI que reciben `{ page }`, los tests de API reciben `{ request }`. Es el cliente HTTP de Playwright — hace requests sin abrir ningún navegador, por eso son muy rápidos (~600ms cada uno).

**La interfaz `ApiObject`:**
```typescript
interface ApiObject {
  id: string;
  name: string;
  data?: Record<string, unknown>;
  // ...
}
```
Define la forma de los objetos que devuelve la API. TypeScript verifica que accedes solo a campos que existen. `Record<string, unknown>` es el tipo correcto para un objeto con keys string y valores de tipo desconocido — más seguro que `any`.

**Los 4 tests:**

1. **GET /objects**: verifica status 200, que la respuesta es un array, y que tiene al menos 1 elemento. Los tres asserts son distintos: uno podría pasar sin los otros.

2. **GET /objects/7**: verifica que un objeto específico tiene los campos `id` y `name`, y que ambos son strings (no números ni null).

3. **POST /objects**: crea un objeto nuevo y verifica que el objeto devuelto tiene el mismo `name` que enviaste. Testea el ciclo completo de escritura.

4. **GET con múltiples ids**: `?id=3&id=5&id=10` — verifica que la API filtra correctamente y devuelve exactamente 3 items, no más, no menos. `toHaveLength(3)` es más expresivo que `expect(body.length).toBe(3)`.

---

### `.github/workflows/playwright.yml`

El pipeline de CI. Se ejecuta automáticamente cuando:
- Haces push a `main`
- Alguien abre un Pull Request hacia `main`
- Lo lanzas manualmente desde la UI de GitHub (`workflow_dispatch`)

**Paso a paso:**

```yaml
- uses: actions/checkout@v4        # descarga el código del repo
- uses: actions/setup-node@v4      # instala Node.js 20
  with: { node-version: '20' }
- run: npm ci                      # instala dependencias exactas del package-lock.json
- run: npx playwright install --with-deps chromium  # descarga Chromium + sus deps de sistema
- run: npx playwright test         # corre todos los tests
- uses: actions/upload-artifact@v4 # sube el reporte HTML como artifact descargable
  if: always()                     # se sube aunque los tests fallen
```

**`npm ci` vs `npm install`:**  
`npm ci` instala exactamente las versiones del `package-lock.json` sin actualizarlas. Es reproducible: el mismo código siempre instala las mismas versiones. `npm install` puede actualizar versiones menores y romper builds de forma no determinista.

**`if: always()` en el upload:**  
Garantiza que el reporte HTML se sube incluso si los tests fallan — que es precisamente cuando más lo necesitas para investigar qué pasó.

**`retention-days: 30`:**  
GitHub guarda el artifact 30 días. Después lo borra automáticamente. Es suficiente para revisiones post-deploy.

---

## 5. El patrón de tags (`@smoke`, `@sanity`, `@regression`)

Los tags van **dentro del nombre del test**:
```typescript
test('@smoke Verify homepage loads correctly', async ({ page }) => {
```

Playwright usa `--grep` para filtrar por texto en el nombre del test:
```bash
npx playwright test --grep @smoke      # solo tests de smoke
npx playwright test --grep @regression # solo regression
npx playwright test --grep @sanity     # solo API sanity
```

**Por qué este enfoque y no describe blocks separados:**  
Un test puede tener múltiples tags si lo necesitas (ej: `@smoke @critical`). Y puedes correr subconjuntos arbitrarios sin cambiar la estructura de archivos. En CI podrías tener un job que solo corra `@smoke` para feedback rápido y otro que corra todo.

---

## 6. Por qué `getByRole` y `getByTestId` son mejores que CSS selectors

| Selector | Problema |
|---|---|
| `div.btn-primary > span` | Se rompe si cambia la clase CSS o la estructura HTML |
| `#submit-button` | Los IDs pueden cambiar o no ser únicos |
| `getByRole('button', { name: /login/i })` | Estable: busca por comportamiento semántico, no por apariencia |
| `getByTestId('email')` | Estable: el atributo `data-test` existe explícitamente para tests |

La regla general de Playwright: **prefiere locators que reflejen cómo el usuario percibe la interfaz**. Si el botón dice "Login", úsalo por ese texto. Si tiene un `data-test`, úsalo. Los selectores CSS son el último recurso.

---

## 7. Cómo funciona el reporte HTML

Después de correr los tests, Playwright genera un reporte en `playwright-report/`. Para verlo:
```bash
npx playwright show-report
```

Muestra:
- Lista de todos los tests con estado (pass/fail) y duración
- En tests fallidos: screenshot del momento del fallo, video completo, y el trace
- El trace es una línea de tiempo interactiva: puedes ver cada acción, el estado del DOM antes y después, y los network requests

En CI, el reporte se sube como artifact y puedes descargarlo desde la pestaña "Actions" del repo en GitHub.

---

## 8. Cómo explicarlo en una entrevista

### Si te preguntan "¿qué frameworks de automatización conoces?"
> "Trabajo principalmente con Playwright y TypeScript. Me gusta Playwright porque tiene auto-wait nativo, maneja UI y API testing en un solo framework, y sus locators semánticos como `getByRole` y `getByTestId` hacen los tests más estables que con CSS selectors. En este portfolio tengo implementado Page Object Model, tests de UI con diferentes tipos de suites, tests de API REST, y CI/CD con GitHub Actions."

### Si te preguntan "explícame el Page Object Model"
> "Es un patrón de diseño que separa la lógica de los tests de los detalles de la UI. Cada página de la aplicación tiene su propia clase que encapsula sus selectores y las acciones que se pueden hacer en ella. Los tests usan esas clases sin saber cómo están implementados los selectores internamente. El beneficio principal es mantenibilidad: si un selector cambia, lo cambias en un solo lugar y todos los tests que usan ese Page Object se actualizan automáticamente."

### Si te preguntan "¿cómo manejas tests flaky?"
> "Primero intento entender la causa raíz. Lo más común es timing: el test intenta interactuar con un elemento antes de que esté listo. Playwright ayuda mucho aquí porque tiene auto-wait, pero a veces necesitas `waitFor()` explícito para elementos que cargan de forma asíncrona. También uso `retries: 1` en CI para absorber fallos de red transitorios, pero nunca más de 1 retry porque si un test necesita muchos retries es que hay un problema real que hay que investigar."

### Si te preguntan sobre CI/CD
> "Tengo GitHub Actions configurado para que los tests corran automáticamente en cada push a main y en cada PR. El pipeline hace checkout del código, instala dependencias con `npm ci` (que es reproducible), descarga Chromium, corre los tests, y sube el reporte HTML como artifact con retención de 30 días. El badge en el README muestra el estado del último run."

---

## 9. Comandos de referencia rápida

```bash
# Instalar todo desde cero
npm install
npx playwright install chromium

# Correr tests
npx playwright test                          # todos
npx playwright test --grep @smoke            # solo smoke
npx playwright test --grep @sanity           # solo API
npx playwright test --grep @regression       # solo regression
npx playwright test tests/ui/navigation.spec.ts  # un archivo específico

# Ver resultados
npx playwright show-report                   # reporte HTML interactivo

# Debug
npx playwright test --debug                  # abre el inspector de Playwright
npx playwright test --headed                 # corre con el navegador visible
npx playwright test --ui                     # UI mode (el mejor para debugging)
```
