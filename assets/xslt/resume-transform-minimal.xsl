<?xml version="1.0" encoding="UTF-8"?>
<!--
  Minimal XSLT theme: single column, light typography.

  Language-aware: reads /resume/meta/lang to localize UI strings.
  Browser-side features: dark/light toggle (localStorage), language
  switcher, PDF download button.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:key name="project-by-name" match="/resume/projects/project[name]" use="name"/>

  <xsl:variable name="lang">
    <xsl:choose>
      <xsl:when test="/resume/meta/lang"><xsl:value-of select="/resume/meta/lang"/></xsl:when>
      <xsl:otherwise>en</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:template name="t">
    <xsl:param name="k"/>
    <xsl:choose>
      <xsl:when test="$lang = 'fr'">
        <xsl:choose>
          <xsl:when test="$k='about'">À propos</xsl:when>
          <xsl:when test="$k='experience'">Expérience professionnelle</xsl:when>
          <xsl:when test="$k='education'">Éducation</xsl:when>
          <xsl:when test="$k='volunteer'">Bénévolat</xsl:when>
          <xsl:when test="$k='projects'">Projets</xsl:when>
          <xsl:when test="$k='skills'">Compétences</xsl:when>
          <xsl:when test="$k='languages'">Langues</xsl:when>
          <xsl:when test="$k='awards'">Distinctions</xsl:when>
          <xsl:when test="$k='interests'">Intérêts</xsl:when>
          <xsl:when test="$k='references'">Références</xsl:when>
          <xsl:when test="$k='viewProject'">Voir le projet</xsl:when>
          <xsl:when test="$k='present'">aujourd'hui</xsl:when>
          <xsl:when test="$k='inProgress'">en cours</xsl:when>
          <xsl:when test="$k='downloadCV'">Télécharger le CV</xsl:when>
          <xsl:when test="$k='dark'">Mode sombre</xsl:when>
          <xsl:when test="$k='light'">Mode clair</xsl:when>
          <xsl:when test="$k='minimal'">minimal</xsl:when>
          <xsl:when test="$k='rich'">riche</xsl:when>
          <xsl:when test="$k='note'">Thème minimal XSLT 1.0. Données canoniques :</xsl:when>
          <xsl:when test="$k='htmlSite'">Site</xsl:when>
          <xsl:when test="$k='typicalDay'">Une journée type</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$lang = 'nl'">
        <xsl:choose>
          <xsl:when test="$k='about'">Over mij</xsl:when>
          <xsl:when test="$k='experience'">Werkervaring</xsl:when>
          <xsl:when test="$k='education'">Opleiding</xsl:when>
          <xsl:when test="$k='volunteer'">Vrijwilligerswerk</xsl:when>
          <xsl:when test="$k='projects'">Projecten</xsl:when>
          <xsl:when test="$k='skills'">Vaardigheden</xsl:when>
          <xsl:when test="$k='languages'">Talen</xsl:when>
          <xsl:when test="$k='awards'">Onderscheidingen</xsl:when>
          <xsl:when test="$k='interests'">Interesses</xsl:when>
          <xsl:when test="$k='references'">Referenties</xsl:when>
          <xsl:when test="$k='viewProject'">Bekijk project</xsl:when>
          <xsl:when test="$k='present'">heden</xsl:when>
          <xsl:when test="$k='inProgress'">in uitvoering</xsl:when>
          <xsl:when test="$k='downloadCV'">CV downloaden</xsl:when>
          <xsl:when test="$k='dark'">Donkere modus</xsl:when>
          <xsl:when test="$k='light'">Lichte modus</xsl:when>
          <xsl:when test="$k='minimal'">minimaal</xsl:when>
          <xsl:when test="$k='rich'">rijk</xsl:when>
          <xsl:when test="$k='note'">Minimaal XSLT 1.0-thema. Canonieke data:</xsl:when>
          <xsl:when test="$k='typicalDay'">Een typische dag</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
          <xsl:when test="$k='htmlSite'">Site</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$lang = 'es'">
        <xsl:choose>
          <xsl:when test="$k='about'">Sobre mí</xsl:when>
          <xsl:when test="$k='experience'">Experiencia laboral</xsl:when>
          <xsl:when test="$k='education'">Educación</xsl:when>
          <xsl:when test="$k='volunteer'">Voluntariado</xsl:when>
          <xsl:when test="$k='projects'">Proyectos</xsl:when>
          <xsl:when test="$k='skills'">Habilidades</xsl:when>
          <xsl:when test="$k='languages'">Idiomas</xsl:when>
          <xsl:when test="$k='awards'">Premios</xsl:when>
          <xsl:when test="$k='interests'">Intereses</xsl:when>
          <xsl:when test="$k='references'">Referencias</xsl:when>
          <xsl:when test="$k='viewProject'">Ver proyecto</xsl:when>
          <xsl:when test="$k='present'">actualidad</xsl:when>
          <xsl:when test="$k='inProgress'">en curso</xsl:when>
          <xsl:when test="$k='downloadCV'">Descargar CV</xsl:when>
          <xsl:when test="$k='dark'">Modo oscuro</xsl:when>
          <xsl:when test="$k='light'">Modo claro</xsl:when>
          <xsl:when test="$k='minimal'">mínimo</xsl:when>
          <xsl:when test="$k='rich'">enriquecido</xsl:when>
          <xsl:when test="$k='note'">Tema mínimo XSLT 1.0. Datos canónicos:</xsl:when>
          <xsl:when test="$k='typicalDay'">Un día típico</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
          <xsl:when test="$k='htmlSite'">Sitio</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$lang = 'de'">
        <xsl:choose>
          <xsl:when test="$k='about'">Über mich</xsl:when>
          <xsl:when test="$k='experience'">Berufserfahrung</xsl:when>
          <xsl:when test="$k='education'">Ausbildung</xsl:when>
          <xsl:when test="$k='volunteer'">Ehrenamt</xsl:when>
          <xsl:when test="$k='projects'">Projekte</xsl:when>
          <xsl:when test="$k='skills'">Fähigkeiten</xsl:when>
          <xsl:when test="$k='languages'">Sprachen</xsl:when>
          <xsl:when test="$k='awards'">Auszeichnungen</xsl:when>
          <xsl:when test="$k='interests'">Interessen</xsl:when>
          <xsl:when test="$k='references'">Referenzen</xsl:when>
          <xsl:when test="$k='viewProject'">Projekt ansehen</xsl:when>
          <xsl:when test="$k='present'">heute</xsl:when>
          <xsl:when test="$k='inProgress'">läuft</xsl:when>
          <xsl:when test="$k='downloadCV'">Lebenslauf herunterladen</xsl:when>
          <xsl:when test="$k='dark'">Dunkler Modus</xsl:when>
          <xsl:when test="$k='light'">Heller Modus</xsl:when>
          <xsl:when test="$k='minimal'">minimal</xsl:when>
          <xsl:when test="$k='rich'">reich</xsl:when>
          <xsl:when test="$k='note'">Minimales XSLT-1.0-Thema. Kanonische Daten:</xsl:when>
          <xsl:when test="$k='typicalDay'">Ein typischer Tag</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
          <xsl:when test="$k='htmlSite'">Website</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$lang = 'zh'">
        <xsl:choose>
          <xsl:when test="$k='about'">关于我</xsl:when>
          <xsl:when test="$k='experience'">工作经验</xsl:when>
          <xsl:when test="$k='education'">教育</xsl:when>
          <xsl:when test="$k='volunteer'">志愿服务</xsl:when>
          <xsl:when test="$k='projects'">项目</xsl:when>
          <xsl:when test="$k='skills'">技能</xsl:when>
          <xsl:when test="$k='languages'">语言</xsl:when>
          <xsl:when test="$k='awards'">奖项</xsl:when>
          <xsl:when test="$k='interests'">兴趣</xsl:when>
          <xsl:when test="$k='references'">推荐人</xsl:when>
          <xsl:when test="$k='viewProject'">查看项目</xsl:when>
          <xsl:when test="$k='present'">至今</xsl:when>
          <xsl:when test="$k='inProgress'">进行中</xsl:when>
          <xsl:when test="$k='downloadCV'">下载简历</xsl:when>
          <xsl:when test="$k='dark'">深色模式</xsl:when>
          <xsl:when test="$k='light'">浅色模式</xsl:when>
          <xsl:when test="$k='minimal'">简约</xsl:when>
          <xsl:when test="$k='rich'">丰富</xsl:when>
          <xsl:when test="$k='note'">极简 XSLT 1.0 主题。原始数据：</xsl:when>
          <xsl:when test="$k='typicalDay'">我的一天</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
          <xsl:when test="$k='htmlSite'">网站</xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <xsl:choose>
          <xsl:when test="$k='about'">About</xsl:when>
          <xsl:when test="$k='experience'">Work experience</xsl:when>
          <xsl:when test="$k='education'">Education</xsl:when>
          <xsl:when test="$k='volunteer'">Volunteer</xsl:when>
          <xsl:when test="$k='projects'">Projects</xsl:when>
          <xsl:when test="$k='skills'">Skills</xsl:when>
          <xsl:when test="$k='languages'">Languages</xsl:when>
          <xsl:when test="$k='awards'">Awards</xsl:when>
          <xsl:when test="$k='interests'">Interests</xsl:when>
          <xsl:when test="$k='references'">References</xsl:when>
          <xsl:when test="$k='viewProject'">View project</xsl:when>
          <xsl:when test="$k='present'">Present</xsl:when>
          <xsl:when test="$k='inProgress'">in progress</xsl:when>
          <xsl:when test="$k='downloadCV'">Download CV</xsl:when>
          <xsl:when test="$k='dark'">Dark mode</xsl:when>
          <xsl:when test="$k='light'">Light mode</xsl:when>
          <xsl:when test="$k='minimal'">minimal</xsl:when>
          <xsl:when test="$k='rich'">rich</xsl:when>
          <xsl:when test="$k='note'">Minimal XSLT 1.0 theme. Canonical data:</xsl:when>
          <xsl:when test="$k='typicalDay'">A Day of My Life</xsl:when>
          <xsl:when test="$k='registry'">JSON Resume registry</xsl:when>
          <xsl:when test="$k='htmlSite'">Site</xsl:when>
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
        <title><xsl:value-of select="basics/name"/> — Resume</title>
        <style>
          :root {
            --primary: <xsl:value-of select="meta/brand/xsltPrimary"/>;
            --accent:  <xsl:value-of select="meta/brand/accent"/>;
            --muted:   <xsl:value-of select="meta/brand/xsltMuted"/>;
            --body:    <xsl:value-of select="meta/brand/xsltBody"/>;
            --bg:      <xsl:value-of select="meta/brand/xsltBg"/>;
            --rule:    <xsl:value-of select="meta/brand/xsltRuleLight"/>;
            --block:   <xsl:value-of select="meta/brand/xsltBlockMin"/>;
            --tb-bg:   <xsl:value-of select="meta/brand/xsltTbBg"/>;
          }
          html[data-theme="dark"] {
            --primary: <xsl:value-of select="meta/brand/xsltPrimaryDark"/>;
            --accent:  <xsl:value-of select="meta/brand/accent"/>;
            --muted:   <xsl:value-of select="meta/brand/xsltMutedDark"/>;
            --body:    <xsl:value-of select="meta/brand/xsltBodyDark"/>;
            --bg:      <xsl:value-of select="meta/brand/xsltBgDark"/>;
            --rule:    <xsl:value-of select="meta/brand/xsltRuleDark"/>;
            --block:   <xsl:value-of select="meta/brand/xsltBlockMinDark"/>;
            --tb-bg:   <xsl:value-of select="meta/brand/xsltSidebarDark"/>;
          }
          body {
            font-family: <xsl:value-of select="meta/brand/fontXslt"/>;
            max-width: 880px;
            margin: 0 auto;
            padding: 0 24px 48px;
            color: var(--body);
            background: var(--bg);
            line-height: 1.45;
          }
          .toolbar {
            margin: 0 -24px 28px;
            padding: 8px 18px;
            background: var(--tb-bg);
            border-bottom: 1px solid var(--rule);
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 0.85em;
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
          h1 { font-size: 1.9em; margin: 0 0 4px; color: var(--primary); }
          h2 {
            font-size: 1.15em;
            margin-top: 30px;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 4px;
            color: var(--primary);
            letter-spacing: 0.02em;
          }
          h3 { font-size: 1em; margin: 14px 0 2px; }
          h3 .company { color: var(--accent); }
          .label { color: var(--muted); font-style: italic; margin-bottom: 10px; }
          .meta-bar { font-size: 0.9em; color: var(--muted); margin-bottom: 8px; }
          .meta-bar span { margin-right: 14px; white-space: nowrap; }
          .muted { color: var(--muted); font-size: 0.9em; }
          .row { margin-bottom: 14px; }
          .tag {
            display: inline-block;
            background: var(--accent);
            color: #fff;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 0.85em;
            margin: 2px;
          }
          ul { padding-left: 20px; margin: 6px 0; }
          a { color: var(--accent); text-decoration: none; }
          a:hover { text-decoration: underline; }
          blockquote {
            border-left: 3px solid var(--accent);
            margin-left: 0;
            padding-left: 14px;
            color: var(--block);
            font-style: italic;
            font-size: 0.95em;
          }
          .ref-author { font-weight: 600; margin: 12px 0 4px; }
          .stylesheet-note {
            margin-top: 40px;
            padding-top: 12px;
            border-top: 1px solid var(--rule);
            font-size: 0.85em;
            color: var(--muted);
          }
          @media (max-width: 768px) {
            body { padding: 0 18px 32px; }
            .toolbar {
              margin: 0 -18px 22px;
              padding: 6px 12px;
              font-size: 0.8em;
              gap: 8px;
            }
            .toolbar a, .toolbar button { padding: 3px 7px; font-size: 0.85em; }
            h1 { font-size: 1.65em; }
            h2 { font-size: 1.05em; margin-top: 24px; }
            h3 { font-size: 0.98em; }
          }
          @media (max-width: 480px) {
            body { padding: 0 12px 24px; font-size: 15px; line-height: 1.5; }
            .toolbar {
              margin: 0 -12px 18px;
              padding: 6px 8px;
              gap: 5px;
              justify-content: flex-start;
              overflow-x: auto;
              flex-wrap: nowrap;
              -webkit-overflow-scrolling: touch;
            }
            .toolbar .group { gap: 4px; flex-shrink: 0; }
            .toolbar a, .toolbar button {
              padding: 3px 6px;
              font-size: 0.8em;
              white-space: nowrap;
            }
            h1 { font-size: 1.4em; }
            h2 { font-size: 1em; }
            h3 { font-size: 0.95em; }
            .meta-bar span { display: block; margin-right: 0; margin-bottom: 3px; }
            blockquote { font-size: 0.9em; padding-left: 12px; }
          }
          @media print { .toolbar { display: none; } }
        </style>
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

        <!-- TOOLBAR -->
        <div class="toolbar">
          <a>
            <xsl:attribute name="href">
              <xsl:choose>
                <xsl:when test="$lang = 'en'">/</xsl:when>
                <xsl:otherwise>/<xsl:value-of select="$lang"/>/</xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
            ↩ <xsl:call-template name="t"><xsl:with-param name="k" select="'htmlSite'"/></xsl:call-template>
          </a>
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
            <xsl:attribute name="href">/assets/data/resume-<xsl:value-of select="$lang"/>.xml</xsl:attribute>
            <xsl:attribute name="title">
              <xsl:call-template name="t"><xsl:with-param name="k" select="'rich'"/></xsl:call-template>
            </xsl:attribute>
            ⇄ <xsl:call-template name="t"><xsl:with-param name="k" select="'rich'"/></xsl:call-template>
          </a>
          <button type="button" id="theme-toggle" aria-pressed="false">
            <span id="theme-toggle-label">
              <xsl:call-template name="t"><xsl:with-param name="k" select="'dark'"/></xsl:call-template>
            </span>
          </button>
          <a class="download">
            <xsl:attribute name="href">/assets/cv/cv_grosjean_baptiste_<xsl:value-of select="$lang"/>.pdf</xsl:attribute>
            <xsl:attribute name="download">cv_grosjean_baptiste_<xsl:value-of select="$lang"/>.pdf</xsl:attribute>
            ⬇ <xsl:call-template name="t"><xsl:with-param name="k" select="'downloadCV'"/></xsl:call-template>
          </a>
        </div>

        <h1><xsl:value-of select="basics/name"/></h1>
        <div class="label"><xsl:value-of select="basics/label"/></div>

        <xsl:if test="meta/degrees/inProgress or meta/degrees/obtained">
          <div class="degrees">
            <xsl:if test="meta/degrees/inProgress">
              <p class="degree degree-in-progress">
                <xsl:value-of select="meta/degrees/inProgress"/>
                <xsl:text> </xsl:text>
                <span class="muted">(<xsl:call-template name="t"><xsl:with-param name="k" select="'inProgress'"/></xsl:call-template>)</span>
              </p>
            </xsl:if>
            <xsl:if test="meta/degrees/obtained">
              <p class="degree degree-obtained"><xsl:value-of select="meta/degrees/obtained"/></p>
            </xsl:if>
          </div>
        </xsl:if>

        <div class="meta-bar">
          <xsl:if test="basics/email">
            <span>✉ <a><xsl:attribute name="href">mailto:<xsl:value-of select="basics/email"/></xsl:attribute><xsl:value-of select="basics/email"/></a></span>
          </xsl:if>
          <xsl:if test="basics/phone">
            <span>☎ <xsl:value-of select="basics/phone"/></span>
          </xsl:if>
          <xsl:if test="basics/location/city">
            <span>⌖ <xsl:value-of select="basics/location/city"/>, <xsl:value-of select="basics/location/countryCode"/></span>
          </xsl:if>
        </div>
        <div class="meta-bar">
          <xsl:for-each select="basics/profiles/profile">
            <span><xsl:value-of select="network"/>: <a><xsl:attribute name="href"><xsl:value-of select="url"/></xsl:attribute><xsl:value-of select="username"/></a></span>
          </xsl:for-each>
        </div>

        <xsl:for-each select="meta/sectionOrder/section">
          <xsl:variable name="name" select="."/>
          <xsl:choose>
            <xsl:when test="$name='about'"><xsl:call-template name="section-about"/></xsl:when>
            <xsl:when test="$name='work'"><xsl:call-template name="section-work"/></xsl:when>
            <xsl:when test="$name='education'"><xsl:call-template name="section-education"/></xsl:when>
            <xsl:when test="$name='skills'"><xsl:call-template name="section-skills"/></xsl:when>
            <xsl:when test="$name='languages'"><xsl:call-template name="section-languages"/></xsl:when>
            <xsl:when test="$name='dailyLife'"><xsl:call-template name="section-dailyLife"/></xsl:when>
            <xsl:when test="$name='awards'"><xsl:call-template name="section-awards"/></xsl:when>
            <xsl:when test="$name='interests'"><xsl:call-template name="section-interests"/></xsl:when>
            <xsl:when test="$name='references'"><xsl:call-template name="section-references"/></xsl:when>
          </xsl:choose>
        </xsl:for-each>

        <div class="stylesheet-note">
          <xsl:call-template name="t"><xsl:with-param name="k" select="'note'"/></xsl:call-template>
          <xsl:text> </xsl:text>
          <a href="/assets/data/resume.json">resume.json</a>
          <xsl:text> · </xsl:text>
          <a href="https://registry.jsonresume.org/grosjeanbaptiste" target="_blank" rel="external noopener">
            <xsl:call-template name="t"><xsl:with-param name="k" select="'registry'"/></xsl:call-template>
          </a>
          <xsl:text> · </xsl:text>
          <a href="https://www.grosjeanbaptiste.com/">grosjeanbaptiste.com</a>.
        </div>

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

  <xsl:template name="section-about">
    <xsl:if test="/resume/basics/summary">
      <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'about'"/></xsl:call-template></h2>
      <p><xsl:value-of select="/resume/basics/summary"/></p>
    </xsl:if>
  </xsl:template>

  <xsl:template name="section-work">
    <xsl:if test="/resume/work/job">
          <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'experience'"/></xsl:call-template></h2>
          <xsl:for-each select="/resume/work/job">
            <div class="row">
              <h3>
                <xsl:value-of select="position"/>
                <xsl:if test="client"> · <xsl:value-of select="client"/></xsl:if>
                <xsl:if test="company"> — <span class="company"><xsl:value-of select="company"/></span></xsl:if>
              </h3>
              <div class="muted">
                <xsl:value-of select="startDate"/>
                <xsl:text> – </xsl:text>
                <xsl:choose>
                  <xsl:when test="endDate"><xsl:value-of select="endDate"/></xsl:when>
                  <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k" select="'present'"/></xsl:call-template></xsl:otherwise>
                </xsl:choose>
                <xsl:if test="location"> · <xsl:value-of select="location"/></xsl:if>
                <xsl:if test="url"> · <a><xsl:attribute name="href"><xsl:value-of select="url"/></xsl:attribute><xsl:value-of select="url"/></a></xsl:if>
              </div>
              <xsl:if test="summary"><p><xsl:value-of select="summary"/></p></xsl:if>
              <xsl:if test="highlights/highlight">
                <ul>
                  <xsl:for-each select="highlights/highlight"><li><xsl:value-of select="."/></li></xsl:for-each>
                </ul>
              </xsl:if>
              <xsl:if test="projects/project">
                <div class="muted"><xsl:call-template name="t"><xsl:with-param name="k" select="'projects'"/></xsl:call-template>:</div>
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
              </xsl:if>
              <xsl:variable name="workOrg" select="company"/>
              <xsl:variable name="workVols" select="/resume/volunteer/volunteer-item[$workOrg and contains($workOrg, substring-before(concat(organization, ' '), ' '))]"/>
              <xsl:if test="$workVols">
                <div class="muted"><xsl:call-template name="t"><xsl:with-param name="k" select="'volunteer'"/></xsl:call-template>:</div>
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
              </xsl:if>
              <xsl:variable name="workRefs" select="/resume/references/reference[$workOrg and contains(name, substring($workOrg, 1, 4))]"/>
              <xsl:if test="$workRefs">
                <div class="muted">
                  <xsl:call-template name="t"><xsl:with-param name="k" select="'references'"/></xsl:call-template>
                  <xsl:text>: </xsl:text>
                  <xsl:for-each select="$workRefs">
                    <xsl:if test="position() &gt; 1">, </xsl:if>
                    <a>
                      <xsl:attribute name="href">#<xsl:value-of select="generate-id(.)"/></xsl:attribute>
                      <xsl:value-of select="name"/>
                    </a>
                  </xsl:for-each>
                </div>
              </xsl:if>
            </div>
          </xsl:for-each>
        </xsl:if>
  </xsl:template>

  <xsl:template name="section-education">
    <xsl:if test="/resume/education/school">
          <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'education'"/></xsl:call-template></h2>
          <xsl:for-each select="/resume/education/school">
            <div class="row">
              <h3>
                <xsl:value-of select="studyType"/>
                <xsl:if test="area"> — <xsl:value-of select="area"/></xsl:if>
              </h3>
              <div class="muted">
                <xsl:value-of select="institution"/>
                <xsl:text> · </xsl:text>
                <xsl:value-of select="startDate"/>
                <xsl:text> – </xsl:text>
                <xsl:choose>
                  <xsl:when test="endDate"><xsl:value-of select="endDate"/></xsl:when>
                  <xsl:otherwise><xsl:call-template name="t"><xsl:with-param name="k" select="'present'"/></xsl:call-template></xsl:otherwise>
                </xsl:choose>
              </div>
              <xsl:if test="gpa"><div class="muted"><xsl:value-of select="gpa"/></div></xsl:if>
              <xsl:if test="summary"><p><xsl:value-of select="summary"/></p></xsl:if>
              <xsl:if test="projects/project">
                <div class="muted"><xsl:call-template name="t"><xsl:with-param name="k" select="'projects'"/></xsl:call-template>:</div>
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
              </xsl:if>
              <xsl:variable name="eduInst" select="institution"/>
              <xsl:variable name="eduVols" select="/resume/volunteer/volunteer-item[$eduInst and contains($eduInst, substring-before(concat(organization, ' '), ' '))]"/>
              <xsl:if test="$eduVols">
                <div class="muted"><xsl:call-template name="t"><xsl:with-param name="k" select="'volunteer'"/></xsl:call-template>:</div>
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
              </xsl:if>
              <xsl:variable name="eduRefs" select="/resume/references/reference[$eduInst and contains(name, $eduInst)]"/>
              <xsl:if test="$eduRefs">
                <div class="muted">
                  <xsl:call-template name="t"><xsl:with-param name="k" select="'references'"/></xsl:call-template>
                  <xsl:text>: </xsl:text>
                  <xsl:for-each select="$eduRefs">
                    <xsl:if test="position() &gt; 1">, </xsl:if>
                    <a>
                      <xsl:attribute name="href">#<xsl:value-of select="generate-id(.)"/></xsl:attribute>
                      <xsl:value-of select="name"/>
                    </a>
                  </xsl:for-each>
                </div>
              </xsl:if>
            </div>
          </xsl:for-each>
        </xsl:if>
  </xsl:template>

  <xsl:template name="section-skills">
    <xsl:if test="/resume/skills/skill">
          <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'skills'"/></xsl:call-template></h2>
          <xsl:for-each select="/resume/skills/skill">
            <h3><xsl:value-of select="name"/></h3>
            <xsl:if test="keywords/keyword">
              <div>
                <xsl:for-each select="keywords/keyword">
                  <span class="tag"><xsl:value-of select="."/></span>
                </xsl:for-each>
              </div>
            </xsl:if>
          </xsl:for-each>
        </xsl:if>
  </xsl:template>

  <xsl:template name="section-languages">
    <xsl:if test="/resume/languages/language-item">
          <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'languages'"/></xsl:call-template></h2>
          <ul>
            <xsl:for-each select="/resume/languages/language-item">
              <li><strong><xsl:value-of select="language"/></strong>: <xsl:value-of select="fluency"/></li>
            </xsl:for-each>
          </ul>
        </xsl:if>
  </xsl:template>

  <xsl:template name="section-dailyLife">
    <xsl:if test="/resume/meta/dailyLife/items/item">
          <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'typicalDay'"/></xsl:call-template></h2>
          <ul>
            <xsl:for-each select="/resume/meta/dailyLife/items/item">
              <li>
                <span class="tag">
                  <xsl:attribute name="style">background:<xsl:value-of select="color"/></xsl:attribute>
                  <xsl:text>&#160;</xsl:text>
                </span>
                <xsl:text> </xsl:text>
                <strong><xsl:value-of select="key"/></strong> — <xsl:value-of select="hours"/>h
              </li>
            </xsl:for-each>
          </ul>
        </xsl:if>
  </xsl:template>

  <xsl:template name="section-awards">
    <xsl:if test="/resume/awards/award">
          <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'awards'"/></xsl:call-template></h2>
          <ul>
            <xsl:for-each select="/resume/awards/award">
              <li>
                <strong><xsl:value-of select="title"/></strong>
                <xsl:if test="awarder"> — <xsl:value-of select="awarder"/></xsl:if>
                <xsl:if test="date"> (<xsl:value-of select="date"/>)</xsl:if>
                <xsl:if test="summary">: <xsl:value-of select="summary"/></xsl:if>
              </li>
            </xsl:for-each>
          </ul>
        </xsl:if>
  </xsl:template>

  <xsl:template name="section-interests">
    <xsl:if test="/resume/interests/interest">
          <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'interests'"/></xsl:call-template></h2>
          <xsl:for-each select="/resume/interests/interest">
            <div class="row">
              <strong><xsl:value-of select="name"/></strong>
              <xsl:if test="keywords/keyword">:
                <xsl:for-each select="keywords/keyword">
                  <xsl:if test="position() &gt; 1">, </xsl:if>
                  <xsl:value-of select="."/>
                </xsl:for-each>
              </xsl:if>
            </div>
          </xsl:for-each>
        </xsl:if>
  </xsl:template>

  <xsl:template name="section-references">
    <xsl:if test="/resume/references/reference">
          <h2><xsl:call-template name="t"><xsl:with-param name="k" select="'references'"/></xsl:call-template></h2>
          <xsl:for-each select="/resume/references/reference">
            <div class="row">
              <xsl:attribute name="id"><xsl:value-of select="generate-id(.)"/></xsl:attribute>
              <div class="ref-author"><xsl:value-of select="name"/></div>
              <blockquote><xsl:value-of select="reference"/></blockquote>
            </div>
          </xsl:for-each>
        </xsl:if>
  </xsl:template>

  <xsl:template name="lang-link">
    <xsl:param name="code"/>
    <a>
      <xsl:attribute name="href">/assets/data/resume-<xsl:value-of select="$code"/>-minimal.xml</xsl:attribute>
      <xsl:attribute name="hreflang"><xsl:value-of select="$code"/></xsl:attribute>
      <xsl:if test="$code = $lang">
        <xsl:attribute name="class">active</xsl:attribute>
      </xsl:if>
      <xsl:value-of select="translate($code, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
    </a>
  </xsl:template>

</xsl:stylesheet>
