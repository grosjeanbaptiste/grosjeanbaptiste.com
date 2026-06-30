const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..', '..');

const LANGS = ['en', 'fr', 'nl', 'es', 'de', 'zh'];

const BABEL = {
  en: 'english',
  fr: 'french',
  nl: 'dutch',
  es: 'spanish',
  de: 'german',
  zh: 'english', // zh skips babel's CJK option (poor support); xeCJK handles it.
};

const NEEDS_CJK = (lang) => lang === 'zh';

// Iterative "fit" plans: ordered from generous to ultra-tight. The compiler
// tries each plan in turn until the recto fits on one page (so the whole
// PDF is exactly 2 pages: recto + verso references).
const FIT_PLANS = [
  {
    work: 5,
    education: 3,
    volunteer: 2,
    projects: 4,
    awards: 2,
    interests: 2,
    summary: 260,
    highlight: 180,
    hl_per_work: 2,
    kw_per_proj: 6,
    proj_desc: 140,
    show_skills: true,
  },
  {
    work: 4,
    education: 3,
    volunteer: 1,
    projects: 3,
    awards: 1,
    interests: 1,
    summary: 220,
    highlight: 150,
    hl_per_work: 1,
    kw_per_proj: 5,
    proj_desc: 120,
    show_skills: true,
  },
  {
    work: 4,
    education: 2,
    volunteer: 0,
    projects: 3,
    awards: 1,
    interests: 1,
    summary: 180,
    highlight: 120,
    hl_per_work: 1,
    kw_per_proj: 4,
    proj_desc: 100,
    show_skills: true,
  },
  {
    work: 3,
    education: 2,
    volunteer: 0,
    projects: 2,
    awards: 1,
    interests: 0,
    summary: 160,
    highlight: 0,
    hl_per_work: 0,
    kw_per_proj: 0,
    proj_desc: 80,
    show_skills: true,
  },
  {
    work: 3,
    education: 2,
    volunteer: 0,
    projects: 1,
    awards: 0,
    interests: 0,
    summary: 140,
    highlight: 0,
    hl_per_work: 0,
    kw_per_proj: 0,
    proj_desc: 60,
    show_skills: false,
  },
  {
    work: 2,
    education: 2,
    volunteer: 0,
    projects: 1,
    awards: 0,
    interests: 0,
    summary: 120,
    highlight: 0,
    hl_per_work: 0,
    kw_per_proj: 0,
    proj_desc: 50,
    show_skills: false,
  },
];

module.exports = {
  ROOT,
  CLS_PATH: path.join(ROOT, 'latex/altacv.cls'),
  PROFILE_IMG: path.join(ROOT, 'assets/images/profil.jpeg'),
  OUTPUT_DIR: path.join(ROOT, 'assets/cv'),
  LANGS,
  BABEL,
  NEEDS_CJK,
  FIT_PLANS,
};
