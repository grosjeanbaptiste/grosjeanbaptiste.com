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

const fs = require('node:fs');
const path = require('node:path');

const { loadResume } = require('./data');
const { ROOT } = require('./config');

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

// An experience's skills ARE its projects' skills. The two were maintained by
// hand in two places — `uses` on the experience and `keywords` on the project —
// which is how they drifted: the project keywords added in #37 were invisible
// on the page, because only the experience's own list is rendered.
//
// So the tags are now derived: what an experience shows is its own `uses`
// unioned with the keywords of every project it references. Nothing is lost —
// `uses` still contributes — and nothing has to be repeated.
//
// Asserted on the generated page, not on the data, because the union happens
// at render time and data-level assertions would pass while the page showed
// the old list.
test('an experience shows the keywords of the projects it references', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const resume = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/resume.json'), 'utf8'));
  const keywordsOf = (name) => resume.projects.find((p) => p.name === name)?.keywords || [];

  const articles = html.match(/<article class="experience-item[^"]*">[\s\S]*?<\/article>/g) || [];
  assert.ok(articles.length >= 10, `found ${articles.length} experience articles`);

  let checked = 0;
  for (const article of articles) {
    const tags = (article.match(/<span class="skill-tag">([^<]*)<\/span>/g) || []).map((m) =>
      m.replace(/<[^>]*>/g, ''),
    );
    // The embedded project list names them; match on that rather than on order.
    const names = (article.match(/<li><strong>([^<]*)<\/strong>/g) || []).map((m) =>
      m.replace(/<[^>]*>/g, ''),
    );
    for (const name of names) {
      const expected = keywordsOf(name);
      if (!expected.length) continue;
      checked++;
      const missing = expected.filter((k) => !tags.includes(k));
      assert.deepEqual(missing, [], `an experience citing ${name} omits: ${missing.join(', ')}`);
    }
  }
  assert.ok(checked >= 5, `only ${checked} experience/project pairs were checked`);
});
