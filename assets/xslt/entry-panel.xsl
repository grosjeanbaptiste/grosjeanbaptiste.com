<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- The entry the URL points at is lifted into a panel by css/entry-panel.css
       (:target, no script); this is the way out of it, back to the timeline. -->
  <xsl:template name="entry-close">
    <a class="entry-close" href="#timeline" aria-label="×">×</a>
    <!-- And the way on, to the same entry in the interactive view. -->
    <xsl:if test="app">
      <a class="entry-open">
        <xsl:attribute name="href"><xsl:value-of select="app"/></xsl:attribute>
        <xsl:value-of select="/resume/meta/views/view[id='interactive']/label"/> ↗
      </a>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
