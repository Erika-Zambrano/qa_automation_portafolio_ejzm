---
name: QA Automation Portfolio
description: A slate-and-frost case file where every proof is a folder tab that docks into the nav bar, in a single teal accent and one serif.
colors:
  teal-ink: "#0d7480"
  teal-wash: "rgba(13, 116, 128, 0.12)"
  case-slate: "#1f3038"
  case-slate-deep: "#16242a"
  folder-slate: "#2b424c"
  folder-slate-mid: "#365360"
  folder-frost: "#cfdde2"
  frost: "#f7f9fa"
  mist: "#ecf0f2"
  sheet-white: "#ffffff"
  muted-slate: "#4d5c63"
  faint-slate: "#566870"
  rule-frost: "#d3dde1"
  rule-frost-strong: "#b5c4ca"
  chip-mist: "#e3eaed"
  chip-ink: "#2f424a"
  ink-on-dark: "#dbe5e9"
typography:
  display:
    fontFamily: "Erode, Georgia, serif"
    fontSize: "clamp(3.4rem, 10vw, 10rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Erode, Georgia, serif"
    fontSize: "clamp(2rem, 1.3rem + 3.2vw, 4rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Erode, Georgia, serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: "Erode, Georgia, serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Erode, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  sm: "6px"
  none: "0px"
spacing:
  tab-gap: "6px"
  page-pad: "clamp(16px, 4vw, 40px)"
  band-strip: "72px"
  section: "clamp(80px, 12vw, 200px)"
components:
  tab:
    backgroundColor: "{colors.folder-slate}"
    textColor: "{colors.ink-on-dark}"
    height: "44px"
    padding: "0 26px 0 22px"
  tab-active:
    backgroundColor: "{colors.case-slate}"
    textColor: "{colors.sheet-white}"
  tab-hover:
    backgroundColor: "{colors.folder-slate-mid}"
    textColor: "{colors.sheet-white}"
  button-primary:
    backgroundColor: "{colors.teal-ink}"
    textColor: "{colors.sheet-white}"
    height: "52px"
    padding: "0 28px"
  folder-band:
    backgroundColor: "{colors.folder-slate}"
    textColor: "{colors.sheet-white}"
    height: "72px"
    padding: "0 28px"
  folder-front:
    backgroundColor: "{colors.frost}"
    textColor: "{colors.case-slate}"
    padding: "48px 48px 0"
  folder-head:
    backgroundColor: "{colors.case-slate}"
    textColor: "{colors.sheet-white}"
  index-row-active:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.case-slate}"
---

# Design System: QA Automation Portfolio

## Overview

**Creative North Star: "The Case File"**

The portfolio is a case file: a stack of folders, each one a piece of evidence that can be opened. The dark slate ground is the cabinet, the frost sheets are the papers inside, and the single teal accent marks what can be acted on. Every proof (CI results, the playground, the CV, contact) is a folder with a tab; as the visitor scrolls, the tabs climb to the top and dock into the nav bar, so the stack the page opened with becomes the navigation that stays. Evidence leads and the interface steps back.

The voice is sober, editorial and trustworthy. One serif, Erode, carries every size; scale does the work that weight, rules and ornament do elsewhere. Density is calm: wide margins, one dominant thing per screen, a small number of large real pictures (screenshots of the site's own pages). The one live thing is the folder stack itself, driven by real CI numbers.

**Key Characteristics:**
- Dark slate cabinet (`case-slate`) with frost sheets (`frost`) laid on it.
- Trapezoid folder tabs are the signature shape: they are the nav, the folder labels and the primary button's silhouette.
- One typeface (Erode), tight tracking at display sizes, five size steps.
- One accent (`teal-ink`), used for the primary action and links.
- Flat: no gradients, no shadows at rest; depth comes from tone steps between slate and frost.
- Same nav tabs, same order, same positions on every page.

## Colors

A cold slate-and-frost palette with one teal accent. Two or three flat tones carry every screen.

### Primary
- **Teal Ink** (#0d7480): the primary button, links on frost, the selected index row title. Its 12% tint **Teal Wash** (rgba(13,116,128,0.12)) backs focused and tagged items.

### Neutral
- **Case Slate** (#1f3038): the hero, the folder head, the active tab, the closing band, and all running text on frost.
- **Case Slate Deep** (#16242a): the nav bar ground and the page footer, one step darker than the cabinet so tabs read as sitting in it.
- **Folder Slate** (#2b424c): resting nav tabs, the first back folder.
- **Folder Slate Mid** (#365360): the hovered tab, the second back folder.
- **Folder Frost** (#cfdde2): the third back folder, a light band between dark ones.
- **Frost** (#f7f9fa): the page background below the hero and the front folder sheet.
- **Mist** (#ecf0f2): the active index row and the preview frame behind screenshots.
- **Sheet White** (#ffffff): cards, inputs and the CV sheet.
- **Muted Slate** (#4d5c63): secondary text on frost.
- **Faint Slate** (#566870): tertiary text such as CV dates.
- **Rule Frost** (#d3dde1) and **Rule Frost Strong** (#b5c4ca): borders on real tables, form fields and dashboard cards only.
- **Ink on Dark** (#dbe5e9): body and supporting text on slate.
- **Chip Mist** (#e3eaed) with **Chip Ink** (#2f424a): neutral badges.

### Named Rules
**The One Voice Rule.** Teal is the only chromatic color in the interface. It marks the action and verification; it is never a surface fill beyond its wash. (The playground shop's per-category art gradients are the one exception, as before.)

**The Cabinet and Sheet Rule.** Dark slate is for structure (nav, hero, folder bands, heads, closing, footer); frost and white are for reading. Never set long text on a dark band.

**The Tab Colour Rule.** A resting tab is `folder-slate`; the active tab is `case-slate`, the same tone as the head band below it, so the active tab and its page read as one folder.

## Typography

**Display Font:** Erode (with Georgia, serif)
**Body Font:** Erode (with Georgia, serif)
**Label/Mono Font:** none; there is no monospace

**Character:** A chiselled serif with wedge serifs, sharp at display size and firm in text. One face for everything keeps the page editorial and lets scale carry hierarchy.

### Hierarchy
- **Display** (500, clamp(3.4rem, 10vw, 10rem), 0.95, -0.025em): the name on the home hero and the closing line. One line at desktop, two on a phone.
- **Headline** (500, clamp(2rem, 1.3rem + 3.2vw, 4rem), 1, -0.025em): page titles in the folder head, section titles, the big CI figure.
- **Title** (600, clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem), 1.15): the supporting sentence under the name, index row names and results.
- **Body** (400, clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem), 1.5): paragraphs; keep lines near 46ch for statements and 65-75ch for reading.
- **Label** (600, 1rem): tabs and buttons.

### Named Rules
**The One Face Rule.** Erode for everything; two or three sizes do the visible work, one very large and one small. Never a second family, never monospace.

**The No Eyebrow Rule.** No small uppercase label above a heading. The folder tab is the label.

## Layout

The page is a full-bleed cabinet. Content sits inside one pair of equal outer margins (`clamp(16px, 4vw, 40px)`); the folder stack is 1200px wide and the nav bar aligns to the same 1200px frame. Inner pages use a folder head (dark band with the page title) at 560px (contact), 640px (playground), 800px (CV), 1000px (reports) or 1040px (shop and checkout), followed by a frost sheet with the content. Sections are 80-200px apart. The home runs: hero with the stack, the evidence index (a two-column list with a sticky preview frame, inline screenshots on phones), the closing band, and a footer where the name returns at full width.

The stack: three back folders as 72px-tall bands (`CV`, `Playground`, `Contacto`), each offset 44px below the previous with its tab rising above its left edge; the front folder (`Reportes`) is open, runs into the hero's bottom edge and carries the CI figure, one line and a screenshot.

The tab bar: Inicio, CV, Playground, Contacto, Reportes, in that order and at the same x on every page. On the home only Inicio is visible at the top; each folder tab docks to its slot to the right of the previous one as it reaches the bar, at the exact x it had in the stack. At 600px and below the bar is a single 52px row with smaller tabs.

## Elevation & Depth

Flat. Depth is conveyed by stepping tone: `case-slate-deep` under `case-slate` under the lighter folder bands, `frost` sheets on slate, `mist` for the active row. Nothing has a shadow at rest.

### Shadow Vocabulary
- **Menu lift** (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18)`): the language and Playground dropdowns only.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest; hover changes colour, never elevation.

## Shapes

Hard-edged with one signature silhouette. Tabs and the primary button are trapezoids cut with `clip-path` (tabs: `polygon(0 100%, 8% 0, 92% 0, 100% 100%)`; button: both top corners cut 14px). Folder bands, heads, sheets and screenshots are square. Real form fields, dashboard cards and the language button keep a 6px radius, and borders appear only there and in tables. There are no thin rules between sections.

## Components

### Tabs (nav and folder labels)
- **Shape:** trapezoid, 44px tall, padding 0 26px 0 22px, 6px gap between neighbours (2px on a phone).
- **Rest:** Folder Slate with Ink on Dark text, 1rem/600.
- **Hover:** Folder Slate Mid with white text, 0.15s.
- **Active:** Case Slate with white text, the same tone as the head band beneath.
- **Docked (home):** fixed to the bar, same size, colour and x as the page-bar version.
- **Focus:** 3px white outline inside the shape.

### Buttons
- **Primary:** Teal Ink fill, white text, 52px minimum height, trapezoid top corners; hover darkens to #0a5c66 and lifts 2px, 0.15s. On the dark closing band the button inverts to white with slate text.
- **Link button:** Teal Ink text, 600, 52px target; on dark it is white.
- Focus: 3px outline (teal on frost, white on slate), 3px offset.

### Folder bands (home stack)
- Back folders are 72px bands: result right-aligned at 1.625rem/600, tab above the left edge. Whole band is the link. Hover steps the tone, it does not lift.
- The front folder is Frost with 48px padding, a 5/7 copy-to-screenshot grid, and no bottom padding so the screenshot runs off the edge.

### Folder head (inner pages)
- A Case Slate band directly under the bar: page title at Headline size in white, one supporting sentence at Title size in Ink on Dark, max 46ch. It carries the shared `folder-open` transition name.

### Evidence index
- Rows of result, name and one line; the active row has a Mist fill and a Teal Ink name; pointing or focusing a row crossfades its screenshot (240ms) in a sticky frame, which drifts 4% over 8s. On phones each row shows its screenshot inline.

### Forms and dashboard
- Contact fields and the Chakra reports dashboard sit on the frost sheet: white inputs, 1px Rule Frost border, 6px radius, Teal Ink focus. The Chakra `teal` palette is remapped to #0d7480 in `web/src/theme.ts`.

### Navigation
- See Tabs. Dropdowns (Playground, language) are white with Menu lift. The language switcher is a translucent white button at the right of the bar.

### Motion
- Entrance: parts of each section rise 24px and fade, 0.6s ease-out, staggered 70ms; folders only fade.
- Folder to page: View Transition 0.55s `cubic-bezier(0.22, 1, 0.36, 1)`; the clicked folder becomes the head band and the tabs travel to their bar slots. Everything stops under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** keep the tab set, order and x positions identical on every page.
- **Do** build every new proof as a folder: a tab, a band, one real number or picture.
- **Do** use real screenshots of this site for imagery; they live in `web/public/shots/`.
- **Do** use Teal Ink for the one action and verification only.
- **Do** set running text in Case Slate on frost and keep every text colour AA on its ground.
- **Do** put new text in `web/src/i18n/translations.ts`; es and en stay equal.
- **Do** keep a visible focus state and full keyboard operation on every control.
- **Do** draw colours from the variables in `web/src/css/tokens.css`.

### Don't:
- **Don't** add a second typeface or any monospace.
- **Don't** add gradients, glass or shadows at rest to the interface.
- **Don't** put an eyebrow label above a heading; the tab is the label.
- **Don't** separate sections with hairlines or outlined boxes; use space or a tone step.
- **Don't** set long text on a dark band or text below AA on any ground.
- **Don't** give the same tab different positions or colours on different pages.
- **Don't** hardcode hex values in components; use the tokens.
