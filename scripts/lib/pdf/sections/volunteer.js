const { tex, nohyphen, formatDate } = require('../tex');
const { sortByRecency } = require('../data');

// Volunteering in the PDF.
//
// The item shape deliberately mirrors renderProjectList in ./_trailer.js:
// \textbf{name} — details, one \item per row in a tight itemize. Volunteer
// entries carry no description, so the details slot holds the organization
// and the period instead.
// One role as a list item. Under the entry that hosts it the organisation is
// already said, so only the standalone section names it.
function roleItem(v, lang, { organisation = true } = {}) {
  const period = `${formatDate(v.startDate, lang)} -- ${formatDate(v.endDate, lang)}`;
  // \mbox: the column is narrow, and a long translated position pushed the
  // period past its edge. TeX then broke it at the last space and left the
  // year stranded on the next line — visible in nl and es only, because the
  // other four fitted. Atomic, it wraps whole or not at all.
  const where = organisation ? `${tex(v.organization)}, ` : '';
  return `    \\item \\textbf{${tex(v.position)}} — ${where}\\mbox{${tex(period)}}`;
}

// The roles as a section of their own. The CV now shows a role inside the
// experience or the degree that hosts it (./_trailer.js); this section is what
// is left for the roles nothing hosts, so that none is dropped.
function buildVolunteer(resume, t, lang) {
  const entries = sortByRecency(resume.volunteer || []);
  if (!entries.length) return '';
  const items = entries.map((v) => roleItem(v, lang));
  return [
    `\\cvsectionsidebar{${nohyphen(t.volunteer)}}`,
    '{\\footnotesize',
    '\\begin{itemize}\\itemsep=0pt',
    ...items,
    '\\end{itemize}}',
  ].join('\n');
}

module.exports = { buildVolunteer, roleItem };
