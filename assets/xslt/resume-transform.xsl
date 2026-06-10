<?xml version="1.0" encoding="UTF-8"?>
<!--
  Rich XSLT theme matching the HTML site design.
  Two-column layout (sidebar + main), bordeaux palette, embedded skills
  and projects inside each work / education entry.

  Open `resume.xml` in Firefox to render this. Chrome/Safari no longer
  honour client-side XSLT 1.0; for those engines or for headless rendering
  use `xsltproc resume-transform.xsl resume.xml > out.html`.

  An alternative minimal theme lives at `resume-transform-minimal.xsl`.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <!-- Lookup: find the top-level <project> object by its <name> child. -->
  <xsl:key name="project-by-name" match="/resume/projects/project[name]" use="name"/>

  <!-- Lookup: find a top-level <skill> category by its <name>. -->
  <xsl:key name="skill-by-name" match="/resume/skills/skill" use="name"/>

  <xsl:template match="/resume">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title><xsl:value-of select="basics/name"/> — <xsl:value-of select="basics/label"/></title>
        <style>
          :root {
            --primary:    #001F5A;
            --secondary:  #FF0000;
            --accent:     #F3890B;
            --body:       #2E2E2E;
            --muted:      #666;
            --bg-sidebar: #E2E2E2;
            --bg-page:    #ffffff;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: var(--body);
            background: var(--bg-page);
            line-height: 1.45;
          }
          .nav {
            background: var(--bg-sidebar);
            padding: 10px 24px;
            font-size: 0.9em;
            color: var(--muted);
            text-align: center;
            border-bottom: 1px solid #d8d8d8;
          }
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
            color: var(--body);
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
          .day-list { font-size: 0.85em; color: var(--muted); }
          .day-list li { list-style: none; padding-left: 0; }
          .day-list .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }

          .main h2 {
            border-bottom: 2px solid var(--primary);
            padding-bottom: 4px;
            color: var(--primary);
            margin-top: 28px;
            margin-bottom: 14px;
          }
          .main h2::after {
            content: '';
            display: block;
            width: 50px;
            height: 3px;
            background: var(--accent);
            margin-top: 4px;
          }
          .item { margin-bottom: 18px; }
          .item h3 {
            font-size: 1.05em;
            margin: 0 0 2px;
            color: var(--primary);
          }
          .item h3 a { color: var(--primary); text-decoration: none; }
          .item h3 a:hover { text-decoration: underline; }
          .item .date { color: var(--muted); font-size: 0.85em; font-style: italic; margin: 0 0 4px; }
          .item .location { color: var(--muted); font-size: 0.85em; margin: 0 0 6px; }
          .item p { margin: 6px 0; font-size: 0.92em; }
          .inline-skills { margin: 6px 0; }
          .inline-skills .skill-tag { font-size: 0.74em; padding: 1px 7px; }
          .embedded-projects {
            margin: 6px 0 0;
            padding-left: 16px;
            font-size: 0.92em;
          }
          .embedded-projects .label { font-weight: 600; color: var(--primary); margin: 0; }
          .embedded-projects ul { margin: 4px 0 0 4px; padding-left: 16px; }
          .embedded-projects li { margin: 2px 0; }

          blockquote {
            margin: 8px 0;
            padding: 8px 14px;
            border-left: 3px solid var(--accent);
            color: #444;
            font-style: italic;
            font-size: 0.9em;
            background: rgba(243, 137, 11, 0.05);
          }
          .ref-author { font-weight: 600; color: var(--primary); margin: 14px 0 4px; }

          .footer-note {
            margin-top: 30px;
            padding: 12px 0;
            border-top: 1px solid #ddd;
            font-size: 0.78em;
            color: var(--muted);
            text-align: center;
          }
          .footer-note a { color: var(--accent); text-decoration: none; }

          @media (max-width: 820px) {
            .container { flex-direction: column; }
            .sidebar, .main { width: 100%; }
          }
          @media print {
            body { background: #fff; }
            .sidebar { background: #f3f3f3; }
            .nav { display: none; }
          }
        </style>
      </head>
      <body>

        <div class="nav">
          XML resume rendered via XSLT. Primary HTML site:
          <a href="https://www.grosjeanbaptiste.com/">grosjeanbaptiste.com</a> ·
          alternative <a href="../xslt/resume-transform-minimal.xsl">minimal theme</a> ·
          canonical <a href="resume.json">JSON Resume</a>
        </div>

        <div class="container">

          <!-- ============== SIDEBAR ============== -->
          <aside class="sidebar">

            <img src="../images/profil.jpeg" id="profile-picture">
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

            <!-- Hard skills -->
            <xsl:variable name="hard" select="key('skill-by-name', 'HardSkills')"/>
            <xsl:if test="$hard/keywords/keyword">
              <h2>Technical Skills</h2>
              <div class="skill-tags">
                <xsl:for-each select="$hard/keywords/keyword">
                  <span class="skill-tag"><xsl:value-of select="."/></span>
                </xsl:for-each>
              </div>
            </xsl:if>

            <!-- Soft skills -->
            <xsl:variable name="soft" select="key('skill-by-name', 'SoftSkills')"/>
            <xsl:if test="$soft/keywords/keyword">
              <h2>Soft Skills</h2>
              <div class="skill-tags">
                <xsl:for-each select="$soft/keywords/keyword">
                  <span class="skill-tag"><xsl:value-of select="."/></span>
                </xsl:for-each>
              </div>
            </xsl:if>

            <!-- Languages -->
            <xsl:if test="languages/language-item">
              <h2>Languages</h2>
              <xsl:for-each select="languages/language-item">
                <div class="lang-item">
                  <strong><xsl:value-of select="language"/></strong><br/>
                  <xsl:value-of select="fluency"/>
                </div>
              </xsl:for-each>
            </xsl:if>

            <!-- A Day of My Life -->
            <h2>A Day of My Life</h2>
            <ul class="day-list" style="margin:0;padding:0;">
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
              <h2>About Me</h2>
              <p><xsl:value-of select="basics/summary"/></p>
            </xsl:if>

            <xsl:if test="work/job">
              <h2>Work Experience</h2>
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
                      <xsl:otherwise>Present</xsl:otherwise>
                    </xsl:choose>
                  </p>
                  <xsl:if test="location"><p class="location">📍 <xsl:value-of select="location"/></p></xsl:if>
                  <xsl:if test="summary"><p><xsl:value-of select="summary"/></p></xsl:if>
                  <xsl:if test="highlights/highlight">
                    <ul>
                      <xsl:for-each select="highlights/highlight">
                        <li><xsl:value-of select="."/></li>
                      </xsl:for-each>
                    </ul>
                  </xsl:if>

                  <!-- Embedded skills -->
                  <xsl:if test="skills/skill">
                    <div class="inline-skills skill-tags">
                      <xsl:for-each select="skills/skill">
                        <span class="skill-tag"><xsl:value-of select="."/></span>
                      </xsl:for-each>
                    </div>
                  </xsl:if>

                  <!-- Embedded projects (lookup by name) -->
                  <xsl:if test="projects/project">
                    <div class="embedded-projects">
                      <p class="label">Projects</p>
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
              <h2>Education</h2>
              <xsl:for-each select="education/school">
                <div class="item">
                  <h3>
                    <xsl:value-of select="studyType"/>
                    <xsl:if test="area"> in <xsl:value-of select="area"/></xsl:if>
                  </h3>
                  <p class="date">
                    <xsl:value-of select="institution"/> ·
                    <xsl:value-of select="startDate"/>
                    <xsl:text> – </xsl:text>
                    <xsl:choose>
                      <xsl:when test="endDate"><xsl:value-of select="endDate"/></xsl:when>
                      <xsl:otherwise>Present</xsl:otherwise>
                    </xsl:choose>
                  </p>
                  <xsl:if test="gpa"><p class="location"><xsl:value-of select="gpa"/></p></xsl:if>
                  <xsl:if test="summary"><p><xsl:value-of select="summary"/></p></xsl:if>

                  <xsl:if test="skills/skill">
                    <div class="inline-skills skill-tags">
                      <xsl:for-each select="skills/skill">
                        <span class="skill-tag"><xsl:value-of select="."/></span>
                      </xsl:for-each>
                    </div>
                  </xsl:if>

                  <xsl:if test="projects/project">
                    <div class="embedded-projects">
                      <p class="label">Projects</p>
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

            <!-- References -->
            <xsl:if test="references/reference">
              <h2>References</h2>
              <xsl:for-each select="references/reference">
                <div class="item">
                  <div class="ref-author"><xsl:value-of select="name"/></div>
                  <blockquote><xsl:value-of select="reference"/></blockquote>
                </div>
              </xsl:for-each>
            </xsl:if>

            <div class="footer-note">
              Rendered from <a href="resume.json">resume.json</a> via XSLT 1.0
              (canonical JSON Resume v1.0.0). Switch to the
              <a href="../xslt/resume-transform-minimal.xsl">minimal theme</a> by editing
              the <code>&lt;?xml-stylesheet?&gt;</code> instruction in
              <a href="resume.xml">resume.xml</a>.
            </div>

          </main>

        </div>

      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
