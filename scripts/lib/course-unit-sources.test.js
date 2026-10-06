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
const { execFileSync } = require('node:child_process');
const { fold } = require('./course-unit-drift');

// The archived pages keep the entities of their HTML.
const decode = (text) =>
  text
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));

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
// A unit links to the sheet of the year it was taken. One of those sheets backs
// none of its keywords: "Mathématique" published no content in 2022-2023. They
// rest on the 2025-2026 sheet of the same unit, recorded as `later` — a later
// description, not the one of the year taken.
const BACKED_BY_A_LATER_SHEET = {
  Mathématique: [
    'GraphTheory',
    'Combinatorics',
    'Complexity',
    'PropositionalLogic',
    'PredicateLogic',
  ],
};

const HOST = {
  UMONS: /^https:\/\/webcontent\.umons\.ac\.be\/web\/fr\/pde\/\d{4}-\d{4}\/ue\/[\w-]+\.htm$/,
  EPHEC: /^https:\/\/www\.ephec\.be\/sites\/default\/files\/.+\.pdf#page=\d+$/,
};

test('every course unit of the CV has a recorded source, and no other is recorded', () => {
  assert.deepEqual(Object.keys(units).sort(), courseUnits.map((u) => u.name).sort());
});

// Saint-Louis: the sheets are the author's own copies of the university's,
// saved on 2022-09-01 — archived here, with no page left to link to.
const SAVED_COPY_ONLY = (unit) => unit.entity === 'USL-B';

test('every course unit links to its official sheet, on its school’s own site', () => {
  const online = courseUnits.filter((u) => !WITHOUT_SHEET.includes(u.name) && !SAVED_COPY_ONLY(u));
  for (const unit of online) {
    assert.match(unit.url || '', HOST[unit.entity], `${unit.name} links to no official sheet`);
    assert.equal(unit.url, units[unit.name].url, `${unit.name} links elsewhere than recorded`);
  }
});

test('a unit whose sheet is a saved copy links nowhere, and its record says when it was saved', () => {
  const saved = courseUnits.filter(SAVED_COPY_ONLY);
  assert.equal(saved.length, 8);
  for (const unit of saved) {
    assert.equal(unit.url, undefined, `${unit.name} links somewhere`);
    assert.match(units[unit.name].saved, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(units[unit.name].archive.length > 0);
  }
});

test('a unit without an official sheet links nowhere rather than somewhere else', () => {
  for (const name of WITHOUT_SHEET) {
    assert.equal(courseUnits.find((u) => u.name === name).url, undefined);
  }
});

const sourced = courseUnits.filter((u) => !WITHOUT_SHEET.includes(u.name));
const lacking = (backs) => {
  const out = {};
  for (const unit of sourced) {
    const missing = unit.keywords.filter((k) => !backs(units[unit.name], k));
    if (missing.length) out[unit.name] = missing;
  }
  return out;
};

test('every keyword is backed by a sheet of its unit, or attested by the author', () => {
  const anySheet = (record, k) => record.evidence[k] || record.later?.evidence[k];
  assert.deepEqual(lacking(anySheet), ATTESTED_BY_THE_AUTHOR);
});

test('the keywords only a later year’s sheet backs are known, and no others', () => {
  const ownSheet = (record, k) => record.evidence[k] || !record.later?.evidence[k];
  assert.deepEqual(lacking(ownSheet), BACKED_BY_A_LATER_SHEET);
});

// The year a unit was taken is the year of the block the CV files it under.
test('a UMONS unit links to the sheet of the year it was taken', () => {
  const blocks = loadResume('en').education.flatMap((e) => e.blocks || []);
  for (const unit of sourced.filter((u) => u.entity === 'UMONS')) {
    const block = blocks.find((b) => b.units.includes(unit.name));
    assert.ok(block, `${unit.name} is in no block of the CV`);
    assert.ok(
      unit.url.includes(`/pde/${block.year}/`),
      `${unit.name} links to another year than ${block.year}`,
    );
  }
});

// A copy of every sheet is kept in the repository, should the school take it
// down: dsl/_sources (the underscore keeps it out of the published site).
const textOf = (file, record) => {
  if (!file.endsWith('.pdf'))
    return fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/<[^>]+>/g, ' ');
  // A saved copy is one sheet: read whole. A dossier is read from the unit's page.
  if (!record.url)
    return execFileSync('pdftotext', [path.join(ROOT, file), '-'], { encoding: 'utf8' });
  const page = Number(record.url.split('#page=')[1]);
  return execFileSync(
    'pdftotext',
    ['-f', `${page}`, '-l', `${page + 12}`, path.join(ROOT, file), '-'],
    {
      encoding: 'utf8',
    },
  );
};
const archived = (record) =>
  fold(decode(record.archive.map((file) => textOf(file, record)).join(' ')));

test('every sheet the CV links to is archived in the repository', () => {
  for (const unit of sourced) {
    const record = units[unit.name];
    for (const file of [...record.archive, ...(record.later?.archive ?? [])]) {
      assert.ok(fs.statSync(path.join(ROOT, file)).size > 500, `${file} is missing or empty`);
    }
  }
});

test('the archived copy of a sheet carries every wording recorded from it', () => {
  for (const unit of sourced) {
    for (const record of [units[unit.name], units[unit.name].later].filter(Boolean)) {
      const copy = archived(record);
      for (const [keyword, wording] of Object.entries(record.evidence)) {
        if (wording)
          assert.ok(
            copy.includes(fold(wording)),
            `${unit.name}: "${wording}" (${keyword}) is not in its archived sheet`,
          );
      }
    }
  }
});

test('the record says when the sources were read', () => {
  const record = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'dsl/course-unit-sources.json'), 'utf8'),
  );
  assert.match(record.retrieved, /^\d{4}-\d{2}-\d{2}$/);
});
