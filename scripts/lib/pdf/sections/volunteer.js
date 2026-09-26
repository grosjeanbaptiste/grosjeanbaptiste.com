const { tex, nohyphen, formatDate } = require('../tex');
const { sortByRecency } = require('../data');

// Volunteering, rendered in the verso's left column — the one part of the
// sheet that was blank, since the references after \switchcolumn occupy the
// right column only. Costs no page.
//
// The item shape deliberately mirrors renderProjectList in ./_trailer.js:
// \textbf{name} — details, one \item per row in a tight itemize. Volunteer
// entries carry no description, so the details slot holds the organization
// and the period instead.
function buildVolunteer(resume, t, lang) {
  const entries = sortByRecency(resume.volunteer || []);
  if (!entries.length) return '';
  const items = entries.map((v) => {
    const period = `${formatDate(v.startDate, lang)} -- ${formatDate(v.endDate, lang)}`;
    return `    \\item \\textbf{${tex(v.position)}} — ${tex(v.organization)}, ${tex(period)}`;
  });
  return [
    `\\cvsectionsidebar{${nohyphen(t.volunteer)}}`,
    '{\\footnotesize',
    '\\begin{itemize}\\itemsep=0pt',
    ...items,
    '\\end{itemize}}',
  ].join('\n');
}

module.exports = { buildVolunteer };
