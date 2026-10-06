// What a bar of the timeline reads, and where it is placed — to the day.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineOf } = require('./timeline-model');
const { TODAY, resume } = require('./timeline-model.fixture');

// What a bar reads. An employer met twice gives two bars of the same name:
// the position is then what tells them apart.
const twice = () =>
  resume({
    work: [
      {
        company: 'Xtrada',
        position: 'Data Scientist',
        startDate: '2024-03-01',
        endDate: '2024-09-22',
      },
      { company: 'Xtrada', position: 'Crafter', startDate: '2023-08-21', endDate: '2024-02-28' },
      { company: 'Senate', position: 'Researcher', startDate: '2025-11-03', endDate: '2026-06-30' },
    ],
  });
const captions = (r) =>
  timelineOf(r, TODAY)
    .lanes.find((l) => l.kind === 'work')
    .bars.filter((b) => b.depth === 0)
    .map((b) => b.caption)
    .sort();

test('entries of one lane that share a name are told apart by their title', () => {
  assert.deepEqual(captions(twice()), ['Senate', 'Xtrada · Crafter', 'Xtrada · Data Scientist']);
});

test('an entry whose name is its own reads by its name alone', () => {
  assert.deepEqual(captions(resume()), ['Senate', 'Xtrada']);
});

test('what an entry carried reads by its name', () => {
  const carried = timelineOf(resume(), TODAY)
    .lanes.flatMap((l) => l.bars)
    .find((b) => b.depth === 1);
  assert.equal(carried.caption, carried.name);
});

// Bars are placed to the day. A degree that ends the day the next one begins
// used to claim that whole month, as did the next: the two overlapped, and the
// second was pushed onto a row of its own.
const handover = () =>
  resume({
    work: [],
    projects: [],
    volunteer: [],
    education: [
      {
        institution: 'EPHEC',
        studyType: 'Bachelor',
        startDate: '2018-09-30',
        endDate: '2022-10-15',
      },
      { institution: 'UMons', studyType: 'Master', startDate: '2022-10-15', endDate: '2026-09-04' },
    ],
  });
const degrees = () => timelineOf(handover(), TODAY).lanes.find((l) => l.kind === 'education').bars;

test('an entry that begins the day another ends follows it on the same row', () => {
  assert.deepEqual(
    degrees().map((b) => b.row),
    [0, 0],
  );
});

test('a bar ends where the next one begins when they share that day', () => {
  const [bachelor, master] = degrees().sort((a, b) => a.start - b.start);
  assert.equal(bachelor.end + 1, master.start);
});

test('a bar starts on its day, not at the start of its month', () => {
  const [bachelor] = degrees().sort((a, b) => a.start - b.start);
  // 30 September: 29 of the month's 30 days in.
  assert.equal(bachelor.start, 2018 * 12 + 8 + 29 / 30);
});

test('a date given to the month covers the whole month', () => {
  const monthly = resume({
    work: [{ company: 'Lab', position: 'Dev', startDate: '2024-03', endDate: '2024-05' }],
    education: [],
    projects: [],
    volunteer: [],
  });
  const [bar] = timelineOf(monthly, TODAY).lanes[0].bars;
  assert.deepEqual([bar.start, bar.end + 1], [2024 * 12 + 2, 2024 * 12 + 5]);
});

test('a competition, held on a day, still shows as a month', () => {
  const held = resume({ competitions: [{ title: 'Hackathon', date: '2024-03-17' }] });
  const [bar] = timelineOf(held, TODAY).lanes.find((l) => l.kind === 'competitions').bars;
  assert.deepEqual([bar.start, bar.end + 1], [2024 * 12 + 2, 2024 * 12 + 3]);
});

test('an entry that starts and ends the same day is a day long, not nothing', () => {
  const brief = resume({
    work: [{ company: 'Lab', position: 'Dev', startDate: '2024-03-10', endDate: '2024-03-10' }],
    education: [],
    projects: [],
    volunteer: [],
  });
  const [bar] = timelineOf(brief, TODAY).lanes[0].bars;
  assert.ok(bar.end + 1 > bar.start);
});
