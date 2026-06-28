const { tex, truncate } = require('../tex');

function buildAbout(resume, t, limits) {
  if (!resume.basics?.summary) return '';
  return [
    `\\cvsection{${tex(t.about)}}`,
    '\\begin{quote}',
    tex(truncate(resume.basics.summary, limits.summary)),
    '\\end{quote}',
  ].join('\n');
}

module.exports = { buildAbout };
