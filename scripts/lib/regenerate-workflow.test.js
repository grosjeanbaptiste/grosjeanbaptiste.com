// Guard for .github/workflows/regenerate-from-resume.yml.
//
// The workflow re-runs the generator and commits the result. It has two
// independent ways of failing silently, both of which actually happened:
//
//   1. It never fires on a stylesheet edit, because `paths` does not list
//      assets/xslt/**. The XML mirrors embed a sha1 of the stylesheet as a
//      cache-buster, so a .xsl change that does not re-run the generator leaves
//      every mirror pointing at a stale hash — browsers keep serving the old
//      theme from cache and the change is invisible in production.
//   2. It fires, but the PATHS list in the commit step is narrower than what
//      the generator writes, so regenerated files are left behind uncommitted
//      and discarded when the runner is torn down.
//
// Both are silent: no failing step, no warning. Hence these tests.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const WORKFLOW = path.join(ROOT, '.github/workflows/regenerate-from-resume.yml');
const yaml = fs.readFileSync(WORKFLOW, 'utf8');

// Every path scripts/generate-from-resume.js writes, mirroring what it logs.
const GENERATED = [
  'index.html',
  'fr/index.html',
  'nl/index.html',
  'es/index.html',
  'de/index.html',
  'zh/index.html',
  'assets/data/resume.xml',
  'assets/data/resume-fr.xml',
  'assets/data/resume-zh-minimal.xml',
  'sitemap.xml',
];

// The `paths:` list under `on: push:`, unquoted.
function pushPaths() {
  const block = yaml.match(/\n {4}paths:\n((?: +- .*\n)+)/);
  assert.ok(block, 'no `paths:` list found under on.push');
  return block[1]
    .split('\n')
    .map((l) => l.trim().replace(/^-\s*/, '').replace(/^'|'$/g, ''))
    .filter(Boolean);
}

// The PATHS="..." shell variable the commit step adds and inspects.
function commitPaths() {
  const m = yaml.match(/PATHS="([^"]*)"/);
  assert.ok(m, 'no PATHS="..." assignment found in the commit step');
  return m[1].split(/\s+/).filter(Boolean);
}

// A committed path covers a generated file if it is that file, a directory
// prefix of it, or a glob matching it.
function covers(pattern, file) {
  if (pattern === file) return true;
  if (pattern.endsWith('/') && file.startsWith(pattern)) return true;
  if (!pattern.includes('*')) return false;
  const rx = new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')}$`);
  return rx.test(file);
}

test('the workflow re-runs the generator when the XSLT changes', () => {
  assert.ok(
    pushPaths().some((p) => p.startsWith('assets/xslt/')),
    'on.push.paths does not watch assets/xslt/** — a stylesheet edit would ' +
      'leave the cache-bust hash in every XML mirror stale',
  );
});

test('the commit step covers every file the generator writes', () => {
  const patterns = commitPaths();
  const missed = GENERATED.filter((f) => !patterns.some((p) => covers(p, f)));
  assert.deepEqual(
    missed,
    [],
    `regenerated but never committed: ${missed.join(', ')}`,
  );
});
