const path = require('node:path');

const SITE_URL = 'https://www.grosjeanbaptiste.com';
const ROOT = path.resolve(__dirname, '..', '..');
const RESUME_PATH = path.join(ROOT, 'assets/data/resume.json');
const I18N_DIR = path.join(ROOT, 'assets/data/i18n');
const TEMPLATE_PATH = path.join(ROOT, 'index.html');

const LANGS = ['en', 'fr', 'nl', 'es', 'de', 'zh'];

const langPath = (lang) => (lang === 'en' ? '/' : `/${lang}/`);
const langOutFile = (lang) => (lang === 'en' ? TEMPLATE_PATH : path.join(ROOT, lang, 'index.html'));

module.exports = {
  SITE_URL,
  ROOT,
  RESUME_PATH,
  I18N_DIR,
  TEMPLATE_PATH,
  LANGS,
  langPath,
  langOutFile,
};
