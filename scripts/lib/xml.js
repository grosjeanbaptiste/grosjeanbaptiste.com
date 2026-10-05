const { viewsOf } = require('./views');
const { anchorOf } = require('./anchors');
const { timelineForXml } = require('./xml-timeline');
const I18N = require('./i18n');
const { highestObtainedDegree, highestInProgressDegree, formatDegreeLine } = require('./degrees');

const XML_ITEM_NAMES = {
  work: 'job',
  education: 'school',
  volunteer: 'volunteer-item',
  projects: 'project',
  awards: 'award',
  skills: 'skill',
  languages: 'language-item',
  interests: 'interest',
  references: 'reference',
  profiles: 'profile',
  highlights: 'highlight',
  keywords: 'keyword',
  courses: 'course',
  roles: 'role',
  sectionOrder: 'section',
  sidebarOrder: 'section',
  views: 'view',
  zooms: 'zoom',
  ticks: 'tick',
  lanes: 'lane',
  bars: 'bar',
  groups: 'group',
};

const xmlEsc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function emitXml(name, value, depth) {
  const pad = '  '.repeat(depth);
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const itemName = XML_ITEM_NAMES[name] || 'item';
    const items = value
      .map((v) => emitXml(itemName, v, depth + 1))
      .filter(Boolean)
      .join('\n');
    return items ? `${pad}<${name}>\n${items}\n${pad}</${name}>` : null;
  }
  if (typeof value === 'object') {
    const inner = Object.keys(value)
      .filter((k) => !k.startsWith('_') && !k.startsWith('$'))
      .map((k) => emitXml(k, value[k], depth + 1))
      .filter(Boolean)
      .join('\n');
    return inner ? `${pad}<${name}>\n${inner}\n${pad}</${name}>` : null;
  }
  if (value === '') return null;
  return `${pad}<${name}>${xmlEsc(value)}</${name}>`;
}

function generateXml(
  resume,
  themePath = '../xslt/resume-transform.xsl',
  lang = 'en',
  today = new Date(),
) {
  // Inject <meta><lang> and <meta><degrees>{inProgress,obtained} so the XSLT
  // can render the "highest degree" summary lines that the HTML site shows —
  // XSLT 1.0 has no reliable current-date primitive, so we pre-compute here.
  const inProgress = formatDegreeLine(highestInProgressDegree(resume.education), lang);
  const obtained = formatDegreeLine(highestObtainedDegree(resume.education), lang);
  const degrees = {};
  if (inProgress) degrees.inProgress = inProgress;
  if (obtained) degrees.obtained = obtained;
  // The views bar the XSLT themes draw, from the same registry as every display.
  const meta = {
    ...(resume.meta || {}),
    lang,
    viewsTitle: I18N[lang].views.title,
    views: viewsOf(lang),
    // Laid out here: XSLT 1.0 cannot compute it (see xml-timeline.js).
    timeline: timelineForXml(resume, lang, today),
  };
  if (Object.keys(degrees).length) meta.degrees = degrees;
  // Each job and degree carries the id the themes give it, for the timeline's
  // bars to link to.
  const anchored = (kind, entries) =>
    (entries || []).map((e) => ({ ...e, anchor: anchorOf(kind, e) }));
  const tagged = {
    ...resume,
    work: anchored('work', resume.work),
    education: anchored('education', resume.education),
    meta,
  };
  const body = emitXml('resume', tagged, 0);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="${themePath}"?>\n${body}\n`;
}

module.exports = { generateXml };
