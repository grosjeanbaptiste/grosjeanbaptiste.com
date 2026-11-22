<?xml version="1.0" encoding="UTF-8"?>
<!-- The metadata of the classic page's <head>, written for both XSLT themes
     from meta/head (scripts/lib/xml-head.js): description, Open Graph,
     Twitter, every hreflang, the machine-readable alternates and the
     schema.org Person, and the warming of the other displays. The canonical address is the classic page's: the XML
     displays are views of it. -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template name="head-meta">
    <xsl:variable name="h" select="/resume/meta/head"/>
    <xsl:if test="$h">
      <meta name="description"><xsl:attribute name="content"><xsl:value-of select="$h/description"/></xsl:attribute></meta>
      <meta name="author"><xsl:attribute name="content"><xsl:value-of select="$h/author"/></xsl:attribute></meta>
      <meta name="keywords"><xsl:attribute name="content"><xsl:value-of select="$h/keywords"/></xsl:attribute></meta>
      <meta name="color-scheme" content="light dark"/>
      <link rel="canonical"><xsl:attribute name="href"><xsl:value-of select="$h/canonical"/></xsl:attribute></link>
      <xsl:for-each select="$h/alternates/alternate">
        <link rel="alternate">
          <xsl:attribute name="hreflang"><xsl:value-of select="lang"/></xsl:attribute>
          <xsl:attribute name="href"><xsl:value-of select="href"/></xsl:attribute>
        </link>
      </xsl:for-each>
      <link rel="alternate" type="application/json" title="Resume (JSON Resume v1.0.0)" href="/assets/data/resume.json"/>
      <link rel="alternate" type="application/pdf" title="CV (PDF)">
        <xsl:attribute name="href">/assets/cv/cv_grosjean_baptiste_<xsl:value-of select="/resume/meta/lang"/>.pdf</xsl:attribute>
      </link>
      <meta property="og:type" content="profile"/>
      <meta property="og:site_name" content="grosjeanbaptiste.com"/>
      <meta property="og:title"><xsl:attribute name="content"><xsl:value-of select="$h/ogTitle"/></xsl:attribute></meta>
      <meta property="og:description"><xsl:attribute name="content"><xsl:value-of select="$h/description"/></xsl:attribute></meta>
      <meta property="og:url"><xsl:attribute name="content"><xsl:value-of select="$h/canonical"/></xsl:attribute></meta>
      <meta property="og:image"><xsl:attribute name="content"><xsl:value-of select="$h/image"/></xsl:attribute></meta>
      <meta property="og:locale"><xsl:attribute name="content"><xsl:value-of select="$h/locale"/></xsl:attribute></meta>
      <xsl:for-each select="$h/localeAlternates/locale">
        <meta property="og:locale:alternate"><xsl:attribute name="content"><xsl:value-of select="."/></xsl:attribute></meta>
      </xsl:for-each>
      <meta property="profile:first_name"><xsl:attribute name="content"><xsl:value-of select="$h/givenName"/></xsl:attribute></meta>
      <meta property="profile:last_name"><xsl:attribute name="content"><xsl:value-of select="$h/familyName"/></xsl:attribute></meta>
      <meta name="twitter:card" content="summary"/>
      <meta name="twitter:title"><xsl:attribute name="content"><xsl:value-of select="$h/ogTitle"/></xsl:attribute></meta>
      <meta name="twitter:description"><xsl:attribute name="content"><xsl:value-of select="$h/description"/></xsl:attribute></meta>
      <meta name="twitter:image"><xsl:attribute name="content"><xsl:value-of select="$h/image"/></xsl:attribute></meta>
      <script type="application/ld+json"><xsl:value-of select="$h/jsonld"/></script>
    </xsl:if>
    <!-- Warm the other displays, as the classic page does: Chrome prerenders
         the one a reader is about to open, js/views-ahead.js fetches the files
         of the rest for every other browser. -->
    <script type="speculationrules">{"prerender":[{"where":{"and":[{"selector_matches":".views-bar-link"},{"not":{"href_matches":"/*.xml"}}]},"eagerness":"moderate"}]}</script>
    <script src="/js/views-ahead.js" defer="defer"></script>
  </xsl:template>

</xsl:stylesheet>
