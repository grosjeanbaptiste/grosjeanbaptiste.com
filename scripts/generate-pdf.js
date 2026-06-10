#!/usr/bin/env node
/**
 * Render and compile assets/cv/cv_grosjean_baptiste_<lang>.pdf for every
 * language (en, fr, nl, es) from assets/data/resume.json + i18n overlays,
 * using the altacv LaTeX class shipped in latex/altacv.cls.
 *
 * Pure stdlib Node (no external deps). pdflatex on PATH required.
 *
 * Run from the repo root: node scripts/generate-pdf.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const RESUME_PATH = path.join(ROOT, 'assets/data/resume.json');
const I18N_DIR = path.join(ROOT, 'assets/data/i18n');
const CLS_PATH = path.join(ROOT, 'latex/altacv.cls');
const PROFILE_IMG = path.join(ROOT, 'assets/images/profil.jpeg');
const OUTPUT_DIR = path.join(ROOT, 'assets/cv');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const LANGS = ['en', 'fr', 'nl', 'es', 'de', 'zh'];

const BABEL = { en: 'english', fr: 'french', nl: 'dutch', es: 'spanish', de: 'german', zh: 'english' };
// zh skips babel's CJK option (poor support); xeCJK handles Chinese typography.
const NEEDS_CJK = (lang) => lang === 'zh';

// Iterative "fit" plans: ordered from generous to ultra-tight. The compiler
// tries each plan in turn until the recto fits on one page (so the whole
// PDF is exactly 2 pages: recto + verso references).
const FIT_PLANS = [
  { work: 5, education: 3, volunteer: 2, projects: 4, awards: 2, interests: 2, summary: 260, highlight: 180, hl_per_work: 2, kw_per_proj: 6, proj_desc: 140, show_skills: true },
  { work: 4, education: 3, volunteer: 1, projects: 3, awards: 1, interests: 1, summary: 220, highlight: 150, hl_per_work: 1, kw_per_proj: 5, proj_desc: 120, show_skills: true },
  { work: 4, education: 2, volunteer: 0, projects: 3, awards: 1, interests: 1, summary: 180, highlight: 120, hl_per_work: 1, kw_per_proj: 4, proj_desc: 100, show_skills: true },
  { work: 3, education: 2, volunteer: 0, projects: 2, awards: 1, interests: 0, summary: 160, highlight: 0, hl_per_work: 0, kw_per_proj: 0, proj_desc: 80, show_skills: true },
  { work: 3, education: 2, volunteer: 0, projects: 1, awards: 0, interests: 0, summary: 140, highlight: 0, hl_per_work: 0, kw_per_proj: 0, proj_desc: 60, show_skills: false },
  { work: 2, education: 2, volunteer: 0, projects: 1, awards: 0, interests: 0, summary: 120, highlight: 0, hl_per_work: 0, kw_per_proj: 0, proj_desc: 50, show_skills: false },
];
// Active plan — mutated by the fit loop in main().
let LIMITS = FIT_PLANS[0];

const I18N = {
  en: {
    technicalSkills: 'Technical Skills', currentlyLearning: 'Currently Learning', softSkills: 'Soft Skills',
    languages: 'Languages', typicalDay: 'A Day of My Life',
    about: 'About Me', experience: 'Experience', education: 'Education', volunteer: 'Volunteer',
    projects: 'Projects', awards: 'Awards', interests: 'Interests', references: 'References',
    present: 'present', degreeIn: 'in', gpa: 'GPA', type: 'Type', keywords: 'Keywords',
    driverLicense: 'Driving Licence B', updated: 'Updated',
    day: { sleep: 'Sleep', transport: 'Transport', work: 'Work', courses: 'Classes', sport: 'Sport', home: 'Home' },
  },
  fr: {
    technicalSkills: 'Compétences techniques', currentlyLearning: "En cours d'apprentissage", softSkills: 'Compétences personnelles',
    languages: 'Langues', typicalDay: 'Une journée type',
    about: 'À propos', experience: 'Expérience', education: 'Éducation', volunteer: 'Bénévolat',
    projects: 'Projets', awards: 'Distinctions', interests: "Centres d'intérêt", references: 'Références',
    present: "aujourd'hui", degreeIn: '—', gpa: 'Note', type: 'Type', keywords: 'Mots-clés',
    driverLicense: 'Permis B', updated: 'Mis à jour le',
    day: { sleep: 'Repos', transport: 'Transport', work: 'Travail', courses: 'Cours', sport: 'Sport', home: 'Maison' },
  },
  nl: {
    technicalSkills: 'Technische vaardigheden', currentlyLearning: 'Op dit moment aan het leren', softSkills: 'Persoonlijke vaardigheden',
    languages: 'Talen', typicalDay: 'Een typische dag',
    about: 'Over mij', experience: 'Werkervaring', education: 'Opleiding', volunteer: 'Vrijwilligerswerk',
    projects: 'Projecten', awards: 'Onderscheidingen', interests: 'Interesses', references: 'Referenties',
    present: 'heden', degreeIn: '—', gpa: 'Score', type: 'Type', keywords: 'Trefwoorden',
    driverLicense: 'Rijbewijs B', updated: 'Bijgewerkt',
    day: { sleep: 'Slaap', transport: 'Vervoer', work: 'Werk', courses: 'Lessen', sport: 'Sport', home: 'Thuis' },
  },
  es: {
    technicalSkills: 'Habilidades técnicas', currentlyLearning: 'Aprendiendo actualmente', softSkills: 'Habilidades personales',
    languages: 'Idiomas', typicalDay: 'Un día típico',
    about: 'Sobre mí', experience: 'Experiencia', education: 'Educación', volunteer: 'Voluntariado',
    projects: 'Proyectos', awards: 'Premios', interests: 'Intereses', references: 'Referencias',
    present: 'actualidad', degreeIn: '—', gpa: 'Nota', type: 'Tipo', keywords: 'Palabras clave',
    driverLicense: 'Permiso de conducir B', updated: 'Actualizado',
    day: { sleep: 'Sueño', transport: 'Transporte', work: 'Trabajo', courses: 'Clases', sport: 'Deporte', home: 'Casa' },
  },
  de: {
    technicalSkills: 'Technische Fähigkeiten', currentlyLearning: 'Lerne gerade', softSkills: 'Soziale Kompetenzen',
    languages: 'Sprachen', typicalDay: 'Ein typischer Tag',
    about: 'Über mich', experience: 'Berufserfahrung', education: 'Ausbildung', volunteer: 'Ehrenamt',
    projects: 'Projekte', awards: 'Auszeichnungen', interests: 'Interessen', references: 'Referenzen',
    present: 'heute', degreeIn: '—', gpa: 'Note', type: 'Typ', keywords: 'Stichwörter',
    driverLicense: 'Führerschein B', updated: 'Aktualisiert',
    day: { sleep: 'Schlaf', transport: 'Transport', work: 'Arbeit', courses: 'Vorlesungen', sport: 'Sport', home: 'Zuhause' },
  },
  zh: {
    technicalSkills: '技术技能', currentlyLearning: '正在学习', softSkills: '软技能',
    languages: '语言', typicalDay: '我的一天',
    about: '关于我', experience: '工作经验', education: '教育', volunteer: '志愿者',
    projects: '项目', awards: '奖项', interests: '兴趣', references: '推荐人',
    present: '至今', degreeIn: '—', gpa: '成绩', type: '类型', keywords: '关键词',
    driverLicense: 'B类驾照', updated: '更新于',
    day: { sleep: '睡眠', transport: '通勤', work: '工作', courses: '上课', sport: '运动', home: '居家' },
  },
};

// ---------- helpers ----------

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  nl: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  de: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'],
  zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
};

// Wrap each word in \mbox{} so it can't be hyphenated. Used for narrow-column
// section titles where the default French/Dutch/Spanish hyphenation breaks
// long words like "COMPÉTENCES TECHNIQUES" into "COMPÉTENCES TECH-/NIQUES".
function nohyphen(value) {
  if (!value) return '';
  return String(value)
    .split(/(\s+)/)
    .map((part) => (part.trim() === '' ? part : `\\mbox{${tex(part)}}`))
    .join('');
}

function tex(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

function formatDate(iso, lang) {
  if (!iso || iso === 'Present') return I18N[lang].present;
  const m = /^(\d{4})(?:-(\d{2}))?(?:-\d{2})?$/.exec(String(iso));
  if (!m) return tex(iso);
  if (!m[2]) return m[1];
  return `${MONTHS[lang][parseInt(m[2], 10) - 1]} ${m[1]}`;
}

function deepMerge(base, overlay) {
  if (overlay === null || overlay === undefined) return base;
  if (Array.isArray(base) && Array.isArray(overlay)) {
    return base.map((b, i) => deepMerge(b, overlay[i]));
  }
  if (base && typeof base === 'object' && overlay && typeof overlay === 'object' && !Array.isArray(overlay)) {
    const out = { ...base };
    for (const k of Object.keys(overlay)) {
      if (k.startsWith('_')) continue;
      out[k] = deepMerge(base?.[k], overlay[k]);
    }
    return out;
  }
  return overlay;
}

function truncate(s, n) {
  if (!s) return '';
  const str = String(s).replace(/\s+/g, ' ').trim();
  if (str.length <= n) return str;
  return str.slice(0, n - 1).trimEnd() + '…';
}

// Sort entries with most recent first (using endDate, falling back to
// startDate). Items lacking dates land at the bottom.
function sortByRecency(arr) {
  return [...arr].sort((a, b) => {
    const keyA = a.endDate || a.startDate || a.date || '';
    const keyB = b.endDate || b.startDate || b.date || '';
    return String(keyB).localeCompare(String(keyA));
  });
}

function topN(arr, n) {
  return sortByRecency(arr || []).slice(0, n);
}

function loadResume(lang) {
  const canonical = JSON.parse(fs.readFileSync(RESUME_PATH, 'utf8'));
  if (lang === 'en') return canonical;
  const overlay = path.join(I18N_DIR, `${lang}.json`);
  if (!fs.existsSync(overlay)) return canonical;
  return deepMerge(canonical, JSON.parse(fs.readFileSync(overlay, 'utf8')));
}

// ---------- LaTeX builders ----------

const PROFILE_INFO = {
  linkedin: (u) => `\\linkedin{${tex(u)}}`,
  github: (u) => `\\github{${tex(u)}}`,
  npm: (u) => `\\printinfo{\\faNpm}{${tex(u)}}`,
};

function buildHeader(resume, t) {
  const b = resume.basics || {};
  const profiles = (b.profiles || [])
    .map((p) => {
      const fn = PROFILE_INFO[(p.network || '').toLowerCase()];
      return fn ? fn(p.username || p.url || '') : '';
    })
    .filter(Boolean)
    .join('\n    ');
  const loc = [b.location?.city, b.location?.region].filter(Boolean).map(tex).join(', ');
  return [
    `\\name{${tex(b.name)}}`,
    `\\tagline{${tex(b.label)}}`,
    `\\photoL{4cm}{profil}`,
    `\\personalinfo{%`,
    `    \\email{${tex(b.email)}}\\smallskip`,
    `    \\phone{${tex(b.phone)}}`,
    `    \\location{${loc}}\\\\`,
    `    ${profiles}`,
    `    \\printinfo{\\faCar}{${tex(t.driverLicense)}}`,
    `    \\begin{center}\\printinfo{\\faRedo}{${tex(t.updated)} \\today}\\end{center}`,
    `}`,
    `\\makecvheader`,
  ].join('\n');
}

function buildSkillsBlock(resume, t) {
  const hard = (resume.skills || []).find((s) => s.name === 'HardSkills');
  const soft = (resume.skills || []).find((s) => s.name === 'SoftSkills');
  // The "Currently Learning" sidebar block is intentionally omitted in the
  // PDF (kept in the HTML site, available in resume.json). Saves vertical
  // space in the narrow left column.
  const parts = [];
  const tagLine = (kw) =>
    `\\noindent\\raggedright{\\small ${kw.map((k) => `\\cvtag{${tex(k)}}`).join(' ')}}\\par`;
  if (hard?.keywords?.length) {
    parts.push(`\\cvsectionsidebar{${nohyphen(t.technicalSkills)}}`);
    parts.push(tagLine(hard.keywords));
  }
  if (soft?.keywords?.length) {
    parts.push(`\\cvsectionsidebar{${nohyphen(t.softSkills)}}`);
    parts.push(tagLine(soft.keywords));
  }
  return parts.join('\n');
}

function buildLanguagesBlock(resume, t) {
  if (!resume.languages?.length) return '';
  // Vertical layout: language name (bold, emphasis color) on line 1,
  // fluency (small, accent color) on line 2. Consistent regardless of the
  // length combination — no more "Anglais:" stranded above its fluency.
  const items = resume.languages
    .map((l, i, arr) => {
      const block = [
        `\\noindent\\raggedright{\\textcolor{emphasis}{\\bfseries\\mbox{${tex(l.language)}}}}\\par`,
        `\\noindent\\raggedright{\\footnotesize\\textcolor{accent}{${tex(l.fluency)}}}\\par`,
      ].join('\n');
      return i < arr.length - 1 ? `${block}\n\\smallskip\\divider` : block;
    })
    .join('\n');
  return [`\\cvsectionsidebar{${nohyphen(t.languages)}}`, items].join('\n');
}

function buildDayBlock(t) {
  const d = t.day;
  return [
    `\\cvsectionsidebar{${nohyphen(t.typicalDay)}}`,
    `\\wheelchart{1cm}{0.4cm}{%`,
    `    7/1em/accent!30/${tex(d.sleep)},`,
    `    2/1em/accent!40/${tex(d.transport)},`,
    `    9/1em/accent!60/${tex(d.work)},`,
    `    3/10em/accent/${tex(d.courses)},`,
    `    1/1em/accent/${tex(d.sport)},`,
    `    6/1em/accent!20/${tex(d.home)}%`,
    `}`,
  ].join('\n');
}

function buildAbout(resume, t) {
  if (!resume.basics?.summary) return '';
  return [
    `\\cvsection{${tex(t.about)}}`,
    `\\begin{quote}`,
    tex(truncate(resume.basics.summary, LIMITS.summary)),
    `\\end{quote}`,
  ].join('\n');
}

function findProject(resume, name) {
  return (resume.projects || []).find((p) => p.name === name);
}

function buildWork(resume, t, lang) {
  const selected = topN(resume.work, LIMITS.work);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.experience)}}`];
  selected.forEach((w, i, arr) => {
    const start = formatDate(w.startDate, lang);
    const end = formatDate(w.endDate, lang);
    // Reserve vertical space so the header is never orphaned at a column edge.
    parts.push(`\\par\\needspace{5\\baselineskip}`);
    parts.push(
      `\\cvevent{${tex(w.position)}}{| ${tex(w.company)}}{${tex(start)} -- ${tex(end)}}{${tex(w.location || '')}}`,
    );
    if (w.summary) {
      parts.push(`\\begin{itemize}\\item ${tex(truncate(w.summary, LIMITS.summary))}\\end{itemize}`);
    }
    if (LIMITS.show_skills && w.skills?.length) {
      const tags = w.skills.map((s) => `\\cvtag{${tex(s)}}`).join(' ');
      parts.push(`\\par\\nobreak\\noindent{\\footnotesize ${tags}}\\par\\nobreak\\smallskip`);
    }
    const projs = (w.projects || []).map((n) => findProject(resume, n)).filter(Boolean);
    if (projs.length) {
      parts.push(`\\par\\nobreak\\noindent{\\footnotesize\\textbf{${tex(t.projects)}:}`);
      parts.push(`\\begin{itemize}\\itemsep=0pt`);
      projs.forEach((p) => {
        const desc = p.summary || p.description || '';
        parts.push(`    \\item \\textbf{${tex(p.name)}}${desc ? ' — ' + tex(truncate(desc, LIMITS.proj_desc)) : ''}`);
      });
      parts.push(`\\end{itemize}}`);
    }
    if (i < arr.length - 1) parts.push(`\\divider`);
  });
  return parts.join('\n');
}

function buildEducation(resume, t, lang) {
  const selected = topN(resume.education, LIMITS.education);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.education)}}`];
  selected.forEach((e, i, arr) => {
    const start = formatDate(e.startDate, lang);
    const end = formatDate(e.endDate, lang);
    const title = e.area ? `${tex(e.studyType)} ${tex(t.degreeIn)} ${tex(e.area)}` : tex(e.studyType);
    parts.push(`\\par\\needspace{5\\baselineskip}`);
    parts.push(
      `\\cvevent{${title}}{| ${tex(e.institution)}}{${tex(start)} -- ${tex(end)}}{}`,
    );
    const bullets = [];
    if (e.gpa) bullets.push(`${tex(t.gpa)}: ${tex(e.gpa)}`);
    if (e.summary) bullets.push(tex(truncate(e.summary, LIMITS.summary)));
    if (bullets.length) {
      parts.push(`\\begin{itemize}`);
      bullets.forEach((b) => parts.push(`    \\item ${b}`));
      parts.push(`\\end{itemize}`);
    }
    if (LIMITS.show_skills && e.skills?.length) {
      const tags = e.skills.map((s) => `\\cvtag{${tex(s)}}`).join(' ');
      parts.push(`\\par\\nobreak\\noindent{\\footnotesize ${tags}}\\par\\nobreak\\smallskip`);
    }
    const projs = (e.projects || []).map((n) => findProject(resume, n)).filter(Boolean);
    if (projs.length) {
      parts.push(`\\par\\nobreak\\noindent{\\footnotesize\\textbf{${tex(t.projects)}:}`);
      parts.push(`\\begin{itemize}\\itemsep=0pt`);
      projs.forEach((p) => {
        const desc = p.summary || p.description || '';
        parts.push(`    \\item \\textbf{${tex(p.name)}}${desc ? ' — ' + tex(truncate(desc, LIMITS.proj_desc)) : ''}`);
      });
      parts.push(`\\end{itemize}}`);
    }
    if (i < arr.length - 1) parts.push(`\\divider`);
  });
  return parts.join('\n');
}

function buildVolunteer(resume, t, lang) {
  const selected = topN(resume.volunteer, LIMITS.volunteer);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.volunteer)}}`];
  selected.forEach((v, i, arr) => {
    const start = formatDate(v.startDate, lang);
    const end = formatDate(v.endDate, lang);
    parts.push(
      `\\cvevent{${tex(v.position)}}{| ${tex(v.organization)}}{${tex(start)} -- ${tex(end)}}{}`,
    );
    if (v.summary) {
      parts.push(`\\begin{itemize}\n    \\item ${tex(v.summary)}\n\\end{itemize}`);
    }
    if (i < arr.length - 1) parts.push(`\\divider`);
  });
  return parts.join('\n');
}

function buildProjects(resume, t, lang) {
  const selected = topN(resume.projects, LIMITS.projects);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.projects)}}`];
  selected.forEach((p, i, arr) => {
    const start = formatDate(p.startDate, lang);
    const end = formatDate(p.endDate, lang);
    parts.push(
      `\\cvevent{${tex(p.name)}}{}{${tex(start)} -- ${tex(end)}}{${tex(p.type || '')}}`,
    );
    const bullets = [];
    const desc = p.summary || p.description;
    if (desc) bullets.push(tex(truncate(desc, LIMITS.summary)));
    if (LIMITS.kw_per_proj > 0 && p.keywords?.length) {
      bullets.push(`${tex(t.keywords)}: ${tex(p.keywords.slice(0, LIMITS.kw_per_proj).join(', '))}`);
    }
    if (bullets.length) {
      parts.push(`\\begin{itemize}`);
      bullets.forEach((b) => parts.push(`    \\item ${b}`));
      parts.push(`\\end{itemize}`);
    }
    if (i < arr.length - 1) parts.push(`\\divider`);
  });
  return parts.join('\n');
}

function buildAwards(resume, t, lang) {
  const selected = topN(resume.awards, LIMITS.awards);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.awards)}}`];
  selected.forEach((a, i, arr) => {
    const date = formatDate(a.date, lang);
    const detail = [a.awarder, a.summary].filter(Boolean).map(tex).join(' — ');
    parts.push(`\\cvevent{${tex(a.title)}}{}{${tex(date)}}{}`);
    if (detail) parts.push(`\\begin{itemize}\n    \\item ${detail}\n\\end{itemize}`);
    if (i < arr.length - 1) parts.push(`\\divider`);
  });
  return parts.join('\n');
}

function buildInterests(resume, t) {
  const selected = (resume.interests || []).slice(0, LIMITS.interests);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.interests)}}`];
  selected.forEach((i, idx, arr) => {
    parts.push(`\\textbf{${tex(i.name)}}`);
    if (i.keywords?.length) parts.push(`: ${tex(i.keywords.join(', '))}`);
    parts.push(`\\\\`);
    if (idx < arr.length - 1) parts.push(`\\divider`);
  });
  return parts.join('\n');
}

function buildReferences(resume, t) {
  if (!resume.references?.length) return '';
  const parts = [`\\cvsection{${tex(t.references)}}`];
  resume.references.forEach((r, i, arr) => {
    parts.push(`\\textbf{${tex(r.name)}}\\\\`);
    if (r.reference) {
      const snippet = r.reference.length > 220 ? r.reference.slice(0, 217).trimEnd() + '…' : r.reference;
      parts.push(`\\begin{quote}\\small\\itshape ${tex(snippet)}\\end{quote}`);
    }
    if (i < arr.length - 1) parts.push(`\\medskip`);
  });
  return parts.join('\n');
}

function generateLatex(resume, lang) {
  const t = I18N[lang];
  return [
    `\\PassOptionsToPackage{dvipsnames}{xcolor}`,
    `\\documentclass[8pt,a4paper,ragged2e,withhyper]{altacv}`,
    `\\usepackage[T1]{fontenc}`,
    `\\usepackage[utf8]{inputenc}`,
    `\\usepackage[english,french,dutch,spanish,german]{babel}`,
    `\\usepackage{paracol}`,
    `\\usepackage{fontawesome5}`,
    `\\usepackage{needspace}`,
    `\\geometry{left=0.9cm,right=0.9cm,top=0.8cm,bottom=0.8cm,columnsep=0.6cm}`,
    `\\ifxetexorluatex`,
    // Under xelatex (only used for ZH), prefer Roboto Slab + Lato when they
    // are installed; otherwise fall back silently to xelatex's default fonts.
    `  \\IfFontExistsTF{Roboto Slab}{\\setmainfont{Roboto Slab}}{}`,
    `  \\IfFontExistsTF{Lato}{\\setsansfont{Lato}}{}`,
    `  \\renewcommand{\\familydefault}{\\sfdefault}`,
    `\\else`,
    `  \\usepackage[rm]{roboto}`,
    `  \\usepackage[defaultsans]{lato}`,
    `  \\renewcommand{\\familydefault}{\\sfdefault}`,
    `\\fi`,
    ...(NEEDS_CJK(lang) ? [
      `\\usepackage{xeCJK}`,
      // Try the macOS font first, fall back to common Linux/CI CJK fonts.
      `\\IfFontExistsTF{Songti SC}{\\setCJKmainfont{Songti SC}}{%`,
      `  \\IfFontExistsTF{Noto Serif CJK SC}{\\setCJKmainfont{Noto Serif CJK SC}}{%`,
      `    \\IfFontExistsTF{Noto Sans CJK SC}{\\setCJKmainfont{Noto Sans CJK SC}}{%`,
      `      \\IfFontExistsTF{WenQuanYi Zen Hei}{\\setCJKmainfont{WenQuanYi Zen Hei}}{}%`,
      `    }%`,
      `  }%`,
      `}`,
    ] : []),
    `\\definecolor{PrimaryColor}{HTML}{001F5A}`,
    `\\definecolor{SecondaryColor}{HTML}{FF0000}`,
    `\\definecolor{ThirdColor}{HTML}{F3890B}`,
    `\\definecolor{BodyColor}{HTML}{666666}`,
    `\\definecolor{EmphasisColor}{HTML}{2E2E2E}`,
    `\\definecolor{BackgroundColor}{HTML}{E2E2E2}`,
    `\\colorlet{name}{PrimaryColor}`,
    `\\colorlet{tagline}{SecondaryColor}`,
    `\\colorlet{heading}{PrimaryColor}`,
    `\\colorlet{headingrule}{ThirdColor}`,
    `\\colorlet{subheading}{SecondaryColor}`,
    `\\colorlet{accent}{SecondaryColor}`,
    `\\colorlet{emphasis}{EmphasisColor}`,
    `\\colorlet{body}{BodyColor}`,
    `\\pagecolor{BackgroundColor}`,
    `\\renewcommand{\\namefont}{\\Huge\\rmfamily\\bfseries}`,
    `\\renewcommand{\\personalinfofont}{\\small\\bfseries}`,
    // Prevent section-title hyphenation in the narrow left column (long
    // FR/NL/ES titles like "Compétences techniques" were breaking as
    // "Compé-tences", "TECH-NIQUES", etc.). \raggedright also drops the
    // last-resort hyphenation that justification triggers.
    `\\renewcommand{\\cvsectionfont}{\\LARGE\\rmfamily\\bfseries\\hyphenpenalty=10000\\exhyphenpenalty=10000\\raggedright}`,
    `\\renewcommand{\\cvsubsectionfont}{\\large\\bfseries}`,
    `\\renewcommand{\\itemmarker}{{\\small\\textbullet}}`,
    `\\renewcommand{\\ratingmarker}{\\faCircle}`,
    // Compact section heading for the narrow left column. Smaller font +
    // hard \raggedright + high hyphenation penalty so no word breaks AND no
    // line bleeds into the right column.
    `\\newcommand{\\cvsectionsidebar}[1]{%`,
    `  \\bigskip\\bigskip%`,
    `  {\\color{heading}\\Large\\rmfamily\\bfseries\\raggedright\\hyphenpenalty=10000\\exhyphenpenalty=10000\\MakeUppercase{#1}}\\\\[-1ex]%`,
    `  {\\color{headingrule}\\rule{\\linewidth}{1.5pt}\\par}%`,
    `  \\medskip%`,
    `}`,
    `\\begin{document}`,
    `\\selectlanguage{${BABEL[lang]}}`,
    buildHeader(resume, t),
    `\\columnratio{0.25}`,
    `\\begin{paracol}{2}`,
    buildSkillsBlock(resume, t),
    buildLanguagesBlock(resume, t),
    buildDayBlock(t),
    `\\newpage`,
    `\\switchcolumn`,
    buildAbout(resume, t),
    buildWork(resume, t, lang),
    buildEducation(resume, t, lang),
    `\\end{paracol}`,
    // ---- Verso: references only ----
    resume.references?.length ? `\\clearpage\n${buildReferences(resume, t)}` : '',
    `\\end{document}`,
    ``,
  ].join('\n');
}

// ---------- compilation ----------

// Returns { ok, pages } where pages is the page count if compilation succeeded.
function compileOnce(texContent, outPath, lang) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), `cv-${lang}-`));
  try {
    fs.copyFileSync(CLS_PATH, path.join(work, 'altacv.cls'));
    fs.copyFileSync(PROFILE_IMG, path.join(work, 'profil.jpeg'));
    const texFile = path.join(work, `cv_${lang}.tex`);
    fs.writeFileSync(texFile, texContent);
    let lastStdout = '';
    for (let pass = 0; pass < 2; pass += 1) {
      try {
        // CJK requires xelatex + system fonts. Other langs use pdflatex with
        // TeX Live's bundled roboto/lato packages (no system fonts needed).
        const engine = NEEDS_CJK(lang) ? 'xelatex' : 'pdflatex';
        const out = execFileSync(
          engine,
          [
            '-interaction=nonstopmode',
            '-halt-on-error',
            '-output-directory', work,
            texFile,
          ],
          { cwd: work, stdio: 'pipe', timeout: 90_000 },
        );
        lastStdout = out.toString();
      } catch (err) {
        const stdout = err.stdout ? err.stdout.toString().slice(-3000) : '';
        const stderr = err.stderr ? err.stderr.toString().slice(-1500) : '';
        console.error(`pdflatex failed for ${lang} (pass ${pass + 1}):`);
        console.error(stdout);
        if (stderr) console.error(stderr);
        return { ok: false };
      }
    }
    const produced = texFile.replace(/\.tex$/, '.pdf');
    if (!fs.existsSync(produced)) return { ok: false };
    // Parse page count from pdflatex .log (more reliable than stdout, which
    // execFileSync may not surface verbatim).
    const logFile = texFile.replace(/\.tex$/, '.log');
    // Page count: prefer pdfinfo (most reliable), fall back to pdflatex log,
    // then to counting /Type /Page entries in the produced PDF.
    let pages = null;
    try {
      const info = execFileSync('pdfinfo', [produced], { stdio: 'pipe' }).toString();
      const m = /^Pages:\s*(\d+)/m.exec(info);
      if (m) pages = parseInt(m[1], 10);
    } catch (_) { /* pdfinfo not available */ }
    if (pages == null && fs.existsSync(logFile)) {
      const log = fs.readFileSync(logFile, 'latin1');
      const m = /Output written on .+?\.pdf \((\d+) pages?/i.exec(log);
      if (m) pages = parseInt(m[1], 10);
    }
    if (pages == null) {
      const pdfBytes = fs.readFileSync(produced, 'latin1');
      const matches = pdfBytes.match(/\/Type\s*\/Page\b/g);
      pages = matches ? matches.length : null;
    }
    fs.copyFileSync(produced, outPath);
    return { ok: true, pages };
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

// Try every fit plan in turn; stop at the first that produces a 2-page PDF
// (recto + verso references). Returns the page count of the chosen plan.
function compileWithFit(resume, lang, outPath) {
  for (let i = 0; i < FIT_PLANS.length; i += 1) {
    LIMITS = FIT_PLANS[i];
    const tex = generateLatex(resume, lang);
    const { ok, pages } = compileOnce(tex, outPath, lang);
    if (!ok) return { ok: false };
    console.log(`  ${lang} plan ${i} → ${pages} pages`);
    if (pages === 2) return { ok: true, plan: i, pages };
    if (pages === 1 && !resume.references?.length) return { ok: true, plan: i, pages };
    if (i === FIT_PLANS.length - 1) return { ok: true, plan: i, pages };
  }
  return { ok: false };
}

// ---------- main ----------

let ok = 0;
const failed = [];
for (const lang of LANGS) {
  const resume = loadResume(lang);
  const outPath = path.join(OUTPUT_DIR, `cv_grosjean_baptiste_${lang}.pdf`);
  const result = compileWithFit(resume, lang, outPath);
  if (result.ok) {
    console.log(`${lang}: ${path.relative(ROOT, outPath)} (plan ${result.plan}, ${result.pages} pages)`);
    ok += 1;
  } else {
    failed.push(lang);
  }
}
console.log(`generate-pdf: ${ok}/${LANGS.length} compiled successfully`);
if (failed.length) {
  console.error(`failed: ${failed.join(', ')}`);
  process.exit(1);
}
