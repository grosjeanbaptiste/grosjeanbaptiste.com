// The id each CV entry carries on the classic page, so the timeline's bars can
// link to it. Kind-prefixed, so no entry can take a section's id (#experience).
const slug = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const PARTS = {
  work: (r) => [r.company, r.position],
  education: (r) => [r.institution, r.studyType],
  project: (r) => [r.name],
  volunteer: (r) => [r.organization, r.position],
};

const anchorOf = (kind, record) =>
  [kind, ...PARTS[kind](record).map(slug)].filter(Boolean).join('-');

module.exports = { anchorOf, slug };
