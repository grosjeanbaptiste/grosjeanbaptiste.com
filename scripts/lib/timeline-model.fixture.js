// The CV the timeline model's tests read: two experiences, a degree, and what
// they carried.
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

module.exports = { TODAY, resume };
