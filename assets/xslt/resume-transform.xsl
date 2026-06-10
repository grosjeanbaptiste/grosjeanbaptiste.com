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
          <xsl:when test="$k='downloadCV'">Télécharger le CV</xsl:when>
          <xsl:when test="$k='dark'">Mode sombre</xsl:when>
          <xsl:when test="$k='light'">Mode clair</xsl:when>
          <xsl:when test="$k='theme'">Thème</xsl:when>
          <xsl:when test="$k='minimal'">minimal</xsl:when>
          <xsl:when test="$k='rich'">riche</xsl:when>
          <xsl:when test="$k='renderedNote'">Rendu depuis</xsl:when>
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
          <xsl:when test="$k='downloadCV'">CV downloaden</xsl:when>
          <xsl:when test="$k='dark'">Donkere modus</xsl:when>
          <xsl:when test="$k='light'">Lichte modus</xsl:when>
          <xsl:when test="$k='theme'">Thema</xsl:when>
          <xsl:when test="$k='minimal'">minimaal</xsl:when>
          <xsl:when test="$k='rich'">rijk</xsl:when>
          <xsl:when test="$k='renderedNote'">Gegenereerd uit</xsl:when>
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
          <xsl:when test="$k='downloadCV'">Descargar CV</xsl:when>
          <xsl:when test="$k='dark'">Modo oscuro</xsl:when>
          <xsl:when test="$k='light'">Modo claro</xsl:when>
          <xsl:when test="$k='theme'">Tema</xsl:when>
          <xsl:when test="$k='minimal'">mínimo</xsl:when>
          <xsl:when test="$k='rich'">enriquecido</xsl:when>
          <xsl:when test="$k='renderedNote'">Generado desde</xsl:when>
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
          <xsl:when test="$k='downloadCV'">Lebenslauf herunterladen</xsl:when>
          <xsl:when test="$k='dark'">Dunkler Modus</xsl:when>
          <xsl:when test="$k='light'">Heller Modus</xsl:when>
          <xsl:when test="$k='theme'">Thema</xsl:when>
          <xsl:when test="$k='minimal'">minimal</xsl:when>
          <xsl:when test="$k='rich'">reich</xsl:when>
          <xsl:when test="$k='renderedNote'">Generiert aus</xsl:when>
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
          <xsl:when test="$k='downloadCV'">下载简历</xsl:when>
          <xsl:when test="$k='dark'">深色模式</xsl:when>
          <xsl:when test="$k='light'">浅色模式</xsl:when>
          <xsl:when test="$k='theme'">主题</xsl:when>
          <xsl:when test="$k='minimal'">简约</xsl:when>
          <xsl:when test="$k='rich'">丰富</xsl:when>
          <xsl:when test="$k='renderedNote'">来源</xsl:when>
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
          <xsl:when test="$k='downloadCV'">Download CV</xsl:when>
          <xsl:when test="$k='dark'">Dark mode</xsl:when>
          <xsl:when test="$k='light'">Light mode</xsl:when>
          <xsl:when test="$k='theme'">Theme</xsl:when>
          <xsl:when test="$k='minimal'">minimal</xsl:when>
          <xsl:when test="$k='rich'">rich</xsl:when>
          <xsl:when test="$k='renderedNote'">Rendered from</xsl:when>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/resume">
    <html>
      <xsl:attribute name="lang"><xsl:value-of select="$lang"/></xsl:attribute>
      <head>
        <meta charset="UTF-8"/>
        <title><xsl:value-of select="basics/name"/> — <xsl:value-of select="basics/label"/></title>
        <style>
          :root {
            --primary:    #001F5A;
            --accent:     #F3890B;
            --body:       #2E2E2E;
            --muted:      #666;
            --bg-page:    #ffffff;
            --bg-sidebar: #E2E2E2;
            --bg-block:   rgba(243, 137, 11, 0.05);
            --rule:       #ddd;
          }
          html[data-theme="dark"] {
            --primary:    #FFB142;
            --accent:     #FFB142;
            --body:       #EDE0C8;
            --muted:      #B89A82;
            --bg-page:    #1F0E0E;
            --bg-sidebar: #2E1818;
            --bg-block:   rgba(255, 177, 66, 0.10);
            --rule:       #4A2828;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
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
          .item h3 a { color: var(--primary); text-decoration: none; }
          .item .date { color: var(--muted); font-size: 0.85em; font-style: italic; margin: 0 0 4px; }
          .item .location { color: var(--muted); font-size: 0.85em; margin: 0 0 6px; }
          .item p { margin: 6px 0; font-size: 0.92em; }
          .inline-skills { margin: 6px 0; }
          .inline-skills .skill-tag { font-size: 0.74em; padding: 1px 7px; }
          .embedded-projects { margin: 6px 0 0; font-size: 0.92em; }
          .embedded-projects .label { font-weight: 600; color: var(--primary); margin: 0; }
          .embedded-projects ul { margin: 4px 0 0 4px; padding-left: 16px; }
          .embedded-projects li { margin: 2px 0; }

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
            .container { flex-direction: column; }
            .sidebar, .main { width: 100%; }
          }
          @media print {
            .toolbar { display: none; }
          }
        </style>
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

          <!-- Language switcher -->
          <div class="group">
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'en'"/></xsl:call-template>
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'fr'"/></xsl:call-template>
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'nl'"/></xsl:call-template>
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'es'"/></xsl:call-template>
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'de'"/></xsl:call-template>
            <xsl:call-template name="lang-link"><xsl:with-param name="code" select="'zh'"/></xsl:call-template>
          </div>

          <!-- Theme (rich / minimal) -->
          <div class="group">
            <a class="active">
              <xsl:attribute name="href">/assets/data/resume-<xsl:value-of select="$lang"/>.xml</xsl:attribute>
              <xsl:call-template name="t"><xsl:with-param name="k" select="'rich'"/></xsl:call-template>
            </a>
            <a>
              <xsl:attribute name="href">/assets/data/resume-<xsl:value-of select="$lang"/>-minimal.xml</xsl:attribute>
              <xsl:call-template name="t"><xsl:with-param name="k" select="'minimal'"/></xsl:call-template>
            </a>
          </div>

          <!-- Dark/light toggle -->
          <button type="button" id="theme-toggle" aria-pressed="false">
            <span id="theme-toggle-label">
              <xsl:call-template name="t"><xsl:with-param name="k" select="'dark'"/></xsl:call-template>
            </span>
          </button>

          <!-- PDF download -->
          <a class="download">
            <xsl:attribute name="href">/assets/cv/cv_grosjean_baptiste_<xsl:value-of select="$lang"/>.pdf</xsl:attribute>
            <xsl:attribute name="download">cv_grosjean_baptiste_<xsl:value-of select="$lang"/>.pdf</xsl:attribute>
            ⬇ <xsl:call-template name="t"><xsl:with-param name="k" select="'downloadCV'"/></xsl:call-template>
          </a>

        </div>

        <div class="container">

          <!-- ============== SIDEBAR ============== -->
          <aside class="sidebar">

            <img src="/assets/images/profil.jpeg" id="profile-picture">
              <xsl:attribute name="alt"><xsl:value-of select="basics/name"/></xsl:attribute>
            </img>

            <h1><xsl:value-of select="basics/name"/></h1>
            <div class="label"><xsl:value-of select="basics/label"/></div>

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

            <xsl:if test="languages/language-item">
              <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'languages'"/></xsl:call-template></h2>
              <xsl:for-each select="languages/language-item">
                <div class="lang-item">
                  <strong><xsl:value-of select="language"/></strong><br/>
                  <xsl:value-of select="fluency"/>
                </div>
              </xsl:for-each>
            </xsl:if>

            <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'typicalDay'"/></xsl:call-template></h2>
            <ul class="day-list">
              <li><span class="dot" style="background:#001F5A;"></span>Work — 9h</li>
              <li><span class="dot" style="background:#F3890B;"></span>Sleep — 7h</li>
              <li><span class="dot" style="background:#FFCC66;"></span>Home — 6h</li>
              <li><span class="dot" style="background:#C0C0C0;"></span>Classes — 3h</li>
              <li><span class="dot" style="background:#FF0000;"></span>Transport — 2h</li>
              <li><span class="dot" style="background:#008000;"></span>Sport — 1h</li>
            </ul>

          </aside>

          <!-- ============== MAIN ============== -->
          <main class="main">

            <xsl:if test="basics/summary">
              <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'about'"/></xsl:call-template></h2>
              <p><xsl:value-of select="basics/summary"/></p>
            </xsl:if>

            <xsl:if test="work/job">
              <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'experience'"/></xsl:call-template></h2>
              <xsl:for-each select="work/job">
                <div class="item">
                  <h3>
                    <xsl:value-of select="position"/>
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
                  <xsl:if test="summary"><p><xsl:value-of select="summary"/></p></xsl:if>
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
                              <xsl:when test="$proj/summary"> — <xsl:value-of select="$proj/summary"/></xsl:when>
                              <xsl:when test="$proj/description"> — <xsl:value-of select="$proj/description"/></xsl:when>
                            </xsl:choose>
                          </li>
                        </xsl:for-each>
                      </ul>
                    </div>
                  </xsl:if>
                </div>
              </xsl:for-each>
            </xsl:if>

            <xsl:if test="education/school">
              <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'education'"/></xsl:call-template></h2>
              <xsl:for-each select="education/school">
                <div class="item">
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
                </div>
              </xsl:for-each>
            </xsl:if>

            <xsl:if test="references/reference">
              <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'references'"/></xsl:call-template></h2>
              <xsl:for-each select="references/reference">
                <div class="item">
                  <div class="ref-author"><xsl:value-of select="name"/></div>
                  <blockquote><xsl:value-of select="reference"/></blockquote>
                </div>
              </xsl:for-each>
            </xsl:if>

            <div class="footer-note">
              <xsl:call-template name="t"><xsl:with-param name="k" select="'renderedNote'"/></xsl:call-template>
              <xsl:text> </xsl:text>
              <a><xsl:attribute name="href">/assets/data/resume-<xsl:value-of select="$lang"/>.xml</xsl:attribute>resume-<xsl:value-of select="$lang"/>.xml</a>
              ·
              <a href="/assets/data/resume.json">resume.json</a>
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
