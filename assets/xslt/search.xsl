<?xml version="1.0" encoding="UTF-8"?>
<!-- The classic page's search, for both XSLT themes: the dialog and its opener
     (scripts/lib/sections/search.js), run by /js/search.js over the index the
     generator wrote (meta/timeline/search, scripts/lib/xml-search.js). -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- Opens the search; /js/search.js shows it, with ⌘K / Ctrl+K. -->
  <xsl:template name="search-open">
    <xsl:for-each select="/resume/meta/timeline/search">
      <button type="button" class="tl-search-open" aria-haspopup="dialog" aria-controls="cv-search" hidden="hidden"><xsl:value-of select="label"/></button>
    </xsl:for-each>
  </xsl:template>

  <!-- The classic page's search dialog (scripts/lib/sections/search.js), run
       by /js/search.js over the index the generator wrote (meta/timeline/
       search — scripts/lib/xml-search.js), inert JSON. Closed. -->
  <xsl:template name="search">
    <xsl:for-each select="/resume/meta/timeline/search">
      <dialog id="cv-search">
        <xsl:attribute name="aria-label"><xsl:value-of select="label"/></xsl:attribute>
        <input type="search" class="cv-search-input" autocomplete="off" aria-controls="cv-search-results">
          <xsl:attribute name="aria-label"><xsl:value-of select="label"/></xsl:attribute>
          <xsl:attribute name="placeholder"><xsl:value-of select="placeholder"/></xsl:attribute>
        </input>
        <ul id="cv-search-results" class="cv-search-results" role="listbox"></ul>
        <p class="cv-search-empty" hidden="hidden"><xsl:value-of select="empty"/></p>
        <script type="application/json" id="cv-index"><xsl:value-of select="index"/></script>
      </dialog>
    </xsl:for-each>
  </xsl:template>

</xsl:stylesheet>
