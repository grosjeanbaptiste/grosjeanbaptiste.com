#!/usr/bin/env node
/**
 * Regenerates the LLM-friendly <head> section of index.html from resume.json.
 * Replaces content between LLM-HEAD markers. Idempotent.
 *
 * Usage (run from the repo root):
 *   node scripts/generate-llm-head.js
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.grosjeanbaptiste.com';
const ROOT = path.resolve(__dirname, '..');
const RESUME_PATH = path.join(ROOT, 'assets/data/resume.json');
const INDEX_PATH = path.join(ROOT, 'index.html');

const START = '<!-- LLM-HEAD:START — generated from assets/data/resume.json, do not edit by hand -->';
const END = '<!-- LLM-HEAD:END -->';

const escape = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const indent = (s, n) =>
  s.split('\n').map((l) => ' '.repeat(n) + l).join('\n');

const resume = JSON.parse(fs.readFileSync(RESUME_PATH, 'utf8'));
const b = resume.basics;
if (!b) throw new Error('resume.json: missing "basics"');

const summary = (b.summary || b.label || '').replace(/\s+/g, ' ').trim();
const description = summary.length > 200 ? summary.slice(0, 197) + '…' : summary;
const ogTitle = `${b.name} — ${b.label}`;
const pageTitle = `${ogTitle} | CV`;

const hardSkills = resume.skills?.find((s) => s.name === 'HardSkills')?.keywords ?? [];
const keywords = hardSkills.slice(0, 18).join(', ');

const sameAs = (b.profiles || []).map((p) => p.url).filter(Boolean);
const linkedinUrl = sameAs.find((u) => /linkedin\.com/i.test(u)) || '';
const linkedinUsername = linkedinUrl.split('/').filter(Boolean).pop() || '';

const alumniOf = (resume.education || [])
  .filter((e) => /Master|Bachelor/i.test(e.studyType || ''))
  .map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution }));

const currentWork = (resume.work || []).find(
  (w) => !w.endDate || w.endDate === 'Present',
);
const worksFor = currentWork
  ? {
      '@type': 'Organization',
      name: currentWork.company,
      ...(currentWork.url && { url: currentWork.url }),
    }
  : undefined;

const knowsLanguage = (resume.languages || []).map((l) => l.language);
const knowsAbout = hardSkills.slice(0, 20);

const [givenName, ...rest] = (b.name || '').split(' ');
const familyName = rest.join(' ');
const imageUrl = `${SITE_URL}/${(b.image || '').replace(/^\//, '')}`;

const COUNTRY_NAMES = { BE: 'Belgium', FR: 'France', NL: 'Netherlands', LU: 'Luxembourg' };
const countryName = COUNTRY_NAMES[b.location?.countryCode] || b.location?.region || '';

const jsonld = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: b.name,
  givenName,
  familyName,
  jobTitle: b.label,
  description: summary,
  url: SITE_URL,
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
};

const lines = [
  `  <title>${escape(pageTitle)}</title>`,
  '',
  `  <meta name="description" content="${escape(description)}">`,
  `  <meta name="author" content="${escape(b.name)}">`,
  `  <meta name="keywords" content="${escape(keywords)}">`,
  '  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">',
  '',
  `  <link rel="canonical" href="${SITE_URL}/">`,
  '',
  '  <!-- Machine-readable alternates -->',
  '  <link rel="alternate" type="application/json" title="Resume (JSON Resume v1.0.0)" href="/assets/data/resume.json">',
  '  <link rel="alternate" type="application/xml" title="Resume (XML)" href="/assets/data/resume.xml">',
  '  <link rel="alternate" type="application/pdf" title="CV (PDF)" href="/assets/cv/cv_grosjean_baptiste_en.pdf">',
  '',
  '  <!-- Open Graph -->',
  '  <meta property="og:type" content="profile">',
  '  <meta property="og:site_name" content="grosjeanbaptiste.com">',
  `  <meta property="og:title" content="${escape(ogTitle)}">`,
  `  <meta property="og:description" content="${escape(description)}">`,
  `  <meta property="og:url" content="${SITE_URL}/">`,
  `  <meta property="og:image" content="${imageUrl}">`,
  '  <meta property="og:locale" content="en_US">',
  `  <meta property="profile:first_name" content="${escape(givenName)}">`,
  `  <meta property="profile:last_name" content="${escape(familyName)}">`,
  ...(linkedinUsername
    ? [`  <meta property="profile:username" content="${escape(linkedinUsername)}">`]
    : []),
  '',
  '  <!-- Twitter -->',
  '  <meta name="twitter:card" content="summary">',
  `  <meta name="twitter:title" content="${escape(ogTitle)}">`,
  `  <meta name="twitter:description" content="${escape(description)}">`,
  `  <meta name="twitter:image" content="${imageUrl}">`,
  '',
  '  <!-- JSON-LD structured data (schema.org Person) -->',
  '  <script type="application/ld+json">',
  indent(JSON.stringify(jsonld, null, 2), 2),
  '  </script>',
];

const block = lines.join('\n');

const html = fs.readFileSync(INDEX_PATH, 'utf8');
const re = new RegExp(
  `(${START.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})[\\s\\S]*?(${END.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`,
);

if (!re.test(html)) {
  console.error(`error: markers not found in ${INDEX_PATH}`);
  console.error(`expected: ${START}`);
  console.error(`         ${END}`);
  process.exit(1);
}

const updated = html.replace(re, `$1\n${block}\n  $2`);

if (updated === html) {
  console.log('LLM head: no changes');
  process.exit(0);
}

fs.writeFileSync(INDEX_PATH, updated);
console.log('LLM head: regenerated');
