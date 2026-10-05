// The id each CV entry carries on the classic page, so the timeline's bars can
// link to it. Kind-prefixed, so no entry can take a section's id (#experience).
const slug = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    // Every letter and digit of every script: Latin-only made two roles at one
    // employer, written in Chinese, share an id.
    .replace(/[^\p{L}\p{N}]+/gu, '-')
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
