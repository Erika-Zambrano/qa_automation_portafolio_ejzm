---
name: QA Automation Portfolio
description: Warm-paper, serif-led report aesthetic with a single deep-teal accent for a bilingual QA portfolio.
colors:
  teal-ink: "#01696f"
  teal-wash: "rgba(1, 105, 111, 0.1)"
  paper: "#f7f6f2"
  sheet-white: "#ffffff"
  ink-black: "#1a1a1a"
  body-graphite: "#3a3a3a"
  muted-gray: "#5f5e5a"
  faint-stone: "#6b6a65"
  hairline: "#e8e7e3"
  divider-stone: "#dcd9d5"
  chip-gray: "#f0f0ee"
typography:
  display:
    fontFamily: "'Instrument Serif', Georgia, serif"
    fontSize: "clamp(2rem, 6vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0em"
  headline:
    fontFamily: "'Instrument Serif', Georgia, serif"
    fontSize: "clamp(1.8rem, 5vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.15
  title:
    fontFamily: "Inter, 'Helvetica Neue', sans-serif"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1.6
  body:
    fontFamily: "Inter, 'Helvetica Neue', sans-serif"
    fontSize: "0.975rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Inter, 'Helvetica Neue', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0.1em"
  mono:
    fontFamily: "SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "6px"
  md: "8px"
  pill: "99px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "56px"
components:
  card:
    backgroundColor: "{colors.sheet-white}"
    rounded: "{rounded.md}"
    padding: "20px 24px"
  badge-type:
    backgroundColor: "{colors.chip-gray}"
    textColor: "#555555"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-tag:
    backgroundColor: "{colors.teal-wash}"
    textColor: "{colors.teal-ink}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  topbar-link:
    textColor: "{colors.muted-gray}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  topbar-link-active:
    backgroundColor: "{colors.teal-wash}"
    textColor: "{colors.teal-ink}"
  lang-button:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.muted-gray}"
    rounded: "{rounded.sm}"
    padding: "5px 10px"
  menu-item:
    textColor: "{colors.muted-gray}"
    padding: "9px 16px"
  menu-item-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.teal-ink}"
---

# Design System: QA Automation Portfolio

## Overview

**Creative North Star: "The Test Report"**

The portfolio reads like a well-typeset test report: warm paper, white sheets laid on it, a serif voice for names and page titles, and a single teal accent that marks what is navigable or verified. Evidence leads; the interface steps back. Sober, editorial, trustworthy: credibility comes from clarity and restraint, not decoration.

Density is calm and document-like. Content sits in a narrow column (800px; 1000px for the reports dashboard), sections are separated by hairlines rather than boxes, and the only containers are small white cards. There is no gradient, no imagery-led hero, and no motion beyond 0.1-0.15s state transitions.

**Key Characteristics:**
- Warm off-white paper (`paper`) with pure white sheets on top.
- Serif display for names and page titles, sans for everything else.
- One accent (`teal-ink`) carries links, active nav, labels and bullets.
- Flat by default; one hairline shadow on cards.
- Uppercase, letter-spaced micro-labels introduce each section.

## Colors

A near-monochrome warm neutral palette with one deep teal.

### Primary
- **Teal Ink** (#01696f): links, active navigation, section labels, role line, list bullets, hover and focus borders. Its tint **Teal Wash** (rgba(1,105,111,0.1)) backs active nav items and tag badges.

### Neutral
- **Paper** (#f7f6f2): page background and hover fill for menu items.
- **Sheet White** (#ffffff): topbar, header band, cards, CV page, inputs.
- **Ink Black** (#1a1a1a): headings and card titles.
- **Body Graphite** (#3a3a3a): running text.
- **Muted Gray** (#5f5e5a): secondary text, nav links at rest, footer (6.0:1 on Paper).
- **Faint Stone** (#6b6a65): tertiary text such as CV dates and locations (5.0:1 on Paper).
- **Hairline** (#e8e7e3): section dividers, card and topbar borders.
- **Divider Stone** (#dcd9d5): stronger rules inside the CV.
- **Chip Gray** (#f0f0ee): neutral badge fill.

### Named Rules
**The One Voice Rule.** Teal is the only chromatic color. It marks interaction and verification; it is never used as a surface fill beyond its 10% wash.

**The AA Floor Rule.** Every text color holds at least 4.5:1 on both Paper and Sheet White. Secondary text never goes lighter than Faint Stone (#6b6a65).

## Typography

**Display Font:** Instrument Serif (with Georgia, serif)
**Body Font:** Inter (with Helvetica Neue, sans-serif)
**Label/Mono Font:** system monospace stack for file paths only

**Character:** An editorial serif for the person's name and page titles over a neutral, legible sans; the pairing signals craft without ornament.

### Hierarchy
- **Display** (400, clamp(2rem, 6vw, 3rem), 1.15): the name in the home header.
- **Headline** (400, clamp(1.8rem, 5vw, 2.5rem), 1.15): page titles on Contact and Reports; CV name uses a similar serif at up to 32pt.
- **Title** (600, 1.35rem): section titles; card titles are 600 at 0.975rem.
- **Body** (400, 0.975rem, 1.75): paragraphs; keep lines near 65-75ch inside the 800px column.
- **Label** (600, 0.75rem, 0.1em tracking, uppercase, teal): section and page labels. The home role line is the same treatment at 1rem/500.
- **Mono** (400, 0.78rem): test file paths on cards.

### Named Rules
**The Serif Is a Name Rule.** Instrument Serif is for the person's name and page titles only. Section titles, UI and data stay in Inter.

## Layout

Single centered column: `max-width` 800px with 24px side padding (reports dashboard 1000px, contact form 560px). The topbar is sticky and 48px tall. Sections use 56px vertical padding (40px at 600px and below) separated by 1px hairlines. Cards flow in an auto-fill grid with a 340px minimum and 16px gaps, collapsing to one column at 600px. The CV is a white A4-style sheet inside the column (40px 48px padding) with print styles that hide the topbar. Spacing rhythm is 4 / 8 / 16 / 24 / 56.

## Elevation & Depth

Mostly flat and tonal: depth comes from white sheets on warm paper and 1px hairlines, not from shadows.

### Shadow Vocabulary
- **Card hairline** (`box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08)`): resting cards.
- **Menu lift** (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)`): language and navigation dropdowns only.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Only floating menus get a real lift; hover changes color, not elevation.

## Shapes

Gently rounded and quiet. Controls and nav links use 6px, cards and dropdowns 8px, badges are full pills (99px). Borders are 1px hairlines; the one heavy rule is the 2px graphite line under the CV header. Bullets are 6px teal dots.

## Components

### Buttons and Nav Links
- **Shape:** 6px radius, 6px 12px padding, 0.875rem/500.
- **Rest:** Muted Gray text, transparent.
- **Hover / Active:** Teal Ink text on Teal Wash, 0.15s color and background transition.
- **Language button:** white, 1px Hairline border, 0.8rem/600 with 0.04em tracking; hover turns text and border teal; chevron rotates 180deg when open.

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** Sheet White on Paper.
- **Shadow Strategy:** Card hairline only.
- **Internal Padding:** 20px 24px.
- **Content:** title (600) with right-aligned badges, a mono file path in Muted Gray below.

### Badges
- **Type badge:** Chip Gray fill, #555 text, pill, 0.72rem/500.
- **Tag badge:** Teal Wash fill, Teal Ink text, same shape.

### Navigation
- Sticky white topbar, 48px, bottom hairline. Links left, spacer, language switcher right. Dropdown menus (Playground, language) are white with a Hairline border, 8px radius and Menu lift; items are 0.85rem/500 with Paper hover fill and teal text; the active item is 600.
- Mobile (600px and below): the bar wraps to two rows, links and the language button keep 44px targets, the language switcher stays right-aligned and visible, and the Playground menu spans the bar width.

### Dashboard (Chakra UI)
The reports dashboard uses Chakra primitives on top of the same tokens (fonts mapped to `--font-body` and `--font-display`; preflight scoped to `.chakra-scope`). Native selects are white with a 1px strong border (#d4d4d8, `--border-strong`) and 6px radius.

## Do's and Don'ts

### Do:
- **Do** keep teal (#01696f) as the only chromatic color, on interaction and verification.
- **Do** separate sections with 1px Hairline rules and 56px padding rather than boxes.
- **Do** introduce each section with the uppercase 0.75rem teal label.
- **Do** put new text in `web/src/i18n/translations.ts`; es and en stay equal.
- **Do** give every interactive element a visible focus state and full keyboard operation (WCAG AA).
- **Do** draw colors from the CSS variables in `web/src/css/tokens.css`.
- **Do** use one solid button style: Teal Ink fill, white text, 6px radius, 44px minimum height. Chakra's `teal` palette is remapped to `#01696f` in `web/src/theme.ts`.
- **Do** let the home page carry proof, not description: a ledger of verifiable rows (result in mono, title, one line) that link to the evidence.

### Don't:
- **Don't** introduce text lighter than Faint Stone (#6b6a65).
- **Don't** add gradients, glass or colored shadows to UI chrome, and never a second accent color. The one exception is the QA Playground shop: its per-category art gradients are the gallery's identity.
- **Don't** place text on an art gradient below 3:1; labels there are white with a dark text-shadow.
- **Don't** use Instrument Serif for UI, data or section titles.
- **Don't** raise cards on hover; change color, not elevation.
- **Don't** hardcode hex values in components; use the tokens in `web/src/css/tokens.css` (`--chip-bg`, `--chip-text`, `--border-strong` included).
