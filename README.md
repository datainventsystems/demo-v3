# DataInvent Systems — Marketing Website

A premium, enterprise-grade marketing site for **DataInvent Systems** (a Microsoft
Solutions Partner), built as a hand-coded, high-fidelity set of pages on a single
shared design system.

---

## 1. Funnel & Pages

The site is structured as a lead-generation funnel:

```
Home  →  Problem (01)  →  Solution  →  Book a Demo  →  Thank You
```

| # | Page | File | Purpose |
|---|------|------|---------|
| 1 | **Homepage** | `index.html` | Brand hero, challenges, solutions, industries, success stories, AI/Copilot, lead-gen, resources |
| 2 | **Problem 01** | `finance-visibility-reporting-gaps.html` | "Finance Visibility & Reporting Gaps" — signs, root-cause router, reporting health-check tool |
| 3 | **Solution** | `finance-erp.html` | "Finance & ERP Transformation" — strategic value, capabilities, Microsoft tech tabs, Why DataInvent, Operating Shift Map, case studies, lead-gen |
| 4 | **Book a Demo** | `book-a-demo.html` | The conversion form (primary object) + a quiet supporting aside |
| 5 | **Thank You** | `thank-you.html` | Success confirmation, "what happens next", "while you wait", social, closing CTA |

**Funnel wiring**
- The shared nav **"Book a Demo"** CTA (and mobile menu) links to `book-a-demo.html` on **every** page.
- Homepage lead-gen, Problem page, and Solution page each also CTA to `book-a-demo.html`.
- The Book-a-Demo form submits (client-side) and routes to `thank-you.html`.
- Home → `finance-visibility-reporting-gaps.html` → `finance-erp.html` → `book-a-demo.html` → `thank-you.html`.

---

## 2. Single Source of Truth (shared design system)

There are **no per-page `<style>` blocks** and **no per-page inline scripts**. Every page links:

```html
<link rel="stylesheet" href="css/styles.css">
...
<script src="js/main.js"></script>
```

- **`css/styles.css`** — the complete design system: tokens, nav/mega-menu, footer,
  buttons, reveals, and every section for all pages (Homepage `K.`, Problem `L.`,
  Solution `L2.`, Book-a-Demo `L3.`, Thank-You `L4.`).
- **`js/main.js`** — all shared behaviours: sticky nav + mega-menu, mobile menu,
  scroll progress, reveal-on-scroll, FAQ accordion, solution tech tabs + bg swap,
  shift-map tabs, success-stories rotator, Book-a-Demo form → thank-you handler,
  and optional GSAP magnetic/tilt enhancements (progressive enhancement — works
  without GSAP).

> **Rule:** any new visual style goes in `css/styles.css`; any new behaviour goes in
> `js/main.js`. Keep pages markup-only.

---

## 3. Brand Identity

| Token | Value |
|-------|-------|
| Orange (primary) | `#E47B2B` |
| Orange light | `#F4A45C` |
| Orange soft (tint) | `#FFF4EA` |
| Charcoal / dark | `#4A4A4A` |
| Darker (headings) | `#1F1F1F` |
| Night (dark sections) | `#1C1C1C` |

**Fonts** (Google Fonts): **Oxanium** (headings), **Inter** (body),
**JetBrains Mono** (labels / eyebrows / mono).

---

## 4. Folder Structure

```
datainvent-highfi/
├── index.html                               (Homepage)
├── finance-visibility-reporting-gaps.html   (Problem 01)
├── finance-erp.html                         (Solution)
├── book-a-demo.html                         (Book a Demo)
├── thank-you.html                           (Thank You)
├── css/
│   └── styles.css                           (shared design system — single source of truth)
├── js/
│   └── main.js                              (shared behaviours — single source of truth)
└── assets/                                  (see §5 for exact filenames)
```

---

## 5. Assets (drop these into `/assets`)

All paths are already wired in the HTML/CSS — just place the files with these exact names.

**Brand / favicon**
- `datainvent default logo.svg` (for light backgrounds)
- `datainvent logo for dark background.svg` (for dark nav / footer)
- `di favicon.png`

**Mega-menu thumbnails**
- `solutions-mega-menu-thumb.png`
- `industries-mega-menu-thumb.png`
- `case-studies-mega-menu-thumb.png`
- `resources-mega-menu-thumb.png`
- `about-mega-menu-thumb.png`

**Homepage industry tiles** (JPG)
- `industry-public.jpg`
- `industry-construction.jpg`
- `industry-financial.jpg`
- `industry-pro-services.jpg`
- `industry-manufacturing.jpg`

**Solution page — Microsoft product ICONS** (transparent PNG, ~square)
- `tech-ico-bc.png` (Business Central)
- `tech-ico-d365f.png` (Dynamics 365 Finance)
- `tech-ico-powerbi.png` (Power BI)
- `tech-ico-copilot.png` (Copilot)
- `tech-ico-automate.png` (Power Automate)
- `tech-ico-azure.png` (Azure)

**Solution page — Microsoft product BACKGROUNDS** (landscape JPG, ~1600×1000)
- `tech-bg-bc.jpg`
- `tech-bg-d365f.jpg`
- `tech-bg-powerbi.jpg`
- `tech-bg-copilot.jpg`
- `tech-bg-automate.jpg`
- `tech-bg-azure.jpg`

> Each tech background is displayed with a **double-exposure** (charcoal→orange
> duotone + left-weighted readability veil) so panel text stays crisp. Missing
> images fall back to on-brand solid colors, so the page never looks broken.

---

## 6. Running Locally

It's a static site — no build step. Options:

```bash
# From inside the project folder:
python -m http.server 8080
# then open http://localhost:8080
```

…or just open `index.html` directly in a browser. (A local server is recommended so
relative asset paths and the SVG logos resolve cleanly.)

---

## 7. Notable Components / Behaviours

- **Nav** — dark/transparent on dark heroes; add class `nav--solid` on light pages
  (Book-a-Demo uses it) so the nav is solid from the top and links are visible.
  Logo auto-swaps dark/light and falls back to a text lockup if the SVG fails.
- **Solution "Powered by Microsoft"** — clickable tech tabs with real product icons,
  a background image that swaps per tab (with duotone), and per-tech CTAs that link to
  future deep-dive pages (`business-central.html`, `power-bi.html`, etc.).
- **Operating Shift Map** — interactive Before → What Changes → After per workflow.
- **Success-stories rotator** — auto-rotating featured case study (shared on Home +
  Solution), pauses on hover.
- **Book-a-Demo** — form-first layout; soft orange-gradient form card; quiet light
  aside (steps, stats, Microsoft partner + the six Solutions Partner designations,
  a short testimonial); submits to `thank-you.html`.
- **Thank-You** — animated success check + ripple, done/upcoming step tracker,
  "while you wait" cards, social band, closing CTA.
- **Accessibility / motion** — respects `prefers-reduced-motion`; reveals and the
  animated check degrade gracefully.

---

## 8. Roadmap (next builds)

- **Technology deep-dive pages** (linked from the Solution tech tabs):
  `business-central.html`, `dynamics-365-finance.html`, `power-bi.html`,
  `copilot.html`, `power-automate.html`, `azure.html`.
- Additional Problem/Solution pairs following the same funnel + shared-system pattern.

---

## 9. Copilot Working Rules

1. Never rebuild files from scratch.
2. Always edit uploaded files.
3. Always return complete files after edits.
4. Validate CSS dependencies before modifying.
5. Preserve the existing design system.
6. Prefer minimal enterprise UI over flashy designs.

---

© 2026 DataInvent Systems Corp. All rights reserved.
