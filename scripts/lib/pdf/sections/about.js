const { tex } = require('../tex');

function buildAbout(resume, t) {
  const summary = resume.basics?.summary;
  if (!summary) return '';
  // Preserve paragraph breaks (\n\s*\n) — a blank line in the LaTeX source
  // is a paragraph break inside `quote`. Whitespace inside each paragraph
  // is collapsed so accidental indentation in resume.json doesn't bleed in.
  const paragraphs = summary
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((p) => tex(p))
    .join('\n\n');
  return [`\\cvsection{${tex(t.about)}}`, '\\begin{quote}', paragraphs, '\\end{quote}'].join('\n');
}

module.exports = { buildAbout };
