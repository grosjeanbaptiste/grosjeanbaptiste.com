// Guard for .github/workflows/dsl.yml.
//
// That workflow's real job is the sync gate: recompile dsl/resume.grosjean and
// fail if the committed assets/data artifacts differ. It is the only thing
// standing between the repo and a silent revert, because resume.json and the
// i18n overlays are generated output that is committed.
//
// It was watching only one side of the compiler. With `paths: [dsl/**]`, a
// commit that edits assets/data alone never triggers it: CI goes green, the
// change merges, and the next compile throws the edit away with nothing
// failing. That happened — see the UMons volunteer end dates.
//
// The gate has to fire whenever *either* side moves, so both path globs are
// asserted here.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const yaml = fs.readFileSync(path.join(ROOT, '.github/workflows/dsl.yml'), 'utf8');

// Both sides of the compiler: its input, and the artifacts it emits.
const WATCHED = ['dsl/**', 'assets/data/**'];

// `on:` holds one `paths:` list per trigger (push, pull_request). Every one of
// them has to carry the globs — a gate that fires on the PR but not on the
// push to master still lets a direct push through.
function pathsLists() {
  const on = yaml.slice(yaml.indexOf('\non:'), yaml.indexOf('\njobs:'));
  return on.split(/^ {4}paths:$/m).slice(1);
}

test('the sync gate watches both sides of the compiler', () => {
  const lists = pathsLists();
  assert.ok(lists.length >= 2, `found ${lists.length} paths lists, expected push + pull_request`);
  for (const list of lists) {
    for (const glob of WATCHED) {
      assert.ok(list.includes(`'${glob}'`), `a paths list does not watch ${glob}`);
    }
  }
});

test('the sync gate still fails the build on a drifted artifact', () => {
  assert.match(yaml, /git status --porcelain assets\/data/);
  assert.match(yaml, /exit 1/);
});
