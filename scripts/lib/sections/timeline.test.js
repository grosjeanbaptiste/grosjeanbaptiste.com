// The interactive view's timeline, on the classic page: built at generation
// time from the same entries (lanes, bars placed in percent of the career), a
// link from each bar to its entry further down the page, and js/timeline.js
// adding the zoom, the arrow keys and the hover preview on top. Without the
// script the bars are still links; on paper the timeline is left out — the
// LaTeX CV the print follows has none.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, LANGS, langOutFile } = require('../config');
const { generateTimeline } = require('./timeline');

const TODAY = new Date(Date.UTC(2026, 9, 3));
const resume = {
  work: [
    { company: 'Acteble', position: 'Founder', startDate: '2025-07-01', projects: ['Acteble'] },
    { company: 'R&D Lab', position: 'Intern', startDate: '2024-07-01', endDate: '2025-06-30' },
  ],
  education: [
    { institution: 'UMons', studyType: 'Master', startDate: '2022-10-15', endDate: '2026-09-04' },
  ],
  projects: [
    { name: 'Acteble', startDate: '2025-07-01' },
    { name: 'Baba', startDate: '2026-07-02' },
    { name: 'Algorithmique', courseUnit: true },
  ],
  volunteer: [],
};
const ON_PAGE = new Set([
  'work-acteble-founder',
  'work-r-d-lab-intern',
  'education-umons-master',
  'project-acteble',
]);
const html = generateTimeline(resume, 'en', TODAY, ON_PAGE);
const bars = (kind) =>
  [
    ...html.matchAll(
      new RegExp(`<div class="tl-lane" data-kind="${kind}">[\\s\\S]*?</div>\\s*</div>`, 'g'),
    ),
  ].flatMap((m) => [...m[0].matchAll(/<(a|span) class="tl-bar"[^>]*>/g)].map((b) => b[0]));

test('one bar per dated entry, in the lane of its kind', () => {
  assert.deepEqual(
    [bars('work').length, bars('education').length, bars('projects').length],
    [2, 1, 2],
  );
});

test('course units are not drawn', () => {
  assert.doesNotMatch(html, /Algorithmique/);
});

test('a bar links to its entry on the page', () => {
  assert.ok(
    bars('work').some((b) => b.startsWith('<a ') && b.includes('href="#work-acteble-founder"')),
  );
});

test('a bar whose entry is not on the page is not a link, and still reachable by keyboard', () => {
  const baba = bars('projects').find((b) => b.includes('Baba'));
  assert.ok(baba.startsWith('<span '), baba);
  assert.match(baba, /tabindex="0"/);
});

test('a bar sits at its place in the career, in percent', () => {
  // UMons: Oct 2022 – Sep 2026, the axis Oct 2022 – Oct 2026 (49 months).
  const umons = bars('education')[0];
  assert.match(umons, /left:0%/);
  assert.match(umons, /width:97\.96%/);
});

test('a bar names its entry and period for assistive technology', () => {
  assert.ok(
    bars('work').some((b) => /aria-label="R&amp;D Lab — Intern — [^"]+2024[^"]+2025"/.test(b)),
  );
});

test('the zoom waits for the script, hidden until it runs', () => {
  assert.match(html, /<div class="tl-zoom"[^>]*hidden/);
});

for (const lang of LANGS) {
  test(`${lang}: the classic page carries the timeline, right after About`, () => {
    const page = fs.readFileSync(langOutFile(lang), 'utf8');
    const about = page.indexOf('<section id="about">');
    const timeline = page.indexOf('<section id="timeline"');
    const experience = page.indexOf('<section id="experience">');
    assert.ok(
      about >= 0 && about < timeline && timeline < experience,
      `${about} ${timeline} ${experience}`,
    );
  });

  test(`${lang}: every anchor on the classic page is unique, and every bar's target exists`, () => {
    const page = fs.readFileSync(langOutFile(lang), 'utf8');
    const ids = [...page.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(
      ids.filter((id, i) => ids.indexOf(id) !== i),
      [],
    );
    const targets = [
      ...page.matchAll(/class="tl-bar"[^>]*href="#([^"]+)"|href="#([^"]+)"[^>]*class="tl-bar"/g),
    ].map((m) => m[1] ?? m[2]);
    assert.ok(targets.length > 10, `only ${targets.length} linked bars`);
    for (const id of targets) assert.ok(ids.includes(id), `no #${id} on the page`);
  });
}

test('the page loads the timeline script and its styles', () => {
  const page = fs.readFileSync(langOutFile('fr'), 'utf8');
  assert.match(page, /<script src="\/js\/timeline\.js" defer><\/script>/);
  assert.match(
    fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8'),
    /@import "timeline\.css";/,
  );
});

test('the timeline is left out of print', () => {
  const print = fs.readFileSync(path.join(ROOT, 'css/print.css'), 'utf8');
  assert.match(print, /#timeline[^{]*\{[^}]*display:\s*none/);
});
