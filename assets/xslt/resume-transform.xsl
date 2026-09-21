<?xml version="1.0" encoding="UTF-8"?>
<!--
  Rich XSLT theme: two-column layout matching the HTML site.

  Language-aware: reads /resume/meta/lang to localize UI strings.
  Browser-side features: dark/light toggle (localStorage), language
  switcher, PDF download button — all generated inline.

  Default XML: /assets/data/resume.xml (English, rich). Per-language
  variants live at /assets/data/resume-<lang>.xml.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:key name="project-by-name" match="/resume/projects/project[name]" use="name"/>
  <xsl:key name="skill-by-name"   match="/resume/skills/skill"           use="name"/>

  <!-- Current language pulled from the XML payload (default 'en'). -->
  <xsl:variable name="lang">
    <xsl:choose>
      <xsl:when test="/resume/meta/lang"><xsl:value-of select="/resume/meta/lang"/></xsl:when>
      <xsl:otherwise>en</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <!-- i18n: pass a key, get the translated label. EN is the fallback. -->
  <xsl:template name="t">
    <xsl:param name="k"/>
    <xsl:choose>
      <xsl:when test="$lang = 'fr'">
        <xsl:choose>
          <xsl:when test="$k='about'">À propos</xsl:when>
          <xsl:when test="$k='experience'">Expérience professionnelle</xsl:when>
          <xsl:when test="$k='education'">Éducation</xsl:when>
          <xsl:when test="$k='references'">Références</xsl:when>
          <xsl:when test="$k='projects'">Projets</xsl:when>
          <xsl:when test="$k='technicalSkills'">Compétences techniques</xsl:when>
          <xsl:when test="$k='softSkills'">Compétences personnelles</xsl:when>
          <xsl:when test="$k='languages'">Langues</xsl:when>
          <xsl:when test="$k='typicalDay'">Une journée type</xsl:when>
          <xsl:when test="$k='present'">aujourd'hui</xsl:when>
          <xsl:when test="$k='inProgress'">en cours</xsl:when>
          <xsl:when test="$k='downloadCV'">Télécharger le CV</xsl:when>
          <xsl:when test="$k='printPdf'">Imprimer / PDF</xsl:when>
          <xsl:when test="$k='dark'">Mode sombre</xsl:when>
          <xsl:when test="$k='light'">Mode clair</xsl:when>
          <xsl:when test="$k='theme'">Thème</xsl:when>
          <xsl:when test="$k='minimal'">minimal</xsl:when>
          <xsl:when test="$k='rich'">riche</xsl:when>
          <xsl:when test="$k='renderedNote'">Rendu depuis</xsl:when>
          <xsl:when test="$k='htmlSite'">Site</xsl:when>
          <xsl:when test="$k='volunteer'">Bénévolat</xsl:when>
          <xsl:when test="$k='awards'">Distinctions</xsl:when>
          <xsl:when test="$k='interests'">Intérêts</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$lang = 'nl'">
        <xsl:choose>
          <xsl:when test="$k='about'">Over mij</xsl:when>
          <xsl:when test="$k='experience'">Werkervaring</xsl:when>
          <xsl:when test="$k='education'">Opleiding</xsl:when>
          <xsl:when test="$k='references'">Referenties</xsl:when>
          <xsl:when test="$k='projects'">Projecten</xsl:when>
          <xsl:when test="$k='technicalSkills'">Technische vaardigheden</xsl:when>
          <xsl:when test="$k='softSkills'">Persoonlijke vaardigheden</xsl:when>
          <xsl:when test="$k='languages'">Talen</xsl:when>
          <xsl:when test="$k='typicalDay'">Een typische dag</xsl:when>
          <xsl:when test="$k='present'">heden</xsl:when>
          <xsl:when test="$k='inProgress'">in uitvoering</xsl:when>
          <xsl:when test="$k='downloadCV'">CV downloaden</xsl:when>
          <xsl:when test="$k='printPdf'">Afdrukken / PDF</xsl:when>
          <xsl:when test="$k='dark'">Donkere modus</xsl:when>
          <xsl:when test="$k='light'">Lichte modus</xsl:when>
          <xsl:when test="$k='theme'">Thema</xsl:when>
          <xsl:when test="$k='minimal'">minimaal</xsl:when>
          <xsl:when test="$k='rich'">rijk</xsl:when>
          <xsl:when test="$k='renderedNote'">Gegenereerd uit</xsl:when>
          <xsl:when test="$k='htmlSite'">Site</xsl:when>
          <xsl:when test="$k='volunteer'">Vrijwilligerswerk</xsl:when>
          <xsl:when test="$k='awards'">Onderscheidingen</xsl:when>
          <xsl:when test="$k='interests'">Interesses</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$lang = 'es'">
        <xsl:choose>
          <xsl:when test="$k='about'">Sobre mí</xsl:when>
          <xsl:when test="$k='experience'">Experiencia laboral</xsl:when>
          <xsl:when test="$k='education'">Educación</xsl:when>
          <xsl:when test="$k='references'">Referencias</xsl:when>
          <xsl:when test="$k='projects'">Proyectos</xsl:when>
          <xsl:when test="$k='technicalSkills'">Habilidades técnicas</xsl:when>
          <xsl:when test="$k='softSkills'">Habilidades personales</xsl:when>
          <xsl:when test="$k='languages'">Idiomas</xsl:when>
          <xsl:when test="$k='typicalDay'">Un día típico</xsl:when>
          <xsl:when test="$k='present'">actualidad</xsl:when>
          <xsl:when test="$k='inProgress'">en curso</xsl:when>
          <xsl:when test="$k='downloadCV'">Descargar CV</xsl:when>
          <xsl:when test="$k='printPdf'">Imprimir / PDF</xsl:when>
          <xsl:when test="$k='dark'">Modo oscuro</xsl:when>
          <xsl:when test="$k='light'">Modo claro</xsl:when>
          <xsl:when test="$k='theme'">Tema</xsl:when>
          <xsl:when test="$k='minimal'">mínimo</xsl:when>
          <xsl:when test="$k='rich'">enriquecido</xsl:when>
          <xsl:when test="$k='renderedNote'">Generado desde</xsl:when>
          <xsl:when test="$k='htmlSite'">Sitio</xsl:when>
          <xsl:when test="$k='volunteer'">Voluntariado</xsl:when>
          <xsl:when test="$k='awards'">Premios</xsl:when>
          <xsl:when test="$k='interests'">Intereses</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$lang = 'de'">
        <xsl:choose>
          <xsl:when test="$k='about'">Über mich</xsl:when>
          <xsl:when test="$k='experience'">Berufserfahrung</xsl:when>
          <xsl:when test="$k='education'">Ausbildung</xsl:when>
          <xsl:when test="$k='references'">Referenzen</xsl:when>
          <xsl:when test="$k='projects'">Projekte</xsl:when>
          <xsl:when test="$k='technicalSkills'">Technische Fähigkeiten</xsl:when>
          <xsl:when test="$k='softSkills'">Soziale Kompetenzen</xsl:when>
          <xsl:when test="$k='languages'">Sprachen</xsl:when>
          <xsl:when test="$k='typicalDay'">Ein typischer Tag</xsl:when>
          <xsl:when test="$k='present'">heute</xsl:when>
          <xsl:when test="$k='inProgress'">läuft</xsl:when>
          <xsl:when test="$k='downloadCV'">Lebenslauf herunterladen</xsl:when>
          <xsl:when test="$k='printPdf'">Drucken / PDF</xsl:when>
          <xsl:when test="$k='dark'">Dunkler Modus</xsl:when>
          <xsl:when test="$k='light'">Heller Modus</xsl:when>
          <xsl:when test="$k='theme'">Thema</xsl:when>
          <xsl:when test="$k='minimal'">minimal</xsl:when>
          <xsl:when test="$k='rich'">reich</xsl:when>
          <xsl:when test="$k='renderedNote'">Generiert aus</xsl:when>
          <xsl:when test="$k='htmlSite'">Website</xsl:when>
          <xsl:when test="$k='volunteer'">Ehrenamt</xsl:when>
          <xsl:when test="$k='awards'">Auszeichnungen</xsl:when>
          <xsl:when test="$k='interests'">Interessen</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$lang = 'zh'">
        <xsl:choose>
          <xsl:when test="$k='about'">关于我</xsl:when>
          <xsl:when test="$k='experience'">工作经验</xsl:when>
          <xsl:when test="$k='education'">教育</xsl:when>
          <xsl:when test="$k='references'">推荐人</xsl:when>
          <xsl:when test="$k='projects'">项目</xsl:when>
          <xsl:when test="$k='technicalSkills'">技术技能</xsl:when>
          <xsl:when test="$k='softSkills'">软技能</xsl:when>
          <xsl:when test="$k='languages'">语言</xsl:when>
          <xsl:when test="$k='typicalDay'">我的一天</xsl:when>
          <xsl:when test="$k='present'">至今</xsl:when>
          <xsl:when test="$k='inProgress'">进行中</xsl:when>
          <xsl:when test="$k='downloadCV'">下载简历</xsl:when>
          <xsl:when test="$k='printPdf'">打印 / PDF</xsl:when>
          <xsl:when test="$k='dark'">深色模式</xsl:when>
          <xsl:when test="$k='light'">浅色模式</xsl:when>
          <xsl:when test="$k='theme'">主题</xsl:when>
          <xsl:when test="$k='minimal'">简约</xsl:when>
          <xsl:when test="$k='rich'">丰富</xsl:when>
          <xsl:when test="$k='renderedNote'">来源</xsl:when>
          <xsl:when test="$k='htmlSite'">网站</xsl:when>
          <xsl:when test="$k='volunteer'">志愿服务</xsl:when>
          <xsl:when test="$k='awards'">奖项</xsl:when>
          <xsl:when test="$k='interests'">兴趣</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <xsl:choose>
          <xsl:when test="$k='about'">About Me</xsl:when>
          <xsl:when test="$k='experience'">Work Experience</xsl:when>
          <xsl:when test="$k='education'">Education</xsl:when>
          <xsl:when test="$k='references'">References</xsl:when>
          <xsl:when test="$k='projects'">Projects</xsl:when>
          <xsl:when test="$k='technicalSkills'">Technical Skills</xsl:when>
          <xsl:when test="$k='softSkills'">Soft Skills</xsl:when>
          <xsl:when test="$k='languages'">Languages</xsl:when>
          <xsl:when test="$k='typicalDay'">A Day of My Life</xsl:when>
          <xsl:when test="$k='present'">Present</xsl:when>
          <xsl:when test="$k='inProgress'">in progress</xsl:when>
          <xsl:when test="$k='downloadCV'">Download CV</xsl:when>
          <xsl:when test="$k='printPdf'">Print / PDF</xsl:when>
          <xsl:when test="$k='dark'">Dark mode</xsl:when>
          <xsl:when test="$k='light'">Light mode</xsl:when>
          <xsl:when test="$k='theme'">Theme</xsl:when>
          <xsl:when test="$k='minimal'">minimal</xsl:when>
          <xsl:when test="$k='rich'">rich</xsl:when>
          <xsl:when test="$k='renderedNote'">Rendered from</xsl:when>
          <xsl:when test="$k='htmlSite'">Site</xsl:when>
          <xsl:when test="$k='volunteer'">Volunteer</xsl:when>
          <xsl:when test="$k='awards'">Awards</xsl:when>
          <xsl:when test="$k='interests'">Interests</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/resume">
    <html>
      <xsl:attribute name="lang"><xsl:value-of select="$lang"/></xsl:attribute>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="basics/name"/></title>
        <style>
          :root {
            --primary:    <xsl:value-of select="meta/brand/xsltPrimary"/>;
            --accent:     <xsl:value-of select="meta/brand/accent"/>;
            --body:       <xsl:value-of select="meta/brand/xsltBody"/>;
            --muted:      <xsl:value-of select="meta/brand/xsltMuted"/>;
            --bg-page:    <xsl:value-of select="meta/brand/xsltBg"/>;
            --bg-sidebar: <xsl:value-of select="meta/brand/xsltRuleLight"/>;
            --bg-block:   rgba(243, 137, 11, 0.05);
            --rule:       <xsl:value-of select="meta/brand/xsltRuleRich"/>;
          }
          html[data-theme="dark"] {
            --primary:    <xsl:value-of select="meta/brand/xsltPrimaryDark"/>;
            --accent:     <xsl:value-of select="meta/brand/accent"/>;
            --body:       <xsl:value-of select="meta/brand/xsltBodyDark"/>;
            --muted:      <xsl:value-of select="meta/brand/xsltMutedDark"/>;
            --bg-page:    <xsl:value-of select="meta/brand/xsltBgDark"/>;
            --bg-sidebar: <xsl:value-of select="meta/brand/xsltSidebarDark"/>;
            --bg-block:   rgba(255, 177, 66, 0.10);
            --rule:       <xsl:value-of select="meta/brand/xsltRuleDark"/>;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: <xsl:value-of select="meta/brand/fontXslt"/>;
            color: var(--body);
            background: var(--bg-page);
            line-height: 1.45;
          }
          .toolbar {
            background: var(--bg-sidebar);
            padding: 8px 18px;
            font-size: 0.85em;
            color: var(--muted);
            border-bottom: 1px solid var(--rule);
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px;
            justify-content: center;
          }
          .toolbar .group { display: flex; gap: 6px; align-items: center; }
          .toolbar a, .toolbar button {
            color: var(--body);
            background: transparent;
            border: 1px solid var(--rule);
            border-radius: 4px;
            padding: 3px 8px;
            text-decoration: none;
            font-size: 0.9em;
            cursor: pointer;
            font-family: inherit;
          }
          .toolbar a:hover, .toolbar button:hover {
            background: var(--accent);
            color: #fff;
            border-color: var(--accent);
          }
          .toolbar a.active {
            background: var(--primary);
            color: #fff;
            border-color: var(--primary);
            font-weight: 600;
          }
          .toolbar .download {
            background: var(--accent);
            color: #fff;
            border-color: var(--accent);
            font-weight: 600;
          }
          .toolbar .download:hover { background: var(--primary); border-color: var(--primary); }

          .container {
            display: flex;
            flex-direction: row;
            max-width: 1180px;
            margin: 0 auto;
            padding: 20px;
            gap: 20px;
          }
          .sidebar {
            width: 28%;
            background: var(--bg-sidebar);
            padding: 24px 20px;
            border-radius: 8px;
          }
          .main { width: 72%; padding: 20px; }
          #profile-picture {
            width: 100%;
            border-radius: 50%;
            margin-bottom: 16px;
            display: block;
          }
          h1 { margin: 0 0 4px; color: var(--primary); font-size: 1.85em; }
          .sidebar h1 { font-size: 1.55em; }
          .sidebar h2 {
            color: var(--accent);
            font-size: 1em;
            margin: 24px 0 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 2px solid var(--accent);
            padding-bottom: 4px;
          }
          .sidebar .label { font-style: italic; color: var(--muted); margin-bottom: 14px; font-size: 0.95em; }
          .sidebar p { margin: 4px 0; font-size: 0.88em; }
          .sidebar a { color: var(--accent); text-decoration: none; word-break: break-all; }
          .sidebar a:hover { text-decoration: underline; }
          .icon { display: inline-block; width: 1.1em; color: var(--accent); margin-right: 4px; }
          .skill-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
          .skill-tag {
            display: inline-block;
            background: var(--accent);
            color: #fff;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 0.78em;
          }
          .lang-item { margin: 6px 0; font-size: 0.88em; }
          .lang-item strong { color: var(--primary); }
          .day-list { font-size: 0.85em; color: var(--muted); margin: 0; padding: 0; }
          .day-list li { list-style: none; padding-left: 0; }
          .day-list .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }

          .main h2 {
            border-bottom: 2px solid var(--primary);
            padding-bottom: 4px;
            color: var(--primary);
            margin-top: 28px;
            margin-bottom: 14px;
          }
          .main h2::after { content: ''; display: block; width: 50px; height: 3px; background: var(--accent); margin-top: 4px; }
          .item { margin-bottom: 18px; }
          .item h3 { font-size: 1.05em; margin: 0 0 2px; color: var(--primary); }
          .item h3 a { color: var(--accent); text-decoration: none; }
          .item h3 a:hover { text-decoration: underline; }
          .item .date { color: var(--muted); font-size: 0.85em; font-style: italic; margin: 0 0 4px; }
          .item .location { color: var(--muted); font-size: 0.85em; margin: 0 0 6px; }
          .item p { margin: 6px 0; font-size: 0.92em; }
          .inline-skills { margin: 6px 0; }
          .inline-skills .skill-tag { font-size: 0.7em; padding: 1px 7px; }
          .embedded-projects { margin: 6px 0 0; font-size: 0.92em; }
          .embedded-projects .label { font-weight: 600; color: var(--primary); margin: 0; }
          .embedded-projects ul { margin: 4px 0 0 4px; padding-left: 16px; }
          .embedded-projects li { margin: 2px 0; }
          /* Print-only copies of text the LaTeX fit plan clips. */
          .clipped-text { display: none; }
          .ref-links { margin: 6px 0 0; font-size: 0.92em; color: var(--muted); }
          .ref-links a { color: var(--accent); text-decoration: none; }
          .ref-links a:hover { text-decoration: underline; }

          blockquote {
            margin: 8px 0;
            padding: 8px 14px;
            border-left: 3px solid var(--accent);
            color: var(--body);
            font-style: italic;
            font-size: 0.9em;
            background: var(--bg-block);
          }
          .ref-author { font-weight: 600; color: var(--primary); margin: 14px 0 4px; }
          .footer-note { margin-top: 30px; padding: 12px 0; border-top: 1px solid var(--rule); font-size: 0.78em; color: var(--muted); text-align: center; }
          .footer-note a { color: var(--accent); text-decoration: none; }

          @media (max-width: 820px) {
            .container {
              flex-direction: column;
              padding: 14px;
              gap: 14px;
            }
            .sidebar, .main { width: 100%; padding: 18px; }
            #profile-picture { max-width: 220px; margin: 0 auto 16px; }
            .toolbar { padding: 8px 12px; font-size: 0.8em; gap: 8px; }
            .toolbar a, .toolbar button { padding: 3px 7px; font-size: 0.85em; }
            .sidebar h1 { text-align: center; }
            .sidebar .label { text-align: center; }
          }
          @media (max-width: 480px) {
            body { font-size: 15px; }
            .container { padding: 8px; gap: 10px; }
            .sidebar, .main { padding: 14px; }
            .toolbar {
              padding: 6px 8px;
              gap: 6px;
              font-size: 0.75em;
              justify-content: center;
              flex-wrap: wrap;
            }
            .toolbar .group { gap: 4px; }
            .toolbar a, .toolbar button {
              padding: 3px 6px;
              font-size: 0.85em;
              white-space: nowrap;
            }
            h1 { font-size: 1.5em; }
            .sidebar h1 { font-size: 1.3em; }
            .main h2 { font-size: 1.15em; margin-top: 22px; }
            .item h3 { font-size: 1em; }
            .item p { font-size: 0.9em; }
            #profile-picture { max-width: 160px; }
            blockquote { font-size: 0.88em; padding: 6px 12px; }
          }
          @page { size: A4; margin: 0.8cm 0.9cm; } /* \geometry of the LaTeX CV */
          @media print {
            .toolbar { display: none; }
            /* Force the light palette so a dark-mode reader still prints a
               clean, ink-light sheet. Mirrors the :root light values. */
            html[data-theme="dark"] {
              --primary:    <xsl:value-of select="meta/brand/xsltPrimary"/>;
              --accent:     <xsl:value-of select="meta/brand/accent"/>;
              --body:       <xsl:value-of select="meta/brand/xsltBody"/>;
              --muted:      <xsl:value-of select="meta/brand/xsltMuted"/>;
              --bg-page:    <xsl:value-of select="meta/brand/xsltBg"/>;
              --bg-sidebar: <xsl:value-of select="meta/brand/xsltRuleLight"/>;
              --bg-block:   rgba(243, 137, 11, 0.05);
              --rule:       <xsl:value-of select="meta/brand/xsltRuleRich"/>;
            }
            html, body { background: #fff; }
            /* Keep the sidebar tint and accent rules instead of white boxes. */
            body {
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
              /* The CV is a two-page document. A browser lays text out less
                 densely than TeX, and neither engine will split the two-column
                 block across sheets, so the recto has to fit one page on its
                 own. scripts/lib/print-fit-xslt.test.js holds it to that. */
              font-size: 6.5pt; line-height: 1.2; margin: 0; padding: 0;
            }
            .container {
              /* A printed page is about 726px wide, which trips this sheet's
                 own max-width: 820px breakpoint — so without this the CV prints
                 in the MOBILE layout: one stacked column, twice as tall, and
                 deaf to any type size. Put the two columns back. */
              flex-direction: row;
              max-width: none; margin: 0; padding: 0; gap: 0.6cm;
              align-items: flex-start;
            }
            .sidebar { border-radius: 0; width: 30%; padding: 0.2cm; }
            .main { width: 70%; padding: 0; }
            /* What the LaTeX fit plan leaves out: the roles past the eighth
               and the education entries below the top two. */
            .print-hidden { display: none; }
            /* Sections the PDF does not carry: the sidebar's Projects list —
               its projects appear under the roles that reference them — plus
               awards and interests. */
            .print-drop { display: none; }
            /* education_in_body: false — the PDF prints no Education entries,
               only the two-line degrees summary the identity block carries.
               Keeping the entries cost eighteen lines of the narrow column and
               repeated the degree that was already three lines above. */
            /* The PDF prints no Education entries, only the degrees summary.
               Keeping the entries whole cost eighteen lines of a five-centimetre
               column; keeping their heading and institution line costs four and
               fills a column that was otherwise ending halfway down the sheet. */
            .edu-block .item > *:not(h3):not(.date) { display: none; }
            .edu-block .item { margin-bottom: 3pt; }
            .edu-block .item h3 { font-size: 1em; }
            .edu-block .degree { margin: 0 0 2pt; }
            /* The recto of the PDF carries no per-entry reference back-links;
               the references live on the verso. */
            .ref-links { display: none; }
            /* Swap the full wording for the clipped one the PDF prints. The
               clipped copy comes first, so the full text can be hidden as the
               element that follows it; where nothing was clipped there is no
               first copy and the full text simply stands. */
            .clipped-text { display: block; }
            span.clipped-text { display: inline; }
            .clipped-text + .full-text { display: none; }
            /* The references get the verso, as they do in the PDF. */
            .refs { break-before: page; }
            h2 { font-size: 9pt; margin: 6pt 0 3pt; break-after: avoid; }
            h3 { font-size: 7.5pt; margin: 0; }
            p, ul, ol { margin: 0 0 2pt; }
            .item { margin-bottom: 4pt; break-inside: avoid; }
            .date, .location, .label { margin: 0; }
            blockquote { margin: 1pt 0 3pt; padding: 0 0 0 4pt; font-size: 0.95em; }
            /* The left column has to end on the first sheet — what spills from
               it lands beside the references, and the PDF gives the verso to
               the references alone. It was squeezed far harder than that needs
               while the Education entries were still in it; with those gone
               the room is there, so the type goes back to a readable size. */
            /* Only the left column is sized up: the main one already runs the
               full page and a larger body size there would cost a sheet.
               Carrying the PDF's sidebar content and nothing more, this column
               does not fill an A4 page at any honest size — so the room left
               over goes to legibility rather than to filler. */
            .sidebar { font-size: 1.1em; }
            .skill-tags { gap: 2pt; }
            .skill-tag { font-size: 0.92em; padding: 1pt 2.5pt; }
            .lang-item { margin: 0 0 1.5pt; }
            .sidebar h2 { font-size: 9.5pt; margin: 8pt 0 4pt; }
            .day-list li { margin: 1pt 0; }
            .day-list .dot { width: 6px; height: 6px; margin-right: 5px; }
            #profile-picture { max-width: 3cm; }
            .item, blockquote, .sidebar h2, .sidebar p { break-inside: avoid; }
            .main h2 { break-after: avoid; }
            a { color: var(--body); text-decoration: none; }
          }
        </style>
        <!-- Print layout: the LaTeX CV carries the degrees in the narrow left
             column, not the main one. Moving the block there for the print also
             uses the slack the sidebar leaves, which is what keeps the recto on
             a single sheet. Restored afterwards, so the screen is untouched. -->
        <script>
          (function () {
            var edu, parent, next, degrees, degreeHomes;
            function prepare() {
              if (parent) return;
              edu = document.querySelector('.edu-block');
              var side = document.querySelector('.sidebar');
              if (!edu || !side) return;
              parent = edu.parentNode;
              next = edu.nextSibling;
              side.insertBefore(edu, side.querySelector('h2'));
              // The identity block already carries the degrees summary — the
              // same two lines the PDF prints. File them under the heading and
              // the section is complete without its detailed entries.
              degrees = [].slice.call(document.querySelectorAll('.degree'));
              degreeHomes = degrees.map(function (d) {
                return { node: d, parent: d.parentNode, next: d.nextSibling };
              });
              degrees.forEach(function (d) { edu.appendChild(d); });
            }
            function restore() {
              if (!parent) return;
              (degreeHomes || []).forEach(function (h) {
                h.parent.insertBefore(h.node, h.next);
              });
              degreeHomes = null;
              parent.insertBefore(edu, next);
              parent = null;
            }
            window.addEventListener('beforeprint', prepare);
            window.addEventListener('afterprint', restore);
            var mq = window.matchMedia('print');
            if (mq.addEventListener) {
              mq.addEventListener('change', function (e) { e.matches ? prepare() : restore(); });
            }
          })();
        </script>

        <!-- Dark mode bootstrap: applied before <body> renders to avoid flash. -->
        <script>
          (function() {
            try {
              var stored = localStorage.getItem('xslt-theme');
              var prefers = window.matchMedia &amp;&amp; window.matchMedia('(prefers-color-scheme: dark)').matches;
              var theme = stored || (prefers ? 'dark' : 'light');
              document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {}
          })();
        </script>
      </head>
      <body>

        <!-- ============== TOOLBAR ============== -->
        <div class="toolbar">

          <!-- Back to HTML site -->
          <a>
            <xsl:attribute name="href">
              <xsl:choose>
                <xsl:when test="$lang = 'en'">/</xsl:when>
                <xsl:otherwise>/<xsl:value-of select="$lang"/>/</xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
            ↩ <xsl:call-template name="t"><xsl:with-param name="k" select="'htmlSite'"/></xsl:call-template>
          </a>

          <!-- Language switcher -->
          <div class="group">
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'en'"/></xsl:call-template>
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'fr'"/></xsl:call-template>
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'nl'"/></xsl:call-template>
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'es'"/></xsl:call-template>
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'de'"/></xsl:call-template>
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'zh'"/></xsl:call-template>
          </div>

          <!-- Theme toggle: single button pointing to the OTHER theme. -->
          <a>
            <xsl:attribute name="href">/assets/data/resume-<xsl:value-of select="$lang"/>-minimal.xml</xsl:attribute>
            <xsl:attribute name="title">
              <xsl:call-template name="t"><xsl:with-param name="k" select="'minimal'"/></xsl:call-template>
            </xsl:attribute>
            ⇄ <xsl:call-template name="t"><xsl:with-param name="k" select="'minimal'"/></xsl:call-template>
          </a>

          <!-- Dark/light toggle -->
          <button type="button" id="theme-toggle" aria-pressed="false">
            <span id="theme-toggle-label">
              <xsl:call-template name="t"><xsl:with-param name="k" select="'dark'"/></xsl:call-template>
            </span>
          </button>

          <!-- PDF download (pre-built LaTeX CV, high-quality, 2-page fit) -->
          <a class="download">
            <xsl:attribute name="href">/assets/cv/cv_grosjean_baptiste_<xsl:value-of select="$lang"/>.pdf</xsl:attribute>
            <xsl:attribute name="download">cv_grosjean_baptiste_<xsl:value-of select="$lang"/>.pdf</xsl:attribute>
            ⬇ <xsl:call-template name="t"><xsl:with-param name="k" select="'downloadCV'"/></xsl:call-template>
          </a>

          <!-- Live PDF: print this XSLT-rendered view straight from the
               browser (Cmd/Ctrl+P → Save as PDF). Always in sync with the XML,
               no build step. Complements — does not replace — the LaTeX PDF. -->
          <button type="button" class="print" onclick="window.print()">
            🖨 <xsl:call-template name="t"><xsl:with-param name="k" select="'printPdf'"/></xsl:call-template>
          </button>

        </div>

        <div class="container">

          <!-- ============== SIDEBAR ============== -->
          <aside class="sidebar">

            <img src="/assets/images/profil.jpeg" id="profile-picture">
              <xsl:attribute name="alt"><xsl:value-of select="basics/name"/></xsl:attribute>
            </img>

            <h1><xsl:value-of select="basics/name"/></h1>
            <div class="label"><xsl:value-of select="basics/label"/></div>

            <xsl:if test="meta/degrees/inProgress">
              <p class="degree degree-in-progress"><span class="icon">📖</span>
                <xsl:value-of select="meta/degrees/inProgress"/>
                <xsl:text> </xsl:text>
                <span class="degree-status">(<xsl:call-template name="t"><xsl:with-param name="k" select="'inProgress'"/></xsl:call-template>)</span>
              </p>
            </xsl:if>
            <xsl:if test="meta/degrees/obtained">
              <p class="degree degree-obtained"><span class="icon">🎓</span>
                <xsl:value-of select="meta/degrees/obtained"/>
              </p>
            </xsl:if>

            <xsl:if test="basics/email">
              <p><span class="icon">✉</span>
                <a><xsl:attribute name="href">mailto:<xsl:value-of select="basics/email"/></xsl:attribute>
                  <xsl:value-of select="basics/email"/>
                </a>
              </p>
            </xsl:if>
            <xsl:if test="basics/phone">
              <p><span class="icon">☎</span><xsl:value-of select="basics/phone"/></p>
            </xsl:if>
            <xsl:if test="basics/location/city">
              <p><span class="icon">⌖</span>
                <xsl:value-of select="basics/location/city"/>
                <xsl:if test="basics/location/countryCode">, <xsl:value-of select="basics/location/countryCode"/></xsl:if>
              </p>
            </xsl:if>
            <xsl:for-each select="basics/profiles/profile">
              <p><span class="icon">↗</span>
                <a><xsl:attribute name="href"><xsl:value-of select="url"/></xsl:attribute>
                  <xsl:value-of select="network"/>: <xsl:value-of select="username"/>
                </a>
              </p>
            </xsl:for-each>

            <xsl:for-each select="meta/sidebarOrder/section">
              <xsl:variable name="name" select="."/>
              <xsl:choose>
                <xsl:when test="$name='skills'"><xsl:call-template name="sidebar-skills"/></xsl:when>
                <xsl:when test="$name='languages'"><xsl:call-template name="sidebar-languages"/></xsl:when>
                <xsl:when test="$name='projects'"><xsl:call-template name="sidebar-projects"/></xsl:when>
                <xsl:when test="$name='dailyLife'"><xsl:call-template name="sidebar-dailyLife"/></xsl:when>
              </xsl:choose>
            </xsl:for-each>

          </aside>

          <!-- ============== MAIN ============== -->
          <main class="main">

            <xsl:for-each select="meta/sectionOrder/section">
              <xsl:variable name="name" select="."/>
              <xsl:choose>
                <xsl:when test="$name='about'"><xsl:call-template name="main-about"/></xsl:when>
                <xsl:when test="$name='work'"><xsl:call-template name="main-work"/></xsl:when>
                <xsl:when test="$name='education'"><xsl:call-template name="main-education"/></xsl:when>
                <xsl:when test="$name='awards'"><xsl:call-template name="main-awards"/></xsl:when>
                <xsl:when test="$name='interests'"><xsl:call-template name="main-interests"/></xsl:when>
                <xsl:when test="$name='references'"><xsl:call-template name="main-references"/></xsl:when>
              </xsl:choose>
            </xsl:for-each>

            <div class="footer-note">
              <xsl:call-template name="t"><xsl:with-param name="k" select="'renderedNote'"/></xsl:call-template>
              <xsl:text> </xsl:text>
              <a><xsl:attribute name="href">/assets/data/resume-<xsl:value-of select="$lang"/>.xml</xsl:attribute>resume-<xsl:value-of select="$lang"/>.xml</a>
              ·
              <a href="/assets/data/resume.json">resume.json</a>
              ·
              <a href="https://registry.jsonresume.org/grosjeanbaptiste" target="_blank" rel="external noopener">
                <xsl:call-template name="t"><xsl:with-param name="k" select="'registry'"/></xsl:call-template>
              </a>
              · canonical JSON Resume v1.0.0.
            </div>

          </main>

        </div>

        <!-- Dark mode toggle JS -->
        <script>
          (function() {
            var btn = document.getElementById('theme-toggle');
            var label = document.getElementById('theme-toggle-label');
            var labels = { dark: '<xsl:call-template name="t"><xsl:with-param name="k" select="'dark'"/></xsl:call-template>',
                           light: '<xsl:call-template name="t"><xsl:with-param name="k" select="'light'"/></xsl:call-template>' };
            function syncLabel() {
              var t = document.documentElement.getAttribute('data-theme') || 'light';
              label.textContent = (t === 'dark') ? labels.light : labels.dark;
              btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
            }
            syncLabel();
            btn.addEventListener('click', function() {
              var current = document.documentElement.getAttribute('data-theme') || 'light';
              var next = current === 'dark' ? 'light' : 'dark';
              document.documentElement.setAttribute('data-theme', next);
              try { localStorage.setItem('xslt-theme', next); } catch (e) {}
              syncLabel();
            });
          })();
        </script>

      </body>
    </html>
  </xsl:template>

  <!-- ============== SIDEBAR TEMPLATES ============== -->

  <xsl:template name="sidebar-skills">
    <xsl:variable name="hard" select="key('skill-by-name', 'HardSkills')"/>
    <xsl:if test="$hard/keywords/keyword">
      <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'technicalSkills'"/></xsl:call-template></h2>
      <div class="skill-tags">
        <xsl:for-each select="$hard/keywords/keyword">
          <span class="skill-tag"><xsl:value-of select="."/></span>
        </xsl:for-each>
      </div>
    </xsl:if>
    <xsl:variable name="soft" select="key('skill-by-name', 'SoftSkills')"/>
    <xsl:if test="$soft/keywords/keyword">
      <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'softSkills'"/></xsl:call-template></h2>
      <div class="skill-tags">
        <xsl:for-each select="$soft/keywords/keyword">
          <span class="skill-tag"><xsl:value-of select="."/></span>
        </xsl:for-each>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template name="sidebar-languages">
    <xsl:if test="/resume/languages/language-item">
      <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'languages'"/></xsl:call-template></h2>
      <xsl:for-each select="/resume/languages/language-item">
        <div class="lang-item">
          <strong><xsl:value-of select="language"/></strong><br/>
          <xsl:value-of select="fluency"/>
        </div>
      </xsl:for-each>
    </xsl:if>
  </xsl:template>

  <xsl:template name="sidebar-projects">
    <xsl:if test="/resume/projects/project">
      <!-- Not in the LaTeX sidebar: its projects appear under the roles that
           reference them. Wrapped so the print sheet can leave it out. -->
      <div class="print-drop">
      <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'projects'"/></xsl:call-template></h2>
      <xsl:for-each select="/resume/projects/project">
        <div class="lang-item">
          <xsl:choose>
            <xsl:when test="url">
              <a target="_blank" rel="noopener">
                <xsl:attribute name="href"><xsl:value-of select="url"/></xsl:attribute>
                <strong><xsl:value-of select="name"/></strong>
              </a>
            </xsl:when>
            <xsl:otherwise><strong><xsl:value-of select="name"/></strong></xsl:otherwise>
          </xsl:choose>
          <xsl:if test="description"><br/><xsl:value-of select="description"/></xsl:if>
        </div>
      </xsl:for-each>
    </div>
    </xsl:if>
  </xsl:template>

  <xsl:template name="sidebar-dailyLife">
    <xsl:if test="/resume/meta/dailyLife/items/item">
      <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'typicalDay'"/></xsl:call-template></h2>
      <ul class="day-list">
        <xsl:for-each select="/resume/meta/dailyLife/items/item">
          <li>
            <span class="dot">
              <xsl:attribute name="style">background:<xsl:value-of select="color"/>;</xsl:attribute>
            </span>
            <xsl:text> </xsl:text>
            <xsl:value-of select="key"/> — <xsl:value-of select="hours"/>h
          </li>
        </xsl:for-each>
      </ul>
    </xsl:if>
  </xsl:template>

  <!-- ============== MAIN TEMPLATES ============== -->

  <xsl:template name="main-about">
    <xsl:if test="/resume/basics/summary">
      <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'about'"/></xsl:call-template></h2>
      <p><xsl:value-of select="/resume/basics/summary"/></p>
    </xsl:if>
  </xsl:template>

  <xsl:template name="main-work">
    <xsl:if test="/resume/work/job">
              <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'experience'"/></xsl:call-template></h2>
              <xsl:for-each select="/resume/work/job">
                <div>
                  <!-- The LaTeX CV prints the 8 most recent roles. The rest are
                       marked rather than dropped: the screen keeps the whole
                       history, only the sheet is trimmed. -->
                  <xsl:attribute name="class">item<xsl:if test="position() &gt; 8"> print-hidden</xsl:if></xsl:attribute>
                  <h3>
                    <xsl:value-of select="position"/>
                    <xsl:if test="client"> · <xsl:value-of select="client"/></xsl:if>
                    <xsl:if test="company">
                      <xsl:text> | </xsl:text>
                      <xsl:choose>
                        <xsl:when test="url">
                          <a target="_blank" rel="noopener">
                            <xsl:attribute name="href"><xsl:value-of select="url"/></xsl:attribute>
                            <xsl:value-of select="company"/>
                          </a>
                        </xsl:when>
                        <xsl:otherwise><xsl:value-of select="company"/></xsl:otherwise>
                      </xsl:choose>
                    </xsl:if>
                  </h3>
                  <p class="date">
                    <xsl:value-of select="startDate"/>
                    <xsl:text> – </xsl:text>
                    <xsl:choose>
                      <xsl:when test="endDate"><xsl:value-of select="endDate"/></xsl:when>
                      <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k" select="'present'"/></xsl:call-template></xsl:otherwise>
                    </xsl:choose>
                  </p>
                  <xsl:if test="location"><p class="location">📍 <xsl:value-of select="location"/></p></xsl:if>
                  <xsl:if test="summary">
                    <xsl:if test="string-length(summary) &gt; 220">
                      <p class="clipped-text"><xsl:value-of select="substring(summary, 1, 219)"/>…</p>
                    </xsl:if>
                    <p class="full-text"><xsl:value-of select="summary"/></p>
                  </xsl:if>
                  <xsl:if test="highlights/highlight">
                    <ul>
                      <xsl:for-each select="highlights/highlight"><li><xsl:value-of select="."/></li></xsl:for-each>
                    </ul>
                  </xsl:if>

                  <xsl:if test="skills/skill">
                    <div class="inline-skills skill-tags">
                      <xsl:for-each select="skills/skill"><span class="skill-tag"><xsl:value-of select="."/></span></xsl:for-each>
                    </div>
                  </xsl:if>

                  <xsl:if test="projects/project">
                    <div class="embedded-projects">
                      <p class="label"><xsl:call-template name="t"><xsl:with-param name="k" select="'projects'"/></xsl:call-template></p>
                      <ul>
                        <xsl:for-each select="projects/project">
                          <xsl:variable name="ref" select="."/>
                          <xsl:variable name="proj" select="key('project-by-name', $ref)"/>
                          <li>
                            <strong><xsl:value-of select="$ref"/></strong>
                            <xsl:choose>
                              <xsl:when test="$proj/summary"> — <xsl:if test="string-length($proj/summary) &gt; 80"><span class="clipped-text"><xsl:value-of select="substring($proj/summary, 1, 79)"/>…</span></xsl:if><span class="full-text"><xsl:value-of select="$proj/summary"/></span></xsl:when>
                              <xsl:when test="$proj/description"> — <xsl:value-of select="$proj/description"/></xsl:when>
                            </xsl:choose>
                          </li>
                        </xsl:for-each>
                      </ul>
                    </div>
                  </xsl:if>

                  <xsl:variable name="workOrg" select="company"/>
                  <xsl:variable name="workVols" select="/resume/volunteer/volunteer-item[$workOrg and contains($workOrg, substring-before(concat(organization, ' '), ' '))]"/>
                  <xsl:if test="$workVols">
                    <div class="embedded-projects">
                      <p class="label"><xsl:call-template name="t"><xsl:with-param name="k" select="'volunteer'"/></xsl:call-template></p>
                      <ul>
                        <xsl:for-each select="$workVols">
                          <li>
                            <strong><xsl:value-of select="position"/></strong>
                            <xsl:text> — </xsl:text>
                            <xsl:value-of select="startDate"/>
                            <xsl:text> – </xsl:text>
                            <xsl:choose>
                              <xsl:when test="endDate"><xsl:value-of select="endDate"/></xsl:when>
                              <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k" select="'present'"/></xsl:call-template></xsl:otherwise>
                            </xsl:choose>
                          </li>
                        </xsl:for-each>
                      </ul>
                    </div>
                  </xsl:if>

                  <xsl:variable name="workRefs" select="/resume/references/reference[$workOrg and contains(name, substring($workOrg, 1, 4))]"/>
                  <xsl:if test="$workRefs">
                    <p class="ref-links">
                      <xsl:call-template name="t"><xsl:with-param name="k" select="'references'"/></xsl:call-template>
                      <xsl:text>: </xsl:text>
                      <xsl:for-each select="$workRefs">
                        <xsl:if test="position() &gt; 1">, </xsl:if>
                        <a>
                          <xsl:attribute name="href">#<xsl:value-of select="generate-id(.)"/></xsl:attribute>
                          <xsl:value-of select="name"/>
                        </a>
                      </xsl:for-each>
                    </p>
                  </xsl:if>
                </div>
              </xsl:for-each>
            </xsl:if>
  </xsl:template>

  <xsl:template name="main-education">
    <xsl:if test="/resume/education/school">
              <div class="edu-block">
              <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'education'"/></xsl:call-template></h2>
              <xsl:for-each select="/resume/education/school">
                <div>
                  <!-- The PDF drops the Education entries and keeps a two-line
                       degrees summary, so the sheet shows the top two only. -->
                  <xsl:attribute name="class">item<xsl:if test="position() &gt; 2"> print-hidden</xsl:if></xsl:attribute>
                  <h3>
                    <xsl:value-of select="studyType"/>
                    <xsl:if test="area"> — <xsl:value-of select="area"/></xsl:if>
                  </h3>
                  <p class="date">
                    <xsl:value-of select="institution"/> ·
                    <xsl:value-of select="startDate"/>
                    <xsl:text> – </xsl:text>
                    <xsl:choose>
                      <xsl:when test="endDate"><xsl:value-of select="endDate"/></xsl:when>
                      <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k" select="'present'"/></xsl:call-template></xsl:otherwise>
                    </xsl:choose>
                  </p>
                  <xsl:if test="gpa"><p class="location"><xsl:value-of select="gpa"/></p></xsl:if>
                  <xsl:if test="summary"><p><xsl:value-of select="summary"/></p></xsl:if>
                  <xsl:if test="skills/skill">
                    <div class="inline-skills skill-tags">
                      <xsl:for-each select="skills/skill"><span class="skill-tag"><xsl:value-of select="."/></span></xsl:for-each>
                    </div>
                  </xsl:if>
                  <xsl:if test="projects/project">
                    <div class="embedded-projects">
                      <p class="label"><xsl:call-template name="t"><xsl:with-param name="k" select="'projects'"/></xsl:call-template></p>
                      <ul>
                        <xsl:for-each select="projects/project">
                          <xsl:variable name="ref" select="."/>
                          <xsl:variable name="proj" select="key('project-by-name', $ref)"/>
                          <li>
                            <strong><xsl:value-of select="$ref"/></strong>
                            <xsl:choose>
                              <xsl:when test="$proj/summary"> — <xsl:value-of select="$proj/summary"/></xsl:when>
                              <xsl:when test="$proj/description"> — <xsl:value-of select="$proj/description"/></xsl:when>
                            </xsl:choose>
                          </li>
                        </xsl:for-each>
                      </ul>
                    </div>
                  </xsl:if>

                  <xsl:variable name="eduInst" select="institution"/>
                  <xsl:variable name="eduVols" select="/resume/volunteer/volunteer-item[$eduInst and contains($eduInst, substring-before(concat(organization, ' '), ' '))]"/>
                  <xsl:if test="$eduVols">
                    <div class="embedded-projects">
                      <p class="label"><xsl:call-template name="t"><xsl:with-param name="k" select="'volunteer'"/></xsl:call-template></p>
                      <ul>
                        <xsl:for-each select="$eduVols">
                          <li>
                            <strong><xsl:value-of select="position"/></strong>
                            <xsl:text> — </xsl:text>
                            <xsl:value-of select="startDate"/>
                            <xsl:text> – </xsl:text>
                            <xsl:choose>
                              <xsl:when test="endDate"><xsl:value-of select="endDate"/></xsl:when>
                              <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k" select="'present'"/></xsl:call-template></xsl:otherwise>
                            </xsl:choose>
                          </li>
                        </xsl:for-each>
                      </ul>
                    </div>
                  </xsl:if>

                  <xsl:variable name="eduRefs" select="/resume/references/reference[$eduInst and contains(name, $eduInst)]"/>
                  <xsl:if test="$eduRefs">
                    <p class="ref-links">
                      <xsl:call-template name="t"><xsl:with-param name="k" select="'references'"/></xsl:call-template>
                      <xsl:text>: </xsl:text>
                      <xsl:for-each select="$eduRefs">
                        <xsl:if test="position() &gt; 1">, </xsl:if>
                        <a>
                          <xsl:attribute name="href">#<xsl:value-of select="generate-id(.)"/></xsl:attribute>
                          <xsl:value-of select="name"/>
                        </a>
                      </xsl:for-each>
                    </p>
                  </xsl:if>
                </div>
              </xsl:for-each>
            </div>
    </xsl:if>
  </xsl:template>

  <xsl:template name="main-awards">
    <xsl:if test="/resume/awards/award">
              <div class="print-drop">
              <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'awards'"/></xsl:call-template></h2>
              <xsl:for-each select="/resume/awards/award">
                <div class="item">
                  <h3><xsl:value-of select="title"/></h3>
                  <p class="date">
                    <xsl:if test="awarder"><xsl:value-of select="awarder"/></xsl:if>
                    <xsl:if test="awarder and date"> · </xsl:if>
                    <xsl:if test="date"><xsl:value-of select="date"/></xsl:if>
                  </p>
                  <xsl:if test="summary"><p><xsl:value-of select="summary"/></p></xsl:if>
                </div>
              </xsl:for-each>
            </div>
    </xsl:if>
  </xsl:template>

  <xsl:template name="main-interests">
    <xsl:if test="/resume/interests/interest">
              <div class="print-drop">
              <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'interests'"/></xsl:call-template></h2>
              <xsl:for-each select="/resume/interests/interest">
                <div class="item">
                  <h3><xsl:value-of select="name"/></h3>
                  <xsl:if test="keywords/keyword">
                    <div class="inline-skills skill-tags">
                      <xsl:for-each select="keywords/keyword"><span class="skill-tag"><xsl:value-of select="."/></span></xsl:for-each>
                    </div>
                  </xsl:if>
                </div>
              </xsl:for-each>
            </div>
    </xsl:if>
  </xsl:template>

  <xsl:template name="main-references">
    <xsl:if test="/resume/references/reference">
              <!-- The LaTeX CV gives the references the verso to themselves. -->
              <div class="refs">
              <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'references'"/></xsl:call-template></h2>
              <xsl:for-each select="/resume/references/reference">
                <div class="item">
                  <xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
                  <div class="ref-author"><xsl:value-of select="name"/></div>
                  <blockquote><xsl:value-of select="reference"/></blockquote>
                </div>
              </xsl:for-each>
            </div>
    </xsl:if>
  </xsl:template>

  <!-- Helper: a single language switcher button. -->
  <xsl:template name="lang-link">
    <xsl:param name="code"/>
    <a>
      <xsl:attribute name="href">/assets/data/resume-<xsl:value-of select="$code"/>.xml</xsl:attribute>
      <xsl:attribute name="hreflang"><xsl:value-of select="$code"/></xsl:attribute>
      <xsl:if test="$code = $lang">
        <xsl:attribute name="class">active</xsl:attribute>
      </xsl:if>
      <xsl:value-of select="translate($code, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
    </a>
  </xsl:template>

</xsl:stylesheet>
