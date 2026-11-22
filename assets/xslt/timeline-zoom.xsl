<?xml version="1.0" encoding="UTF-8"?>
<!-- The timeline's zoom, with no script, for both XSLT themes: a radio per zoom
     (css/timeline-zoom.css draws them as buttons) and the rules, written here
     from meta/timeline/months, that set the scale each one gives. -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template name="timeline-zoom">
    <xsl:variable name="tl" select="/resume/meta/timeline"/>
          <!-- The zoom is a radio per zoom (css/timeline-zoom.css draws them as
               buttons, the rules in the head set the scale): no script. -->
          <div class="tl-zoom" role="group">
            <xsl:attribute name="aria-label"><xsl:value-of select="$tl/title"/></xsl:attribute>
            <xsl:for-each select="$tl/zooms/zoom">
              <input type="radio" name="tl-zoom" class="tl-zoom-input">
                <xsl:attribute name="id">tl-z-<xsl:value-of select="years"/></xsl:attribute>
                <xsl:if test="years = '5'"><xsl:attribute name="checked">checked</xsl:attribute></xsl:if>
              </input>
              <label>
                <xsl:attribute name="for">tl-z-<xsl:value-of select="years"/></xsl:attribute>
                <xsl:value-of select="label"/>
              </label>
            </xsl:for-each>
          </div>
  </xsl:template>

  <xsl:template name="timeline-zoom-css">
    <xsl:variable name="months" select="/resume/meta/timeline/months"/>
    <xsl:if test="$months">
      <style>
        <xsl:for-each select="/resume/meta/timeline/zooms/zoom">
          <xsl:text>#timeline:has(#tl-z-</xsl:text><xsl:value-of select="years"/><xsl:text>:checked) .tl-grid { --stretch: </xsl:text>
          <xsl:choose>
            <xsl:when test="years != 'all' and $months div (years * 12) &gt; 1"><xsl:value-of select="$months div (years * 12)"/></xsl:when>
            <xsl:otherwise>1</xsl:otherwise>
          </xsl:choose>
          <xsl:text>; }&#10;</xsl:text>
        </xsl:for-each>
      </style>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
