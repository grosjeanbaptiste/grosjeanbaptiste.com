// Which entry of the CV hosts what. A project belongs to the entries that
// reference it by name. A volunteering role belongs to the experience or the
// degree of its organisation, matched on the organisation's first word inside
// the entry's name ("EPHEC …" inside "… (EPHEC-EPS)") — the rule the page has
// always embedded roles by. One rule for the timelines and the PDF's entries.

const firstWord = (text) => String(text || '').split(/\s+/)[0];
// The name an entry is hosted under: its employer, its school or its title.
const nameOf = (record) => record.company || record.institution || record.title || '';

const hostsProject = (record, project) => (record.projects || []).includes(project.name);
const namesRole = (name, role) =>
  Boolean(firstWord(role.organization)) &&
  String(name || '').includes(firstWord(role.organization));
const hostsRole = (record, role) => namesRole(nameOf(record), role);

const rolesHostedBy = (resume, record) =>
  (resume.volunteer || []).filter((role) => hostsRole(record, role));

// The roles no experience and no degree hosts: they must be shown on their own.
const unhostedRoles = (resume) => {
  const entries = [...(resume.work || []), ...(resume.education || [])];
  return (resume.volunteer || []).filter((role) => !entries.some((e) => hostsRole(e, role)));
};

module.exports = { hostsProject, hostsRole, namesRole, rolesHostedBy, unhostedRoles };
