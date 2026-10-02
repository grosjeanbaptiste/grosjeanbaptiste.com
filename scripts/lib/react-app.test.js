// Guard for the React view at /app/ (source in react/, build committed in app/).
//
// The build is generated output that happens to be committed, like the
// localized index.html files. The ways it would rot silently are the ones the
// static site already hit: CI never running its tests, the regeneration
// workflow not rebuilding it when the CV changes, or rebuilding it without
// committing what it wrote — the live /app/ would keep serving a stale CV.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const uncommented = (yaml) => yaml.replace(/^\s*#.*$/gm, '');

test('CI runs the React test suite', () => {
  const yaml = uncommented(read('.github/workflows/test.yml'));
  assert.match(yaml, /working-directory: react[\s\S]*npm test/, 'react/ tests never run in CI');
});

test('the regeneration workflow fires when the React sources change', () => {
  const yaml = read('.github/workflows/regenerate-from-resume.yml');
  assert.match(yaml, /- 'react\/\*\*'/, "on.push.paths does not list 'react/**'");
});

test('the regeneration workflow fires on every data file the app exports', () => {
  const yaml = read('.github/workflows/regenerate-from-resume.yml');
  for (const file of ['site-extras.json', 'site-overrides.json']) {
    assert.ok(yaml.includes(`assets/data/${file}`), `on.push.paths misses assets/data/${file}`);
  }
});

test('the regeneration workflow rebuilds the app', () => {
  const yaml = uncommented(read('.github/workflows/regenerate-from-resume.yml'));
  assert.match(yaml, /working-directory: react[\s\S]*npm run build/, 'app/ is never rebuilt');
});

test('the regeneration workflow commits the rebuilt app', () => {
  const paths = read('.github/workflows/regenerate-from-resume.yml').match(/PATHS="([^"]*)"/);
  assert.ok(paths, 'no PATHS="..." in the commit step');
  assert.ok(paths[1].split(/\s+/).includes('app/'), 'app/ is rebuilt but never committed');
});

test('the lint workflow fires on TypeScript edits', () => {
  const yaml = read('.github/workflows/lint.yml');
  for (const glob of ['**/*.ts', '**/*.tsx']) {
    assert.ok(yaml.includes(`'${glob}'`), `lint.yml does not watch ${glob}`);
  }
});

test('the line-count check covers TypeScript sources', () => {
  const { CODE_EXTS } = require('../check-line-count');
  for (const ext of ['.ts', '.tsx', '.mjs']) {
    assert.ok(CODE_EXTS.has(ext), `check-line-count.js skips ${ext} files`);
  }
});
