#!/usr/bin/env node
/**
 * Regenerates the four language variants of index.html from resume.json
 * and the i18n overlays in assets/data/i18n/.
 *
 * Outputs:
 *   /index.html        (en, canonical)
 *   /fr/index.html
 *   /nl/index.html
 *   /es/index.html
 *
 * Replaces four marker blocks per page: LLM-HEAD, NAV, BODY-SIDEBAR, BODY-MAIN.
 * `<html lang>` is patched per language.
 *
 * Usage (from repo root): node scripts/generate-from-resume.js
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.grosjeanbaptiste.com';
const ROOT = path.resolve(__dirname, '..');
const RESUME_PATH = path.join(ROOT, 'assets/data/resume.json');
const I18N_DIR = path.join(ROOT, 'assets/data/i18n');
const TEMPLATE_PATH = path.join(ROOT, 'index.html');

const LANGS = ['en', 'fr', 'nl', 'es'];

const MARKERS = {
  'LLM-HEAD': {
    start: '<!-- LLM-HEAD:START — generated from assets/data/resume.json, do not edit by hand -->',
    end: '<!-- LLM-HEAD:END -->',
    indent: 2,
  },
  'NAV': {
    start: '<!-- NAV:START — generated from assets/data/resume.json + i18n, do not edit by hand -->',
    end: '<!-- NAV:END -->',
    indent: 2,
  },
  'BODY-SIDEBAR': {
    start: '<!-- BODY-SIDEBAR:START — generated from assets/data/resume.json, do not edit by hand -->',
    end: '<!-- BODY-SIDEBAR:END -->',
    indent: 6,
  },
  'BODY-MAIN': {
    start: '<!-- BODY-MAIN:START — generated from assets/data/resume.json, do not edit by hand -->',
    end: '<!-- BODY-MAIN:END -->',
    indent: 6,
  },
};

// ----------------------------------------------------------- localization

const I18N = {
  en: {
    htmlLocale: 'en_US',
    about: 'About Me',
    experience: 'Work Experience',
    education: 'Education',
    volunteer: 'Volunteer',
    projects: 'Projects',
    awards: 'Awards',
    interests: 'Interests',
    references: 'References',
    contact: 'Contact',
    contactCTA: 'Reach out by email, phone, or through any of these profiles.',
    technicalSkills: 'Technical Skills',
    currentlyLearning: 'Currently Learning',
    softSkills: 'Soft Skills',
    languages: 'Languages',
    typicalDay: 'Typical Day',
    viewProject: 'View project',
    role: 'Role',
    type: 'Type',
    keywords: 'Keywords',
    driverLicense: 'Driver License B',
    menuLabel: 'Menu',
    themeLabel: 'Toggle theme',
    darkMode: 'Dark mode',
    langMenuLabel: 'Language',
    pageTitleSuffix: 'CV',
    inProgress: 'in progress',
    xmlResume: 'CV (XML + XSLT)',
    firefoxNote: 'best viewed in Firefox',
    nav: { about: 'About', experience: 'Experience', education: 'Education', projects: 'Projects', references: 'References', contact: 'Contact' },
  },
  fr: {
    htmlLocale: 'fr_FR',
    about: 'À propos',
    experience: 'Expérience professionnelle',
    education: 'Éducation',
    volunteer: 'Bénévolat',
    projects: 'Projets',
    awards: 'Distinctions',
    interests: "Centres d'intérêt",
    references: 'Références',
    contact: 'Contact',
    contactCTA: "Contactez-moi par e-mail, par téléphone, ou via l'un de ces profils.",
    technicalSkills: 'Compétences techniques',
    currentlyLearning: "En cours d'apprentissage",
    softSkills: 'Compétences personnelles',
    languages: 'Langues',
    typicalDay: 'Une journée type',
    viewProject: 'Voir le projet',
    role: 'Rôle',
    type: 'Type',
    keywords: 'Mots-clés',
    driverLicense: 'Permis B',
    menuLabel: 'Menu',
    themeLabel: 'Basculer le thème',
    darkMode: 'Mode sombre',
    langMenuLabel: 'Langue',
    pageTitleSuffix: 'CV',
    inProgress: 'en cours',
    xmlResume: 'CV (XML + XSLT)',
    firefoxNote: 'à ouvrir avec Firefox',
    nav: { about: 'À propos', experience: 'Expérience', education: 'Éducation', projects: 'Projets', references: 'Références', contact: 'Contact' },
  },
  nl: {
    htmlLocale: 'nl_BE',
    about: 'Over mij',
    experience: 'Werkervaring',
    education: 'Opleiding',
    volunteer: 'Vrijwilligerswerk',
    projects: 'Projecten',
    awards: 'Onderscheidingen',
    interests: 'Interesses',
    references: 'Referenties',
    contact: 'Contact',
    contactCTA: 'Neem contact op via e-mail, telefoon of een van deze profielen.',
    technicalSkills: 'Technische vaardigheden',
    currentlyLearning: 'Op dit moment aan het leren',
    softSkills: 'Persoonlijke vaardigheden',
    languages: 'Talen',
    typicalDay: 'Een typische dag',
    viewProject: 'Bekijk project',
    role: 'Rol',
    type: 'Type',
    keywords: 'Trefwoorden',
    driverLicense: 'Rijbewijs B',
    menuLabel: 'Menu',
    themeLabel: 'Thema wisselen',
    darkMode: 'Donkere modus',
    langMenuLabel: 'Taal',
    pageTitleSuffix: 'CV',
    inProgress: 'in uitvoering',
    xmlResume: 'CV (XML + XSLT)',
    firefoxNote: 'best te bekijken in Firefox',
    nav: { about: 'Over', experience: 'Ervaring', education: 'Opleiding', projects: 'Projecten', references: 'Referenties', contact: 'Contact' },
  },
  es: {
    htmlLocale: 'es_ES',
    about: 'Sobre mí',
    experience: 'Experiencia laboral',
    education: 'Educación',
    volunteer: 'Voluntariado',
    projects: 'Proyectos',
    awards: 'Premios',
    interests: 'Intereses',
    references: 'Referencias',
    contact: 'Contacto',
    contactCTA: 'Contáctame por correo, teléfono o a través de cualquiera de estos perfiles.',
    technicalSkills: 'Habilidades técnicas',
    currentlyLearning: 'Aprendiendo actualmente',
    softSkills: 'Habilidades personales',
    languages: 'Idiomas',
    typicalDay: 'Un día típico',
    viewProject: 'Ver proyecto',
    role: 'Rol',
    type: 'Tipo',
    keywords: 'Palabras clave',
    driverLicense: 'Permiso de conducir B',
    menuLabel: 'Menú',
    themeLabel: 'Cambiar tema',
    darkMode: 'Modo oscuro',
    langMenuLabel: 'Idioma',
    pageTitleSuffix: 'CV',
    inProgress: 'en curso',
    xmlResume: 'CV (XML + XSLT)',
    firefoxNote: 'mejor visto en Firefox',
    nav: { about: 'Sobre', experience: 'Experiencia', education: 'Educación', projects: 'Proyectos', references: 'Referencias', contact: 'Contacto' },
  },
};

const langPath = (lang) => (lang === 'en' ? '/' : `/${lang}/`);
const langOutFile = (lang) =>
  lang === 'en' ? TEMPLATE_PATH : path.join(ROOT, lang, 'index.html');

// --------------------------------------------------------- helpers

const escape = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const indentLines = (s, n) =>
  s.split('\n').map((l) => (l ? ' '.repeat(n) + l : '')).join('\n');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LOCALIZED = {
  en: MONTHS,
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  nl: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
};
const formatDate = (iso, lang = 'en') => {
  if (!iso) return { en: 'Present', fr: 'Aujourd’hui', nl: 'Heden', es: 'Actualidad' }[lang];
  if (iso === 'Present') return { en: 'Present', fr: 'Aujourd’hui', nl: 'Heden', es: 'Actualidad' }[lang];
  const [y, m] = iso.split('-');
  if (m) return `${MONTHS_LOCALIZED[lang][parseInt(m, 10) - 1]} ${y}`;
  return y;
};

const ISO_DATE_RE = /^\d{4}(-\d{2}){0,2}$/;
const timeHtml = (iso, lang) => {
  if (!iso || iso === 'Present')
    return `<time>${escape(formatDate(iso, lang))}</time>`;
  if (ISO_DATE_RE.test(iso))
    return `<time datetime="${iso}">${escape(formatDate(iso, lang))}</time>`;
  return `<time>${escape(iso)}</time>`;
};
const dateRangeHtml = (start, end, lang) =>
  `${timeHtml(start, lang)} – ${timeHtml(end, lang)}`;

const PROFILE_ICONS = {
  linkedin: 'fab fa-linkedin',
  github: 'fab fa-github',
  npm: 'fab fa-npm',
  twitter: 'fab fa-x-twitter',
  x: 'fab fa-x-twitter',
  bluesky: 'fas fa-cloud',
  mastodon: 'fab fa-mastodon',
  stackoverflow: 'fab fa-stack-overflow',
};
const profileIcon = (net) =>
  PROFILE_ICONS[(net || '').toLowerCase()] || 'fas fa-link';

const DEGREE_SCORE = (st) => {
  if (!st) return 0;
  if (/master|MSc?\b|MA\b/i.test(st)) return 4;
  if (/bachelor|bachelier|BSc|BA\b/i.test(st)) return 3;
  if (/attestation|certificat/i.test(st)) return 2;
  if (/CESS|cours|secondaire/i.test(st)) return 1;
  return 0;
};

// Ranks education entries by degree level (Master > Bachelor > Attestation >
// CESS > other), ties broken by most recent endDate (or startDate when no end).
function rankDegrees(entries) {
  return [...entries].sort((a, b) => {
    const ds = DEGREE_SCORE(b.studyType) - DEGREE_SCORE(a.studyType);
    if (ds !== 0) return ds;
    return (b.endDate || b.startDate || '').localeCompare(a.endDate || a.startDate || '');
  });
}

function highestObtainedDegree(education) {
  const today = new Date().toISOString().slice(0, 10);
  const completed = (education || []).filter(
    (e) => e.endDate && e.endDate !== 'Present' && e.endDate <= today,
  );
  return rankDegrees(completed)[0] || null;
}

function highestInProgressDegree(education) {
  const today = new Date().toISOString().slice(0, 10);
  const ongoing = (education || []).filter(
    (e) => !e.endDate || e.endDate === 'Present' || e.endDate > today,
  );
  return rankDegrees(ongoing)[0] || null;
}

function formatDegreeLine(degree, lang) {
  if (!degree) return null;
  const parts = [degree.studyType, degree.area].filter(Boolean);
  if (!parts.length) return null;
  const sep = lang === 'en' ? ' in ' : ' — ';
  return parts.join(sep);
}

// Deep merge: overlay values overwrite base. Arrays are merged element-wise.
function deepMerge(base, overlay) {
  if (overlay === null || overlay === undefined) return base;
  if (Array.isArray(base) && Array.isArray(overlay)) {
    return base.map((b, i) => deepMerge(b, overlay[i]));
  }
  if (typeof base === 'object' && base !== null && typeof overlay === 'object' && !Array.isArray(overlay)) {
    const out = { ...base };
    for (const k of Object.keys(overlay)) {
      if (k.startsWith('_')) continue; // skip _meta-style keys
      out[k] = deepMerge(base?.[k], overlay[k]);
    }
    return out;
  }
  return overlay;
}

function loadResume(lang) {
  const canonical = JSON.parse(fs.readFileSync(RESUME_PATH, 'utf8'));
  if (lang === 'en') return canonical;
  const overlayPath = path.join(I18N_DIR, `${lang}.json`);
  if (!fs.existsSync(overlayPath)) {
    console.warn(`warning: no overlay for ${lang}, falling back to en`);
    return canonical;
  }
  const overlay = JSON.parse(fs.readFileSync(overlayPath, 'utf8'));
  return deepMerge(canonical, overlay);
}

// ----------------------------------------------------------------- HEAD

function generateHead(resume, lang) {
  const t = I18N[lang];
  const b = resume.basics;
  if (!b) throw new Error('resume.json: missing "basics"');

  const summary = (b.summary || b.label || '').replace(/\s+/g, ' ').trim();
  const description = summary.length > 200 ? summary.slice(0, 197) + '…' : summary;
  const ogTitle = `${b.name} — ${b.label}`;
  const pageTitle = `${ogTitle} | ${t.pageTitleSuffix}`;

  const hardSkills = resume.skills?.find((s) => s.name === 'HardSkills')?.keywords ?? [];
  const keywords = hardSkills.slice(0, 18).join(', ');

  const sameAs = (b.profiles || []).map((p) => p.url).filter(Boolean);
  const linkedinUrl = sameAs.find((u) => /linkedin\.com/i.test(u)) || '';
  const linkedinUsername = linkedinUrl.split('/').filter(Boolean).pop() || '';

  const alumniOf = (resume.education || [])
    .filter((e) => /Master|Bachelor|Máster|Bachelier|Bachelor of/i.test(e.studyType || ''))
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
  };

  const hreflangs = LANGS.map((l) =>
    `<link rel="alternate" hreflang="${l}" href="${SITE_URL}${langPath(l)}">`,
  );
  hreflangs.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/">`);

  return [
    `<title>${escape(pageTitle)}</title>`,
    '',
    `<meta name="description" content="${escape(description)}">`,
    `<meta name="author" content="${escape(b.name)}">`,
    `<meta name="keywords" content="${escape(keywords)}">`,
    '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">',
    '',
    `<link rel="canonical" href="${SITE_URL}${langPath(lang)}">`,
    '',
    '<!-- Language alternates -->',
    ...hreflangs,
    '',
    '<!-- Machine-readable alternates -->',
    '<link rel="alternate" type="application/json" title="Resume (JSON Resume v1.0.0)" href="/assets/data/resume.json">',
    '<link rel="alternate" type="application/xml" title="Resume (XML)" href="/assets/data/resume.xml">',
    '<link rel="alternate" type="application/pdf" title="CV (PDF)" href="/assets/cv/cv_grosjean_baptiste_en.pdf">',
    '',
    '<!-- Open Graph -->',
    '<meta property="og:type" content="profile">',
    '<meta property="og:site_name" content="grosjeanbaptiste.com">',
    `<meta property="og:title" content="${escape(ogTitle)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:url" content="${SITE_URL}${langPath(lang)}">`,
    `<meta property="og:image" content="${imageUrl}">`,
    `<meta property="og:locale" content="${t.htmlLocale}">`,
    ...LANGS.filter((l) => l !== lang).map(
      (l) => `<meta property="og:locale:alternate" content="${I18N[l].htmlLocale}">`,
    ),
    `<meta property="profile:first_name" content="${escape(givenName)}">`,
    `<meta property="profile:last_name" content="${escape(familyName)}">`,
    ...(linkedinUsername
      ? [`<meta property="profile:username" content="${escape(linkedinUsername)}">`]
      : []),
    '',
    '<!-- Twitter -->',
    '<meta name="twitter:card" content="summary">',
    `<meta name="twitter:title" content="${escape(ogTitle)}">`,
    `<meta name="twitter:description" content="${escape(description)}">`,
    `<meta name="twitter:image" content="${imageUrl}">`,
    '',
    '<!-- JSON-LD structured data (schema.org Person) -->',
    '<script type="application/ld+json">',
    JSON.stringify(jsonld, null, 2),
    '</script>',
  ].join('\n');
}

// ------------------------------------------------------------ NAV

function generateNav(lang) {
  const t = I18N[lang];
  const navItems = [
    { id: 'about', label: t.nav.about },
    { id: 'experience', label: t.nav.experience },
    { id: 'education', label: t.nav.education },
    { id: 'projects', label: t.nav.projects },
    { id: 'references', label: t.nav.references },
    { id: 'contact', label: t.nav.contact },
  ];
  const navLinks = navItems
    .map((i) => `    <li><a href="#${i.id}" class="nav-link">${escape(i.label)}</a></li>`)
    .join('\n');
  const langLinks = LANGS.map((l) => {
    const cls = l === lang ? ' class="active"' : '';
    const aria = l === lang ? ' aria-current="page"' : '';
    return `    <a href="${langPath(l)}" hreflang="${l}"${cls}${aria}>${l.toUpperCase()}</a>`;
  }).join('\n');
  return [
    '<nav>',
    `  <button class="menu-toggle" aria-label="${escape(t.menuLabel)}" id="menu-toggle">`,
    '    <i class="fas fa-bars"></i>',
    '  </button>',
    '  <ul id="nav-menu">',
    navLinks,
    '  </ul>',
    `  <div class="lang-switcher" aria-label="${escape(t.langMenuLabel)}">`,
    langLinks,
    '  </div>',
    `  <button id="theme-toggle" aria-label="${escape(t.themeLabel)}">`,
    '    <i class="fas fa-moon"></i>',
    `    <span>${escape(t.darkMode)}</span>`,
    '  </button>',
    '</nav>',
  ].join('\n');
}

// ------------------------------------------------------------ SIDEBAR

function generateSidebar(resume, lang) {
  const t = I18N[lang];
  const b = resume.basics;
  const profiles = b.profiles || [];

  const profileLines = profiles.map((p) => {
    const icon = profileIcon(p.network);
    const label = p.network || p.url;
    return `  <p><i class="${icon}"></i> <a href="${escape(p.url)}">${escape(label)}</a></p>`;
  });

  const inProgressLine = formatDegreeLine(highestInProgressDegree(resume.education), lang);
  const obtainedLine = formatDegreeLine(highestObtainedDegree(resume.education), lang);
  const degreeLines = [];
  if (inProgressLine) {
    degreeLines.push(
      `  <p class="degree degree-in-progress"><i class="fas fa-book-open" aria-hidden="true"></i> ${escape(inProgressLine)} <span class="degree-status">(${escape(t.inProgress)})</span></p>`,
    );
  }
  if (obtainedLine) {
    degreeLines.push(
      `  <p class="degree degree-obtained"><i class="fas fa-graduation-cap" aria-hidden="true"></i> ${escape(obtainedLine)}</p>`,
    );
  }
  const contactInfo = [
    '<div class="contact-info">',
    `  <h1>${escape(b.name)}</h1>`,
    `  <h2>${escape(b.label)}</h2>`,
    ...degreeLines,
    `  <p><i class="fas fa-envelope"></i> <a href="mailto:${escape(b.email)}">${escape(b.email)}</a></p>`,
    `  <p><i class="fas fa-phone"></i> ${escape(b.phone)}</p>`,
    `  <p><i class="fas fa-map-marker-alt"></i> ${escape(b.location?.city)}, ${escape(b.location?.countryCode)}</p>`,
    ...profileLines,
    `  <p><i class="fas fa-car"></i> ${escape(t.driverLicense)}</p>`,
    '</div>',
  ].join('\n');

  const SKILL_CATEGORIES = [
    { name: 'HardSkills', title: t.technicalSkills },
    { name: 'Learning', title: t.currentlyLearning },
    { name: 'SoftSkills', title: t.softSkills },
  ];

  const skillsBlocks = SKILL_CATEGORIES
    .map(({ name, title }) => {
      const cat = (resume.skills || []).find((s) => s.name === name);
      if (!cat || !cat.keywords?.length) return null;
      const tags = cat.keywords
        .map((k) => `      <span class="skill-tag">${escape(k)}</span>`)
        .join('\n');
      return [
        '<div class="skills">',
        `  <h2>${escape(title)}</h2>`,
        '  <div class="skill-category">',
        '    <div class="skill-tags">',
        tags,
        '    </div>',
        '  </div>',
        '</div>',
      ].join('\n');
    })
    .filter(Boolean)
    .join('\n\n');

  const languages = (resume.languages || [])
    .map((l) => `  <p>${escape(l.language)}: ${escape(l.fluency)}</p>`)
    .join('\n');
  const languagesBlock = [
    '<div class="languages">',
    `  <h2>${escape(t.languages)}</h2>`,
    languages,
    '</div>',
  ].join('\n');

  return [contactInfo, '', skillsBlocks, '', languagesBlock].join('\n');
}

// --------------------------------------------------------------- MAIN

function generateMain(resume, lang) {
  const t = I18N[lang];
  const sections = [];

  // About
  const summaryParas = (resume.basics?.summary || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `  <p>${escape(p)}</p>`)
    .join('\n');
  sections.push([
    '<section id="about">',
    `  <h2>${escape(t.about)}</h2>`,
    summaryParas,
    '</section>',
  ].join('\n'));

  // Experience
  if (resume.work?.length) {
    const items = resume.work.map((w) => {
      const companyHtml = w.company
        ? (w.url
            ? `<a href="${escape(w.url)}" target="_blank" rel="noopener">${escape(w.company)}</a>`
            : escape(w.company))
        : '';
      const parts = [
        '<article class="experience-item">',
        `  <h3>${escape(w.position)}${w.company ? ' | ' + companyHtml : ''}</h3>`,
        `  <p class="date">${dateRangeHtml(w.startDate, w.endDate, lang)}</p>`,
      ];
      if (w.location) parts.push(`  <p class="location">${escape(w.location)}</p>`);
      if (w.summary) parts.push(`  <p>${escape(w.summary).replace(/\n/g, '<br>')}</p>`);
      (w.highlights || []).forEach((h) => parts.push(`  <p>• ${escape(h)}</p>`));
      parts.push('</article>');
      return parts.join('\n');
    });
    sections.push([
      '<section id="experience">',
      `  <h2>${escape(t.experience)}</h2>`,
      items.map((i) => indentLines(i, 2)).join('\n'),
      '</section>',
    ].join('\n'));
  }

  // Education
  if (resume.education?.length) {
    const items = resume.education.map((e) => {
      const parts = [
        '<article class="education-item">',
        `  <h3>${escape(e.studyType)}${e.area ? (lang === 'en' ? ' in ' : ' — ') + escape(e.area) : ''}</h3>`,
        `  <p class="institution">${escape(e.institution)}</p>`,
        `  <p class="date">${dateRangeHtml(e.startDate, e.endDate, lang)}</p>`,
      ];
      if (e.gpa) parts.push(`  <p>${escape(e.gpa)}</p>`);
      if (e.summary) parts.push(`  <p>${escape(e.summary).replace(/\n/g, '<br>')}</p>`);
      parts.push('</article>');
      return parts.join('\n');
    });
    sections.push([
      '<section id="education">',
      `  <h2>${escape(t.education)}</h2>`,
      items.map((i) => indentLines(i, 2)).join('\n'),
      '</section>',
    ].join('\n'));
  }

  // Volunteer
  if (resume.volunteer?.length) {
    const items = resume.volunteer.map((v) => {
      const orgHtml = v.organization
        ? (v.url
            ? `<a href="${escape(v.url)}" target="_blank" rel="noopener">${escape(v.organization)}</a>`
            : escape(v.organization))
        : '';
      const parts = [
        '<article class="experience-item">',
        `  <h3>${escape(v.position)}${v.organization ? ' | ' + orgHtml : ''}</h3>`,
        `  <p class="date">${dateRangeHtml(v.startDate, v.endDate, lang)}</p>`,
      ];
      if (v.summary) parts.push(`  <p>${escape(v.summary)}</p>`);
      parts.push('</article>');
      return parts.join('\n');
    });
    sections.push([
      '<section id="volunteer">',
      `  <h2>${escape(t.volunteer)}</h2>`,
      items.map((i) => indentLines(i, 2)).join('\n'),
      '</section>',
    ].join('\n'));
  }

  // Projects
  if (resume.projects?.length) {
    const items = resume.projects.map((p) => {
      const parts = [
        '<article class="project-item">',
        `  <h3>${escape(p.name)}</h3>`,
        `  <p class="date">${dateRangeHtml(p.startDate, p.endDate, lang)}</p>`,
      ];
      const desc = p.summary || p.description;
      if (desc) parts.push(`  <p>${escape(desc)}</p>`);
      if (p.type) parts.push(`  <p>${escape(t.type)}: ${escape(p.type)}</p>`);
      if (p.roles?.length) parts.push(`  <p>${escape(t.role)}: ${escape(p.roles.join(', '))}</p>`);
      if (p.keywords?.length)
        parts.push(`  <p>${escape(t.keywords)}: ${escape(p.keywords.join(', '))}</p>`);
      if (p.url) parts.push(`  <a href="${escape(p.url)}">${escape(t.viewProject)}</a>`);
      parts.push('</article>');
      return parts.join('\n');
    });
    sections.push([
      '<section id="projects">',
      `  <h2>${escape(t.projects)}</h2>`,
      items.map((i) => indentLines(i, 2)).join('\n'),
      '</section>',
    ].join('\n'));
  }

  // Awards
  if (resume.awards?.length) {
    const items = resume.awards.map((a) => {
      const parts = [
        '<article class="education-item">',
        `  <h3>${escape(a.title)}</h3>`,
        `  <p class="date">${timeHtml(a.date, lang)}</p>`,
      ];
      const detail = [a.awarder, a.summary].filter(Boolean).join(' — ');
      if (detail) parts.push(`  <p>${escape(detail)}</p>`);
      parts.push('</article>');
      return parts.join('\n');
    });
    sections.push([
      '<section id="awards">',
      `  <h2>${escape(t.awards)}</h2>`,
      items.map((i) => indentLines(i, 2)).join('\n'),
      '</section>',
    ].join('\n'));
  }

  // Interests
  if (resume.interests?.length) {
    const items = resume.interests.map((i) => {
      const parts = [
        '<article class="education-item">',
        `  <h3>${escape(i.name)}</h3>`,
      ];
      if (i.keywords?.length) parts.push(`  <p>${escape(i.keywords.join(', '))}</p>`);
      parts.push('</article>');
      return parts.join('\n');
    });
    sections.push([
      '<section id="interests">',
      `  <h2>${escape(t.interests)}</h2>`,
      items.map((i) => indentLines(i, 2)).join('\n'),
      '</section>',
    ].join('\n'));
  }

  // References
  if (resume.references?.length) {
    const items = resume.references.map((r) => [
      '<article class="reference-item">',
      `  <p><strong>${escape(r.name)}</strong></p>`,
      `  <blockquote>${escape(r.reference).replace(/\n/g, '<br>')}</blockquote>`,
      '</article>',
    ].join('\n'));
    sections.push([
      '<section id="references">',
      `  <h2>${escape(t.references)}</h2>`,
      items.map((i) => indentLines(i, 2)).join('\n'),
      '</section>',
    ].join('\n'));
  }

  // Contact
  const b = resume.basics;
  const phoneDigits = (b.phone || '').replace(/[^+\d]/g, '');
  const contactLines = [
    `  <p><i class="fas fa-envelope"></i> <a href="mailto:${escape(b.email)}">${escape(b.email)}</a></p>`,
  ];
  if (phoneDigits) {
    contactLines.push(
      `  <p><i class="fas fa-phone"></i> <a href="tel:${escape(phoneDigits)}">${escape(b.phone)}</a></p>`,
    );
  }
  (b.profiles || []).forEach((p) => {
    contactLines.push(
      `  <p><i class="${profileIcon(p.network)}"></i> <a href="${escape(p.url)}" rel="me">${escape(p.network)}</a></p>`,
    );
  });
  contactLines.push(
    `  <p><i class="fas fa-code"></i> <a href="/assets/data/resume.xml">${escape(t.xmlResume)}</a> <span class="muted-inline">(${escape(t.firefoxNote)})</span></p>`,
  );
  sections.push([
    '<section id="contact">',
    `  <h2>${escape(t.contact)}</h2>`,
    `  <p>${escape(t.contactCTA)}</p>`,
    contactLines.join('\n'),
    '</section>',
  ].join('\n'));

  return sections.join('\n\n');
}

// ---------------------------------------------------------- XML mirror

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

function generateXml(resume) {
  const body = emitXml('resume', resume, 0);
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="../xslt/resume-transform.xsl"?>
${body}
`;
}

// ---------------------------------------------------------- MAIN FLOW

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceBetween(html, marker, content) {
  const re = new RegExp(
    `(${escapeRegex(marker.start)})[\\s\\S]*?(${escapeRegex(marker.end)})`,
  );
  if (!re.test(html)) {
    throw new Error(`marker not found: ${marker.start}`);
  }
  const indented = indentLines(content, marker.indent);
  const endIndent = ' '.repeat(marker.indent);
  return html.replace(re, `$1\n${indented}\n${endIndent}$2`);
}

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

// Always read the template from the canonical EN file on disk.
// If it was previously generated for another lang, the markers still match.
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

let wrote = 0;
for (const lang of LANGS) {
  const resume = loadResume(lang);
  let html = template;

  // Patch <html lang>
  html = html.replace(/<html\s+lang="[^"]*">/, `<html lang="${lang}">`);

  // Replace markers
  html = replaceBetween(html, MARKERS['LLM-HEAD'], generateHead(resume, lang));
  html = replaceBetween(html, MARKERS['NAV'], generateNav(lang));
  html = replaceBetween(html, MARKERS['BODY-SIDEBAR'], generateSidebar(resume, lang));
  html = replaceBetween(html, MARKERS['BODY-MAIN'], generateMain(resume, lang));

  const outPath = langOutFile(lang);
  ensureDir(outPath);
  const previous = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
  if (previous !== html) {
    fs.writeFileSync(outPath, html);
    wrote += 1;
  }
  console.log(`${lang}: ${path.relative(ROOT, outPath)}`);
}

// Regenerate XML mirror from canonical EN
const canonical = loadResume('en');
const xmlPath = path.join(ROOT, 'assets/data/resume.xml');
const newXml = generateXml(canonical);
const previousXml = fs.existsSync(xmlPath) ? fs.readFileSync(xmlPath, 'utf8') : '';
if (previousXml !== newXml) {
  fs.writeFileSync(xmlPath, newXml);
  wrote += 1;
}
console.log(`xml: assets/data/resume.xml`);

console.log(`generate-from-resume: ${wrote} file(s) updated`);
