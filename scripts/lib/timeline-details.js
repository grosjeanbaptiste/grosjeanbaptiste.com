// What a bar of the timeline tells beyond its name and its dates: a project
// says what kind of project it is and the parts taken in it, what it was and
// what it was built with; any other entry its summary. The bar reads the kind beside the name; the rest is
// for the preview (js/timeline.js) and for whoever hears the bar's name.
const SEPARATOR = ' · ';
// The preview is a glance: the first few of what a project was built with.
const MAX_SKILLS = 5;

const NOTHING = { type: '', detail: '', summary: '', skills: '' };
// What an entry says of itself, for the preview: a job its summary, a degree
// its note, a role or a competition its summary — whatever the data has.
const summarised = (summary) => ({ summary: summary || '' });
const TELLS = {
  work: (w) => ({
    ...summarised(w.summary),
    skills: (w.uses || w.keywords || []).slice(0, MAX_SKILLS).join(SEPARATOR),
  }),
  education: (e) => ({
    ...summarised(e.summary || e.note),
    skills: (e.uses || []).slice(0, MAX_SKILLS).join(SEPARATOR),
  }),
  volunteer: (v) => summarised(v.summary),
  competition: (c) => summarised(c.summary || c.description),
  project: (p) => ({
    type: p.type || '',
    detail: [p.type, ...(p.roles || [])].filter(Boolean).join(SEPARATOR),
    summary: p.description || '',
    skills: (p.keywords || []).slice(0, MAX_SKILLS).join(SEPARATOR),
  }),
};

// Every kind of entry answers: the kinds with nothing more to tell say so.
const detailsOf = (kind, record) => ({ ...NOTHING, ...TELLS[kind]?.(record) });
// What a bar reads when its name is all it has to go by: a project's kind
// tells two bars of one product apart ("Acteble API · API").
const readingOf = (bar) =>
  bar.type ? `${bar.name}${SEPARATOR}${bar.type}` : bar.name || bar.title;
// The attributes a page hands the preview: only what the bar does tell.
const TOLD = ['detail', 'summary', 'skills'];
const toldBy = (bar) => TOLD.filter((key) => bar[key]).map((key) => [key, bar[key]]);

// The entry a bar stands for, by the id it carries on the page: a block of a
// degree stands for its degree, any other bar for its own entry.
const standsFor = (bar) => (bar.kind === 'block' ? bar.host.anchor : bar.anchor);

module.exports = { detailsOf, readingOf, toldBy, standsFor };
