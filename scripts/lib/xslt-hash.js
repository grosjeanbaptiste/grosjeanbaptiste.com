// Firefox caches XSLT stylesheets very aggressively: the XML mirrors name their
// theme with a short content hash, so that the URL changes whenever the
// stylesheet does. The stylesheets both themes include count too: a change to
// one must change the URL of the theme, or the browser keeps the old copy of
// what it includes.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./config');

const XSLT_INCLUDES = [
  'skill-filter.xsl',
  'head-meta.xsl',
  'entry-panel.xsl',
  'timeline-zoom.xsl',
  'search.xsl',
  'pdf-reader.xsl',
];

const xsltHash = (rel) =>
  crypto
    .createHash('sha1')
    .update(
      [path.basename(rel), ...XSLT_INCLUDES]
        .map((f) => fs.readFileSync(path.join(ROOT, 'assets/xslt', f)))
        .join(''),
    )
    .digest('hex')
    .slice(0, 8);

module.exports = { xsltHash };
