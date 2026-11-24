<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- The entry the URL points at is lifted into a panel by css/entry-panel.css
       (:target, no script); this is the way out of it, back to the timeline. No
       link leads to another display: the rich theme is the only one offered. -->
  <xsl:template name="entry-close">
    <a class="entry-close" href="#timeline" aria-label="×">×</a>
  </xsl:template>

  <!-- The id of a project, course unit or volunteering row, which its timeline
       bar leads to: on the row of the entry that lists it first, as on the
       classic page (scripts/lib/xml-anchors.js). An empty span at the row's
       end, which /css/timeline.css pins to the row's top. -->
  <xsl:template name="row-anchor">
    <xsl:param name="host"/>
    <xsl:if test="anchoredIn and anchoredIn = $host">
      <span class="tl-anchor"><xsl:attribute name="id"><xsl:value-of select="anchor"/></xsl:attribute></span>
      <xsl:call-template name="entry-close"/>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
