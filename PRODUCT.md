# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Recruiters and hiring managers for QA / automation roles: evaluate the profile quickly, looking for proof of skill.
- Freelance clients: people who might hire QA and test-automation services.
- Technical peers (QA/devs) may review the code, but are not a confirmed primary audience.

## Product Purpose

Personal portfolio of Erika Zambrano, QA automation engineer with a focus on quality of conversational AI. It exists so a visitor can verify, not just read about, her skills, and decide to contact her. Success: the visitor sees real evidence (reports, playground, CV) and reaches the contact page.

## Positioning

Executable evidence: every claim is backed by something that runs. A purpose-built QA Playground (shop, cart, checkout, login, chaos endpoint), 593 API tests plus UI suites with Page Object Model, a CI results dashboard at /reports, and an LLM eval harness with deterministic checks and an LLM judge.

## Operating Context

- Live at https://qa-automation-portafolio-ejzm.vercel.app, deployed on Vercel.
- Routes: /, /cv, /contact, /reports, plus the Playground under a topbar dropdown.
- Test results are recorded to `web/src/data/` (eval-results.json, ci-results.json) from Playwright JSON via `scripts/summarize-playwright.ts`.

## Capabilities and Constraints

- Stack is fixed: React + Chakra UI + React Router, bundled by Vite in `web/`.
- Bilingual es/en via LangContext (`?lang=` and localStorage); all copy lives in `web/src/i18n/translations.ts`.
- Do not expose confidential employer details (e.g. Nearpod, Telecom Argentina) or internal figures; do not invent metrics.
- Open: CV has untranslated fixed strings and repeated 2019 dates (see `docs/mejoras_pag.md`).

## Brand Commitments

Name: Erika Zambrano. Bilingual voice (Spanish and English).

## Evidence on Hand

- Playwright suites: `tests/ui/`, `tests/api/`, `tests/playground-api/`.
- Eval harness: `evals/`.
- Recorded results: `web/src/data/`.
- Absent: testimonials, client logos, case studies; must not be fabricated.

## Product Principles

1. Show, don't claim: every skill links to something verifiable.
2. Real numbers only; recorded results over round figures.
3. Fast to scan for a recruiter, deep for a technical reviewer.
4. Bilingual parity: es and en are equal citizens.

## Accessibility & Inclusion

WCAG AA: verified contrast, visible focus, full keyboard operation.
