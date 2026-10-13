// A project on the timeline tells more than its name: its bar reads what kind
// of project it is, and its preview the part taken in it, what it was and what
// it was built with — as a course unit's line tells the course.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineOf } = require('./timeline-model');
const { timelineForXml } = require('./xml-timeline');
const { generateTimeline } = require('./sections/timeline');

const TODAY = new Date(Date.UTC(2026, 9, 3));
const resume = {
  work: [
    { company: 'Acteble', position: 'Founder', startDate: '2025-07-01', projects: ['Acteble API'] },
  ],
  education: [],
  projects: [
    {
      name: 'Acteble API',
      startDate: '2025-07-01',
      type: 'API',
      roles: ['Founder', 'Maintainer'],
      description: 'Backend of the platform.',
      keywords: ['Rust', 'Tokio', 'Axum', 'Tonic', 'gRPC', 'SQLx', 'PostgreSQL'],
    },
    { name: 'Baba', startDate: '2026-07-02', type: 'CLI' },
    { name: 'Kwalitijd', startDate: '2026-08-02' },
  ],
  volunteer: [],
};
const barsOf = (timeline) => timeline.lanes.flatMap((lane) => lane.bars);
const named = (name, bars = barsOf(timelineOf(resume, TODAY))) => bars.find((b) => b.name === name);

test('a project under its host reads its name, then what kind of project it is', () => {
  assert.equal(named('Acteble API').caption, 'Acteble API · API');
});

test('a project that stands alone reads its kind too', () => {
  assert.equal(named('Baba').caption, 'Baba · CLI');
});

test('a project of no stated kind reads its name alone', () => {
  assert.equal(named('Kwalitijd').caption, 'Kwalitijd');
});

test('a project tells its kind, then the parts taken in it', () => {
  assert.equal(named('Acteble API').detail, 'API · Founder · Maintainer');
});

test('a project tells what it was', () => {
  assert.equal(named('Acteble API').summary, 'Backend of the platform.');
});

test('a project tells the first five things it was built with', () => {
  assert.equal(named('Acteble API').skills, 'Rust · Tokio · Axum · Tonic · gRPC');
});

test('a project with nothing more to tell tells nothing more', () => {
  const { detail, summary, skills } = named('Kwalitijd');
  assert.deepEqual([detail, summary, skills], ['', '', '']);
});

test('an experience tells nothing more than it did', () => {
  const { detail, summary, skills } = named('Acteble');
  assert.deepEqual([detail, summary, skills], ['', '', '']);
});

const html = generateTimeline(resume, 'en', TODAY, new Set());
const tagOf = (name) =>
  [...html.matchAll(/<(a|span) class="tl-bar"[^>]*>/g)]
    .map((m) => m[0])
    .find((bar) => bar.includes(`data-name="${name}"`));

test('the page hands the preview what the project tells', () => {
  const tag = tagOf('Acteble API');
  assert.match(tag, /data-detail="API · Founder · Maintainer"/);
  assert.match(tag, /data-summary="Backend of the platform\."/);
  assert.match(tag, /data-skills="Rust · Tokio · Axum · Tonic · gRPC"/);
});

test('a bar with nothing more to tell carries no empty attribute', () => {
  assert.doesNotMatch(tagOf('Kwalitijd'), /data-(detail|summary|skills)/);
});

test('the kind and the parts are said aloud with the name', () => {
  assert.match(tagOf('Acteble API'), /aria-label="Acteble API — API · Founder · Maintainer — /);
});

test('the bar shows the kind beside the name', () => {
  assert.match(html, /<span>Acteble API · API<\/span>/);
});

test('the XML mirrors carry what the project tells', () => {
  const bars = barsOf(timelineForXml(resume, 'en', TODAY));
  const { caption, detail, summary, skills } = named('Acteble API', bars);
  assert.deepEqual(
    [caption, detail, summary, skills],
    [
      'Acteble API · API',
      'API · Founder · Maintainer',
      'Backend of the platform.',
      'Rust · Tokio · Axum · Tonic · gRPC',
    ],
  );
});

test('the XML mirrors leave out what a bar does not tell', () => {
  const bar = named('Kwalitijd', barsOf(timelineForXml(resume, 'en', TODAY)));
  assert.deepEqual([bar.detail, bar.summary, bar.skills], [undefined, undefined, undefined]);
});
