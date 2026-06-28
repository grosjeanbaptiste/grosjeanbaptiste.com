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
    updated: 'Updated',
  },
  fr: {
    ...sharedFr,
    experience: 'Expérience',
    present: "aujourd'hui",
    degreeIn: '—',
    gpa: 'Note',
    updated: 'Mis à jour le',
  },
  nl: {
    ...sharedNl,
    experience: 'Werkervaring',
    present: 'heden',
    degreeIn: '—',
    gpa: 'Score',
    updated: 'Bijgewerkt',
  },
  es: {
    ...sharedEs,
    experience: 'Experiencia',
    present: 'actualidad',
    degreeIn: '—',
    gpa: 'Nota',
    updated: 'Actualizado',
  },
  de: {
    ...sharedDe,
    experience: 'Berufserfahrung',
    present: 'heute',
    degreeIn: '—',
    gpa: 'Note',
    updated: 'Aktualisiert',
  },
  zh: {
    ...sharedZh,
    experience: '工作经验',
    present: '至今',
    degreeIn: '—',
    gpa: '成绩',
    updated: '更新于',
  },
};
