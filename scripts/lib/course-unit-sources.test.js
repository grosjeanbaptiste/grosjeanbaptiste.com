// Every course unit of the CV is sourced: it links to its official sheet, and
// each of its keywords is backed by the wording of that sheet, recorded in
// dsl/course-unit-sources.json (retrieved from the schools' own sites).
//
// UMONS publishes one page per unit (and per learning activity, which carries
// the content). EPHEC publishes one "dossier pédagogique" for the whole
// bachelor: a unit's source is its first page in that PDF.
//
// scripts/check-course-unit-sources.js re-reads the live pages against this
// record; this file checks, offline, that the record covers the whole CV.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./config');
const { loadResume } = require('./data');

const { units } = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'dsl/course-unit-sources.json'), 'utf8'),
);
const courseUnits = loadResume('en').projects.filter((p) => p.type === 'Course unit');

// What the official sources do not back, said here rather than left unsaid.
// The first language unit has no sheet in EPHEC's dossier, which only names it
// as the prerequisite of the second. XPath and BaseX are on no UMONS sheet of
// "Bases de données II" (2022-2023 to 2025-2026): they were taught in the
// course all the same — the author's own account, 2026-10-05 — so they stay,
// known to rest on it and not on the sheet.
const WITHOUT_SHEET = ["Langue en situation appliquée à l'enseignement supérieur UE1"];
const ATTESTED_BY_THE_AUTHOR = { 'Bases de données II': ['XPath', 'BaseX'] };

const HOST = {
  UMONS: /^https:\/\/webcontent\.umons\.ac\.be\/web\/fr\/pde\/\d{4}-\d{4}\/ue\/[\w-]+\.htm$/,
  EPHEC: /^https:\/\/www\.ephec\.be\/sites\/default\/files\/.+\.pdf#page=\d+$/,
};

test('every course unit of the CV has a recorded source, and no other is recorded', () => {
  assert.deepEqual(Object.keys(units).sort(), courseUnits.map((u) => u.name).sort());
});

test('every course unit links to its official sheet, on its school’s own site', () => {
  for (const unit of courseUnits.filter((u) => !WITHOUT_SHEET.includes(u.name))) {
    assert.match(unit.url || '', HOST[unit.entity], `${unit.name} links to no official sheet`);
    assert.equal(unit.url, units[unit.name].url, `${unit.name} links elsewhere than recorded`);
  }
});

test('a unit without an official sheet links nowhere rather than somewhere else', () => {
  for (const name of WITHOUT_SHEET) {
    assert.equal(courseUnits.find((u) => u.name === name).url, undefined);
  }
});

test('every keyword is backed by the wording of its sheet, or attested by the author', () => {
  const unbacked = {};
  for (const unit of courseUnits.filter((u) => !WITHOUT_SHEET.includes(u.name))) {
    const missing = unit.keywords.filter((k) => !units[unit.name].evidence[k]);
    if (missing.length) unbacked[unit.name] = missing;
  }
  assert.deepEqual(unbacked, ATTESTED_BY_THE_AUTHOR);
});

test('the record says when the sources were read', () => {
  const record = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'dsl/course-unit-sources.json'), 'utf8'),
  );
  assert.match(record.retrieved, /^\d{4}-\d{2}-\d{2}$/);
});
