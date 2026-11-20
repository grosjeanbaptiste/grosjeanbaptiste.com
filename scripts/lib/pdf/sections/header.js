const { tex } = require('../tex');
const { formatLongDate } = require('../today');

const PROFILE_INFO = {
  linkedin: (u) => `\\linkedin{${tex(u)}}`,
  github: (u) => `\\github{${tex(u)}}`,
  npm: (u) => `\\printinfo{\\faNpm}{${tex(u)}}`,
};

// The contact items, as altacv sets them: e-mail, phone, place, then the profiles.
function contactItems(b) {
  const profiles = (b.profiles || [])
    .map((p) => {
      const fn = PROFILE_INFO[(p.network || '').toLowerCase()];
      return fn ? fn(p.username || p.url || '') : '';
    })
    .filter(Boolean);
  const loc = [b.location?.city, b.location?.region].filter(Boolean).map(tex).join(', ');
  return {
    main: [`\\email{${tex(b.email)}}`, `\\phone{${tex(b.phone)}}`, `\\location{${loc}}`],
    profiles,
  };
}

function buildHeader(resume, t, lang, now = new Date()) {
  const b = resume.basics || {};
  const { main, profiles: list } = contactItems(b);
  const profiles = list.join('\n    ');
  return [
    `\\name{${tex(b.name)}}`,
    `\\tagline{${tex(b.label)}}`,
    '\\photoL{4cm}{profil}',
    '\\personalinfo{%',
    `    ${main[0]}\\smallskip`,
    `    ${main[1]}`,
    `    ${main[2]}\\\\`,
    `    ${profiles}`,
    `    \\printinfo{\\faCar}{${tex(t.driverLicense)}}`,
    // \today would localize from babel, and zh compiles under babel's
    // `english` on purpose — see ../today.js.
    `    \\begin{center}\\printinfo{\\faRedo}{${tex(t.updated)} ${tex(formatLongDate(now, lang))}}\\end{center}`,
    '}',
    '\\makecvheader',
  ].join('\n');
}

module.exports = { buildHeader, contactItems };
