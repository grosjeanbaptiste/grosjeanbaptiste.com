<?xml version="1.0" encoding="UTF-8"?>
<!--
  The skill filter of the two XSLT themes, with no script. The generator
  writes the skills into each XML mirror (meta/timeline/skillFilter — see
  scripts/lib/xml-skill-filter.js), each with a token of its own, and the bars
  with the tokens of the skills their entry uses.

  A skill is a link to a target of its own (#skill-rust). The targets are set
  first in the timeline's section, so that a rule written here, one per skill,
  can reach what follows them: while a target is the one the URL names, the
  bars that do not carry its token fade, its link reads as chosen and its
  sentence shows. Clearing is a link to the section itself. A filtered view is
  therefore a URL like any other. /css/skill-links.css holds what does not
  depend on the skill.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:key name="skill-token" match="/resume/meta/timeline/skillFilter//skill" use="name"/>

  <!-- A skill named on an entry: a link into the filter when the filter has
       it, its plain name otherwise. -->
  <xsl:template name="skill-tag">
    <xsl:variable name="token" select="key('skill-token', string(.))[1]/token"/>
    <xsl:choose>
      <xsl:when test="$token">
        <a class="skill-tag"><xsl:attribute name="href">#skill-<xsl:value-of select="$token"/></xsl:attribute><xsl:value-of select="."/></a>
      </xsl:when>
      <xsl:otherwise><span class="skill-tag"><xsl:value-of select="."/></span></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- First in the section: the targets, then the rules that read them. -->
  <xsl:template name="skill-targets">
    <xsl:variable name="skills" select="/resume/meta/timeline/skillFilter//skill"/>
    <xsl:if test="$skills">
      <xsl:for-each select="$skills">
        <span class="tl-skill-target"><xsl:attribute name="id">skill-<xsl:value-of select="token"/></xsl:attribute></span>
      </xsl:for-each>
      <style>
        <xsl:for-each select="$skills">
#skill-<xsl:value-of select="token"/>:target ~ .tl-scroll .tl-bar:not([data-uses~="<xsl:value-of select="token"/>"]) { opacity: var(--tl-dimmed); }
#skill-<xsl:value-of select="token"/>:target ~ .tl-skills .tl-chip[href="#skill-<xsl:value-of select="token"/>"] { border-color: var(--tl-chosen); background: var(--tl-chosen); color: var(--tl-on-chosen); }
#skill-<xsl:value-of select="token"/>:target ~ .tl-skills .tl-skill-said[data-skill="<xsl:value-of select="token"/>"] { display: block; }
        </xsl:for-each>
      </style>
    </xsl:if>
  </xsl:template>

  <!-- One skill: its link, with the number of entries using it. -->
  <xsl:template name="skill-chip">
    <li>
      <a class="tl-chip">
        <xsl:attribute name="href">#skill-<xsl:value-of select="token"/></xsl:attribute>
        <xsl:value-of select="name"/><xsl:text> </xsl:text><span class="tl-chip-count"><xsl:value-of select="uses"/></span>
      </a>
    </li>
  </xsl:template>

  <!-- Last in the section: the skills, the rest behind a disclosure, and the
       sentence of each, shown while it is the chosen one. -->
  <xsl:template name="skill-filter">
    <xsl:variable name="filter" select="/resume/meta/timeline/skillFilter"/>
    <xsl:if test="$filter/shortlist/skill">
      <div class="tl-skills">
        <h3 id="tl-skills-title"><xsl:value-of select="$filter/title"/></h3>
        <ul class="tl-chips" aria-labelledby="tl-skills-title">
          <xsl:for-each select="$filter/shortlist/skill"><xsl:call-template name="skill-chip"/></xsl:for-each>
        </ul>
        <xsl:if test="$filter/rest/skill">
          <details class="tl-chips-rest">
            <summary class="tl-chip-more"><xsl:value-of select="$filter/more"/></summary>
            <ul class="tl-chips">
              <xsl:for-each select="$filter/rest/skill"><xsl:call-template name="skill-chip"/></xsl:for-each>
            </ul>
          </details>
        </xsl:if>
        <xsl:for-each select="$filter//skill">
          <p class="tl-skill-said">
            <xsl:attribute name="data-skill"><xsl:value-of select="token"/></xsl:attribute>
            <xsl:value-of select="said"/><xsl:text> </xsl:text><a href="#timeline"><xsl:value-of select="$filter/clear"/></a>
          </p>
        </xsl:for-each>
      </div>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
