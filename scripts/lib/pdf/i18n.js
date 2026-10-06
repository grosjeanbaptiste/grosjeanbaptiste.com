// PDF I18N: each language spreads scripts/lib/i18n/shared/{lang}.js and adds
// PDF-only keys. Section titles that diverge from the HTML site (e.g.
// "Experience" instead of "Work Experience") are overridden here.
const sharedEn = require('../i18n/shared/en');
const sharedFr = require('../i18n/shared/fr');
const sharedNl = require('../i18n/shared/nl');
const sharedEs = require('../i18n/shared/es');
const sharedDe = require('../i18n/shared/de');
const sharedZh = require('../i18n/shared/zh');

module.exports = {
  en: {
    ...sharedEn,
    experience: 'Experience',
    present: 'present',
    degreeIn: 'in',
    gpa: 'GPA',
    inProgress: 'in progress',
    curriculumVitae: 'Curriculum Vitae',
    timeline: 'Timeline',
    competitions: 'Competitions',
    eveningSchedule: 'evening schedule',
    timelineSpan: (n) => `last ${n} years`,
  },
  fr: {
    ...sharedFr,
    experience: 'Expérience',
    present: "aujourd'hui",
    degreeIn: '—',
    gpa: 'Note',
    inProgress: 'en cours',
    curriculumVitae: 'Curriculum vitæ',
    timeline: 'Chronologie',
    competitions: 'Compétitions',
    eveningSchedule: 'horaire décalé',
    timelineSpan: (n) => `${n} dernières années`,
  },
  nl: {
    ...sharedNl,
    experience: 'Werkervaring',
    present: 'heden',
    degreeIn: '—',
    gpa: 'Score',
    inProgress: 'in uitvoering',
    curriculumVitae: 'Curriculum vitae',
    timeline: 'Tijdlijn',
    competitions: 'Wedstrijden',
    eveningSchedule: 'avondonderwijs',
    timelineSpan: (n) => `laatste ${n} jaar`,
  },
  es: {
    ...sharedEs,
    experience: 'Experiencia',
    present: 'actualidad',
    degreeIn: '—',
    gpa: 'Nota',
    inProgress: 'en curso',
    curriculumVitae: 'Currículum vítae',
    timeline: 'Cronología',
    competitions: 'Competiciones',
    eveningSchedule: 'horario vespertino',
    timelineSpan: (n) => `últimos ${n} años`,
  },
  de: {
    ...sharedDe,
    experience: 'Berufserfahrung',
    present: 'heute',
    degreeIn: '—',
    gpa: 'Note',
    inProgress: 'läuft',
    curriculumVitae: 'Lebenslauf',
    timeline: 'Zeitleiste',
    competitions: 'Wettbewerbe',
    eveningSchedule: 'Abendstudium',
    timelineSpan: (n) => `letzte ${n} Jahre`,
  },
  zh: {
    ...sharedZh,
    experience: '工作经验',
    present: '至今',
    degreeIn: '—',
    gpa: '成绩',
    inProgress: '进行中',
    curriculumVitae: '简历',
    timeline: '时间线',
    competitions: '竞赛',
    eveningSchedule: '夜间课程',
    timelineSpan: (n) => `最近 ${n} 年`,
  },
};
