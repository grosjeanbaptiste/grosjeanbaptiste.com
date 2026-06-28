const fs = require('node:fs');
const path = require('node:path');
const { RESUME_PATH, I18N_DIR } = require('./config');

// Deep merge: overlay values overwrite base. Arrays are merged element-wise.
function deepMerge(base, overlay) {
  if (overlay === null || overlay === undefined) return base;
  if (Array.isArray(base) && Array.isArray(overlay)) {
    return base.map((b, i) => deepMerge(b, overlay[i]));
  }
  const bothObj =
    typeof base === 'object' &&
    base !== null &&
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

module.exports = { deepMerge, loadResume };
