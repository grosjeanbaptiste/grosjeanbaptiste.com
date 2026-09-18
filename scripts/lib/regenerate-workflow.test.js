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
//   3. It watches the generator entry point but not the modules it requires, so
//      editing a label under scripts/lib/i18n/ or a section renderer changes
//      what the site should say without any regeneration being triggered.
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
  const rx = new RegExp(
    `^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')}$`,
  );
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
  assert.deepEqual(missed, [], `regenerated but never committed: ${missed.join(', ')}`);
});

// Every local module the generator transitively requires, relative to the repo
// root. Derived from the source rather than listed by hand, so a new module is
// covered the day it is added.
function generatorDeps() {
  const entry = path.join(ROOT, 'scripts/generate-from-resume.js');
  const seen = new Set();
  const stack = [entry];
  while (stack.length > 0) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/require\((['"])(\.[^'"]+)\1\)/g)) {
      let dep = path.resolve(path.dirname(file), m[2]);
      if (fs.existsSync(dep) && fs.statSync(dep).isDirectory()) dep = path.join(dep, 'index.js');
      else if (!dep.endsWith('.js')) dep += '.js';
      if (fs.existsSync(dep)) stack.push(dep);
    }
  }
  return [...seen].map((f) => path.relative(ROOT, f));
}

// A push filter entry watches a file if it names it or is a `dir/**` prefix.
function watches(pattern, file) {
  if (pattern === file) return true;
  return pattern.endsWith('/**') && file.startsWith(pattern.slice(0, -2));
}

test('the workflow watches every module the generator depends on', () => {
  const patterns = pushPaths();
  const unwatched = generatorDeps().filter((f) => !patterns.some((p) => watches(p, f)));
  assert.deepEqual(
    unwatched,
    [],
    `editing these would change the generated site without triggering a rebuild: ${unwatched.join(', ')}`,
  );
});
