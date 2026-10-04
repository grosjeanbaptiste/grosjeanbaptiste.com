# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static personal portfolio/resume website for Baptiste Grosjean, hosted on GitHub Pages. The site is built with vanilla HTML, CSS, and JavaScript without any build process or package manager dependencies — except the React view at `/app/`, which has its own build (see "The React view" below).

## Architecture

### File Structure
- `index.html` - Main HTML file containing the entire website content
- `css/` - Stylesheet directory
  - `style.css` - Main stylesheet with responsive design and theme support
  - `variables.css` - CSS custom properties for theming (light/dark mode)
- `js/` - JavaScript modules
  - `theme.js` - Dark/light mode theme switching functionality
  - `chart.js` - Chart.js integration for daily life visualization
  - `nav.js` - Navigation functionality including mobile menu and smooth scrolling
- `assets/` - Static assets
  - `data/resume.json` - Structured resume data following JSON Resume schema
  - `data/resume.xml` - XML mirror of resume data
  - `images/` - Profile pictures and other images
  - `cv/` - PDF version of CV
  - `xslt/resume-transform.xsl` - Optional XML transform stylesheet
- `CNAME` - GitHub Pages custom domain configuration

### Data Architecture
The website uses JSON and XML files for data:
- `assets/data/resume.json` - Primary resume data following the JSON Resume schema v1.0.0
- `assets/data/resume.xml` - XML mirror of the resume data

The HTML content is currently hardcoded in `index.html` rather than dynamically generated from the JSON data.

### Stylesheets
`css/style.css` is the ordered list of the classic page's sheets (one module per component, each under 200 lines). The page does not load it: as `@import`s it made the browser fetch one file to discover nineteen, all render-blocking, seven of them print-only (measured cold on a slow phone: first paint 1.26 s, 0.72 s without the chain). `scripts/lib/css-bundle.js`, run by `scripts/generate-from-resume.js`, writes the list out as `css/bundle.css` (screen) and `css/bundle-print.css` (linked with `media="print"`, which does not block the paint); both are generated and committed, and `scripts/lib/css-bundle.test.js` fails when they are stale — **after editing a CSS module, rerun the generator**. The page also preloads its text font.

### Theming System
- CSS custom properties in `variables.css` define color schemes
- Theme switching handled by `theme.js` with localStorage persistence
- Supports system preference detection via `prefers-color-scheme`
- Both light and dark themes with bordeaux/orange color palette

## Development Workflow

### Build Process

`dsl/resume.grosjean` is the single source of truth. **Edit the CV there and nowhere else.** `dsl/compile.py` parses it, validates it, and emits everything under `assets/data/`:

- `assets/data/resume.json` — strict JSON Resume v1.0.0 (English)
- `assets/data/i18n/{fr,nl,es,de,zh}.json` — per-language overlays, translated text fields only
- `assets/data/site-overrides.json` — hide/display overrides
- `assets/data/site-extras.json` — non-schema data (uses, notes, dailyLife)

Those four are **generated output that happens to be committed**. Editing one directly looks like it works — the site regenerates, the tests pass — and then the next `python dsl/compile.py` throws the edit away. `.github/workflows/dsl.yml` guards this by recompiling and failing if any committed artifact differs, and it watches both `dsl/**` and `assets/data/**` so the gate fires whichever side moved.

`scripts/generate-from-resume.js` then deep-merges canonical + overlay per language and produces six language variants:

- `/index.html` (English, canonical at root)
- `/fr/index.html`, `/nl/index.html`, `/es/index.html`, `/de/index.html`, `/zh/index.html`

It also writes the fourteen XML mirrors under `assets/data/` (read by the XSLT themes) and `sitemap.xml`. `llms.txt` and `llms-full.txt` are **not** generated — they are hand-maintained and drift silently; `scripts/lib/volunteer-dates.test.js` is an example of pinning one against the data.

Each variant has six marker blocks replaced from data:

- `LLM-HEAD` (in `<head>`) — localized `<title>`, meta tags (description, author, keywords, OG, Twitter, robots), canonical, **hreflang** alternates for all six languages + `x-default`, machine-readable alternates (JSON/XML/PDF), JSON-LD `schema.org/Person` with `inLanguage`.
- `NAV` (in `<body>`) — localized nav links, language switcher with active state, theme toggle.
- `BODY-SIDEBAR` (in `<aside class="sidebar">`) — contact info, skills categories, languages.
- `BODY-MAIN` (in `<main class="main-content">`) — about, experience, education, volunteer, projects, awards, interests, references, contact. Each item uses semantic `<article>` and `<time datetime>`.
- `CV-DOWNLOAD` — the floating CV action cluster: download the pre-built LaTeX PDF, or print the page itself through `css/print.css`.
- `DAILY-LIFE` — the hand-built SVG donut chart of a typical day, from `site-extras.json`.

`BODY-MAIN` also carries the **timeline** of the interactive view, right after About (`scripts/lib/sections/timeline.js`, model in `scripts/lib/timeline-model.js`): one lane per kind of entry, bars placed in percent of the career, each a link to its entry further down the page — work and education articles and the embedded project / volunteer rows carry ids from `scripts/lib/anchors.js` (only an entry's first appearance keeps its id; a bar whose entry is not on the page is drawn but is not a link). It works without JavaScript; `js/timeline.js` adds the zoom (2 years / 5 years / all, hidden until the script runs), the arrow keys, the hover preview and the mark on the bar of the entry in the URL. `css/timeline.css` styles it and `css/print.css` leaves it out of the printed sheet, since the LaTeX CV has none. `scripts/lib/sections/timeline.test.js` holds the markup, `scripts/lib/timeline-interaction.test.js` the behaviour in a real Chrome. Its "today" is the day the page was generated.

`<html lang="…">` is patched per language.

`.github/workflows/regenerate-from-resume.yml` runs the script on every push that touches `resume.json`, any overlay under `assets/data/i18n/`, or the script itself, then commits the regenerated files. Manual trigger via `workflow_dispatch` is also enabled.

The generator also rewrites `assets/data/resume.xml` from the canonical JSON. The XML carries an `<?xml-stylesheet?>` processing instruction pointing to `assets/xslt/resume-transform.xsl`, which renders the full CV when the XML is opened in an XSLT-capable browser (Firefox) or processed via `xsltproc` / Saxon. Chrome/Safari no longer apply client-side XSLT; the HTML site is the primary view for those.

### Printable PDFs

`scripts/generate-pdf.js` produces six printable CVs in `assets/cv/cv_grosjean_baptiste_{en,fr,nl,es,de,zh}.pdf` from the same canonical JSON + i18n overlays. It builds a LaTeX document inline (using the `altacv` class shipped in `latex/altacv.cls`) and compiles it via `pdflatex` (two passes per language). The download button in `index.html` is wrapped in `<!-- CV-DOWNLOAD -->` markers and points to the matching language PDF on each page (`/index.html` → `_en.pdf`, `/fr/index.html` → `_fr.pdf`, etc.).

The photo the PDF embeds is `assets/images/profil-print.jpeg` (480 px, about 300 ppi at the 4 cm it is set at), made by `scripts/make-photo-sizes.sh` — not the site's 837 px original, which was 160 kB of every 376 kB PDF; `scripts/lib/pdf-weight.test.js` holds the shipped PDFs to print resolution and under 300 kB.

**Hard rule: every generated PDF must fit on a single sheet — one recto (front) + one verso (back), maximum 2 pages total.** `scripts/lib/pdf/compile.js` enforces this via an iterative fit loop that walks the `FIT_PLANS` array in `scripts/lib/pdf/config.js` from the most generous plan to the tightest, retrying the LaTeX compile with progressively lower entry counts / shorter summaries / dropped optional sections until the resulting PDF has ≤ 2 pages. The recto carries the header + paracol two-column body (sidebar with education/skills/languages/day-chart, main with about/work); the verso carries only the references block (also emitted inside `paracol{2}` with `\switchcolumn` so it stays in the right-hand column). If no plan fits within 2 pages the pipeline fails hard rather than shipping a 3-page CV — do not relax this constraint when tuning content or fit plans.

Each PDF carries its own document properties (Title, Author, Subject, Keywords, Language) so a reader shows “Baptiste Grosjean — Curriculum vitæ” rather than the file name. `altacv` loads `pdfx` for PDF/A-1b, and `pdfx` takes those from a `\jobname.xmpdata` file written next to the source by `scripts/lib/pdf/metadata.js` — **not** from `\hypersetup{pdftitle=…}`, which would fill the docinfo dictionary and leave the XMP packet empty, the exact mismatch PDF/A forbids. `scripts/lib/pdf-metadata.test.js` reads the XMP packet back out of the six shipped PDFs, so anonymous artefacts fail the suite. The keywords live in `dc:subject` only — `pdfx` does not mirror them into the docinfo dictionary, so `pdfinfo` prints no `Keywords` line even though ATS and XMP-aware readers index them.

### Printing the page

Printing the HTML CV from a browser is meant to produce the LaTeX PDF, not a web page on paper. The LaTeX build is the source of truth for all of it: the palette and geometry come from `scripts/lib/pdf/preamble.js`, the column split from `document.js`, the entry shape from `sections/work.js`, the content reductions from the fit plan in `config.js`, and the type scale from `\documentclass[8pt]` — the sizes in `css/print*.css` (17.22 / 11.96 / 10.91 / 9.96 / 7.97 / 6.97 / 5.98 pt) are the ones measured out of a shipped PDF's own content stream, not guesses at TeX's steps.

Anything that moves a node between containers is `js/print-layout.js`, since CSS cannot: the full-width banner (`\makecvheader`), Education into the narrow column, the volunteering onto the verso. Everything it builds or rewrites is undone on `afterprint` — `scripts/lib/print-restore.test.js` compares the whole DOM before and after and fails on any residue. Where the wording itself differs, the page carries the PDF's version in `data-print-text` (clipped summaries, the localized country, the sections the PDF titles more briefly via `printHeading`) instead of the two being typed out twice.

The banner was removed once, because Firefox will not fragment the two-column block across sheets and a header above it pushed the whole block onto a third page. It is affordable now for the reason it was expensive then: the identity block is what leaves the narrow column, and nine stacked contact rows cost that 30% column far more height than the same details cost across the full width. That is also what let the sheet go back from 6pt to the PDF's 8pt. None of this is assumed — `print-fit.test.js` (Chrome, six languages), `print-fit-firefox.test.js` and `print-fit-xslt.test.js` print with real browsers and count the sheets.

Two divergences are deliberate: the sheet prints on white rather than altacv's grey `\pagecolor`, and consecutive roles at one employer are not collapsed into the PDF's continuation form. What remains beyond reach is TeX's line breaking, hyphenation and pagination, so line endings differ from the PDF and always will.

A second PDF per language, `assets/cv/cv_grosjean_baptiste_timeline_{lang}.pdf`, carries the timeline alone on **one A4 landscape page** — the interactive view's lanes (experience, education, projects, volunteering), the whole career up to today (plus `timeline_5y_` and `timeline_2y_`, cut to the last five and two years — the zoom options of the interactive view, listed in `scripts/lib/pdf/timeline/spans.js`; an entry begun earlier is cut at the span's start and points left; the reader at `/app/{lang}/pdf/timeline/` switches between them with `?span=5` / `?span=2`), every bar labelled since paper has no hover. `scripts/generate-timeline-pdf.js` builds it (`npm run pdf` runs both) from `scripts/lib/pdf/timeline/`: `bars.js` reads the entries, `rows.js` packs each lane by what a bar *and its label* occupy (a label too long for its bar sits beside it), `page.js` picks the largest type that still fits and refuses a timeline taller than the page rather than letting TeX cut it off, `picture.js` draws it in TikZ with the vertical CV's preamble and palette. Label widths are estimated before TeX runs, so `scripts/lib/pdf-timeline.test.js` reads the shipped PDFs back with poppler and fails if any two words overprint, if a page is missing, or if an entry is not on it.

The dedicated workflow `.github/workflows/regenerate-pdf.yml.disabled` installed the required TeX Live packages on Ubuntu and ran the script on every push that touched the resume data, the LaTeX class, or the script. It is **currently disabled** (hence the extension) — the PDFs are rebuilt locally and committed. Local prerequisites: Node 20+ and a `pdflatex` install with `altacv` deps (`paracol`, `fontawesome5`, `roboto`, `lato`, multilingual babel).

Running locally: `node scripts/generate-from-resume.js` (Node 20+). Idempotent.

Do not hand-edit anything between markers — overwritten on next run. Do not hand-edit the files under `assets/data/` either; they are compiled. Change `dsl/resume.grosjean`, run `python dsl/compile.py`, then `node scripts/generate-from-resume.js`.

Static (hand-maintained) parts of `index.html` outside markers: profile picture `<img>`, CDN scripts (pinned + SRI). The daily-life chart and the CV action cluster used to be static; both are generated now, inside the `DAILY-LIFE` and `CV-DOWNLOAD` markers. All static paths are **absolute** (`/css/…`, `/js/…`, `/assets/…`) so they resolve from any language subdir.

### i18n overlay format

The overlay mirrors `resume.json` shape but contains only translated fields. Arrays are matched by index — keep the same order as `resume.json`. Untranslated fields are omitted. UI strings (section titles like "Work Experience" / "Expérience professionnelle") are kept centralized in the generator's `I18N` constant, not in the overlay files.

LLM/agent-discovery files alongside the site:
- `llms.txt` — index per the [llmstxt.org](https://llmstxt.org) spec
- `llms-full.txt` — flat Markdown digest of the CV
- `robots.txt` — explicit allow for major LLM crawlers + sitemap reference
- `sitemap.xml` — XML sitemap including the JSON/XML/PDF data files

### The views bar

The classic site, the interactive view, both XSLT themes and the PDF are all *displays* of one CV, so every HTML display carries the same bar at the very top, listing them in the same order with the same localized labels, the current one marked `aria-current="page"`. One registry, `scripts/lib/views.js` (labels under `views` in `scripts/lib/i18n/*.js`), feeds three renderers: `renderViewsBar()` in the static generator's NAV block, `<meta><views>` in the XML mirrors for the `views-bar` template of each XSLT theme, and the `views` field of the React export. One stylesheet, `css/views-bar.css`, styles it everywhere (each display also loads `css/variables.css` for the DSL palette); it is fixed, and each display makes room with `--views-bar-h`. `scripts/lib/views.test.js` holds the classic page and both XSLT themes to the registry, `react/src/ui/views-bar.spec.tsx` the React side. Links to another display belong in the registry, not scattered in a view's own toolbar.

### The React view (`/app/`)

A third view of the same CV, next to the static HTML site and the XSLT themes: an interactive one — ⌘K command palette, filter by skill (shareable `?skill=` URLs), and a timeline that *is* the way to browse the CV: no lists of entries under it; a bar opens its entry in a panel below (`/app/{lang}/{kind}/{id}`, deep-linkable, a degree's panel lists its course units), hovering previews, the arrow keys walk from bar to bar (`src/domain/timeline-navigation.ts`), and zooming changes the scale only — the whole career is always drawn, scrolled to today. The app also serves the **PDF display**: `/app/{lang}/pdf/` reads the LaTeX PDF inside the site (PDF.js, loaded only there, behind the `PdfRenderer` port in `src/ui/pdf/`; adapter `src/infrastructure/pdfjs-renderer.ts`), under the same views bar, with its own toolbar (zoom, download, the raw file). `src/infrastructure/pdfjs-documents.spec.ts` opens every shipped PDF with PDF.js and expects its two pages. Switching displays is kept cheap, and each choice was measured (headless Chrome, throttled mobile profile) before it went in: the views bar's links to the app's own displays (interactive, PDF, timeline) are router `<Link>`s, so moving between them never reloads the app; the PDF bytes come from `src/infrastructure/pdf-bytes.ts`, one plain cacheable GET per file kept for the page's life (PDF.js's own range requests never came back from the HTTP cache and were sometimes made twice); one PDF.js worker is started once and handed to every document; the engine loads while the interactive view is idle (`src/ui/use-pdf-engine-ahead.ts`, not under Save-Data or on 2G), and a PDF is fetched as soon as the pointer or a finger reaches its link. The first visit to a display is prepared from the one being read: `js/views-ahead.js` (loaded by the classic page and by the app), once the page is idle and unless Save-Data or 2G says otherwise, reads the page of every other display in the views bar and fetches at low priority what it announces — so each app page announces its own needs in its `<head>` (`react/scripts/route-pages-lib.mjs`: the language's data, and for a reader page the first page's picture, the PDF, and the PDF engine's chunks, named from Vite's manifest by `engine-lib.mjs`), which also starts them with the page itself instead of after the app has booted. Chrome and Edge additionally prerender a display on the way to its link (speculation rules in `index.html` and `react/index.html`; the app's own displays are excluded there, being routes). `scripts/lib/views-ahead.test.js` asks a real Chrome what the classic page fetched unasked. The reader keys its container by file, since PDF.js never clears what it drew. Until PDF.js has drawn the first page, the reader shows pictures of the pages (`src/ui/pdf/PagePictures.tsx`): `scripts/generate-pdf-previews.js` renders every page of every shipped PDF to a 1000 px WebP in `assets/cv/previews/`, `manifest.json` ties each picture to its PDF by SHA-256 (`scripts/lib/pdf-previews.test.js` fails on a stale or missing one, so rebuilding a PDF means rerunning it — `npm run pdf` does), and the data export carries each language's pictures (`pictures` in `app/data/{lang}.json`). `dsl/resume.grosjean` stays the single source of truth; the app only re-reads its compiled output.

- **Source** in `react/` (Vite + React + TypeScript, its own `package.json`; Node 24 — `scripts/export-data.mjs` imports the domain's `.ts` slugger natively).
- **Build** in `app/`, **committed** like the localized `index.html` files, because GitHub Pages serves the repository as-is. Do not hand-edit `app/`: `cd react && npm run build` rewrites it whole.
- `npm run build` = `scripts/export-data.mjs` (merges canonical + overlay + overrides per language with the same `scripts/lib/data.js` / `site-overrides.js` the static generator uses, and gives every entry a stable id taken from the **English** entry, so `/app/fr/project/x` and `/app/en/project/x` are one page in two languages) → type check → `vite build` → `scripts/route-pages.mjs` (one `index.html` per route with a localized title and description, since Pages cannot rewrite URLs).
- Layers: `src/domain/` (pure: `Entry`, `Period`, search, skill usage, timeline — no React, no I/O, the clock is passed in), `src/application/` (`Catalogue` read model, languages), `src/infrastructure/` (`HttpResumeSource`, the adapter behind the `ResumeSource` port), `src/ui/` (React). Section titles come from the exported `scripts/lib/i18n` strings; strings only the app needs live in `src/ui/strings.ts`.
- The fonts and the DSL-generated palette are **not copied**: a Vite plugin links `/css/fonts.css` and `/css/variables.css` after HTML processing and, in dev, serves them from the repository root. The theme is stored under the same `theme` key as `js/theme.js`, so the choice follows the visitor across views.
- Tests: `cd react && npm test` (Vitest; specs are `*.spec.*` so the root `node --test` never picks them up). `src/infrastructure/exported-data.spec.ts` builds the catalogue of every exported language, so a dangling project reference or an id that differs between languages fails there. `scripts/lib/react-app.test.js` guards the CI wiring: the `react` job in `test.yml`, and the regeneration workflow rebuilding **and committing** `app/`.
- Dev: `cd react && npm run dev` → <http://localhost:5173/app/>.

### Local Development
Simply open `index.html` in a web browser or serve the directory with any static web server:
```bash
# Using Python's built-in server
python3 -m http.server 8000

# Using Node.js http-server (if available)
npx http-server

# Or any other static server
```

### Deployment
The site is hosted on GitHub Pages. Changes are deployed automatically when pushed to the `master` branch.

## Key Features

### Responsive Design
- Mobile-first approach with breakpoint at 768px
- Collapsible mobile navigation menu
- Flexible grid layout that stacks on mobile

### Interactive Elements
- Smooth scrolling navigation with active section highlighting
- Mobile hamburger menu with animation
- Dark/light theme toggle with icon switching
- Daily life chart using Chart.js (doughnut chart)
- Hover effects on profile picture and navigation elements

### Data Integration
The site could be enhanced to dynamically generate HTML content from the JSON resume data, but currently uses static HTML with the JSON files serving as potential data sources for future iterations.

## Styling Conventions
- Uses CSS custom properties for consistent theming
- Flexbox layout for responsive design
- CSS transitions for smooth interactions
- Font Awesome icons for visual elements
- Google Fonts (Roboto) for typography

## Potential Enhancements
- Dynamic HTML generation from JSON resume data
- JSON schema validation for resume data
- Additional chart visualizations
- Performance optimizations for mobile
- SEO meta tags optimization
