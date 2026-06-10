# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static personal portfolio/resume website for Baptiste Grosjean, hosted on GitHub Pages. The site is built with vanilla HTML, CSS, and JavaScript without any build process or package manager dependencies.

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

### Theming System
- CSS custom properties in `variables.css` define color schemes
- Theme switching handled by `theme.js` with localStorage persistence
- Supports system preference detection via `prefers-color-scheme`
- Both light and dark themes with bordeaux/orange color palette

## Development Workflow

### Build Process

`assets/data/resume.json` is the canonical single source of truth (English). Three i18n overlays live at `assets/data/i18n/{fr,nl,es}.json` and contain only translated text fields — the generator deep-merges canonical + overlay per language.

`scripts/generate-from-resume.js` produces four language variants:

- `/index.html` (English, canonical at root)
- `/fr/index.html`, `/nl/index.html`, `/es/index.html`

Each variant has four marker blocks replaced from data:

- `LLM-HEAD` (in `<head>`) — localized `<title>`, meta tags (description, author, keywords, OG, Twitter, robots), canonical, **hreflang** alternates for all four languages + `x-default`, machine-readable alternates (JSON/XML/PDF), JSON-LD `schema.org/Person` with `inLanguage`.
- `NAV` (in `<body>`) — localized nav links, language switcher with active state, theme toggle.
- `BODY-SIDEBAR` (in `<aside class="sidebar">`) — contact info, skills categories, languages.
- `BODY-MAIN` (in `<main class="main-content">`) — about, experience, education, volunteer, projects, awards, interests, references, contact. Each item uses semantic `<article>` and `<time datetime>`.

`<html lang="…">` is patched per language.

`.github/workflows/regenerate-from-resume.yml` runs the script on every push that touches `resume.json`, any overlay under `assets/data/i18n/`, or the script itself, then commits the regenerated files. Manual trigger via `workflow_dispatch` is also enabled.

The generator also rewrites `assets/data/resume.xml` from the canonical JSON. The XML carries an `<?xml-stylesheet?>` processing instruction pointing to `assets/xslt/resume-transform.xsl`, which renders the full CV when the XML is opened in an XSLT-capable browser (Firefox) or processed via `xsltproc` / Saxon. Chrome/Safari no longer apply client-side XSLT; the HTML site is the primary view for those.

### Printable PDFs

`scripts/generate-pdf.js` produces four printable CVs in `assets/cv/cv_grosjean_baptiste_{en,fr,nl,es}.pdf` from the same canonical JSON + i18n overlays. It builds a LaTeX document inline (using the `altacv` class shipped in `latex/altacv.cls`) and compiles it via `pdflatex` (two passes per language). The download button in `index.html` is wrapped in `<!-- CV-DOWNLOAD -->` markers and points to the matching language PDF on each page (`/index.html` → `_en.pdf`, `/fr/index.html` → `_fr.pdf`, etc.).

The dedicated workflow `.github/workflows/regenerate-pdf.yml` installs the required TeX Live packages on Ubuntu and runs the script on every push that touches `resume.json`, the i18n overlays, the LaTeX class, or the script. Local prerequisites: Node 20+ and a `pdflatex` install with `altacv` deps (`paracol`, `fontawesome5`, `roboto`, `lato`, multilingual babel).

Running locally: `node scripts/generate-from-resume.js` (Node 20+). Idempotent.

Do not hand-edit anything between markers — overwritten on next run. Edit `resume.json` (canonical) or `assets/data/i18n/<lang>.json` (translations).

Static (hand-maintained) parts of `index.html` outside markers: profile picture `<img>`, daily-life chart `<canvas>`, CV download button, CDN scripts (pinned + SRI). All static paths are **absolute** (`/css/…`, `/js/…`, `/assets/…`) so they resolve from any language subdir.

### i18n overlay format

The overlay mirrors `resume.json` shape but contains only translated fields. Arrays are matched by index — keep the same order as `resume.json`. Untranslated fields are omitted. UI strings (section titles like "Work Experience" / "Expérience professionnelle") are kept centralized in the generator's `I18N` constant, not in the overlay files.

LLM/agent-discovery files alongside the site:
- `llms.txt` — index per the [llmstxt.org](https://llmstxt.org) spec
- `llms-full.txt` — flat Markdown digest of the CV
- `robots.txt` — explicit allow for major LLM crawlers + sitemap reference
- `sitemap.xml` — XML sitemap including the JSON/XML/PDF data files

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
