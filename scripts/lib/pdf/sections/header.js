const { tex } = require('../tex');

const PROFILE_INFO = {
  linkedin: (u) => `\\linkedin{${tex(u)}}`,
  github: (u) => `\\github{${tex(u)}}`,
  npm: (u) => `\\printinfo{\\faNpm}{${tex(u)}}`,
};

function buildHeader(resume, t) {
  const b = resume.basics || {};
  const profiles = (b.profiles || [])
    .map((p) => {
      const fn = PROFILE_INFO[(p.network || '').toLowerCase()];
      return fn ? fn(p.username || p.url || '') : '';
    })
    .filter(Boolean)
    .join('\n    ');
  const loc = [b.location?.city, b.location?.region].filter(Boolean).map(tex).join(', ');
  return [
    `\\name{${tex(b.name)}}`,
    `\\tagline{${tex(b.label)}}`,
    '\\photoL{4cm}{profil}',
    '\\personalinfo{%',
    `    \\email{${tex(b.email)}}\\smallskip`,
    `    \\phone{${tex(b.phone)}}`,
    `    \\location{${loc}}\\\\`,
    `    ${profiles}`,
    `    \\printinfo{\\faCar}{${tex(t.driverLicense)}}`,
    `    \\begin{center}\\printinfo{\\faRedo}{${tex(t.updated)} \\today}\\end{center}`,
    '}',
    '\\makecvheader',
  ].join('\n');
}

module.exports = { buildHeader };
