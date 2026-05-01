# 🌐 Web Portfolio — Navegación + Página CV

**Fecha inicio:** 2026-05-01  
**Estado:** En progreso  
**Rama:** `task-2-web-portfolio-nav-cv`

---

## 📊 Resumen Ejecutivo

### Objetivo
Añadir navegación global al portfolio web y crear la página de CV con soporte bilingüe (ES/EN), donde el idioma se detecta automáticamente del browser y el usuario puede cambiarlo mediante un dropdown.

### Estrategia
Implementación incremental por subtarea: primero la topbar compartida, luego la página de CV con i18n, luego las páginas placeholder, configuración del servidor local para tests, y finalmente los tests automatizados.

---

## 🔢 Índice por ID

### ⏳ Fase 1 — Estructura de navegación (alta prioridad)
- **[PORT-001]** ✅ COMPLETADO — Añadir topbar de navegación a `index.html` (Home · CV · Contacto · Reportes) (`75c2144`, 2026-05-01)
- **[PORT-002]** ⏳ PENDIENTE — Crear `web/cv.html` con CV real + topbar + switcher ES/EN con detección de idioma del browser

### ⏳ Fase 2 — Páginas placeholder (media prioridad)
- **[PORT-003]** ⏳ PENDIENTE — Crear `web/contact.html` con topbar (placeholder)
- **[PORT-004]** ⏳ PENDIENTE — Crear `web/reports.html` con topbar (placeholder)

### ⏳ Fase 3 — Infraestructura de tests (alta prioridad)
- **[PORT-005]** ⏳ PENDIENTE — Configurar servidor local en `playwright.config.ts` para testear el portfolio (`webServer`)

### ⏳ Fase 4 — Tests automatizados (alta prioridad)
- **[PORT-006]** ⏳ PENDIENTE — Tests para `cv.html`: topbar visible, navegación, secciones del CV, switcher de idioma

---

## 📋 Detalle por Tarea

### PORT-001 — Topbar de navegación en index.html

**Estado:** ✅ COMPLETADO  
**Rama:** `task-2-web-portfolio-nav-cv`  
**Commits:** `75c2144` feat(TASK-2.1): add sticky topbar navigation to index.html

**Descripción:**  
Añadir una barra de navegación superior a `index.html` con links a las páginas: Home, CV, Contacto y Reportes. Debe respetar el diseño visual existente (colores, tipografía) y ser responsive.

**Archivos a modificar:**
- [ ] `web/index.html`

**Criterios de aceptación:**
- [ ] Topbar visible con links: Home · CV · Contacto · Reportes
- [ ] Link activo visualmente destacado
- [ ] Responsive en mobile
- [ ] Consistente con el design system existente (`--accent: #01696f`)

---

### PORT-002 — Página cv.html con i18n ES/EN

**Estado:** ⏳ PENDIENTE  
**Rama:** `task-2-web-portfolio-nav-cv`  
**Commits:** —

**Descripción:**  
Crear `web/cv.html` integrando el contenido real del CV (ES como idioma principal). El idioma se detecta automáticamente con `navigator.language` al cargar. El usuario puede cambiar manualmente entre ES y EN mediante un dropdown en la topbar, y la preferencia se guarda en `localStorage`.

**Archivos a modificar/crear:**
- [ ] `web/cv.html` (nuevo)

**Lógica del switcher:**
1. Al cargar: leer `localStorage.getItem('cv-lang')` → si existe, usarlo
2. Si no hay preferencia guardada: detectar `navigator.language` → ES por defecto si es español, EN si no
3. Al cambiar desde el dropdown: actualizar el DOM y guardar en `localStorage`

**Contenido fuente:**
- ES: `/home/erikazam/Downloads/erika-zambrano-cv-es.html`
- EN: `/home/erikazam/Downloads/erika-zambrano-cv-en.html`

**Criterios de aceptación:**
- [ ] Página carga en español por defecto (o si browser es ES)
- [ ] Dropdown en topbar muestra idioma activo
- [ ] Al cambiar idioma, todo el contenido textual cambia sin recargar la página
- [ ] Preferencia persiste al refrescar (localStorage)
- [ ] `<html lang="">` se actualiza dinámicamente al cambiar idioma
- [ ] Todas las secciones presentes: Perfil · Experiencia · Proyectos · Habilidades · Formación · Idiomas

---

### PORT-003 — Página contact.html (placeholder)

**Estado:** ⏳ PENDIENTE  
**Rama:** `task-2-web-portfolio-nav-cv`  
**Commits:** —

**Descripción:**  
Crear `web/contact.html` como placeholder con la topbar de navegación y un mensaje "Próximamente". Misma estructura visual que el resto del portfolio.

**Archivos a modificar/crear:**
- [ ] `web/contact.html` (nuevo)

**Criterios de aceptación:**
- [ ] Topbar presente y funcional
- [ ] Heading visible con texto de sección
- [ ] Link "CV" en topbar lleva a `cv.html`

---

### PORT-004 — Página reports.html (placeholder)

**Estado:** ⏳ PENDIENTE  
**Rama:** `task-2-web-portfolio-nav-cv`  
**Commits:** —

**Descripción:**  
Crear `web/reports.html` como placeholder con la topbar de navegación. Misma estructura visual.

**Archivos a modificar/crear:**
- [ ] `web/reports.html` (nuevo)

**Criterios de aceptación:**
- [ ] Topbar presente y funcional
- [ ] Heading visible con texto de sección

---

### PORT-005 — Servidor local para tests del portfolio

**Estado:** ⏳ PENDIENTE  
**Rama:** `task-2-web-portfolio-nav-cv`  
**Commits:** —

**Descripción:**  
Configurar `webServer` en `playwright.config.ts` para servir `web/` localmente durante los tests. Los tests del portfolio usarán una `baseURL` diferente a `practicesoftwaretesting.com`.

**Archivos a modificar:**
- [ ] `playwright.config.ts`
- [ ] `package.json` (agregar `serve` como devDependency o usar `npx serve`)

**Criterios de aceptación:**
- [ ] `npm test` levanta el servidor local automáticamente antes de correr los tests del portfolio
- [ ] Tests de `practicesoftwaretesting.com` no se ven afectados
- [ ] Servidor se detiene al terminar los tests

---

### PORT-006 — Tests automatizados para cv.html

**Estado:** ⏳ PENDIENTE  
**Rama:** `task-2-web-portfolio-nav-cv`  
**Commits:** —

**Descripción:**  
Crear suite de tests en `tests/ui/portfolio/cv.spec.ts` cubriendo la página CV del portfolio.

**Archivos a crear:**
- [ ] `tests/ui/portfolio/cv.spec.ts`

**Tests a implementar:**

| Test | Suite | Descripción |
|------|-------|-------------|
| `@smoke` topbar visible | smoke | Topbar renderiza con los 4 links |
| `@smoke` navegación topbar | smoke | Cada link de topbar lleva a la página correcta |
| `@smoke` secciones CV visibles | smoke | Las 6 secciones del CV están presentes en ES |
| `@regression` switcher de idioma | regression | Al cambiar a EN, el contenido cambia al inglés |
| `@regression` persistencia localStorage | regression | La preferencia de idioma persiste al recargar |
| `@regression` lang attribute | regression | `<html lang>` se actualiza al cambiar idioma |

**Criterios de aceptación:**
- [ ] Todos los tests pasan en local
- [ ] Tests usan `getByRole` y `getByTestId` (no CSS selectors)
- [ ] Tests no dependen de orden de ejecución

---

## 📈 Progreso General

| ID | Descripción | Estado | Commits | Fecha |
|----|-------------|--------|---------|-------|
| PORT-001 | Topbar en index.html | ✅ COMPLETADO | `75c2144` | 2026-05-01 |
| PORT-002 | cv.html con i18n ES/EN | ⏳ PENDIENTE | — | — |
| PORT-003 | contact.html placeholder | ⏳ PENDIENTE | — | — |
| PORT-004 | reports.html placeholder | ⏳ PENDIENTE | — | — |
| PORT-005 | Servidor local para tests | ⏳ PENDIENTE | — | — |
| PORT-006 | Tests automatizados cv.html | ⏳ PENDIENTE | — | — |

---

## 🔧 Notas Técnicas

- **i18n sin librería externa**: el switcher se implementa con un objeto JS `{ es: {...}, en: {...} }` que mapea cada texto traducible a un `data-i18n` attribute en el HTML. Sin dependencias extra.
- **Detección de idioma**: `navigator.language.startsWith('es')` → ES, cualquier otro → EN. Preferencia guardada en `localStorage` tiene prioridad.
- **Servidor local**: `npx serve web/` en el `webServer` de playwright.config.ts. Se configura como proyecto separado para no afectar los tests existentes de practicesoftwaretesting.com.
- **Design system**: todos los archivos nuevos heredan las variables CSS de `index.html` (`--accent: #01696f`, fuentes Inter + Instrument Serif).

---

## 🧪 Testing

- [ ] Tests corren en local con `npm test`
- [ ] Tests del portfolio no interfieren con tests de practicesoftwaretesting.com
- [ ] Switcher de idioma testeado con simulación de `localStorage`
- [ ] Topbar testeada en todas las páginas

---

## 📝 Changelog

| Fecha | Acción | Commit | Descripción |
|-------|--------|--------|-------------|
| 2026-05-01 | Creado | — | Documento inicial creado |
| 2026-05-01 | Completado | `75c2144` | PORT-001: topbar sticky en index.html |
