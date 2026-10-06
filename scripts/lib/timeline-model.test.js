// The timeline's model. Projects and volunteering are not lanes of their own:
// each sits inside the experience or the degree it belongs to — a group, the
// host on its first row and what it carried underneath. Only a project that no
// experience or degree references keeps a lane.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineOf } = require('./timeline-model');

const TODAY = new Date(Date.UTC(2026, 9, 3));
const resume = (extra = {}) => ({
  work: [
    {
      company: 'Senate',
      position: 'Researcher',
      startDate: '2025-11-03',
      endDate: '2026-06-30',
      projects: ['Synergy'],
    },
    { company: 'Xtrada', position: 'Crafter', startDate: '2023-08-21', endDate: '2024-09-22' },
  ],
  education: [
    {
      institution: 'UMons',
      studyType: 'Master',
      startDate: '2022-10-15',
      endDate: '2026-09-04',
      projects: ['Synergy'],
    },
  ],
  projects: [
    { name: 'Synergy', startDate: '2025-11-03', endDate: '2026-06-30' },
    { name: 'Baba', startDate: '2026-07-02' },
    { name: 'Algorithmique', courseUnit: true },
  ],
  volunteer: [
    { organization: 'UMons', position: 'Buddy', startDate: '2023-11-30', endDate: '2026-09-04' },
  ],
  ...extra,
});
const lane = (timeline, kind) => timeline.lanes.find((l) => l.kind === kind);
const barsOf = (timeline, kind) => lane(timeline, kind).bars;
const named = (bars, name) => bars.find((b) => b.name === name);

test('the lanes are the experiences, the degrees, and the projects nobody hosts', () => {
  assert.deepEqual(
    timelineOf(resume(), TODAY).lanes.map((l) => l.kind),
    ['work', 'education', 'projects'],
  );
});

test('a project sits under the experience that references it', () => {
  const work = barsOf(timelineOf(resume(), TODAY), 'work');
  const [host, child] = [named(work, 'Senate'), named(work, 'Synergy')];
  assert.deepEqual([host.depth, child.depth, child.row], [0, 1, host.row + 1]);
});

test('a project an experience and a degree both reference sits under both', () => {
  assert.ok(named(barsOf(timelineOf(resume(), TODAY), 'education'), 'Synergy'));
});

test('volunteering sits under the entry of its organisation, named by the role', () => {
  const education = barsOf(timelineOf(resume(), TODAY), 'education');
  const role = named(education, 'Buddy');
  assert.deepEqual([role.depth, role.kind], [1, 'volunteer']);
});

test('a project no experience or degree references keeps a lane of its own', () => {
  assert.deepEqual(
    barsOf(timelineOf(resume(), TODAY), 'projects').map((b) => b.name),
    ['Baba'],
  );
});

test('course units stay out of the timeline', () => {
  const all = timelineOf(resume(), TODAY).lanes.flatMap((l) => l.bars.map((b) => b.name));
  assert.ok(!all.includes('Algorithmique'));
});

test('what a host carried at the same time is stacked under it, not overprinted', () => {
  const education = barsOf(timelineOf(resume(), TODAY), 'education');
  assert.notEqual(named(education, 'Synergy').row, named(education, 'Buddy').row);
});

test('a group takes every row it uses: the next entry goes below it, not through it', () => {
  // Two degrees at the same time, the first with two things under it.
  const both = resume({
    education: [
      {
        institution: 'UMons',
        studyType: 'Master',
        startDate: '2022-10-15',
        endDate: '2026-09-04',
        projects: ['Synergy'],
      },
      { institution: 'Other', studyType: 'Course', startDate: '2024-01-01', endDate: '2024-06-30' },
    ],
  });
  const education = barsOf(timelineOf(both, TODAY), 'education');
  const rows = ['UMons', 'Synergy', 'Buddy'].map((n) => named(education, n).row);
  assert.ok(!rows.includes(named(education, 'Other').row));
});

test('a lane says how many rows it needs', () => {
  assert.equal(lane(timelineOf(resume(), TODAY), 'education').rows, 3);
});

test('a group is outlined over the rows and the months it covers', () => {
  const [group] = lane(timelineOf(resume(), TODAY), 'work').groups;
  assert.deepEqual(
    [group.row, group.rows],
    [named(barsOf(timelineOf(resume(), TODAY), 'work'), 'Senate').row, 2],
  );
});

test('an entry with nothing under it is not outlined as a group', () => {
  const groups = lane(timelineOf(resume(), TODAY), 'work').groups;
  assert.equal(groups.length, 1);
});

// EduCraft was built at a hackathon: the DSL files it under that competition,
// not under a job or a degree. Read as hostless, it sat alone among the
// projects.
const withHackathon = () =>
  resume({
    projects: [{ name: 'EduCraft', startDate: '2024-03-29', endDate: '2024-03-31' }],
    competitions: [
      {
        title: 'Hackathon 2024',
        organizer: 'Citizens of Wallonia',
        date: '2024-03-17',
        projects: ['EduCraft'],
      },
      { title: 'Hackathon 2023', organizer: 'Citizens of Wallonia', date: '2023-03-31' },
    ],
  });

test('a competition is an entry of the timeline, in a lane after the degrees', () => {
  assert.deepEqual(
    timelineOf(withHackathon(), TODAY).lanes.map((l) => l.kind),
    ['work', 'education', 'competitions'],
  );
});

test('a project built at a competition sits under it', () => {
  const bars = barsOf(timelineOf(withHackathon(), TODAY), 'competitions');
  const [host, child] = [named(bars, 'Hackathon 2024'), named(bars, 'EduCraft')];
  assert.deepEqual([host.depth, child.depth, child.row], [0, 1, host.row + 1]);
});

test('a competition is placed on the month it was held', () => {
  const host = named(barsOf(timelineOf(withHackathon(), TODAY), 'competitions'), 'Hackathon 2023');
  assert.deepEqual([host.start, host.end], [2023 * 12 + 2, 2023 * 12 + 2]);
});

// A display that fits labels around the bars needs to know which outline is a
// bar's own, and which belongs to a neighbour.
test('a bar and the outline of its group carry the same group number', () => {
  const lane = timelineOf(resume(), TODAY).lanes.find((l) => l.kind === 'work');
  const [outline] = lane.groups;
  const inside = lane.bars.filter((b) => b.group === outline.group);
  assert.ok(inside.length >= 2, 'the outlined group holds its entry and what it carried');
  assert.equal(inside.filter((b) => b.depth === 0).length, 1);
});

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
