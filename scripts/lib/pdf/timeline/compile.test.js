// Compiling one timeline PDF: the document, TeX, then the check on what came
// out — with TeX and the document replaced by fakes.
const test = require('node:test');
const assert = require('node:assert/strict');
const { compileTimeline } = require('./compile');

const RESUME = { basics: { name: 'Baptiste Grosjean' } };
const TODAY = new Date(Date.UTC(2026, 9, 5));

function run({ labels = 'full', pages = 1, ok = true } = {}) {
  const warnings = [];
  const result = compileTimeline(RESUME, 'de', '/nowhere/out.pdf', TODAY, null, {
    document: () => ({ tex: '', labels }),
    compile: () => ({ ok, pages }),
    warn: (message) => warnings.push(message),
  });
  return { result, warnings };
}

test('a timeline compiled on one page succeeds', () => {
  assert.deepEqual(run().result, { ok: true, pages: 1 });
});

test('a timeline in full says nothing', () => {
  assert.deepEqual(run().warnings, []);
});

test('a timeline reduced to its names says so, naming the language', () => {
  const [warning] = run({ labels: 'names' }).warnings;
  assert.match(warning, /de: .*names only/);
});

test('a timeline that TeX failed to compile is reported as failed', () => {
  assert.deepEqual(run({ ok: false }).result, { ok: false });
});
