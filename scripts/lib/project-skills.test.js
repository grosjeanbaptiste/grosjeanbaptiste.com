// Skills belong to projects, not to experiences.
//
// Until now the page rendered one aggregated tag cluster per experience — its
// own `uses` unioned with every referenced project's keywords — so a reader
// could see WHAT was used but never WHICH project used it. Two projects under
// one job dissolved into a single undifferentiated list.
//
// Now each project carries its own tags, and the experience-level cluster is
// gone. `uses` still exists in the DSL and still renders, but only for an
// experience that references no project at all — otherwise its content was
// migrated down into the project that earned it.
//
// The tags must stay off the printed sheet: the LaTeX fit plan sets
// show_skills: false, and anything added inside .embedded-projects prints,
// unlike the old .inline-skills. That is a two-page-fit risk, so it is
// asserted here and measured by the print-fit tests.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { ROOT, LANGS, langOutFile } = require('./config');
const { loadResume } = require('./data');

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const resume = loadResume('en');
const project = (name) => resume.projects.find((p) => p.name === name);

// Every <li> of an embedded project list, with the tags that follow it.
const projectRows = () =>
  (html.match(/<li>(?:(?!<\/li>)[\s\S])*<\/li>/g) || []).filter((row) => row.includes('<strong>'));

test('a project shows its own keywords beside it', () => {
  let checked = 0;
  for (const row of projectRows()) {
    const name = (row.match(/<strong>([^<]*)<\/strong>/) || [])[1];
    const keywords = project(name)?.keywords || [];
    if (!keywords.length) continue;
    checked++;
    const missing = keywords.filter((k) => !row.includes(`>${k}<`));
    assert.deepEqual(missing, [], `the ${name} row omits: ${missing.join(', ')}`);
  }
  assert.ok(checked >= 8, `only ${checked} project rows carried keywords`);
});

// Scoped to experience articles on purpose. Education still aggregates: its
// `uses` carries what no project covers — LaTeX for the MSc, the whole EPHEC
// stack — and the proper home for those is the course units, which do not
// exist yet. Asserting page-wide would have forced dropping them.
test('an experience with projects no longer aggregates them into one cluster', () => {
  for (const lang of LANGS) {
    const page = fs.readFileSync(langOutFile(lang), 'utf8');
    const articles =
      page.match(/<article class="experience-item[^"]*"[^>]*>[\s\S]*?<\/article>/g) || [];
    assert.ok(articles.length >= 10, `${lang}: found ${articles.length} experiences`);
    for (const article of articles) {
      const aggregated = article.includes('class="skill-tags inline-skills"');
      const hasProjects = article.includes('<strong>');
      assert.ok(!(aggregated && hasProjects), `${lang}: an experience aggregates despite projects`);
    }
  }
});

test('the per-project tags are hidden from the printed sheet', () => {
  const css = fs.readFileSync(path.join(ROOT, 'css/print-type.css'), 'utf8');
  assert.match(css, /\.project-skills\s*\{[^}]*display:\s*none/);
});
