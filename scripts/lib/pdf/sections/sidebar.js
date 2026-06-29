const { tex, nohyphen } = require('../tex');

function buildSkillsBlock(resume, t) {
  // The "Currently Learning" sidebar block is intentionally omitted in the
  // PDF (kept in the HTML site, available in resume.json). Saves vertical
  // space in the narrow left column.
  const hard = (resume.skills || []).find((s) => s.name === 'HardSkills');
  const soft = (resume.skills || []).find((s) => s.name === 'SoftSkills');
  const parts = [];
  const tagLine = (kw) =>
    `\\noindent\\raggedright{\\small ${kw.map((k) => `\\cvtag{${tex(k)}}`).join(' ')}}\\par`;
  if (hard?.keywords?.length) {
    parts.push(`\\cvsectionsidebar{${nohyphen(t.technicalSkills)}}`);
    parts.push(tagLine(hard.keywords));
  }
  if (soft?.keywords?.length) {
    parts.push(`\\cvsectionsidebar{${nohyphen(t.softSkills)}}`);
    parts.push(tagLine(soft.keywords));
  }
  return parts.join('\n');
}

function buildLanguagesBlock(resume, t) {
  if (!resume.languages?.length) return '';
  // Compact one-line-per-language layout: name in bold, fluency in accent
  // colour on the same line. Saves ~6 lines vs the two-line+divider
  // variant, which is what lets Education + day chart still fit on a
  // single recto.
  const items = resume.languages
    .map(
      (l) =>
        `\\noindent\\raggedright{\\footnotesize\\textcolor{emphasis}{\\bfseries\\mbox{${tex(l.language)}}} — \\textcolor{accent}{${tex(l.fluency)}}}\\par`,
    )
    .join('\n');
  return [`\\cvsectionsidebar{${nohyphen(t.languages)}}`, items].join('\n');
}

// Wheelchart style per slice index (separator + accent shade). Order matches
// the slices declared in resume.json:meta.dailyLife.items. The 10em
// separator on the 4th slice visually splits the chart, mimicking the
// original hand-tuned layout.
const WHEEL_STYLES = [
  '1em/accent!30',
  '1em/accent!40',
  '1em/accent!60',
  '10em/accent',
  '1em/accent',
  '1em/accent!20',
];

function buildDayBlock(resume, t) {
  const items = resume.meta?.dailyLife?.items || [];
  if (!items.length) return '';
  const slices = items.map((item, i) => {
    const style = WHEEL_STYLES[i] || WHEEL_STYLES[WHEEL_STYLES.length - 1];
    const label = t.dailyLifeLabels[item.key] || item.key;
    const tail = i === items.length - 1 ? '%' : ',';
    return `    ${item.hours}/${style}/${tex(label)}${tail}`;
  });
  return [
    `\\cvsectionsidebar{${nohyphen(t.typicalDay)}}`,
    '\\wheelchart{1cm}{0.4cm}{%',
    ...slices,
    '}',
  ].join('\n');
}

module.exports = { buildSkillsBlock, buildLanguagesBlock, buildDayBlock };
