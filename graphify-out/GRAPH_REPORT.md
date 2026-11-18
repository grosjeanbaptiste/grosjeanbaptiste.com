# Graph Report - grosjeanbaptiste.com  (2026-10-12)

## Corpus Check
- Large corpus: 982 files · ~2,033,149 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2530 nodes · 5179 edges · 143 communities (132 shown, 11 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 253 edges (avg confidence: 0.87)
- Token cost: 198,048 input · 0 output

## Community Hubs (Navigation)
- DSL Parser Builder
- DSL Node Types and Validation
- Site Generator and Page Head
- DSL Compile CLI and Tests
- Course Unit Source Checks
- EPHEC Bachelor Programme Dossier
- Site Data and Anchor Tests
- PDF Section Builders
- Workflow and Bundle Tests
- Node Test Harness Imports
- React UI Test Harness
- React Timeline Domain
- App Route Page Prerender
- DSL Migration Script
- React Domain Specs
- Degree Ranking and XML
- Views Bar and Data Export
- React Resume Entries
- React Timeline Navigation
- Anchors and Embedded Rows
- Classic Timeline Rendering
- PDF Timeline Row Packing
- PDF Metadata (XMP)
- React App Bootstrap
- PDF Preamble and Timeline Document
- React Periods and Blocks
- DSL Site Extras Compiler
- Main Sections and Markers
- PDF Verso Compact Timeline
- Timeline Model Fixtures
- Print Selection and Fit Plans
- PDF Document Assembly
- React Timeline Lane UI
- Icons and CV Download
- PDF Config and Languages
- Sidebar and Profiles
- React Resume Source
- PDF Previews and WebP
- Hosting Rules
- PDF Compilation
- Views Bar and PDF Warm-up
- CV PDF Generator
- Shared Translations
- PDF Timeline Page Plans
- DSL i18n Overlays Compiler
- DSL JSON Resume Compiler
- React Reading Context
- React TypeScript Config
- Document Tests
- Print Fit Tests
- Timeline Carried Tests
- USL-B Language Course Sheets
- Search
- Check Line Count
- App Prerender Tests
- Picture
- Pdf Timeline Tests
- Pdfjs Renderer
- Units Tests
- Print Fit Xslt Tests
- Timeline Groups
- Xslt Timeline Tests
- USL-B Sociology and Politics Sheets
- Pdfreader
- Print Fit Harness
- Header Tests
- Print Fit Firefox Tests
- Print Timeline Tests
- Print Verso Tests
- Timeline Units Tests
- Views Ahead Tests
- USL-B Economics Sheets
- USL-B Media and Methods Sheets
- Paths
- Pdf Previews Tests
- Compile
- Print Parity Tests
- Regenerate Workflow Tests
- Timeline Blocks
- USL-B Methods Seminar Readings
- Package
- Export Lib
- Timeline Interaction Tests
- Generate Timeline Pdf
- Print Visual Parity Tests
- Views Layout Tests
- Test Education Blocks
- Package (react, 87)
- Hero
- Course Units Tests
- Bars Tests
- Page Tests
- Picture Tests
- Print Restore Tests
- Print Volunteer Tests
- Timeline Tests
- Site Overrides
- Timeline Units Tests (lib, 97)
- Volunteer Dates Tests
- USL-B Political Science Concepts
- Site Overrides (compilers, 100)
- Chrome Probe
- Bars Degree Tests
- Page Degrees Tests
- Education Blocks Tests
- Education Tests
- Extras Tests
- Bars
- Print Fonts Tests
- Timeline Model
- Xslt Print Tests
- Docs Accuracy Tests
- Favicon Tests
- Photo Tests
- Projects Tests
- Timeline Blocks Tests
- Timeline Nonlatin Tests
- Timeline Print Tests
- Xslt Blocks Tests
- Test Roundtrip
- Pdf Bytes
- Rows Blocks Tests
- Scale Tests
- Print Page Colour Tests
- React HTML Entry Page
- Vite.config
- Measure
- Rows Margin Tests
- Rows Whole Tests
- Daily Life
- Timeline Degree Title Tests
- Package (react, 131)
- Package (react, 132)
- Pdf Renderer
- Validators
- DSL Python Requirements
- Make Photo Sizes

## God Nodes (most connected - your core abstractions)
1. `_Builder` - 163 edges
2. `Bachelier en informatique de gestion (section, code 7500 05 S32 D3, 180 ECTS, 2200 périodes)` - 40 edges
3. `vitest` - 38 edges
4. `escapeHtml()` - 37 edges
5. `useReading()` - 36 edges
6. `tex()` - 33 edges
7. `Resume` - 25 edges
8. `Node` - 24 edges
9. `_pos()` - 24 edges
10. `timelineOf()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `_tr()` --uses--> `Translated`  [INFERRED]
  dsl/compilers/i18n_overlays.py → dsl/nodes.py
- `_basics_overlay()` --uses--> `Basics`  [INFERRED]
  dsl/compilers/i18n_overlays.py → dsl/nodes.py
- `emit_for_lang()` --uses--> `Resume`  [INFERRED]
  dsl/compilers/i18n_overlays.py → dsl/nodes.py
- `emit()` --uses--> `Resume`  [INFERRED]
  dsl/compilers/i18n_overlays.py → dsl/nodes.py
- `_text()` --uses--> `Translated`  [INFERRED]
  dsl/compilers/jsonresume.py → dsl/nodes.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **USL-B course-unit description sheets archived as CV provenance** — dsl__sources_usl_b_angl1191_anglais_1_anglais_i, dsl__sources_usl_b_espo1162_science_politique_science_politique, dsl__sources_usl_b_neer1181_neerlandais_1_neerlandais_i, dsl__sources_usl_b_pols1113_socio_economie_des_medias_socio_economie_des_medias, dsl__sources_usl_b_pols1122_economie_1_economie_i, dsl__sources_usl_b_pols1123_economie_2_economie_ii, dsl__sources_usl_b_pols1150_seminaire_principes_et_methodes_seminaire_principes_et_methodes_en_sc_sociales, dsl__sources_usl_b_pols1151_seminaire_penser_le_social_seminaire_penser_le_social [INFERRED 0.85]
- **Economie I and II sequence taught from Mankiw and Taylor** — dsl__sources_usl_b_pols1122_economie_1_economie_i, dsl__sources_usl_b_pols1123_economie_2_economie_ii, dsl__sources_usl_b_pols1122_economie_1_mankiw_taylor_principes_de_l_economie, dsl__sources_usl_b_pols1122_economie_1_latzer_helene [EXTRACTED 1.00]
- **First-cycle social-science seminar sequence with shared teaching staff** — dsl__sources_usl_b_pols1150_seminaire_principes_et_methodes_seminaire_principes_et_methodes_en_sc_sociales, dsl__sources_usl_b_pols1151_seminaire_penser_le_social_seminaire_penser_le_social, dsl__sources_usl_b_pols1150_seminaire_principes_et_methodes_vertongen_youri, dsl__sources_usl_b_pols1150_seminaire_principes_et_methodes_mathen_marie, dsl__sources_usl_b_pols1150_seminaire_principes_et_methodes_woitchik_juliette [EXTRACTED 1.00]
- **Chaîne de prérequis des projets de développement** — dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_principes_algorithmiques_et_programmation, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_programmation_orientee_objet, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_gestion_et_exploitation_de_bases_de_donnees, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_web_principes_de_base, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_projet_de_developpement_web, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_projet_de_developpement_sgbd, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_projet_d_integration_de_developpement [EXTRACTED 1.00]
- **Unités déterminantes de la section** — dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_produits_logiciels_de_gestion_integres, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_veille_technologique, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_administration_gestion_et_securisation_des_reseaux, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_projet_de_developpement_web, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_projet_de_developpement_sgbd, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_projet_d_integration_de_developpement, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_projet_d_analyse_et_de_conception, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_activites_professionnelles_de_formation [EXTRACTED 1.00]
- **Parcours d'intégration professionnelle (analyse, stage, activités professionnelles)** — dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_projet_d_analyse_et_de_conception, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_stage_d_integration_professionnelle, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_activites_professionnelles_de_formation, dsl__sources_ephec_bachelier_en_informatique_version_2_dossier_complet_projet_d_integration_de_developpement [EXTRACTED 1.00]

## Communities (143 total, 11 thin omitted)

### Community 1 - "DSL Node Types and Validation"
Cohesion: 0.07
Nodes (26): AwardEntry, Basics, BlockEntry, CompetitionEntry, DailyItem, Date, DateRange, EducationEntry (+18 more)

### Community 2 - "Site Generator and Page Head"
Cohesion: 0.05
Nodes (44): { applyHtmlOverrides }, bundles, { bundlesOf }, crypto, fs, { generateCvDownload }, { generateDailyLife }, { generateHead } (+36 more)

### Community 3 - "DSL Compile CLI and Tests"
Cohesion: 0.09
Nodes (22): main(), _write_json(), parse(), parse_file(), education(), test_a_degree_followed_in_the_evening_says_so(), test_a_degree_that_says_nothing_is_followed_by_day(), test_a_schedule_the_cv_does_not_know_is_refused() (+14 more)

### Community 4 - "Course Unit Source Checks"
Cohesion: 0.06
Nodes (39): decode(), download(), { driftOf }, { execFileSync }, fs, os, path, pdfPages() (+31 more)

### Community 5 - "EPHEC Bachelor Programme Dossier"
Cohesion: 0.10
Nodes (45): Bachelier en informatique de gestion : Activités professionnelles de formation (7503 07 U32 D1), Administration, gestion et sécurisation des réseaux (7532 47 U32 D2), Allemand en situation appliqué à l'enseignement supérieur - UF2 (7303 92 U32 D1), Anglais en situation appliqué à l'enseignement supérieur - UF2 (7302 92 U32 D1), Axe de compétences : analyse et conception d'applications, Axe de compétences : e-business et logiciels de gestion intégrés, Axe de compétences : programmation dans différents environnements, Axe de compétences : administration, gestion et sécurisation de réseaux (+37 more)

### Community 6 - "Site Data and Anchor Tests"
Cohesion: 0.06
Nodes (34): { anchorOf }, { applyHtmlOverrides }, assert, fs, { LANGS, langOutFile }, { loadResume }, test, I18N_DIR (+26 more)

### Community 7 - "PDF Section Builders"
Cohesion: 0.12
Nodes (37): findProject(), sortByRecency(), topN(), { appendItemTrailer }, carriedProjects(), isUnit(), renderEducationEntry(), renderSummary() (+29 more)

### Community 8 - "Workflow and Bundle Tests"
Cohesion: 0.06
Nodes (30): bundlesOf(), fs, isPrint(), path, assert, { bundlesOf }, fs, path (+22 more)

### Community 9 - "Node Test Harness Imports"
Cohesion: 0.05
Nodes (27): assert, fs, manifest, path, ROOT, svg, test, assert (+19 more)

### Community 10 - "React UI Test Harness"
Cohesion: 0.12
Nodes (13): aViews(), TODAY, aUi(), currentLocation(), InMemorySource, LocationProbe(), renderApp(), documentOf() (+5 more)

### Community 11 - "React Timeline Domain"
Cohesion: 0.11
Nodes (26): Catalogue, BlockGroup, Block, Entry, ENTRY_KINDS, EntryKind, CARRIED, Dated (+18 more)

### Community 12 - "App Route Page Prerender"
Cohesion: 0.09
Nodes (23): engineOf(), manifest, APP, document, engine, DATA, documents, HERE (+15 more)

### Community 13 - "DSL Migration Script"
Cohesion: 0.21
Nodes (22): _banner(), _bare_or_string(), _dedupe_key(), _emit_awards(), _emit_basics(), _emit_education(), _emit_interests(), _emit_languages() (+14 more)

### Community 14 - "React Domain Specs"
Cohesion: 0.10
Nodes (20): catalogue, entriesOf(), aResume(), entries, ids(), entries, withProjectSkills(), timeline (+12 more)

### Community 15 - "Degree Ranking and XML"
Cohesion: 0.12
Nodes (24): degreeScore(), formatDegreeLine(), highestInProgressDegree(), highestObtainedDegree(), I18N, rankDegrees(), assert, { highestObtainedDegree, formatDegreeLine } (+16 more)

### Community 16 - "Views Bar and Data Export"
Cohesion: 0.08
Nodes (24): { applyHtmlOverrides }, canonical, I18N, { LANGS }, { loadResume }, MANIFEST, OUT_DIR, require (+16 more)

### Community 17 - "React Resume Entries"
Cohesion: 0.14
Nodes (23): blocksOf(), fromEducation(), fromProject(), fromVolunteer(), fromWork(), LABELS, periodOf(), degreePeriods() (+15 more)

### Community 18 - "React Timeline Navigation"
Cohesion: 0.12
Nodes (24): YearMonth, byTime(), closestIn(), Direction, locate(), middle(), neighbour(), Timeline (+16 more)

### Community 19 - "Anchors and Embedded Rows"
Cohesion: 0.15
Nodes (25): anchorOf(), PARTS, slug(), dateRangeHtml(), { EMOJI_RANGES }, escapeHtml(), MONTHS_LOCALIZED, PRESENT_LABEL (+17 more)

### Community 20 - "Classic Timeline Rendering"
Cohesion: 0.15
Nodes (25): formatDate(), generateMain(), { escapeHtml }, generateTimeline(), I18N, legendHtml(), { pct, periodOf, labelOf, legendOf, LANE_LABEL, zoomsOf }, renderBar() (+17 more)

### Community 21 - "PDF Timeline Row Packing"
Cohesion: 0.12
Nodes (23): cut(), bandsOnPaper(), { cut }, labelOf(), packGroupsOnPaper(), packLane(), shortened(), assert (+15 more)

### Community 22 - "PDF Metadata (XMP)"
Cohesion: 0.09
Nodes (22): RFC-3066, { loadResume }, buildXmpData(), keywords(), { buildXmpData, xmpEscape }, fs, assert, assert (+14 more)

### Community 23 - "React App Bootstrap"
Cohesion: 0.15
Nodes (16): isLang(), LANGS, preferredLang(), ResumeDocument, noPdf, noSource, prerender(), Deps (+8 more)

### Community 24 - "PDF Preamble and Timeline Document"
Cohesion: 0.09
Nodes (24): NEEDS_CJK(), buildPreamble(), CJK_FONT_FALLBACKS, COLOURS, CVTAG_WRAP_MACRO, { NEEDS_CJK }, SIDEBAR_HEADING_MACRO, VERSO_HEADING_MACRO (+16 more)

### Community 25 - "React Periods and Blocks"
Cohesion: 0.14
Nodes (12): newestFirst(), block(), degree, related, fromCompetition(), daysIn(), instant(), monthOf() (+4 more)

### Community 26 - "DSL Site Extras Compiler"
Cohesion: 0.19
Nodes (12): _block(), _competitions(), _daily_life(), _education_extras(), emit(), _hours_as_int_if_whole(), _project_extras(), _resolve_project_name() (+4 more)

### Community 27 - "Main Sections and Markers"
Cohesion: 0.12
Nodes (23): wrapPictographs(), escapeRegex(), indentLines(), MARKERS, replaceBetween(), printedWork(), printHeading(), { anchorOf } (+15 more)

### Community 28 - "PDF Verso Compact Timeline"
Cohesion: 0.12
Nodes (21): blockLabelled(), { cut }, labelled(), laneOf(), layOutCompact(), moonRoom(), PLACED, slotsOf() (+13 more)

### Community 29 - "Timeline Model Fixtures"
Cohesion: 0.10
Nodes (21): withBlocks(), twice(), resume(), TODAY, assert, barsOf(), lane(), test (+13 more)

### Community 30 - "Print Selection and Fit Plans"
Cohesion: 0.10
Nodes (18): FIT_PLANS, { FIT_PLANS, PRINT_PLAN_INDEX }, PDF_I18N, articles(), assert, { FIT_PLANS, PRINT_PLAN_INDEX }, fs, html (+10 more)

### Community 31 - "PDF Document Assembly"
Cohesion: 0.14
Nodes (20): { BABEL }, { buildAbout }, { buildEducation }, { buildHeader }, { buildPreamble }, { buildReferences }, {
  buildSkillsBlock,
  buildLanguagesBlock,
  buildDayBlock,
  buildDegreesSummary,
}, { buildTimeline } (+12 more)

### Community 32 - "React Timeline Lane UI"
Cohesion: 0.22
Nodes (16): byBlock(), TimelineBar, useKindLabel(), EntryFacts(), EntryPanel(), formatPeriod(), monthYear(), same() (+8 more)

### Community 33 - "Icons and CV Download"
Cohesion: 0.12
Nodes (18): fitTransform(), fmt(), icon(), ICONS, resolveKey(), assert, fs, { generateCvDownload } (+10 more)

### Community 34 - "PDF Config and Languages"
Cohesion: 0.11
Nodes (17): BABEL, LANGS, path, assert, BABEL_WORDING, DAY, { formatLongDate }, { LANGS } (+9 more)

### Community 35 - "Sidebar and Profiles"
Cohesion: 0.12
Nodes (17): PROFILE_ICONS, profileIcon(), { escapeHtml }, renderLanguagesBlock(), renderProjectsBlock(), renderSkillsBlocks(), assert, { renderProjectsBlock } (+9 more)

### Community 36 - "React Resume Source"
Cohesion: 0.14
Nodes (6): ResumeSource, Fetcher, HttpResumeSource, document, deps(), FakePdfRenderer

### Community 37 - "PDF Previews and WebP"
Cohesion: 0.13
Nodes (15): crypto, { execFileSync }, fs, os, pageCount(), path, renderPreviews(), run() (+7 more)

### Community 38 - "Hosting Rules"
Cohesion: 0.14
Nodes (18): firstWord(), hostsProject(), hostsRole(), nameOf(), namesRole(), rolesHostedBy(), assert, bachelor (+10 more)

### Community 39 - "PDF Compilation"
Cohesion: 0.14
Nodes (17): { buildXmpData }, { CLS_PATH, PROFILE_IMG, NEEDS_CJK, FIT_PLANS }, compileOnce(), compileWithFit(), countPages(), { execFileSync }, fs, { generateLatex } (+9 more)

### Community 40 - "Views Bar and PDF Warm-up"
Cohesion: 0.16
Nodes (13): insideApp(), preloadImage(), Props, ViewsBar(), ShellProps, timelinePdfPath(), PdfRenderer, Props (+5 more)

### Community 41 - "CV PDF Generator"
Cohesion: 0.11
Nodes (16): { applyPdfOverrides }, { compileWithFit }, failed, fs, { loadResume }, path, plans, files (+8 more)

### Community 42 - "Shared Translations"
Cohesion: 0.11
Nodes (11): sharedDe, sharedEn, sharedEs, sharedFr, sharedNl, sharedZh, assert, { buildVolunteer } (+3 more)

### Community 43 - "PDF Timeline Page Plans"
Cohesion: 0.16
Nodes (17): fitted(), hasUnits(), { labelWidth, MM_PER_PT }, lanesAt(), layOut(), namesOnly(), { packGroupsOnPaper }, PLANS (+9 more)

### Community 44 - "DSL i18n Overlays Compiler"
Cohesion: 0.33
Nodes (14): _award_overlay(), _basics_overlay(), _competition_overlay(), _education_overlay(), emit(), emit_for_lang(), _interest_overlay(), _language_overlay() (+6 more)

### Community 45 - "DSL JSON Resume Compiler"
Cohesion: 0.34
Nodes (14): _award_entry(), _basics(), _date_iso(), _education_entry(), emit(), _interest_entry(), _languages(), _period() (+6 more)

### Community 46 - "React Reading Context"
Cohesion: 0.24
Nodes (13): KIND_LABEL_KEYS, Reading, ReadingContext, ReadingProvider, InteractiveCv(), LangShell(), LoadedShell(), NotFound() (+5 more)

### Community 47 - "React TypeScript Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noFallthroughCasesInSwitch (+9 more)

### Community 48 - "Document Tests"
Cohesion: 0.12
Nodes (14): assert, { FIT_PLANS, PRINT_PLAN_INDEX }, { generateLatex }, latex(), { loadResume }, test, TODAY, { TRACK, TITLES } (+6 more)

### Community 49 - "Print Fit Tests"
Cohesion: 0.12
Nodes (15): printedWithRetry(), assert, chrome, CHROME_CANDIDATES, { execFile }, fs, os, PAGES (+7 more)

### Community 50 - "Timeline Carried Tests"
Cohesion: 0.14
Nodes (14): assert, degree(), test, { timelineOf }, TODAY, under(), assert, captions() (+6 more)

### Community 51 - "USL-B Language Course Sheets"
Cohesion: 0.13
Nodes (15): ANGL1191 - Anglais I, Backer Elena, Basic English Grammar (ESPO English team), Cipolla Gina, Communicating in English I and II (ESPO English team), Ferrari Sebastiano, Longrée Françoise, Temmerman Tanja (+7 more)

### Community 52 - "Search"
Cohesion: 0.27
Nodes (12): entryScore(), fieldsOf(), search(), SearchHit, skillScore(), wordScore(), skillUsage, fold() (+4 more)

### Community 53 - "Check Line Count"
Cohesion: 0.13
Nodes (13): CODE_EXTS, fs, GENERATED, IGNORED_DIRS, main(), path, ROOT, walk() (+5 more)

### Community 54 - "App Prerender Tests"
Cohesion: 0.12
Nodes (13): assert, fs, path, { ROOT, LANGS }, test, ROOT, assert, AUDITED (+5 more)

### Community 55 - "Picture"
Cohesion: 0.21
Nodes (16): barLines(), buildPicture(), FILL, fillOf(), isEvening(), LANE_TITLE, laneLines(), legendLines() (+8 more)

### Community 56 - "Pdf Timeline Tests"
Cohesion: 0.17
Nodes (16): { applyPdfOverrides }, assert, checkTimelinePdf(), { execFileSync }, I18N, { LANGS, OUTPUT_DIR }, { loadResume }, overprints() (+8 more)

### Community 57 - "Pdfjs Renderer"
Cohesion: 0.16
Nodes (4): loadEngine(), PdfJsRenderer, container, pdfjs-dist

### Community 58 - "Units Tests"
Cohesion: 0.13
Nodes (12): assert, bands(), { buildPicture }, { compileTimeline }, { layOut }, packed(), { packGroupsOnPaper }, resume (+4 more)

### Community 59 - "Print Fit Xslt Tests"
Cohesion: 0.13
Nodes (13): pageHeads(), assert, CANDIDATES, firefox, fs, isComplete(), os, path (+5 more)

### Community 60 - "Timeline Groups"
Cohesion: 0.23
Nodes (15): { anchorOf }, { blocksOf }, datedProjects(), datedRoles(), during(), entryGroups(), groupOf(), held() (+7 more)

### Community 61 - "Xslt Timeline Tests"
Cohesion: 0.13
Nodes (12): assert, { execFileSync }, fs, laid, path, render(), resume, { ROOT, LANGS } (+4 more)

### Community 62 - "USL-B Sociology and Politics Sheets"
Cohesion: 0.14
Nodes (13): Pouvoir, Dal Cynthia, Emile Durkheim, Georg Simmel, Karl Marx, Karl Polanyi (La grande transformation), Marcel Gauchet, Marcel Mauss (+5 more)

### Community 63 - "Pdfreader"
Cohesion: 0.24
Nodes (11): Lang, TimelineSpan, PagePictures(), PDF_STRINGS, PdfStrings, DOCUMENTS, PdfReader(), State (+3 more)

### Community 64 - "Print Fit Harness"
Cohesion: 0.18
Nodes (13): autoprintScript(), { execFileSync }, fs, http, injected(), MODES, path, renderXslt() (+5 more)

### Community 65 - "Header Tests"
Cohesion: 0.16
Nodes (12): buildHeader(), { formatLongDate }, PROFILE_INFO, assert, { buildHeader }, I18N, RESUME, test (+4 more)

### Community 66 - "Print Fit Firefox Tests"
Cohesion: 0.14
Nodes (13): assert, CANDIDATES, firefox, fs, isComplete(), os, path, { printedWithRetry } (+5 more)

### Community 67 - "Print Timeline Tests"
Cohesion: 0.14
Nodes (13): assert, CANDIDATES, check(), { execFile, execFileSync }, fs, I18N, os, path (+5 more)

### Community 68 - "Print Verso Tests"
Cohesion: 0.14
Nodes (11): assert, CANDIDATES, check(), { execFile, execFileSync }, fs, os, path, { promisify } (+3 more)

### Community 69 - "Timeline Units Tests"
Cohesion: 0.13
Nodes (13): assert, bars, css, fs, { generateTimeline }, html, path, print (+5 more)

### Community 70 - "Views Ahead Tests"
Cohesion: 0.15
Nodes (13): assert, check(), CHROME_CANDIDATES, { execFile }, fs, os, path, { promisify } (+5 more)

### Community 71 - "USL-B Economics Sheets"
Cohesion: 0.21
Nodes (14): Université Saint-Louis - Bruxelles (USL-B), Efficiency and failure of competitive markets, Dorsimont Arnaud, POLS1122 - Economie I, Latzer Hélène, Mankiw and Taylor, Principes de l'économie (De Boeck, 2011), Functioning of competitive markets, Microeconomic theory (+6 more)

### Community 72 - "USL-B Media and Methods Sheets"
Cohesion: 0.16
Nodes (13): Media regulation and press subsidies, Antoine and Heinderyckx (2011), État des lieux des médias d'information en Belgique francophone, Charon (2009), Stratégies pluri-médias des groupes de presse, Colson Vinciane, Diversification, financiarisation, concentration and internationalisation of media, Économie du web, Gassee (2005), L'aide directe à la presse en Communauté française, Concept of gratuité (free content) (+5 more)

### Community 73 - "Paths"
Cohesion: 0.32
Nodes (10): Header(), isMac(), LangMenu(), PaletteAction, usePaletteActions(), homePath(), LANG_NAMES, pdfPath() (+2 more)

### Community 74 - "Pdf Previews Tests"
Cohesion: 0.15
Nodes (10): assert, crypto, { execFileSync }, fs, MANIFEST, { OUTPUT_DIR }, path, shipped (+2 more)

### Community 75 - "Compile"
Cohesion: 0.16
Nodes (12): { buildTimelineDocument }, { buildXmpData }, { compileOnce }, compileTimeline(), I18N, PORTS, assert, { compileTimeline } (+4 more)

### Community 76 - "Print Parity Tests"
Cohesion: 0.15
Nodes (11): assert, { buildPreamble }, css, DIVERGES, documentJs, { FIT_PLANS }, fs, path (+3 more)

### Community 77 - "Regenerate Workflow Tests"
Cohesion: 0.15
Nodes (9): assert, covers(), fs, GENERATED, path, ROOT, test, WORKFLOW (+1 more)

### Community 78 - "Timeline Blocks"
Cohesion: 0.25
Nodes (12): { anchorOf }, blockBar(), blocksOf(), shortYear(), { spanOf }, unitsOf(), dayOf(), monthNow() (+4 more)

### Community 79 - "USL-B Methods Seminar Readings"
Cohesion: 0.19
Nodes (11): Howard S. Becker, Les ficelles du métier, E. Kant, Qu'est-ce que les Lumières, Matalon, Mathen Marie, Régis Meyran, La crise des banlieues : fantasmes et réalités, Nguyen Anne, Peter Berger, Pierre Bourdieu (+3 more)

### Community 80 - "Package"
Cohesion: 0.15
Nodes (12): description, name, private, type, version, cmdk, jsdom, @testing-library/user-event (+4 more)

### Community 81 - "Export Lib"
Cohesion: 0.26
Nodes (9): identify(), identifySection(), NAMERS, picturesFor(), canonical, localized, uniqueIds(), slugOf() (+1 more)

### Community 82 - "Timeline Interaction Tests"
Cohesion: 0.17
Nodes (11): assert, check(), CHROME_CANDIDATES, { execFile }, fs, os, path, { promisify } (+3 more)

### Community 83 - "Generate Timeline Pdf"
Cohesion: 0.18
Nodes (11): { applyPdfOverrides }, { compileTimeline }, failed, fs, { loadResume }, path, { ROOT, OUTPUT_DIR, LANGS }, { SPANS, timelineFile } (+3 more)

### Community 84 - "Print Visual Parity Tests"
Cohesion: 0.18
Nodes (11): assert, { buildPreamble }, cls, css, fs, path, preamble, read() (+3 more)

### Community 85 - "Views Layout Tests"
Cohesion: 0.15
Nodes (10): assert, CHROME_CANDIDATES, { execFile }, fs, os, path, { promisify }, run (+2 more)

### Community 86 - "Test Education Blocks"
Cohesion: 0.30
Nodes (10): blocks(), document(), test_a_block_carries_the_programmes_name_for_it_in_english(), test_a_block_names_the_units_taken_that_year_by_their_name(), test_a_block_says_when_it_ran(), test_a_block_the_programme_does_not_name_has_no_label(), test_a_degree_carries_its_blocks_in_order(), test_a_unit_filed_under_two_blocks_is_refused() (+2 more)

### Community 87 - "Package (react, 87)"
Cohesion: 0.17
Nodes (12): devDependencies, jsdom, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, @types/node, @types/react, @types/react-dom (+4 more)

### Community 88 - "Hero"
Cohesion: 0.39
Nodes (8): entriesUsing(), useReading(), About(), Hero(), photoSrcSet(), WIDTHS, HomePage(), SkillFilter()

### Community 89 - "Course Units Tests"
Cohesion: 0.18
Nodes (10): assert, EPHEC_FROM_THE_DOSSIERS, FROM_THE_SHEETS, fs, { loadResume }, msc, path, resume (+2 more)

### Community 90 - "Bars Tests"
Cohesion: 0.24
Nodes (10): aResume(), assert, group(), lane(), lastTwo(), test, { timelineBars }, TODAY (+2 more)

### Community 91 - "Page Tests"
Cohesion: 0.24
Nodes (8): assert, at(), bar(), busy, crowd(), { layOut, TRACK }, test, timeline()

### Community 92 - "Picture Tests"
Cohesion: 0.23
Nodes (9): assert, bar(), { buildPicture }, day(), evening(), I18N, outlined(), sheet() (+1 more)

### Community 93 - "Print Restore Tests"
Cohesion: 0.17
Nodes (10): assert, CHROME_CANDIDATES, { execFile }, fs, os, path, { promisify }, run (+2 more)

### Community 94 - "Print Volunteer Tests"
Cohesion: 0.17
Nodes (11): assert, CHROME_CANDIDATES, { execFile, execFileSync }, fs, os, path, { promisify }, ROLES (+3 more)

### Community 95 - "Timeline Tests"
Cohesion: 0.17
Nodes (10): assert, fs, { generateTimeline }, html, ON_PAGE, path, resume, { ROOT, LANGS, langOutFile } (+2 more)

### Community 96 - "Site Overrides"
Cohesion: 0.27
Nodes (11): applyDisplayPatches(), applyHtmlOverrides(), applyPdfOverrides(), entryKey(), fs, KEY_FIELDS, OVERRIDES_PATH, path (+3 more)

### Community 97 - "Timeline Units Tests (lib, 97)"
Cohesion: 0.24
Nodes (11): assert, band(), byName(), head(), lane(), studied(), test, { timelineOf } (+3 more)

### Community 98 - "Volunteer Dates Tests"
Cohesion: 0.20
Nodes (10): assert, DATA_DIR, dslUmonsPeriods(), fs, LOCALIZED_RANGE, path, PUBLISHED, read() (+2 more)

### Community 99 - "USL-B Political Science Concepts"
Cohesion: 0.24
Nodes (8): Deleixhe Martin, Démocratie, Etat, Fondements de science politique (De Boeck, 2014), Paye Olivier, Politique / politisation, ESPO1162 - Science politique, Philippe Braud, Science politique. 2. L'Etat

### Community 100 - "Site Overrides (compilers, 100)"
Cohesion: 0.25
Nodes (4): _display_patches(), emit(), _hidden_by(), _resolve_display_target()

### Community 101 - "Chrome Probe"
Cohesion: 0.20
Nodes (9): CANDIDATES, { execFile }, fs, os, path, probePage(), { promisify }, run (+1 more)

### Community 102 - "Bars Degree Tests"
Cohesion: 0.24
Nodes (10): aResume(), assert, BLOCKS, group(), lane(), studied(), test, { timelineBars } (+2 more)

### Community 103 - "Page Degrees Tests"
Cohesion: 0.22
Nodes (8): assert, at(), bar(), busy, degree, { layOut }, test, timeline

### Community 104 - "Education Blocks Tests"
Cohesion: 0.18
Nodes (7): { appendEmbeds }, assert, BLOCKS, ctx, html(), I18N, test

### Community 105 - "Education Tests"
Cohesion: 0.22
Nodes (9): assert, { buildEducation }, { buildWork }, education(), I18N, LIMITS, resume, test (+1 more)

### Community 106 - "Extras Tests"
Cohesion: 0.24
Nodes (8): buildReferences(), assert, { buildReferences }, I18N, references(), resume, test, { tex }

### Community 107 - "Bars"
Cohesion: 0.27
Nodes (8): ALONE, cut(), { entryGroups, monthOf, monthNow }, reaches(), restMax(), { truncate }, within(), worded()

### Community 108 - "Print Fonts Tests"
Cohesion: 0.22
Nodes (7): assert, fontsCss, fs, path, printCss, ROOT, test

### Community 109 - "Timeline Model"
Cohesion: 0.33
Nodes (7): { entryGroups, monthNow }, laneOf(), measured(), { packRows, packGroups }, under(), packGroups(), packRows()

### Community 110 - "Xslt Print Tests"
Cohesion: 0.22
Nodes (6): assert, { execFileSync }, path, ROOT, test, XSL

### Community 111 - "Docs Accuracy Tests"
Cohesion: 0.22
Nodes (8): assert, COMPILED, doc, fs, { MARKERS }, path, { ROOT, LANGS, I18N_DIR, langPath }, test

### Community 112 - "Favicon Tests"
Cohesion: 0.22
Nodes (7): assert, fs, head, path, ROOT, svg, test

### Community 113 - "Photo Tests"
Cohesion: 0.22
Nodes (7): assert, fs, path, { ROOT, LANGS, langOutFile }, SRCSET, test, WIDTHS

### Community 114 - "Projects Tests"
Cohesion: 0.22
Nodes (8): assert, AUDITED, fs, path, PRIVATE_REPOS, PUBLISHED_FILES, { ROOT, LANGS, langOutFile }, test

### Community 115 - "Timeline Blocks Tests"
Cohesion: 0.28
Nodes (8): assert, bands(), BLOCKS, head(), lane(), test, { timelineOf }, { TODAY, resume }

### Community 116 - "Timeline Nonlatin Tests"
Cohesion: 0.25
Nodes (8): { anchorOf }, { applyHtmlOverrides }, assert, check(), id, { loadResume }, { probePage }, test

### Community 117 - "Timeline Print Tests"
Cohesion: 0.28
Nodes (8): assert, bare(), lane(), studied(), test, { timelineOf }, { TODAY, resume }, { withPrintRows }

### Community 118 - "Xslt Blocks Tests"
Cohesion: 0.22
Nodes (7): assert, { execFileSync }, headings, html, path, ROOT, test

### Community 121 - "Rows Blocks Tests"
Cohesion: 0.32
Nodes (7): assert, band(), bar(), laid(), { packGroupsOnPaper }, scale, test

### Community 122 - "Scale Tests"
Cohesion: 0.29
Nodes (7): assert, axis, span(), test, { timeScale }, widthOf(), Y()

### Community 123 - "Print Page Colour Tests"
Cohesion: 0.25
Nodes (7): assert, fs, path, printCss, { renderXslt }, ROOT, test

### Community 124 - "React HTML Entry Page"
Cohesion: 0.33
Nodes (7): React app HTML entry (index.html), No-JavaScript fallback (full-width timeline, classic CV link), React root mount point (#root, /src/main.tsx), ROUTE-HEAD placeholder (per-route title and description), Speculation rules prerendering the classic page, Pre-paint theme bootstrap script, Timeline scroll-to-today script

### Community 125 - "Vite.config"
Cohesion: 0.29
Nodes (5): SHARED, SITE_ROOT, TYPES, vite, @vitejs/plugin-react

### Community 126 - "Measure"
Cohesion: 0.52
Nodes (6): ems(), labelWidth(), moonOf(), restOf(), textWidth(), widthOf()

### Community 127 - "Rows Margin Tests"
Cohesion: 0.29
Nodes (6): assert, long, { packLane }, [placed], scale, test

### Community 128 - "Rows Whole Tests"
Cohesion: 0.29
Nodes (6): assert, cut, { packLane }, scale, test, { timelineBars }

### Community 129 - "Daily Life"
Cohesion: 0.43
Nodes (6): { escapeHtml }, fmt(), generateDailyLife(), I18N, pt(), slicePath()

### Community 130 - "Timeline Degree Title Tests"
Cohesion: 0.33
Nodes (6): assert, captionOf(), degree(), test, { timelineOf }, TODAY

### Community 131 - "Package (react, 131)"
Cohesion: 0.33
Nodes (6): dependencies, cmdk, pdfjs-dist, react, react-dom, react-router

### Community 132 - "Package (react, 132)"
Cohesion: 0.33
Nodes (6): scripts, build, data, dev, test, typecheck

### Community 134 - "Validators"
Cohesion: 0.60
Nodes (3): _check_translation(), ValidationError, _walk_values()

### Community 135 - "DSL Python Requirements"
Cohesion: 0.50
Nodes (4): DSL Python requirements (requirements.txt), Lark parser dependency (lark>=1.3), pytest dependency (pytest>=8.0), Ruff linter/formatter dependency (ruff>=0.5)

## Ambiguous Edges - Review These
- `Paye Olivier` → `Fondements de science politique (De Boeck, 2014)`  [AMBIGUOUS]
  dsl/_sources/usl-b/ESPO1162_science-politique.pdf · relation: references
- `Mathématique appliquée à l'informatique (0121 02 U32 D3)` → `Eléments de statistique (0132 03 U32 D1)`  [AMBIGUOUS]
  dsl/_sources/ephec/bachelier_en_informatique_version_2_dossier_complet.pdf · relation: conceptually_related_to
- `Structure des ordinateurs (7551 01 U32 D3)` → `Informatique - Système d'exploitation (7552 03 U32 D3)`  [AMBIGUOUS]
  dsl/_sources/ephec/bachelier_en_informatique_version_2_dossier_complet.pdf · relation: conceptually_related_to
- `Notions de e-business (7145 06 U32 D1)` → `Produits logiciels de gestion intégrés (7111 06 U32 D2)`  [AMBIGUOUS]
  dsl/_sources/ephec/bachelier_en_informatique_version_2_dossier_complet.pdf · relation: conceptually_related_to

## Knowledge Gaps
- **1028 isolated node(s):** `name`, `private`, `version`, `type`, `description` (+1023 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1343 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Paye Olivier` and `Fondements de science politique (De Boeck, 2014)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `vitest` connect `React UI Test Harness` to `React Resume Source`, `Workflow and Bundle Tests`, `App Route Page Prerender`, `React Domain Specs`, `Package`, `Export Lib`, `React Timeline Navigation`, `React App Bootstrap`, `Pdf Bytes`, `React Periods and Blocks`, `Vite.config`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 22 inferred relationships involving `_Builder` (e.g. with `AwardEntry` and `Basics`) actually correct?**
  _`_Builder` has 22 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _1028 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DSL Parser Builder` be split into smaller, more focused modules?**
  _Cohesion score 0.017355371900826446 - nodes in this community are weakly interconnected._
- **What is the exact relationship between `Mathématique appliquée à l'informatique (0121 02 U32 D3)` and `Eléments de statistique (0132 03 U32 D1)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `ResumeDocument` connect `React App Bootstrap` to `React Resume Source`, `Views Bar and PDF Warm-up`, `React UI Test Harness`, `React Reading Context`, `React Resume Entries`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._