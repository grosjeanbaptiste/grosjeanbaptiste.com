// Guard for the "Build Process" facts in CLAUDE.md.
//
// That section is the first thing an agent reads before touching the CV, so a
// stale claim there does not merely mislead a human — it routes the next change
// into the wrong file. It already did: CLAUDE.md called assets/data/resume.json
// "the canonical single source of truth" long after dsl/resume.grosjean took
// that role, and an edit went into the generated file, to be silently reverted
// by the next compile.
//
// The same paragraph had drifted on every countable fact it stated: three i18n
// overlays when five exist, four language variants when six ship, four marker
// blocks when the generator replaces six. Each is derivable from the code, so
// each is asserted from the code here rather than trusted.
//
// Spelled-out numerals in the prose are deliberately NOT asserted — matching
// "six" in English text is brittle and the list membership below is what
// actually catches a new language or marker being added.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { ROOT, LANGS, I18N_DIR, langPath } = require('./config');
const { MARKERS } = require('./markers');

const doc = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8');

test('nothing but the DSL source is called the single source of truth', () => {
  const claims = doc.split('\n').filter((l) => l.includes('single source of truth'));
  assert.ok(claims.length > 0, 'CLAUDE.md no longer states a source of truth at all');
  for (const claim of claims) {
    assert.match(claim, /dsl\/resume\.grosjean/, `stale claim: ${claim.trim()}`);
  }
});

test('the documented i18n overlays are the ones on disk', () => {
  const onDisk = fs
    .readdirSync(I18N_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.basename(f, '.json'))
    .sort();
  const documented = doc.match(/assets\/data\/i18n\/\{([^}]+)\}\.json/);
  assert.ok(documented, 'CLAUDE.md does not document the overlay paths');
  assert.deepEqual(documented[1].split(',').sort(), onDisk);
});

test('every generated language page is documented', () => {
  for (const lang of LANGS) {
    assert.ok(doc.includes(`${langPath(lang)}index.html`), `${lang} page is undocumented`);
  }
});

test('every marker block the generator replaces is documented', () => {
  for (const marker of Object.keys(MARKERS)) {
    assert.ok(doc.includes(`\`${marker}\``), `marker ${marker} is undocumented`);
  }
});

// The paths dsl/compile.py writes. Editing any of them is the mistake this
// whole guard exists to prevent, so the doc must never instruct it — line 86
// used to read "Edit `resume.json` (canonical) or `assets/data/i18n/<lang>.json`".
const COMPILED = ['resume.json', 'assets/data/i18n', 'site-overrides.json', 'site-extras.json'];

test('no instruction tells the reader to edit a compiled artifact', () => {
  const instructions = doc.split('\n').filter((l) => /\bEdit `/.test(l));
  for (const line of instructions) {
    for (const artifact of COMPILED) {
      assert.ok(!line.includes(artifact), `"Edit" instruction names ${artifact}: ${line.trim()}`);
    }
  }
});
