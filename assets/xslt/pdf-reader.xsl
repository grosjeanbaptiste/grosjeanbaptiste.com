<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- The PDFs, read in the page: one <details> each, all of one named group,
       so the browser keeps one open — the tabs of a reader, with no script and
       no sheet. The browser's own viewer in the <object> zooms and downloads;
       one that cannot show a PDF hands the file over. With the script
       (js/xslt-pdf-reader.js, PDF.js from assets/_vendor/pdfjs) an opened
       panel is drawn the interactive view's way: pages with their text layer,
       zoom buttons, fit-to-width. Without it, the <object> stays. -->
  <xsl:template name="pdf-reader">
    <section id="pdf" data-pdfjs="/assets/_vendor/pdfjs/">
      <h2><xsl:value-of select="/resume/meta/views/view[id='pdf']/label"/></h2>
      <xsl:call-template name="pdf-panel">
        <xsl:with-param name="summary" select="/resume/meta/views/view[id='pdf']/label"/>
        <xsl:with-param name="file" select="concat('/assets/cv/cv_grosjean_baptiste_', $lang, '.pdf')"/>
      </xsl:call-template>
      <xsl:for-each select="/resume/meta/timeline/pdf">
        <xsl:variable name="label" select="label"/>
        <xsl:call-template name="pdf-panel">
          <xsl:with-param name="summary" select="concat($label, ' · ', ../zooms/zoom[years = 2]/label)"/>
          <xsl:with-param name="file" select="two"/>
        </xsl:call-template>
        <xsl:call-template name="pdf-panel">
          <xsl:with-param name="summary" select="concat($label, ' · ', ../zooms/zoom[years = 5]/label)"/>
          <xsl:with-param name="file" select="five"/>
        </xsl:call-template>
        <xsl:call-template name="pdf-panel">
          <xsl:with-param name="summary" select="concat($label, ' · ', ../zooms/zoom[years = 'all']/label)"/>
          <xsl:with-param name="file" select="all"/>
        </xsl:call-template>
      </xsl:for-each>
    </section>
  </xsl:template>

  <xsl:template name="pdf-panel">
    <xsl:param name="summary"/>
    <xsl:param name="file"/>
    <details name="cv-reader">
      <xsl:attribute name="data-file"><xsl:value-of select="$file"/></xsl:attribute>
      <summary><xsl:value-of select="$summary"/></summary>
      <!-- The reader's toolbar: hidden until the script has drawn the PDF. -->
      <div class="pdf-toolbar" hidden="hidden">
        <button type="button" data-pdf="out"><xsl:attribute name="aria-label"><xsl:value-of select="/resume/meta/pdfReader/zoomOut"/></xsl:attribute>−</button>
        <button type="button" data-pdf="in"><xsl:attribute name="aria-label"><xsl:value-of select="/resume/meta/pdfReader/zoomIn"/></xsl:attribute>+</button>
        <button type="button" data-pdf="fit"><xsl:value-of select="/resume/meta/pdfReader/fitWidth"/></button>
        <a class="pdf-open" target="_blank" rel="noopener noreferrer"><xsl:attribute name="href"><xsl:value-of select="$file"/></xsl:attribute><xsl:value-of select="/resume/meta/pdfReader/openFile"/></a>
      </div>
      <p class="pdf-failed" role="alert" hidden="hidden"><xsl:value-of select="/resume/meta/pdfReader/failed"/></p>
      <object type="application/pdf" width="100%" height="800">
        <xsl:attribute name="data"><xsl:value-of select="$file"/></xsl:attribute>
        <!-- Where the browser cannot show a PDF: the pages as pictures (what
             the interactive view's reader shows before PDF.js has drawn),
             each leading to the file. -->
        <xsl:for-each select="/resume/meta/pictures/picture[file = $file]/pages/page">
          <a class="pdf-page">
            <xsl:attribute name="href"><xsl:value-of select="$file"/></xsl:attribute>
            <img loading="lazy" alt="">
              <xsl:attribute name="src"><xsl:value-of select="src"/></xsl:attribute>
              <xsl:attribute name="width"><xsl:value-of select="width"/></xsl:attribute>
              <xsl:attribute name="height"><xsl:value-of select="height"/></xsl:attribute>
              <xsl:attribute name="alt"><xsl:value-of select="$summary"/> · <xsl:value-of select="position()"/></xsl:attribute>
            </img>
          </a>
        </xsl:for-each>
        <a><xsl:attribute name="href"><xsl:value-of select="$file"/></xsl:attribute><xsl:value-of select="$summary"/></a>
      </object>
    </details>
  </xsl:template>

</xsl:stylesheet>
