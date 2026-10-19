// The skill filter as the XML mirrors carry it (meta/timeline/skillFilter), for
// the XSLT themes — which draw it with no script: a skill is a link to a
// target of its own (#skill-rust), and CSS dims the bars that do not name that
// skill while the target is the one in the URL. XSLT 1.0 can neither count nor
// build an id, so both are worked out here: each skill gets a token — its id
// and the word its bars are matched on — and each bar the tokens of its entry.
const { slug } = require('./anchors');
const { skillUsage } = require('./cv-index');

// Shown at first; the rest wait behind "All skills", as on the classic page.
const SHORTLIST = 18;

// A token per skill, each its own: "C", "C#" and "C++" all fold to "c".
function tokensFor(skills) {
  const taken = new Map();
  return new Map(
    skills.map((skill) => {
      const base = slug(skill) || 'skill';
      const met = (taken.get(base) ?? 0) + 1;
      taken.set(base, met);
      return [skill, met === 1 ? base : `${base}-${met}`];
    }),
  );
}

// `entries`: the CV's entries (cv-index.js); `drawn`: the ids of those the
// filter counts — those with a bar on the timeline or on the page. Gives the filter — undefined when it would be empty —
// and `tokensOf(entryId)`, what a bar of that entry carries.
function skillFilterForXml(entries, drawn, t) {
  const shown = entries.filter((entry) => drawn.has(entry.id));
  const usage = skillUsage(shown);
  const token = tokensFor(usage.map((used) => used.skill));
  const skills = usage.map(({ skill, uses }) => ({
    name: skill,
    token: token.get(skill),
    uses,
    said: t.matching(uses, skill),
  }));
  const byId = new Map(shown.map((entry) => [entry.id, entry]));
  const tokensOf = (id) =>
    byId
      .get(id)
      ?.skills.map((skill) => token.get(skill))
      .join(' ') || undefined;
  if (skills.length === 0) return { filter: undefined, tokensOf };
  const rest = skills.slice(SHORTLIST);
  const filter = {
    title: t.filterBySkill,
    clear: t.clearFilter,
    shortlist: skills.slice(0, SHORTLIST),
    ...(rest.length ? { more: `${t.allSkills} (${skills.length})`, rest } : {}),
  };
  return { filter, tokensOf };
}

module.exports = { skillFilterForXml };
