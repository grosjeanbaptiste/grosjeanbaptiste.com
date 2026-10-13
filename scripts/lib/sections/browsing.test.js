// What the classic page carries for its search and its skill filter: each bar
// of the timeline names the entry it stands for, the skills are listed under
// the timeline with the entries using each, and the entries on the page are
// handed to the search. Built at generation time; js/skill-filter.js and
// js/search.js only read it. Both stay hidden until their script runs.
const test = require('node:test');
const assert = require('node:assert/strict');
const { generateBrowsing } = require('./browsing');

const TODAY = new Date(Date.UTC(2026, 9, 3));
const resume = {
  work: [
    {
      company: 'Acteble',
      position: 'Founder',
      startDate: '2025-07-01',
      skills: ['Rust', 'Flutter'],
      projects: ['Baba'],
    },
  ],
  education: [
    {
      institution: 'UMons',
      studyType: 'Master',
      startDate: '2022-10-15',
      endDate: '2026-09-04',
      skills: ['Python'],
      blocks: [
        { year: '2022-2023', startDate: '2022-10-15', endDate: '2023-09-13', units: ['Algo'] },
      ],
    },
  ],
  projects: [
    { name: 'Baba', startDate: '2026-07-02', keywords: ['Rust', 'Prolog'] },
    { name: 'Hidden', keywords: ['Cobol'] },
  ],
  courses: [{ name: 'Algo', keywords: ['Algorithms'] }],
  volunteer: [],
};
const ON_PAGE = new Set(['work-acteble-founder', 'education-umons-master', 'project-baba']);
const { timeline, search } = generateBrowsing(resume, 'en', TODAY, ON_PAGE);
const bars = [...timeline.matchAll(/<(a|span) class="tl-bar"[^>]*>/g)].map((m) => m[0]);
const bar = (name) => bars.find((b) => b.includes(`data-name="${name}"`));
const chips = [
  ...timeline.matchAll(/<button type="button" class="tl-chip"[^>]*>[\s\S]*?<\/button>/g),
].map((m) => m[0]);
const chip = (skill) => chips.find((c) => c.includes(`data-skill="${skill}"`));
const index = JSON.parse(
  /<script type="application\/json" id="cv-index">([\s\S]*?)<\/script>/.exec(search)[1],
);

test('a bar names the entry it stands for', () => {
  assert.match(bar('Acteble'), /data-entry="work-acteble-founder"/);
});

test('a block of a degree stands for its degree', () => {
  assert.match(bar('22-23'), /data-entry="education-umons-master"/);
});

test('a course unit stands for itself', () => {
  assert.match(bar('Algo'), /data-entry="course-algo"/);
});

test('the skills are listed with the number of entries using each, most used first', () => {
  assert.deepEqual(
    chips.map((c) => /data-skill="([^"]+)"[\s\S]*tl-chip-count">(\d+)</.exec(c).slice(1, 3)),
    [
      ['Rust', '2'],
      ['Algorithms', '1'],
      ['Flutter', '1'],
      ['Prolog', '1'],
      ['Python', '1'],
    ],
  );
});

test('a skill names the entries that use it', () => {
  assert.match(chip('Rust'), /data-entries="work-acteble-founder project-baba"/);
});

test('a skill carries the sentence said once it is chosen', () => {
  assert.match(chip('Rust'), /data-status="2 entries use Rust"/);
});

test('no skill is chosen as the page opens', () => {
  for (const c of chips) assert.match(c, /aria-pressed="false"/);
});

test('an entry neither on the page nor on the timeline lends no skill', () => {
  assert.equal(chip('Cobol'), undefined);
});

test('the filter waits for its script, hidden until it runs', () => {
  assert.match(timeline, /<div class="tl-skills" hidden>/);
});

test('the filter is part of the timeline section', () => {
  assert.ok(timeline.indexOf('class="tl-skills"') < timeline.lastIndexOf('</section>'));
});

test('the status is empty and hidden until a skill is chosen', () => {
  assert.match(timeline, /<p class="tl-skill-status" hidden><output><\/output>/);
  assert.match(timeline, /<button type="button" class="tl-skill-clear">Clear filter<\/button>/);
});

test('the search is handed the entries that are on the page, and only those', () => {
  assert.deepEqual(
    index.entries.map((e) => e.id),
    ['work-acteble-founder', 'education-umons-master', 'project-baba'],
  );
});

test('the search is handed the skills as the filter lists them', () => {
  assert.deepEqual(index.skills[0], { skill: 'Rust', uses: 2 });
});

test('the search names each kind of entry in the page’s language', () => {
  assert.deepEqual([index.kinds.work, index.kinds.course], ['Work Experience', 'Course units']);
});

test('the search box is a dialog, closed as the page opens', () => {
  assert.match(search, /<dialog id="cv-search" aria-label="Search">/);
  assert.match(
    search,
    /<input type="search"[^>]*placeholder="Search experience, projects, skills…"/,
  );
  assert.match(search, /<p class="cv-search-empty" hidden>Nothing matches\.<\/p>/);
});

test('the timeline’s head carries the button that opens the search, hidden until its script runs', () => {
  const head = timeline.slice(
    timeline.indexOf('class="tl-head"'),
    timeline.indexOf('class="tl-scroll"'),
  );
  assert.match(
    head,
    /<button type="button" class="tl-search-open" aria-haspopup="dialog" aria-controls="cv-search" hidden>Search<\/button>/,
  );
});

test('a closing script tag inside the data cannot end the data', () => {
  const odd = { ...resume, work: [{ ...resume.work[0], summary: '</script><b>' }] };
  const out = generateBrowsing(odd, 'en', TODAY, ON_PAGE).search;
  assert.equal(out.match(/<\/script>/g).length, 1);
});

test('a CV with no skill has no filter', () => {
  const bare = { ...resume, work: [], education: [], projects: [], courses: [] };
  assert.doesNotMatch(generateBrowsing(bare, 'en', TODAY, new Set()).timeline, /tl-skills/);
});

test('more skills than the shortlist holds are kept behind a button', () => {
  const many = {
    ...resume,
    projects: [
      {
        name: 'Baba',
        startDate: '2026-07-02',
        keywords: Array.from({ length: 25 }, (_, i) => `S${i}`),
      },
    ],
  };
  const html = generateBrowsing(many, 'en', TODAY, ON_PAGE).timeline;
  assert.equal((html.match(/<li class="tl-chip-extra">/g) || []).length, 29 - 18);
  assert.match(
    html,
    /class="tl-chip-more" aria-expanded="false" data-more="All skills \(29\)" data-fewer="Fewer skills">All skills \(29\)</,
  );
});
