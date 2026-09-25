// Guard for the UMons volunteering end dates.
//
// Both UMons roles (student representative, TandeMons buddy) ran open-ended
// until 2026-09-04. Three artefacts have to agree that they are over, and only
// the first is hand-edited:
//
//   1. assets/data/resume.json — the canonical record.
//   2. the six generated index.html pages, which embed the roles under the MSc.
//   3. the fourteen XML mirrors, which the XSLT themes read.
//
// (2) and (3) are generated output committed to the repo, so closing a role in
// resume.json without re-running `npm run generate` leaves the published site
// claiming it is still running. That failure is silent — the pages build,
// nothing warns, and the stale "Present" only ever shows up to a reader.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { ROOT, LANGS, langOutFile } = require('./config');

const UMONS_END_DATE = '2026-09-04';
const DATA_DIR = path.join(ROOT, 'assets/data');

const resume = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'resume.json'), 'utf8'));
const umonsRoles = resume.volunteer.filter((v) => v.organization === 'UMons');

// The embedded list renders "<li><strong>role</strong> — start – end</li>", and
// an open-ended role puts the literal "Present" in the end slot (untranslated,
// in every language — see renderEmbeddedVolunteer). The work header instead
// emits <time>Present</time>, so this shape is specific to volunteering.
const ONGOING_VOLUNTEER_LINE = /–\s*Present<\/li>/;

const umonsItemsIn = (xml) =>
  xml.match(/<volunteer-item>\s*<organization>UMons<\/organization>[\s\S]*?<\/volunteer-item>/g) ||
  [];

test('both UMons volunteer roles are recorded as ended', () => {
  assert.equal(umonsRoles.length, 2);
  for (const role of umonsRoles) {
    assert.equal(role.endDate, UMONS_END_DATE, `${role.position} carries no end date`);
  }
});

test('no generated page still lists a volunteer role as ongoing', () => {
  for (const lang of LANGS) {
    const html = fs.readFileSync(langOutFile(lang), 'utf8');
    assert.doesNotMatch(html, ONGOING_VOLUNTEER_LINE, `${lang} page is stale`);
  }
});

test('every XML mirror carries the UMons end date', () => {
  const mirrors = fs.readdirSync(DATA_DIR).filter((f) => /^resume.*\.xml$/.test(f));
  assert.ok(mirrors.length >= LANGS.length, `only ${mirrors.length} mirrors found`);
  for (const file of mirrors) {
    const items = umonsItemsIn(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
    assert.equal(items.length, 2, `${file} holds ${items.length} UMons roles`);
    for (const item of items) {
      assert.match(item, new RegExp(`<endDate>${UMONS_END_DATE}</endDate>`), `${file} is stale`);
    }
  }
});
