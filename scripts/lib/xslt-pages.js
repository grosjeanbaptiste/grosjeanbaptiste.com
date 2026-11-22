// The XSLT themes as plain HTML pages, beside the XML mirrors they come from:
// assets/data/resume-{lang}[-minimal].html. Chrome and Safari no longer apply
// client-side XSLT (Chrome 157 shows an empty document), so the views bar leads
// to these, drawn here with xsltproc from the same stylesheet and the same XML;
// the XML keeps its <?xml-stylesheet?> for the browsers that still apply it.
// xsltproc writes no doctype, which would leave the page in quirks mode.
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { ROOT } = require('./config');

const SHEETS = { rich: 'resume-transform.xsl', minimal: 'resume-transform-minimal.xsl' };

function renderPage(theme, xmlPath) {
  const sheet = path.join(ROOT, 'assets/xslt', SHEETS[theme]);
  const html = execFileSync('xsltproc', [sheet, xmlPath], {
    encoding: 'utf8',
    maxBuffer: 1 << 26,
  });
  return `<!DOCTYPE html>\n${html}`;
}

module.exports = { renderPage };
