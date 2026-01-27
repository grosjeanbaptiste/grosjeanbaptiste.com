<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/resume">
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Resume (XML)</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; }
          h1 { margin-bottom: 4px; }
          .muted { color: #666; }
        </style>
      </head>
      <body>
        <h1><xsl:value-of select="basics/name" /></h1>
        <div class="muted"><xsl:value-of select="basics/label" /></div>
        <p><xsl:value-of select="basics/summary" /></p>
        <p class="muted">This is a minimal XML transform. The HTML site remains the primary presentation.</p>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
