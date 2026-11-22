# Features by view

Index of what each display of the CV offers. The displays are the classic page,
the interactive view (React, `/app/`), the rich XSLT theme, the minimal XSLT
theme and the PDFs. Last checked: 2026-11-22, by reading the code and rendering both themes with `xsltproc`
(`index.html`, `assets/xslt/resume-transform*.xsl`, `react/src/ui/`); the
behaviour was not re-tested in a browser for this file.

The XSLT themes are served as plain HTML pages (`assets/data/resume-{lang}[-minimal].html`, drawn by `xsltproc` at generation) so that they show in Chrome and Safari, which no longer apply client-side XSLT; the XML mirrors still carry their stylesheet.

The classic page and the interactive view are `hidden` in `scripts/lib/views.js`: they stay online but the views bar no longer offers them.

Legend: **yes** = present, **css** = done with markup and CSS only (no script),
**no** = absent, **n/a** = does not apply.

| Feature | Classic | Interactive | XSLT rich | XSLT minimal |
|---|---|---|---|---|
| Six languages, language switcher | yes | yes | yes (links to the other XSLT displays) | yes (same) |
| Views bar (all displays, same order) | yes | yes | yes | yes |
| Dark / light theme, shared `theme` key | yes | yes | yes | yes |
| Timeline (four lanes, bars in percent) | yes | yes | yes | yes |
| Timeline zoom (2 years / 5 years / all) | yes (script) | yes | css (radios) | css (radios) |
| Timeline folded on phones (family of projects) | yes | no | yes | yes |
| Timeline PDF download per zoom | yes | yes | yes | yes |
| Skill filter | yes (script) | yes | css (`:target`) | css (`:target`) |
| Shareable `?skill=` URL | yes | yes | yes (`js/xslt-links.js`) | yes (same script) |
| Search (⌘K / Ctrl+K) | yes (`js/search.js`) | yes (palette) | yes (same script as classic) | yes (same) |
| Palette actions (languages, theme, PDFs) | yes (in the search) | yes | yes (in the search) | yes (same) |
| Skill tags on entries lead into the filter | yes | yes | yes | yes (the skills section) |
| Entry opened from a timeline bar | scrolls to the entry | panel under the timeline | css panel (`:target`) | css panel (same) |
| Deep link to one entry in a given language | anchor `#…` | `/app/{lang}/{kind}/{id}` | anchor `#…`, and a link on to the interactive entry | anchor `#…`, and the same link |
| Course units, one page each | no | yes | rows with ids | rows with ids |
| Section menu with the active section marked | yes (`js/nav.js`) | n/a | yes (`js/xslt-links.js`) | yes (same) |
| Sticky toolbar, animated jumps between sections | yes | n/a | yes | yes (`css/xslt-polish.css`) |
| PDF reader inside the site | no | yes (PDF.js, zoom, download, page previews) | yes (PDF.js from `assets/_vendor/pdfjs`, zoom, fit width, download, page count, open; the browser's `<object>` and page pictures without the script) | yes (same) |
| CV PDF and print buttons | yes | yes | yes | yes |
| Print gives the LaTeX CV (two sheets, landscape verso) | yes (`js/print-layout.js`) | n/a | yes (own script) | yes (own script, tighter type) |
| Typical-day chart | yes (SVG) | no | yes | yes |
| JSON-LD `schema.org/Person` | yes | no | yes (`meta/head`) | yes |
| Open Graph / Twitter / description / keywords | yes | per-route title and description | yes | yes |
| `hreflang` for all six languages + `x-default` | yes | no | yes | yes |
| Font preload | yes | n/a | no | no |
| Display prefetch (`js/views-ahead.js`) | yes | yes | yes | yes |
| Chrome speculation rules (prerender) | yes | yes | yes | yes |
| Drawn at build time (visible before the script) | yes | yes | yes (XSLT) | yes (XSLT) |
| Works without JavaScript | yes (filter, search and zoom are hidden) | no | yes (except the search and the extras of `js/xslt-links.js`) | yes (same) |

## What the XSLT displays still lack

- The classic print layout script (`js/print-layout.js`) in the rich theme;
  both themes keep their own print scripts, which a test holds to one sheet.
- Font preload: the themes use their own font stack, not Roboto, so there is
  nothing to preload.

## Gaps of the interactive view

- The timeline does not fold a family of projects on phones.
- No JSON-LD, no Open Graph beyond the per-route title and description, no
  `hreflang` alternates.
- No typical-day chart.
