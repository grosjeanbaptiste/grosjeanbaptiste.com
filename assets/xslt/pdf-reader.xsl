<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" extension-element-prefixes="exsl">

  <!-- The PDFs, read in the page by one reader, always open, that is told which PDF to show:
       the CV, or the timeline at one of three zooms. The browser's own viewer
       in the <object> zooms and downloads the CV (the default); a list of
       links hands the others over, and a browser that cannot show a PDF gets
       the file. With the script (js/xslt-pdf-reader.js, PDF.js from
       assets/_vendor/pdfjs) the reader is drawn the interactive view's way —
       pages with their text layer, zoom buttons, fit-to-width — and a choice
       (the buttons, hidden until then) switches the PDF it shows. -->
  <xsl:template name="pdf-reader">
    <xsl:variable name="cv" select="concat('/assets/cv/cv_grosjean_baptiste_', $lang, '.pdf')"/>
    <xsl:variable name="cvLabel" select="/resume/meta/views/view[id='pdf']/label"/>
    <xsl:variable name="pdf" select="/resume/meta/timeline/pdf"/>
    <xsl:variable name="label" select="$pdf/label"/>
    <xsl:variable name="zooms" select="/resume/meta/timeline/zooms/zoom"/>
    <!-- The choices, as the page words them: the CV, then the timeline at each zoom. -->
    <xsl:variable name="choices">
      <choice file="{$cv}" download="{/resume/meta/pdfReader/downloadCV}"><xsl:value-of select="$cvLabel"/></choice>
      <xsl:if test="$pdf">
        <choice file="{$pdf/two}" download="{/resume/meta/pdfReader/downloadTimeline}"><xsl:value-of select="concat($label, ' · ', $zooms[years = 2]/label)"/></choice>
        <choice file="{$pdf/five}" download="{/resume/meta/pdfReader/downloadTimeline}"><xsl:value-of select="concat($label, ' · ', $zooms[years = 5]/label)"/></choice>
        <choice file="{$pdf/all}" download="{/resume/meta/pdfReader/downloadTimeline}"><xsl:value-of select="concat($label, ' · ', $zooms[years = 'all']/label)"/></choice>
      </xsl:if>
    </xsl:variable>
    <section id="pdf" data-pdfjs="/assets/_vendor/pdfjs/">
      <h2><xsl:value-of select="$cvLabel"/></h2>
      <div class="pdf-reader">
        <xsl:attribute name="data-file"><xsl:value-of select="$cv"/></xsl:attribute>
        <!-- The choice and the toolbar: hidden until the script has drawn the PDF. -->
        <div class="pdf-toolbar" hidden="hidden">
          <div class="pdf-choice" role="group"><xsl:attribute name="aria-label"><xsl:value-of select="$cvLabel"/></xsl:attribute>
            <xsl:for-each select="exsl:node-set($choices)/choice">
              <button type="button" data-file="{@file}" data-download="{@download}">
                <xsl:attribute name="aria-pressed"><xsl:choose><xsl:when test="position() = 1">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose></xsl:attribute>
                <xsl:value-of select="."/>
              </button>
            </xsl:for-each>
          </div>
          <button type="button" data-pdf="out"><xsl:attribute name="aria-label"><xsl:value-of select="/resume/meta/pdfReader/zoomOut"/></xsl:attribute>−</button>
          <button type="button" data-pdf="in"><xsl:attribute name="aria-label"><xsl:value-of select="/resume/meta/pdfReader/zoomIn"/></xsl:attribute>+</button>
          <button type="button" data-pdf="fit"><xsl:value-of select="/resume/meta/pdfReader/fitWidth"/></button>
          <span class="pdf-pages" data-one="{/resume/meta/pdfReader/pageOne}" data-many="{/resume/meta/pdfReader/pageMany}"/>
          <a class="pdf-download" download="download"><xsl:attribute name="href"><xsl:value-of select="$cv"/></xsl:attribute><xsl:value-of select="/resume/meta/pdfReader/downloadCV"/></a>
          <a class="pdf-open" target="_blank" rel="noopener noreferrer"><xsl:attribute name="href"><xsl:value-of select="$cv"/></xsl:attribute><xsl:value-of select="/resume/meta/pdfReader/openFile"/></a>
        </div>
        <p class="pdf-failed" role="alert" hidden="hidden"><xsl:value-of select="/resume/meta/pdfReader/failed"/></p>
        <object type="application/pdf" width="100%" height="800">
          <xsl:attribute name="data"><xsl:value-of select="$cv"/></xsl:attribute>
          <!-- Where the browser cannot show a PDF: the pages as pictures (what
               the interactive view's reader shows before PDF.js has drawn),
               each leading to the file. -->
          <xsl:for-each select="/resume/meta/pictures/picture[file = $cv]/pages/page">
            <a class="pdf-page">
              <xsl:attribute name="href"><xsl:value-of select="$cv"/></xsl:attribute>
              <img loading="lazy" alt="">
                <xsl:attribute name="src"><xsl:value-of select="src"/></xsl:attribute>
                <xsl:attribute name="width"><xsl:value-of select="width"/></xsl:attribute>
                <xsl:attribute name="height"><xsl:value-of select="height"/></xsl:attribute>
                <xsl:attribute name="alt"><xsl:value-of select="$cvLabel"/> · <xsl:value-of select="position()"/></xsl:attribute>
              </img>
            </a>
          </xsl:for-each>
          <a><xsl:attribute name="href"><xsl:value-of select="$cv"/></xsl:attribute><xsl:value-of select="$cvLabel"/></a>
        </object>
        <!-- The other PDFs, for the reader that has no script. -->
        <ul class="pdf-files">
          <xsl:for-each select="exsl:node-set($choices)/choice[position() &gt; 1]">
            <li><a href="{@file}"><xsl:value-of select="."/></a></li>
          </xsl:for-each>
        </ul>
      </div>
    </section>
  </xsl:template>

</xsl:stylesheet>
