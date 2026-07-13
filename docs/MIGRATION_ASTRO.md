# 🚀 Migración a Astro + TypeScript

**Fecha inicio:** 2026-07-13
**Estado:** En progreso
**Rama:** `master`

---

## 📊 Resumen Ejecutivo

### Objetivo
Migrar el portfolio web de HTML estático plano a Astro + TypeScript, obteniendo una arquitectura de componentes real con CSS scoped, layouts compartidos, TypeScript first y performance de 100 en Lighthouse.

### Estrategia
Migración incremental: inicializar Astro en paralelo al código actual, migrar componente por componente y página por página, luego reemplazar `web/` con el output de Astro. El contenido (textos, traducciones, estructura) ya está listo en `i18n.js` y los HTML actuales.

### Stack resultante
- **Framework:** Astro 5
- **Lenguaje:** TypeScript (strict)
- **CSS:** Scoped por componente (estilo Astro)
- **i18n:** Store compartido en TypeScript
- **Deploy:** Vercel (adaptador `@astrojs/vercel`)

---

## 🔢 Índice por ID

### ⏳ Fase 1 — Setup e infraestructura (alta prioridad)
- **[ASTRO-001]** ⏳ PENDIENTE — Inicializar proyecto Astro + TypeScript en `web/`
- **[ASTRO-002]** ⏳ PENDIENTE — Configurar Vercel adapter y `vercel.json`
- **[ASTRO-003]** ⏳ PENDIENTE — Migrar sistema i18n a TypeScript (`src/i18n/`)

### ⏳ Fase 2 — Componentes (alta prioridad)
- **[ASTRO-004]** ⏳ PENDIENTE — Crear componente `Topbar.astro` con lang-switcher
- **[ASTRO-005]** ⏳ PENDIENTE — Crear layout base `BaseLayout.astro`

### ⏳ Fase 3 — Páginas (alta prioridad)
- **[ASTRO-006]** ⏳ PENDIENTE — Migrar `index.html` → `src/pages/index.astro`
- **[ASTRO-007]** ⏳ PENDIENTE — Migrar `cv.html` → `src/pages/cv.astro`
- **[ASTRO-008]** ⏳ PENDIENTE — Migrar `contact.html` → `src/pages/contact.astro`
- **[ASTRO-009]** ⏳ PENDIENTE — Migrar `reports.html` → `src/pages/reports.astro`

### ⏳ Fase 4 — Verificación y cleanup (media prioridad)
- **[ASTRO-010]** ⏳ PENDIENTE — Verificar build y deploy en Vercel
- **[ASTRO-011]** ⏳ PENDIENTE — Eliminar archivos HTML/CSS/JS planos anteriores

---

## 📋 Detalle por Tarea

### ASTRO-001 — Inicializar proyecto Astro + TypeScript

**Estado:** ⏳ PENDIENTE
**Rama:** `master`
**Commits:** —

**Descripción:**
Inicializar Astro 5 con template mínimo y TypeScript strict dentro del directorio `web/`. Instalar dependencias necesarias.

**Archivos a crear:**
- [ ] `web/astro.config.ts`
- [ ] `web/tsconfig.json`
- [ ] `web/package.json`
- [ ] `web/src/` (estructura base)

**Criterios de aceptación:**
- [ ] `npm run dev` levanta el servidor sin errores
- [ ] TypeScript en modo strict sin errores
- [ ] Estructura `src/pages/`, `src/components/`, `src/layouts/` creada

---

### ASTRO-002 — Configurar Vercel adapter

**Estado:** ⏳ PENDIENTE
**Rama:** `master`
**Commits:** —

**Descripción:**
Instalar `@astrojs/vercel` y configurar output estático. Actualizar `vercel.json` en la raíz del repo para apuntar al build output de Astro.

**Archivos a modificar:**
- [ ] `web/astro.config.ts`
- [ ] `vercel.json`

**Criterios de aceptación:**
- [ ] `npm run build` genera el sitio en `web/dist/`
- [ ] `vercel.json` apunta al directorio correcto

---

### ASTRO-003 — Migrar i18n a TypeScript

**Estado:** ⏳ PENDIENTE
**Rama:** `master`
**Commits:** —

**Descripción:**
Convertir `web/js/i18n.js` a un módulo TypeScript tipado en `web/src/i18n/`. Exportar un store con las traducciones ES/EN y las funciones `t()` y `getLang()`.

**Archivos a crear:**
- [ ] `web/src/i18n/translations.ts`
- [ ] `web/src/i18n/index.ts`

**Criterios de aceptación:**
- [ ] Traducciones tipadas (sin `any`)
- [ ] `getLang()` devuelve `'es'` por defecto
- [ ] Importable desde cualquier componente Astro

---

### ASTRO-004 — Componente Topbar.astro

**Estado:** ⏳ PENDIENTE
**Rama:** `master`
**Commits:** —

**Descripción:**
Crear `src/components/Topbar.astro` que recibe `activePage` como prop tipada. CSS scoped dentro del componente. Lang-switcher con JS client-side.

**Archivos a crear:**
- [ ] `web/src/components/Topbar.astro`

**Criterios de aceptación:**
- [ ] Props tipadas con TypeScript
- [ ] CSS scoped (no afecta otros componentes)
- [ ] Lang-switcher funcional (dropdown abre/cierra, cambia idioma)
- [ ] Link activo se marca correctamente según `activePage`

---

### ASTRO-005 — Layout base BaseLayout.astro

**Estado:** ⏳ PENDIENTE
**Rama:** `master`
**Commits:** —

**Descripción:**
Crear `src/layouts/BaseLayout.astro` con `<head>` compartido (fonts, meta, title dinámico), `<Topbar>` y `<slot>` para el contenido de cada página.

**Archivos a crear:**
- [ ] `web/src/layouts/BaseLayout.astro`

**Criterios de aceptación:**
- [ ] `title` como prop requerida
- [ ] Fonts de Google cargadas una sola vez
- [ ] CSS base importado desde el layout
- [ ] `<Topbar>` incluido con `activePage` como prop

---

### ASTRO-006 — Página index.astro

**Estado:** ⏳ PENDIENTE
**Rama:** `master`
**Commits:** —

**Descripción:**
Migrar `web/index.html` a `src/pages/index.astro` usando `BaseLayout`. Extraer secciones (About, Suites, CI, Stack, Footer) como subcomponentes si tiene sentido.

**Archivos a crear:**
- [ ] `web/src/pages/index.astro`
- [ ] `web/src/components/home/` (subcomponentes opcionales)

**Criterios de aceptación:**
- [ ] Visual idéntico al HTML actual
- [ ] i18n funcionando (ES por defecto, switch a EN)
- [ ] CSS scoped sin fugas

---

### ASTRO-007 — Página cv.astro

**Estado:** ⏳ PENDIENTE
**Rama:** `master`
**Commits:** —

**Descripción:**
Migrar `web/cv.html` a `src/pages/cv.astro`. El CV tiene mucho contenido estructurado — evaluar si conviene extraer secciones (Experience, Skills, Education) como componentes.

**Archivos a crear:**
- [ ] `web/src/pages/cv.astro`
- [ ] `web/src/components/cv/` (subcomponentes opcionales)

**Criterios de aceptación:**
- [ ] Visual idéntico al HTML actual
- [ ] i18n funcionando (todas las secciones traducibles)
- [ ] Print styles preservados

---

### ASTRO-008 — Página contact.astro

**Estado:** ⏳ PENDIENTE
**Rama:** `master`
**Commits:** —

**Descripción:**
Migrar `web/contact.html` a `src/pages/contact.astro`. El formulario Web3Forms y la validación JS se mantienen como `client:load`.

**Archivos a crear:**
- [ ] `web/src/pages/contact.astro`
- [ ] `web/src/components/ContactForm.astro`

**Criterios de aceptación:**
- [ ] Formulario funcional (envío real a Web3Forms)
- [ ] Validación client-side funcionando
- [ ] Mensajes de error/éxito en ES y EN

---

### ASTRO-009 — Página reports.astro

**Estado:** ⏳ PENDIENTE
**Rama:** `master`
**Commits:** —

**Descripción:**
Migrar `web/reports.html` a `src/pages/reports.astro`. Página placeholder por ahora.

**Archivos a crear:**
- [ ] `web/src/pages/reports.astro`

**Criterios de aceptación:**
- [ ] Visual idéntico al HTML actual
- [ ] i18n funcionando

---

### ASTRO-010 — Verificar build y deploy en Vercel

**Estado:** ⏳ PENDIENTE
**Rama:** `master`
**Commits:** —

**Descripción:**
Ejecutar `npm run build` y verificar que el output es correcto. Hacer push y confirmar que Vercel deploya sin errores. Verificar las 4 páginas en producción.

**Criterios de aceptación:**
- [ ] Build sin errores ni warnings de TypeScript
- [ ] Las 4 páginas cargan en producción
- [ ] Lang-switcher funciona en producción
- [ ] Formulario de contacto funciona en producción

---

### ASTRO-011 — Cleanup de archivos HTML planos

**Estado:** ⏳ PENDIENTE
**Rama:** `master`
**Commits:** —

**Descripción:**
Una vez confirmado que el deploy de Astro funciona, eliminar los archivos HTML/CSS/JS planos de `web/` que ya no son necesarios.

**Archivos a eliminar:**
- [ ] `web/css/` (reemplazado por CSS scoped en componentes)
- [ ] `web/js/` (reemplazado por `src/i18n/` y componentes)
- [ ] `web/*.html` (reemplazado por `src/pages/`)

**Criterios de aceptación:**
- [ ] Solo queda `web/src/`, `web/astro.config.ts`, `web/package.json`, `web/tsconfig.json`
- [ ] Build sigue funcionando después del cleanup

---

## 📈 Progreso General

| ID | Descripción | Estado | Commits | Fecha |
|----|-------------|--------|---------|-------|
| ASTRO-001 | Inicializar Astro + TypeScript | ⏳ PENDIENTE | — | — |
| ASTRO-002 | Configurar Vercel adapter | ⏳ PENDIENTE | — | — |
| ASTRO-003 | Migrar i18n a TypeScript | ⏳ PENDIENTE | — | — |
| ASTRO-004 | Componente Topbar.astro | ⏳ PENDIENTE | — | — |
| ASTRO-005 | Layout base BaseLayout.astro | ⏳ PENDIENTE | — | — |
| ASTRO-006 | Página index.astro | ⏳ PENDIENTE | — | — |
| ASTRO-007 | Página cv.astro | ⏳ PENDIENTE | — | — |
| ASTRO-008 | Página contact.astro | ⏳ PENDIENTE | — | — |
| ASTRO-009 | Página reports.astro | ⏳ PENDIENTE | — | — |
| ASTRO-010 | Verificar build y deploy | ⏳ PENDIENTE | — | — |
| ASTRO-011 | Cleanup de archivos planos | ⏳ PENDIENTE | — | — |

---

## 🔧 Notas Técnicas

- **Output mode:** `static` — el portfolio no necesita SSR, todo es estático
- **i18n approach:** client-side con `localStorage` (igual que ahora) — Astro tiene i18n routing nativo pero agrega complejidad de URLs (`/es/`, `/en/`) que no es necesaria aquí
- **CSS strategy:** scoped en cada componente `.astro`; variables CSS globales en un archivo `src/styles/tokens.css` importado en `BaseLayout`
- **Formulario:** el script de validación y envío de Web3Forms va en un `<script>` dentro de `ContactForm.astro` con `is:inline` para acceso al DOM

---

## 🔄 Rollback Plan

Si el deploy de Astro falla, los archivos HTML planos actuales están preservados en git hasta que se ejecute ASTRO-011. Se puede revertir el `vercel.json` para volver a servir desde `web/` directamente.

---

## 📝 Changelog

| Fecha | Acción | Commit | Descripción |
|-------|--------|--------|-------------|
| 2026-07-13 | Creado | — | Documento inicial de migración a Astro |
