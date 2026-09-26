// Guard for the per-experience skill tags.
//
// They do NOT live in resume.json: JSON Resume has no field for them, so the
// DSL's `uses` compiles into site-extras.json and loadResume merges it back.
// Reading resume.json alone shows every experience with no skills at all —
// a trap worth naming, since it makes the tags look absent when they are not.
//
// Audited 2026-09-26 against the source folders under ~/Source, counting
// first-party files only. Nothing was removed; these are the technologies the
// code shows that the experience did not yet claim.
//
//   Founder        Acteble/      PostgreSQL 22 (.rs/.dart/.toml/.md)
//   Senate         Synergy/      RAG 196 · OCR 288 · SentenceTransformers 39 ·
//                                Pandas 116
//   Emvi Lead      Emvi/Emvi/    Firebase 69 · OpenAI 28 · Valhalla 796
//   Emvi Crafter   Emvi/Remi/    FastAPI 14 · DeepFace 96 · OpenAI 5 ·
//                                SQLAlchemy 5 · asyncpg in requirements
//   VhAuctions     Xtrada/VhAuctions/  EntityFramework 513 · 111 .ts ·
//                                Docker · azure-pipeline.yaml · OTel 13
//   aXinco         Xtrada/Axinco/      EntityFramework 233 · xUnit 24
//   Technofutur    VP/MyWay + FSW/     Auth0 12 · Sequelize 21 · TS in both

const test = require('node:test');
const assert = require('node:assert/strict');

const { loadResume } = require('./data');

const work = loadResume('en').work;

const AUDITED = {
  Founder: ['PostgreSQL'],
  'AI Research Scientist': ['RAG', 'OCR', 'SentenceTransformers', 'Pandas'],
  'AI Software Crafter Lead': ['Firebase', 'OpenAI', 'Valhalla'],
  'AI Software Crafter': ['FastAPI', 'DeepFace', 'OpenAI', 'PostgreSQL', 'SQLAlchemy'],
  '.NET/React Software Crafter': [
    'TypeScript',
    'EntityFramework',
    'Docker',
    'Azure',
    'OpenTelemetry',
  ],
  '.NET/Blazor Software Crafter': ['EntityFramework', 'xUnit'],
};

test('every audited experience declares what its sources show', () => {
  for (const [position, expected] of Object.entries(AUDITED)) {
    const entry = work.find((w) => w.position === position);
    assert.ok(entry, `no experience with position "${position}"`);
    const missing = expected.filter((s) => !(entry.skills || []).includes(s));
    assert.deepEqual(missing, [], `${position} does not declare: ${missing.join(', ')}`);
  }
});

// The Technofutur internship is the only position held twice, so it is matched
// on the employer rather than the title.
test('the Technofutur internship declares what MyWay shows', () => {
  const entry = work.find((w) => w.company === 'Technofutur TIC');
  assert.ok(entry, 'the Technofutur TIC experience is gone');
  const missing = ['TypeScript', 'Auth0', 'Sequelize'].filter(
    (s) => !(entry.skills || []).includes(s),
  );
  assert.deepEqual(missing, [], `Technofutur TIC does not declare: ${missing.join(', ')}`);
});
