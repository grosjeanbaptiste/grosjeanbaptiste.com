// The timeline in the two XSLT themes. XSLT 1.0 has no date arithmetic worth
// the name and no way to pack overlapping bars into rows, so the generator
// writes the timeline already laid out into each XML mirror (meta/timeline)
// and the themes only draw it — with the classic page's markup, so the rich
// theme reuses css/timeline.css and js/timeline.js as they are. The minimal
// theme stays static: no script. Rendered here with xsltproc.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, LANGS } = require('./config');
const { timelineForXml } = require('./xml-timeline');

const xmlOf = (lang, minimal) =>
  path.join(ROOT, `assets/data/resume-${lang}${minimal ? '-minimal' : ''}.xml`);
const render = (lang, minimal = false) =>
  execFileSync(
    'xsltproc',
    [
      path.join(ROOT, `assets/xslt/resume-transform${minimal ? '-minimal' : ''}.xsl`),
      xmlOf(lang, minimal),
    ],
    { encoding: 'utf8' },
  );
const bars = (html) => [...html.matchAll(/<(a|span) class="tl-bar"[^>]*>/g)].map((m) => m[0]);
const ids = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);

const TODAY = new Date(Date.UTC(2026, 9, 3));
const resume = {
  work: [
    { company: 'Acteble', position: 'Founder', startDate: '2025-07-01', projects: ['Acteble'] },
  ],
  education: [
    { institution: 'UMons', studyType: 'Master', startDate: '2022-10-15', endDate: '2026-09-04' },
  ],
  projects: [
    { name: 'Acteble', startDate: '2025-07-01' },
    { name: 'Baba', startDate: '2026-07-02' },
  ],
  volunteer: [
    { organization: 'UMons', position: 'Buddy', startDate: '2023-11-30', endDate: '2026-09-04' },
  ],
};
const laid = timelineForXml(resume, 'en', TODAY);
const barNamed = (kind, name) =>
  laid.lanes.find((l) => l.kind === kind).bars.find((b) => b.name === name);

test('a work bar targets its own entry', () => {
  assert.equal(barNamed('work', 'Acteble').target, 'work-acteble-founder');
});

test('a project under an experience targets that experience', () => {
  const project = laid.lanes.find((l) => l.kind === 'work').bars.find((b) => b.depth === 1);
  assert.deepEqual([project.name, project.target], ['Acteble', 'work-acteble-founder']);
});

test('a project no entry hosts has no target', () => {
  assert.equal(barNamed('projects', 'Baba').target, undefined);
});

test('a volunteering role targets the degree of its organisation', () => {
  assert.equal(barNamed('education', 'Buddy').target, 'education-umons-master');
});

test('a bar is placed in percent of the career', () => {
  assert.deepEqual(
    [barNamed('education', 'UMons').left, barNamed('education', 'UMons').width],
    ['0%', '97.96%'],
  );
});

test('an entry that carried something has its outline laid out', () => {
  const [group] = laid.lanes.find((l) => l.kind === 'education').groups;
  assert.deepEqual([group.row, group.rows], [0, 2]);
});

for (const lang of LANGS) {
  test(`${lang}: the XML mirror carries the timeline, laid out`, () => {
    const xml = fs.readFileSync(xmlOf(lang, false), 'utf8');
    assert.match(xml, /<timeline>[\s\S]*<lane>[\s\S]*<bar>[\s\S]*<left>[\d.]+%<\/left>/);
  });

  test(`${lang}: the rich theme draws the timeline, after About and before the experience`, () => {
    const html = render(lang);
    const at = html.indexOf('<section id="timeline"');
    assert.ok(at > 0, 'no timeline section');
    assert.ok(bars(html).length > 20, `only ${bars(html).length} bars`);
    assert.ok(at < html.indexOf(`id="${ids(html).find((id) => id.startsWith('work-'))}"`));
  });

  test(`${lang}: in the rich theme every bar's target is on the page, and no id is twice`, () => {
    const html = render(lang);
    const all = ids(html);
    assert.deepEqual(
      all.filter((id, i) => all.indexOf(id) !== i),
      [],
    );
    // xsltproc percent-encodes non-Latin letters in href, as HTML output does;
    // a browser decodes the fragment before looking the id up.
    const targets = bars(html)
      .flatMap((b) => (b.match(/href="#([^"]+)"/) || []).slice(1))
      .map(decodeURIComponent);
    assert.ok(targets.length > 20, `only ${targets.length} linked bars`);
    for (const id of targets) assert.ok(all.includes(id), `no #${id} on the page`);
  });

  test(`${lang}: the minimal theme draws the timeline too`, () => {
    assert.ok(bars(render(lang, true)).length > 20);
  });
}

test('the rich theme loads the classic page’s timeline script and styles', () => {
  const html = render('fr');
  assert.match(html, /<script[^>]*src="\/js\/timeline\.js"/);
  assert.match(html, /<link[^>]*href="\/css\/timeline\.css"/);
});

test('the zoom waits for the script, hidden until it runs', () => {
  assert.match(render('fr'), /<div class="tl-zoom"[^>]*hidden/);
});

test('the minimal theme stays static: styles, no script', () => {
  const html = render('fr', true);
  assert.match(html, /<link[^>]*href="\/css\/timeline\.css"/);
  assert.doesNotMatch(html, /timeline\.js/);
});

test('the timeline is left out of print in the XSLT themes too', () => {
  const css = fs.readFileSync(path.join(ROOT, 'css/timeline.css'), 'utf8');
  assert.match(css, /@media print\s*\{[^}]*#timeline\s*\{[^}]*display:\s*none/);
});
