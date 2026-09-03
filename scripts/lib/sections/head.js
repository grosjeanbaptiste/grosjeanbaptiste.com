const I18N = require('../i18n');
const { SITE_URL, LANGS, langPath } = require('../config');
const { escapeHtml } = require('../format');

const COUNTRY_NAMES = { BE: 'Belgium', FR: 'France', NL: 'Netherlands', LU: 'Luxembourg' };

function buildJsonLd(resume, lang, b, summary) {
  const sameAs = (b.profiles || []).map((p) => p.url).filter(Boolean);
  const alumniOf = (resume.education || [])
    .filter((e) => /Master|Bachelor|Máster|Bachelier|Bachelor of/i.test(e.studyType || ''))
    .map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution }));
  const currentWork = (resume.work || []).find((w) => !w.endDate || w.endDate === 'Present');
  const worksFor = currentWork
    ? {
        '@type': 'Organization',
        name: currentWork.company,
        ...(currentWork.url && { url: currentWork.url }),
      }
    : undefined;
  const hardSkills = resume.skills?.find((s) => s.name === 'HardSkills')?.keywords ?? [];
  const knowsLanguage = (resume.languages || []).map((l) => l.language);
  const knowsAbout = hardSkills.slice(0, 20);
  const [givenName, ...rest] = (b.name || '').split(' ');
  const familyName = rest.join(' ');
  const imageUrl = `${SITE_URL}/${(b.image || '').replace(/^\//, '')}`;
  const countryName = COUNTRY_NAMES[b.location?.countryCode] || b.location?.region || '';

  return {
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: b.name,
      givenName,
      familyName,
      jobTitle: b.label,
      description: summary,
      url: SITE_URL + langPath(lang),
      image: imageUrl,
      email: `mailto:${b.email}`,
      telephone: b.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: b.location?.city,
        addressRegion: b.location?.region,
        addressCountry: b.location?.countryCode,
      },
      ...(countryName && { nationality: { '@type': 'Country', name: countryName } }),
      sameAs,
      alumniOf,
      ...(worksFor && { worksFor }),
      knowsLanguage,
      knowsAbout,
      inLanguage: lang,
    },
    sameAs,
    givenName,
    familyName,
    imageUrl,
    hardSkills,
  };
}

function buildMeta(b, lang, description, ogTitle, imageUrl, t, hardSkills, brand) {
  const linkedinUrl =
    (b.profiles || []).map((p) => p.url).find((u) => /linkedin\.com/i.test(u || '')) || '';
  const linkedinUsername = linkedinUrl.split('/').filter(Boolean).pop() || '';
  const [givenName, ...rest] = (b.name || '').split(' ');
  const familyName = rest.join(' ');
  const keywords = hardSkills.slice(0, 18).join(', ');
  return [
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="author" content="${escapeHtml(b.name)}">`,
    `<meta name="keywords" content="${escapeHtml(keywords)}">`,
    '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">',
    '',
    '<!-- Browser chrome + PWA -->',
    '<meta name="color-scheme" content="light dark">',
    `<meta name="theme-color" content="${brand.primary}" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="${brand.darkBg}" media="(prefers-color-scheme: dark)">`,
    '<link rel="icon" href="/favicon.ico" sizes="any">',
    '<link rel="icon" type="image/svg+xml" href="/assets/icons/favicon.svg">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/favicon-180.png">',
    '<link rel="manifest" href="/manifest.webmanifest">',
    '',
    `<link rel="canonical" href="${SITE_URL}${langPath(lang)}">`,
    '',
    '<!-- Language alternates -->',
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE_URL}${langPath(l)}">`),
    `<link rel="alternate" hreflang="x-default" href="${SITE_URL}/">`,
    '',
    '<!-- Machine-readable alternates -->',
    '<link rel="alternate" type="application/json" title="Resume (JSON Resume v1.0.0)" href="/assets/data/resume.json">',
    `<link rel="alternate" type="application/xml" title="Resume (XML)" href="/assets/data/resume-${lang}.xml">`,
    `<link rel="alternate" type="application/pdf" title="CV (PDF)" href="/assets/cv/cv_grosjean_baptiste_${lang}.pdf">`,
    '',
    '<!-- Open Graph -->',
    '<meta property="og:type" content="profile">',
    '<meta property="og:site_name" content="grosjeanbaptiste.com">',
    `<meta property="og:title" content="${escapeHtml(ogTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${SITE_URL}${langPath(lang)}">`,
    `<meta property="og:image" content="${imageUrl}">`,
    `<meta property="og:locale" content="${t.htmlLocale}">`,
    ...LANGS.filter((l) => l !== lang).map(
      (l) => `<meta property="og:locale:alternate" content="${I18N[l].htmlLocale}">`,
    ),
    `<meta property="profile:first_name" content="${escapeHtml(givenName)}">`,
    `<meta property="profile:last_name" content="${escapeHtml(familyName)}">`,
    ...(linkedinUsername
      ? [`<meta property="profile:username" content="${escapeHtml(linkedinUsername)}">`]
      : []),
    '',
    '<!-- Twitter -->',
    '<meta name="twitter:card" content="summary">',
    `<meta name="twitter:title" content="${escapeHtml(ogTitle)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${imageUrl}">`,
  ];
}

function generateHead(resume, lang) {
  const t = I18N[lang];
  const b = resume.basics;
  if (!b) throw new Error('resume.json: missing "basics"');

  const summary = (b.summary || b.label || '').replace(/\s+/g, ' ').trim();
  const description = summary.length > 200 ? `${summary.slice(0, 197)}…` : summary;
  const ogTitle = `${b.name} — ${b.label}`;
  const pageTitle = `${b.name} | ${t.pageTitleSuffix}`;
  const { jsonld, imageUrl, hardSkills } = buildJsonLd(resume, lang, b, summary);
  const brand = resume.meta?.brand ?? {};
  const metaLines = buildMeta(b, lang, description, ogTitle, imageUrl, t, hardSkills, brand);

  return [
    `<title>${escapeHtml(pageTitle)}</title>`,
    '',
    ...metaLines,
    '',
    '<!-- JSON-LD structured data (schema.org Person) -->',
    '<script type="application/ld+json">',
    JSON.stringify(jsonld, null, 2),
    '</script>',
  ].join('\n');
}

module.exports = { generateHead };
