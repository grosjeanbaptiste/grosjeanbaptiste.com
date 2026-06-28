const indentLines = (s, n) =>
  s
    .split('\n')
    .map((l) => (l ? ' '.repeat(n) + l : ''))
    .join('\n');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const MARKERS = {
  'LLM-HEAD': {
    start: '<!-- LLM-HEAD:START — generated from assets/data/resume.json, do not edit by hand -->',
    end: '<!-- LLM-HEAD:END -->',
    indent: 2,
  },
  NAV: {
    start:
      '<!-- NAV:START — generated from assets/data/resume.json + i18n, do not edit by hand -->',
    end: '<!-- NAV:END -->',
    indent: 2,
  },
  'BODY-SIDEBAR': {
    start:
      '<!-- BODY-SIDEBAR:START — generated from assets/data/resume.json, do not edit by hand -->',
    end: '<!-- BODY-SIDEBAR:END -->',
    indent: 6,
  },
  'BODY-MAIN': {
    start: '<!-- BODY-MAIN:START — generated from assets/data/resume.json, do not edit by hand -->',
    end: '<!-- BODY-MAIN:END -->',
    indent: 6,
  },
  'CV-DOWNLOAD': {
    start:
      '<!-- CV-DOWNLOAD:START — generated from assets/data/resume.json + i18n, do not edit by hand -->',
    end: '<!-- CV-DOWNLOAD:END -->',
    indent: 2,
  },
  'DAILY-LIFE': {
    start:
      '<!-- DAILY-LIFE:START — generated from assets/data/resume.json + i18n, do not edit by hand -->',
    end: '<!-- DAILY-LIFE:END -->',
    indent: 6,
  },
};

function replaceBetween(html, marker, content) {
  const re = new RegExp(`(${escapeRegex(marker.start)})[\\s\\S]*?(${escapeRegex(marker.end)})`);
  if (!re.test(html)) throw new Error(`marker not found: ${marker.start}`);
  const indented = indentLines(content, marker.indent);
  const endIndent = ' '.repeat(marker.indent);
  return html.replace(re, `$1\n${indented}\n${endIndent}$2`);
}

module.exports = { MARKERS, indentLines, replaceBetween };
