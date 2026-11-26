<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" extension-element-prefixes="exsl">

  <!-- The PDFs, read in the page by one reader, always open, that is told which PDF to show:
       the CV, or the timeline at one of three zooms. The browser's own viewer
       in the <object> zooms and downloads the CV (the default); a list of
       links hands the others over, and a browser that cannot show a PDF gets
       the file. With the script (js/xslt-pdf-reader.js, PDF.js from
       assets/_vendor/pdfjs) the reader is drawn the interactive view's way —
       pages with their text layer, zoom buttons, the width fitted by itself — and a choice
       (the buttons, hidden until then) switches the PDF it shows. -->
  <xsl:variable name="sides"><side>recto</side><side>verso</side></xsl:variable>
  <xsl:template name="pdf-reader">
    <xsl:variable name="cv" select="concat('/assets/cv/cv_grosjean_baptiste_', $lang, '.pdf')"/>
    <xsl:variable name="cvLabel" select="/resume/meta/views/view[id='pdf']/label"/>
    <xsl:variable name="pdf" select="/resume/meta/timeline/pdf"/>
    <xsl:variable name="label" select="$pdf/label"/>
    <xsl:variable name="zooms" select="/resume/meta/timeline/zooms/zoom"/>
    <xsl:variable name="reader" select="/resume/meta/pdfReader"/>
    <!-- The choices, as the page words them: the CV, then the timeline at each zoom. -->
    <xsl:variable name="choices">
      <choice file="{$cv}" download="{/resume/meta/pdfReader/downloadCV}"><xsl:value-of select="$cvLabel"/></choice>
      <xsl:if test="$pdf">
        <choice file="{$pdf/two}" download="{/resume/meta/pdfReader/downloadTimeline}"><xsl:value-of select="concat($label, ' · ', $zooms[years = 2]/label)"/></choice>
        <choice file="{$pdf/five}" download="{/resume/meta/pdfReader/downloadTimeline}"><xsl:value-of select="concat($label, ' · ', $zooms[years = 5]/label)"/></choice>
        <choice file="{$pdf/all}" download="{/resume/meta/pdfReader/downloadTimeline}"><xsl:value-of select="concat($label, ' · ', $zooms[years = 'all']/label)"/></choice>
      </xsl:if>
    </xsl:variable>
    <!-- The sheets a side can show, one page of one PDF each: the CV's two, then the
         timeline's landscape and upright pages at each zoom. -->
    <xsl:variable name="sheets">
      <sheet file="{$cv}" page="1" download="{/resume/meta/pdfReader/downloadCV}"><xsl:value-of select="concat($cvLabel, ' · 1')"/></sheet>
      <sheet file="{$cv}" page="2" download="{/resume/meta/pdfReader/downloadCV}"><xsl:value-of select="concat($cvLabel, ' · 2')"/></sheet>
      <xsl:if test="$pdf">
        <xsl:for-each select="exsl:node-set($choices)/choice[position() &gt; 1]">
          <sheet file="{@file}" page="1" download="{@download}"><xsl:value-of select="concat(., ' · 1')"/></sheet>
          <sheet file="{@file}" page="2" download="{@download}"><xsl:value-of select="concat(., ' · 2')"/></sheet>
        </xsl:for-each>
      </xsl:if>
    </xsl:variable>
    <section id="pdf" data-pdfjs="/assets/_vendor/pdfjs/" data-pdflib="/assets/_vendor/pdf-lib/pdf-lib.esm.min.js">
      <h2><xsl:value-of select="$cvLabel"/></h2>
      <div class="pdf-reader">
        <xsl:attribute name="data-file"><xsl:value-of select="$cv"/></xsl:attribute>
        <!-- The choice and the toolbar: hidden until the script has drawn the PDF. -->
        <div class="pdf-toolbar" hidden="hidden">
          <xsl:for-each select="exsl:node-set($sides)/side">
            <xsl:variable name="side" select="."/>
            <div class="pdf-choice" role="group" data-side="{$side}">
              <xsl:attribute name="aria-label"><xsl:value-of select="$reader/*[name() = $side]"/></xsl:attribute>
              <span class="pdf-side"><xsl:value-of select="$reader/*[name() = $side]"/></span>
              <xsl:for-each select="exsl:node-set($sheets)/sheet">
                <button type="button" data-file="{@file}" data-page="{@page}" data-download="{@download}">
                  <xsl:attribute name="aria-pressed"><xsl:choose><xsl:when test="(position() = 1 and $side = 'recto') or (position() = 2 and $side = 'verso')">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose></xsl:attribute>
                  <xsl:value-of select="."/>
                </button>
              </xsl:for-each>
            </div>
          </xsl:for-each>
          <button type="button" data-pdf="out"><xsl:attribute name="aria-label"><xsl:value-of select="/resume/meta/pdfReader/zoomOut"/></xsl:attribute>−</button>
          <button type="button" data-pdf="in"><xsl:attribute name="aria-label"><xsl:value-of select="/resume/meta/pdfReader/zoomIn"/></xsl:attribute>+</button>
          <span class="pdf-pages" data-one="{/resume/meta/pdfReader/pageOne}" data-many="{/resume/meta/pdfReader/pageMany}"/>
          <a class="pdf-download" download="download"><xsl:attribute name="href"><xsl:value-of select="$cv"/></xsl:attribute><xsl:value-of select="/resume/meta/pdfReader/downloadCV"/></a>
          <a class="pdf-open" target="_blank" rel="noopener noreferrer"><xsl:attribute name="href"><xsl:value-of select="$cv"/></xsl:attribute><xsl:value-of select="/resume/meta/pdfReader/openFile"/></a>
        </div>
        <p class="pdf-failed" role="alert" hidden="hidden"><xsl:value-of select="/resume/meta/pdfReader/failed"/></p>

        <!-- The first page as a picture, shown in the frame until PDF.js has drawn
             the real one (as the interactive view does): the script moves it there. -->
        <xsl:for-each select="/resume/meta/pictures/picture[file = $cv]/pages/page[1]">
          <div class="pdf-preview" aria-hidden="true">
            <img loading="lazy" alt="">
              <xsl:attribute name="src"><xsl:value-of select="src"/></xsl:attribute>
              <xsl:attribute name="width"><xsl:value-of select="width"/></xsl:attribute>
              <xsl:attribute name="height"><xsl:value-of select="height"/></xsl:attribute>
            </img>
          </div>
        </xsl:for-each>
        <!-- In <noscript>: the browser fetches an <object>'s file as the page loads,
             a whole PDF a visitor with the script never looks at (PDF.js reads it
             itself, when the reader nears the screen). -->
        <noscript>
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
        </noscript>
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
