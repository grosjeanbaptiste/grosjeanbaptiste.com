<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/resume">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title><xsl:value-of select="basics/name"/> — Resume</title>
        <style>
          :root {
            --primary: #001F5A;
            --accent:  #F3890B;
            --muted:   #666;
            --body:    #2E2E2E;
            --rule:    #E2E2E2;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            max-width: 880px;
            margin: 32px auto;
            padding: 0 24px 48px;
            color: var(--body);
            line-height: 1.45;
          }
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
          .label  { color: var(--muted); font-style: italic; margin-bottom: 10px; }
          .meta-bar { font-size: 0.9em; color: var(--muted); margin-bottom: 8px; }
          .meta-bar span { margin-right: 14px; white-space: nowrap; }
          .muted    { color: var(--muted); font-size: 0.9em; }
          .row      { margin-bottom: 14px; }
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
            color: #555;
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
        </style>
      </head>
      <body>

        <!-- Header -->
        <h1><xsl:value-of select="basics/name"/></h1>
        <div class="label"><xsl:value-of select="basics/label"/></div>

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

        <!-- About -->
        <xsl:if test="basics/summary">
          <h2>About</h2>
          <p><xsl:value-of select="basics/summary"/></p>
        </xsl:if>

        <!-- Work -->
        <xsl:if test="work/job">
          <h2>Work experience</h2>
          <xsl:for-each select="work/job">
            <div class="row">
              <h3>
                <xsl:value-of select="position"/>
                <xsl:if test="company"> — <xsl:value-of select="company"/></xsl:if>
              </h3>
              <div class="muted">
                <xsl:value-of select="startDate"/>
                <xsl:text> – </xsl:text>
                <xsl:choose>
                  <xsl:when test="endDate"><xsl:value-of select="endDate"/></xsl:when>
                  <xsl:otherwise>Present</xsl:otherwise>
                </xsl:choose>
                <xsl:if test="location"> · <xsl:value-of select="location"/></xsl:if>
                <xsl:if test="url"> · <a><xsl:attribute name="href"><xsl:value-of select="url"/></xsl:attribute><xsl:value-of select="url"/></a></xsl:if>
              </div>
              <xsl:if test="summary"><p><xsl:value-of select="summary"/></p></xsl:if>
              <xsl:if test="highlights/highlight">
                <ul>
                  <xsl:for-each select="highlights/highlight">
                    <li><xsl:value-of select="."/></li>
                  </xsl:for-each>
                </ul>
              </xsl:if>
            </div>
          </xsl:for-each>
        </xsl:if>

        <!-- Education -->
        <xsl:if test="education/school">
          <h2>Education</h2>
          <xsl:for-each select="education/school">
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
                  <xsl:otherwise>Present</xsl:otherwise>
                </xsl:choose>
              </div>
              <xsl:if test="gpa"><div class="muted"><xsl:value-of select="gpa"/></div></xsl:if>
              <xsl:if test="summary"><p><xsl:value-of select="summary"/></p></xsl:if>
            </div>
          </xsl:for-each>
        </xsl:if>

        <!-- Volunteer -->
        <xsl:if test="volunteer/volunteer-item">
          <h2>Volunteer</h2>
          <xsl:for-each select="volunteer/volunteer-item">
            <div class="row">
              <h3><xsl:value-of select="position"/> — <xsl:value-of select="organization"/></h3>
              <div class="muted">
                <xsl:value-of select="startDate"/>
                <xsl:text> – </xsl:text>
                <xsl:choose>
                  <xsl:when test="endDate"><xsl:value-of select="endDate"/></xsl:when>
                  <xsl:otherwise>Present</xsl:otherwise>
                </xsl:choose>
              </div>
              <xsl:if test="summary"><p><xsl:value-of select="summary"/></p></xsl:if>
            </div>
          </xsl:for-each>
        </xsl:if>

        <!-- Projects -->
        <xsl:if test="projects/project">
          <h2>Projects</h2>
          <xsl:for-each select="projects/project">
            <div class="row">
              <h3><xsl:value-of select="name"/></h3>
              <div class="muted">
                <xsl:value-of select="startDate"/>
                <xsl:text> – </xsl:text>
                <xsl:choose>
                  <xsl:when test="endDate"><xsl:value-of select="endDate"/></xsl:when>
                  <xsl:otherwise>Present</xsl:otherwise>
                </xsl:choose>
                <xsl:if test="type"> · <xsl:value-of select="type"/></xsl:if>
              </div>
              <xsl:if test="summary"><p><xsl:value-of select="summary"/></p></xsl:if>
              <xsl:if test="description"><p><xsl:value-of select="description"/></p></xsl:if>
              <xsl:if test="keywords/keyword">
                <div>
                  <xsl:for-each select="keywords/keyword">
                    <span class="tag"><xsl:value-of select="."/></span>
                  </xsl:for-each>
                </div>
              </xsl:if>
              <xsl:if test="url">
                <div><a><xsl:attribute name="href"><xsl:value-of select="url"/></xsl:attribute>View project</a></div>
              </xsl:if>
            </div>
          </xsl:for-each>
        </xsl:if>

        <!-- Skills -->
        <xsl:if test="skills/skill">
          <h2>Skills</h2>
          <xsl:for-each select="skills/skill">
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

        <!-- Languages -->
        <xsl:if test="languages/language-item">
          <h2>Languages</h2>
          <ul>
            <xsl:for-each select="languages/language-item">
              <li><strong><xsl:value-of select="language"/></strong>: <xsl:value-of select="fluency"/></li>
            </xsl:for-each>
          </ul>
        </xsl:if>

        <!-- Awards -->
        <xsl:if test="awards/award">
          <h2>Awards</h2>
          <ul>
            <xsl:for-each select="awards/award">
              <li>
                <strong><xsl:value-of select="title"/></strong>
                <xsl:if test="awarder"> — <xsl:value-of select="awarder"/></xsl:if>
                <xsl:if test="date"> (<xsl:value-of select="date"/>)</xsl:if>
                <xsl:if test="summary">: <xsl:value-of select="summary"/></xsl:if>
              </li>
            </xsl:for-each>
          </ul>
        </xsl:if>

        <!-- Interests -->
        <xsl:if test="interests/interest">
          <h2>Interests</h2>
          <xsl:for-each select="interests/interest">
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

        <!-- References -->
        <xsl:if test="references/reference">
          <h2>References</h2>
          <xsl:for-each select="references/reference">
            <div class="row">
              <div class="ref-author"><xsl:value-of select="name"/></div>
              <blockquote><xsl:value-of select="reference"/></blockquote>
            </div>
          </xsl:for-each>
        </xsl:if>

        <div class="stylesheet-note">
          XML rendered via XSLT 1.0. For the primary HTML site, see
          <a href="https://www.grosjeanbaptiste.com/">grosjeanbaptiste.com</a>.
          Canonical data: <a href="../data/resume.json">resume.json</a> (JSON Resume v1.0.0).
        </div>

      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
