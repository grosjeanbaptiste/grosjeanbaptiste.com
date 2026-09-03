const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./config');

const OVERRIDES_PATH = path.join(ROOT, 'assets/data/site-overrides.json');

const KEY_FIELDS = ['institution', 'name', 'company', 'title'];

function readOverrides() {
  if (!fs.existsSync(OVERRIDES_PATH)) return {};
  return JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'));
}

function entryKey(entry) {
  for (const field of KEY_FIELDS) {
    if (entry?.[field]) return entry[field];
  }
  return null;
}

function removeHidden(resume, hiddenSpec) {
  for (const [section, names] of Object.entries(hiddenSpec || {})) {
    if (!Array.isArray(resume[section])) continue;
    const nameSet = new Set(names);
    resume[section] = resume[section].filter((entry) => !nameSet.has(entryKey(entry)));
  }
}

function applyDisplayPatches(resume, patchesBySection) {
  for (const [section, patches] of Object.entries(patchesBySection || {})) {
    if (!Array.isArray(resume[section])) continue;
    for (const patch of patches) {
      const idx = resume[section].findIndex((entry) => entryKey(entry) === patch.match);
      if (idx === -1) continue;
      const { match: _match, reason: _reason, ...fields } = patch;
      resume[section][idx] = { ...resume[section][idx], ...fields };
    }
  }
}

function applyHtmlOverrides(resume) {
  const overrides = readOverrides();
  const out = structuredClone(resume);
  removeHidden(out, overrides.hideOnHtml);
  applyDisplayPatches(out, overrides.displayOverrides);
  return out;
}

function applyPdfOverrides(resume) {
  const overrides = readOverrides();
  const out = structuredClone(resume);
  removeHidden(out, overrides.hideOnPdf);
  return out;
}

module.exports = { applyHtmlOverrides, applyPdfOverrides };
