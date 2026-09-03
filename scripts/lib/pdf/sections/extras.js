const { tex } = require('../tex');

// Only references survive onto the printed CV (the verso). The old
// buildVolunteer/buildProjects/buildAwards/buildInterests builders and their
// FIT_PLANS levers were never wired into document.js, so they were removed as
// dead code — volunteer/projects/awards/interests already surface on the HTML
// site, not the space-constrained PDF.
function buildReferences(resume, t) {
  if (!resume.references?.length) return '';
  const parts = [`\\cvsection{${tex(t.references)}}`];
  resume.references.forEach((r, i, arr) => {
    parts.push(`\\textbf{${tex(r.name)}}\\\\`);
    if (r.reference) {
      parts.push(`\\begin{quote}\\small\\itshape ${tex(r.reference)}\\end{quote}`);
    }
    if (i < arr.length - 1) parts.push('\\medskip');
  });
  return parts.join('\n');
}

module.exports = { buildReferences };
