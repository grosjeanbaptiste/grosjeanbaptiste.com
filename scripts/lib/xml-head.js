// The page's metadata as the XML mirrors carry it (meta/head), for the XSLT
// themes to write what the classic page's <head> holds: description, Open
// Graph, Twitter, every hreflang, the machine-readable alternates and the
// schema.org Person. The same values as sections/head.js, which this reuses —
// XSLT 1.0 can neither shorten a summary nor build JSON.
const I18N = require('./i18n');
const { SITE_URL, LANGS, langPath } = require('./config');
const { buildJsonLd } = require('./sections/head');

function headForXml(resume, lang) {
  const t = I18N[lang];
  const b = resume.basics || {};
  const summary = (b.summary || b.label || '').replace(/\s+/g, ' ').trim();
  const { jsonld, imageUrl, hardSkills, givenName, familyName } = buildJsonLd(
    resume,
    lang,
    b,
    summary,
  );
  return {
    description: summary.length > 200 ? `${summary.slice(0, 197)}…` : summary,
    author: b.name,
    keywords: hardSkills.slice(0, 18).join(', '),
    ogTitle: `${b.name} — ${b.label}`,
    canonical: `${SITE_URL}${langPath(lang)}`,
    image: imageUrl,
    locale: t.htmlLocale,
    localeAlternates: LANGS.filter((l) => l !== lang).map((l) => I18N[l].htmlLocale),
    givenName,
    familyName,
    // `<` is escaped so that no text in the data can close the script element.
    jsonld: JSON.stringify(jsonld, null, 2).replace(/</g, '\\u003c'),
    alternates: [
      ...LANGS.map((l) => ({ lang: l, href: `${SITE_URL}${langPath(l)}` })),
      { lang: 'x-default', href: `${SITE_URL}/` },
    ],
  };
}

module.exports = { headForXml };
