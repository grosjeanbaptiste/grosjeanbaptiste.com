// Strings shared between the HTML site (scripts/lib/i18n/{lang}.js) and the
// PDF generator (scripts/lib/pdf/i18n.js). Each consumer spreads this base
// and overrides only when the values genuinely diverge (e.g. HTML uses
// "Work Experience" while the PDF uses the shorter "Experience").
module.exports = {
  about: 'About Me',
  education: 'Education',
  volunteer: 'Volunteer',
  projects: 'Projects',
  awards: 'Awards',
  interests: 'Interests',
  references: 'References',
  technicalSkills: 'Technical Skills',
  currentlyLearning: 'Currently Learning',
  softSkills: 'Soft Skills',
  languages: 'Languages',
  typicalDay: 'Typical Day',
  type: 'Type',
  keywords: 'Keywords',
  driverLicense: 'Driver License B',
  dailyLifeLabels: {
    sleep: 'Sleep',
    transport: 'Transport',
    work: 'Work',
    classes: 'Classes',
    sport: 'Sport',
    others: 'Others',
  },
};
