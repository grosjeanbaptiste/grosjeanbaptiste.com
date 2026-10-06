const { tex } = require('../tex');

// Only references survive onto the printed CV (the verso). The old
// buildVolunteer/buildProjects/buildAwards/buildInterests builders and their
// FIT_PLANS levers were never wired into document.js, so they were removed as
// dead code — volunteer/projects/awards/interests already surface on the HTML
// site, not the space-constrained PDF.
//
// They sit on the landscape verso under the timeline, in four columns across
// the page: one long column left most of the sheet's width unused.
function buildReferences(resume, t) {
  if (!resume.references?.length) return '';
  const parts = [`\\cvsection{${tex(t.references)}}`, '\\begin{multicols}{4}'];
  resume.references.forEach((r, i, arr) => {
    // \nobreak: a name is never left alone at the foot of a column.
    parts.push(`\\noindent\\textbf{${tex(r.name)}}\\par\\nobreak`);
    if (r.reference) {
      parts.push(`{\\color{accent}\\small\\itshape ${tex(r.reference)}\\par}`);
    }
    if (i < arr.length - 1) parts.push('\\medskip');
  });
  parts.push('\\end{multicols}');
  return parts.join('\n');
}

module.exports = { buildReferences };
