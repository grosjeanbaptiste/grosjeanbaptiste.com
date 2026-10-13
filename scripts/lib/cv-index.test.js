// The entries of the CV as the classic page's search and skill filter read
// them: one line per experience, degree, project, course unit, role and
// competition, under the id it carries on the page, with the skills it used.
const test = require('node:test');
const assert = require('node:assert/strict');
const { entriesOf, skillUsage } = require('./cv-index');

const resume = {
  work: [
    {
      company: 'Acteble',
      position: 'Founder',
      summary: 'Builds the platform.',
      skills: ['Rust', 'Flutter'],
    },
  ],
  education: [{ institution: 'UMons', studyType: 'Master', area: 'Computer Science' }],
  projects: [
    { name: 'Baba', description: 'A shell.', entity: 'Lab', keywords: ['Rust', 'Prolog', 'Rust'] },
  ],
  courses: [{ name: 'Algorithmique', summary: 'Algorithmics', keywords: ['Algorithms'] }],
  volunteer: [{ organization: 'UMons', position: 'Buddy' }],
  competitions: [{ title: 'Hackathon', organizer: 'EDITx' }],
};
const entries = entriesOf(resume);
const entry = (id) => entries.find((e) => e.id === id);

test('every kind of entry is listed, under the id it carries on the page', () => {
  assert.deepEqual(
    entries.map((e) => e.id),
    [
      'work-acteble-founder',
      'education-umons-master',
      'project-baba',
      'course-algorithmique',
      'volunteer-umons-buddy',
      'competition-hackathon',
    ],
  );
});

test('an experience is read by its position, at its employer', () => {
  const { kind, title, organisation, summary } = entry('work-acteble-founder');
  assert.deepEqual(
    [kind, title, organisation, summary],
    ['work', 'Founder', 'Acteble', 'Builds the platform.'],
  );
});

test('a degree is read by its type, then its speciality', () => {
  const { title, organisation, subtitle } = entry('education-umons-master');
  assert.deepEqual([title, organisation, subtitle], ['Master', 'UMons', 'Computer Science']);
});

test('a project is read by its name, with what it was', () => {
  const { title, organisation, subtitle } = entry('project-baba');
  assert.deepEqual([title, organisation, subtitle], ['Baba', 'Lab', 'A shell.']);
});

test('a course unit is read by its designation, with its translated title', () => {
  const { kind, title, subtitle } = entry('course-algorithmique');
  assert.deepEqual([kind, title, subtitle], ['course', 'Algorithmique', 'Algorithmics']);
});

test('a skill named twice by an entry is used once by it', () => {
  assert.deepEqual(entry('project-baba').skills, ['Rust', 'Prolog']);
});

test('an entry that names no skill uses none', () => {
  assert.deepEqual(entry('volunteer-umons-buddy').skills, []);
});

test('skills are counted by the entries that use them, the most used first', () => {
  assert.deepEqual(skillUsage(entries), [
    { skill: 'Rust', uses: 2 },
    { skill: 'Algorithms', uses: 1 },
    { skill: 'Flutter', uses: 1 },
    { skill: 'Prolog', uses: 1 },
  ]);
});

test('skills are told apart by their exact name', () => {
  const usage = skillUsage([{ skills: ['C'] }, { skills: ['C#'] }, { skills: ['C++'] }]);
  assert.deepEqual(usage.map((u) => u.skill).sort(), ['C', 'C#', 'C++']);
});
