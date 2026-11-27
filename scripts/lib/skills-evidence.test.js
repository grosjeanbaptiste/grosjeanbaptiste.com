// Every technical skill the CV claims is one of a project, a course or a job.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadResume } = require('./data');

test('each hard skill is named by a project, a course or a job', () => {
  const r = loadResume('en');
  const used = new Set();
  const add = (list) => {
    for (const k of list || []) used.add(String(k).toLowerCase());
  };
  for (const p of r.projects || []) add([...(p.keywords || []), ...(p.uses || [])]);
  for (const c of r.courses || []) add(c.keywords);
  for (const w of r.work || []) add([...(w.uses || []), ...(w.keywords || [])]);
  for (const e of r.education || []) add(e.uses);
  const hard = r.skills.find((s) => s.name === 'HardSkills').keywords;
  assert.deepEqual(
    hard.filter((k) => !used.has(k.toLowerCase())),
    [],
  );
});
