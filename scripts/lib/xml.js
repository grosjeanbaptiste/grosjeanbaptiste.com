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

function generateXml(resume, themePath = '../xslt/resume-transform.xsl', lang = 'en') {
  // Inject <meta><lang> so the XSLT can pick up which language to render.
  const tagged = { ...resume, meta: { ...(resume.meta || {}), lang } };
  const body = emitXml('resume', tagged, 0);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="${themePath}"?>\n${body}\n`;
}

module.exports = { generateXml };
