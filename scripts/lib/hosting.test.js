// Which entry of the CV hosts what: a volunteering role belongs to the
// experience or the degree of its organisation, a project to the entries that
// name it. Shared by the timelines and by the PDF's entries.
const test = require('node:test');
const assert = require('node:assert/strict');
const { rolesHostedBy, unhostedRoles, hostsProject } = require('./hosting');

const master = { institution: 'UMons', studyType: 'Master', projects: ['Remi'] };
const bachelor = { institution: 'Ecole Pratique Hautes Etudes Commerciales (EPHEC-EPS)' };
const job = { company: 'Croix-Rouge de Belgique', position: 'Developer' };
const buddy = { organization: 'UMons', position: 'Buddy' };
const tutor = { organization: 'EPHEC École Supérieure de Promotion Sociale', position: 'Tutor' };
const firstAid = { organization: 'Croix-Rouge', position: 'First aid' };
const scout = { organization: 'Scouts', position: 'Leader' };
const resume = {
  work: [job],
  education: [master, bachelor],
  volunteer: [buddy, tutor, firstAid, scout],
};

test('a role belongs to the degree of its organisation', () => {
  assert.deepEqual(rolesHostedBy(resume, master), [buddy]);
});

test('the organisation is matched on its first word, inside the name of the school', () => {
  assert.deepEqual(rolesHostedBy(resume, bachelor), [tutor]);
});

test('a role belongs to an experience the same way', () => {
  assert.deepEqual(rolesHostedBy(resume, job), [firstAid]);
});

test('a role whose organisation is no entry of the CV is hosted by none', () => {
  assert.deepEqual(unhostedRoles(resume), [scout]);
});

test('a role without an organisation is hosted by none', () => {
  const nameless = { position: 'Helper' };
  assert.deepEqual(unhostedRoles({ ...resume, volunteer: [nameless] }), [nameless]);
});

test('a project belongs to an entry that names it', () => {
  assert.equal(hostsProject(master, { name: 'Remi' }), true);
  assert.equal(hostsProject(bachelor, { name: 'Remi' }), false);
});
