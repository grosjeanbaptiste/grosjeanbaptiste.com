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

const { ROOT, LANGS, langOutFile } = require('./config');
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

// Audited 2026-09-26 against the local source folders, counting first-party
// files only — vendored trees, node_modules, target/ and build/ excluded.
// Nothing here was inferred from a project's description; each keyword was
// counted in the code:
//
//   VhAuctions  790 .cs / 19 .csproj · EntityFramework 513 · 115 .jsx|.tsx +
//               111 .ts · Dockerfile + docker-compose · azure-pipeline.yaml ·
//               OpenTelemetry 13, Jaeger 16
//   fedrag-be   OCR 288 · SentenceTransformers 39 · Pandas 116
//   Remi        SQLAlchemy 5 · asyncpg/psycopg2 in requirements.txt
const AUDITED = {
  VhAuctions: [
    '.NET',
    'C#',
    'EntityFramework',
    'React',
    'TypeScript',
    'Docker',
    'Azure',
    'OpenTelemetry',
  ],
  'fedrag-be': ['OCR', 'SentenceTransformers', 'Pandas'],
  Remi: ['PostgreSQL', 'SQLAlchemy'],
};

test('every audited project declares what its sources show', () => {
  for (const [name, expected] of Object.entries(AUDITED)) {
    const project = projects.find((p) => p.name === name);
    assert.ok(project, `the ${name} project is gone`);
    const missing = expected.filter((k) => !(project.keywords || []).includes(k));
    assert.deepEqual(missing, [], `${name} does not declare: ${missing.join(', ')}`);
  }
});

// One term per concept. The product was spelled two ways — "SQL Server" on the
// experiences, "MSSQL Server" on the MyWay project — and deriving an
// experience's tags from its projects put both on the same line, one after the
// other, where a reader could see they were the same thing.
//
// Published content only. This file names the wrong spelling in the prose
// above, and a scan that included scripts/ would fail on its own comment —
// the trap that has now caught four guards in this repo.
const PUBLISHED_FILES = [
  'llms-full.txt',
  ...LANGS.map((l) => path.relative(ROOT, langOutFile(l))),
  ...fs
    .readdirSync(path.join(ROOT, 'assets/data'))
    .filter((f) => /^resume.*\.(xml|json)$/.test(f))
    .map((f) => `assets/data/${f}`),
];

test('the database product has one name across everything published', () => {
  for (const file of PUBLISHED_FILES) {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const variants = new Set(text.match(/\bM?S[ _-]?SQL[ _-]?Server\b/gi) || []);
    for (const variant of variants) {
      assert.equal(variant, 'SQL Server', `${file} also calls it "${variant}"`);
    }
  }
});
