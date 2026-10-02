// Writes public/data/{lang}.json: the same merged, override-applied resume the
// static generator renders, plus its UI strings, with stable entry ids.
// The DSL stays the single source of truth — this only re-reads its output.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { identify } from './export-lib.mjs';

const require = createRequire(import.meta.url);
const { loadResume } = require('../../scripts/lib/data.js');
const { applyHtmlOverrides } = require('../../scripts/lib/site-overrides.js');
const { LANGS } = require('../../scripts/lib/config.js');
const I18N = require('../../scripts/lib/i18n/index.js');

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data');
mkdirSync(OUT_DIR, { recursive: true });

const canonical = loadResume('en');
for (const lang of LANGS) {
  const resume = applyHtmlOverrides(identify(canonical, loadResume(lang)));
  const document = { lang, ui: I18N[lang], resume };
  writeFileSync(join(OUT_DIR, `${lang}.json`), `${JSON.stringify(document)}\n`);
}
writeFileSync(join(OUT_DIR, 'languages.json'), `${JSON.stringify(LANGS)}\n`);
console.log(`exported ${LANGS.length} languages to ${OUT_DIR}`);
