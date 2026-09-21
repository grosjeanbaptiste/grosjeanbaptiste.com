// Guard for .github/workflows/test.yml.
//
// The suite guards a lot — the LaTeX/print parity, the two-page fit, the
// regeneration workflow's own coverage — but for most of this repo's life
// nothing ran it outside a developer's machine, so none of it gated a merge.
//
// Two ways a test job goes quietly useless, both already seen here:
//   1. A `paths:` filter narrower than what the tests actually read. The tests
//      read CSS, the generated HTML, the fonts, the resume data and the other
//      workflow files — that is nearly the whole repo, so the filter's job is
//      not worth its risk and there should be none.
//   2. The browser-dependent test skipping. print-fit.test.js skips when it
//      finds no Chrome; on a runner without one, CI would go green having
//      checked nothing about the printed CV.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const WORKFLOW = path.join(ROOT, '.github/workflows/test.yml');

test('a workflow runs the test suite', () => {
  assert.ok(
    fs.existsSync(WORKFLOW),
    'no .github/workflows/test.yml — nothing runs the tests in CI',
  );
  const yaml = fs.readFileSync(WORKFLOW, 'utf8');
  assert.match(yaml, /npm test|node --test/, 'the workflow never actually runs the suite');
  assert.match(yaml, /pull_request/, 'the suite would not gate a pull request');
});

test('the test job is not narrowed by a paths filter', () => {
  const yaml = fs.readFileSync(WORKFLOW, 'utf8');
  // `paths:` under on.push/on.pull_request is what silently stops a workflow
  // from firing. The tests read too much of the repo for any filter to be safe.
  assert.doesNotMatch(
    yaml.replace(/^\s*#.*$/gm, ''),
    /^\s{4}paths:/m,
    'test.yml filters by path — a change outside the filter would skip the suite',
  );
});

test('a missing browser fails CI instead of skipping', () => {
  const src = fs.readFileSync(path.join(__dirname, 'print-fit.test.js'), 'utf8');
  assert.match(
    src,
    /process\.env\.CI/,
    'print-fit.test.js skips unconditionally — on a runner without Chrome, CI would pass having checked nothing',
  );
});

test('the workflow installs the tools the suite shells out to', () => {
  const yaml = fs.readFileSync(WORKFLOW, 'utf8');
  // The suite runs two external binaries. Neither is a node dependency, so
  // nothing but this workflow puts them on the runner.
  for (const [tool, why] of [
    ['xsltproc', 'xslt-print.test.js renders the theme with it'],
    ['google-chrome', 'print-fit.test.js prints the pages with it'],
    ['firefox', 'print-fit-firefox.test.js prints with the other engine'],
  ]) {
    assert.ok(yaml.includes(tool), `test.yml never provides ${tool} — ${why}`);
  }
});
