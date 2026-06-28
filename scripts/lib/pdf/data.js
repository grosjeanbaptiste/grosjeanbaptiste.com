const fs = require('node:fs');
const path = require('node:path');
const { RESUME_PATH, I18N_DIR } = require('./config');

function deepMerge(base, overlay) {
  if (overlay === null || overlay === undefined) return base;
  if (Array.isArray(base) && Array.isArray(overlay)) {
    return base.map((b, i) => deepMerge(b, overlay[i]));
  }
  const bothObj =
    base &&
    typeof base === 'object' &&
    overlay &&
    typeof overlay === 'object' &&
    !Array.isArray(overlay);
  if (bothObj) {
    const out = { ...base };
    for (const k of Object.keys(overlay)) {
      if (k.startsWith('_')) continue;
      out[k] = deepMerge(base?.[k], overlay[k]);
    }
    return out;
  }
  return overlay;
}

function sortByRecency(arr) {
  return [...arr].sort((a, b) => {
    const keyA = a.endDate || a.startDate || a.date || '';
    const keyB = b.endDate || b.startDate || b.date || '';
    return String(keyB).localeCompare(String(keyA));
  });
}

const topN = (arr, n) => sortByRecency(arr || []).slice(0, n);

function loadResume(lang) {
  const canonical = JSON.parse(fs.readFileSync(RESUME_PATH, 'utf8'));
  if (lang === 'en') return canonical;
  const overlay = path.join(I18N_DIR, `${lang}.json`);
  if (!fs.existsSync(overlay)) return canonical;
  return deepMerge(canonical, JSON.parse(fs.readFileSync(overlay, 'utf8')));
}

const findProject = (resume, name) => (resume.projects || []).find((p) => p.name === name);

module.exports = { loadResume, topN, findProject };
