// Guards for the project entries, written after auditing them against the
// actual repositories.
//
// The CV linked two projects to github.com/grosjeanbaptiste/{baba,KAG}. Both
// repos are private, so both links answer 404 to the only people who click
// them — recruiters. A dead link on a CV is worse than no link: it reads as a
// project that was taken down.
//
// Keeping them private is a deliberate choice, so the links go instead. This
// pins that: re-adding one fails here, and when a repo does open the failure
// message says to drop it from the list rather than silently keeping the CV
// quiet about a project that now has something to show.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { ROOT } = require('./config');
const projects = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'assets/data/resume.json'), 'utf8'),
).projects;

// Verified private on 2026-09-26: an anonymous GET of each returns 404.
const PRIVATE_REPOS = ['grosjeanbaptiste/baba', 'grosjeanbaptiste/KAG'];

test('no project advertises a link to a private repository', () => {
  for (const p of projects) {
    for (const repo of PRIVATE_REPOS) {
      assert.ok(
        !(p.url || '').includes(repo),
        `${p.name} links to ${repo}, which answers 404 — open the repo and drop it from PRIVATE_REPOS, or leave the link out`,
      );
    }
  }
});

test('every project link is an absolute https URL', () => {
  for (const p of projects) {
    if (!p.url) continue;
    assert.match(p.url, /^https:\/\//, `${p.name} has a link that is not absolute https: ${p.url}`);
  }
});

// Baba's seven repositories carry 415 #[test] between them — more than KAG,
// which declares the discipline. Audited 2026-09-26.
test('Baba declares the test discipline its repositories show', () => {
  const baba = projects.find((p) => p.name === 'Baba');
  assert.ok(baba, 'the Baba project is gone');
  assert.ok(baba.keywords.includes('TDD'), 'Baba does not declare TDD');
});
