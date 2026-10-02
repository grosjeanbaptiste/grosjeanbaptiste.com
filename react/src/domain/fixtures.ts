// Test data builder: a small resume shaped like the exported document.
import type { Resume } from './resume';

export function aResume(): Resume {
  return {
    basics: { name: 'Baptiste Grosjean', label: 'Computer Scientist' },
    work: [
      {
        id: 'acteble-founder',
        company: 'Acteble',
        position: 'Founder',
        startDate: '2025-07-01',
        skills: ['Rust', 'Flutter'],
        projects: ['Acteble'],
      },
      {
        id: 'xtrada-data-scientist',
        company: 'Xtrada',
        position: 'Data Scientist',
        startDate: '2023-01-01',
        endDate: '2024-06-30',
        skills: ['Python'],
      },
    ],
    education: [
      {
        id: 'umons-master',
        institution: 'UMons',
        studyType: 'Master',
        area: 'Computer Science',
        startDate: '2022-10-15',
        endDate: '2026-09-04',
        skills: ['Python'],
        projects: ['Algorithmique'],
      },
    ],
    projects: [
      {
        id: 'baba',
        name: 'Baba',
        keywords: ['Rust', 'Prolog'],
        startDate: '2026-07-02',
        courseUnit: false,
      },
      {
        id: 'acteble',
        name: 'Acteble',
        keywords: ['Flutter'],
        startDate: '2025-07-01',
        courseUnit: false,
      },
      { id: 'algorithmique', name: 'Algorithmique', keywords: ['Algorithms'], courseUnit: true },
    ],
    volunteer: [
      {
        id: 'umons-rep',
        organization: 'UMons',
        position: 'Student representative',
        startDate: '2023-11-30',
      },
    ],
    skills: [{ name: 'HardSkills', keywords: ['Rust', 'Python'] }],
    languages: [{ language: 'French', fluency: 'Native' }],
  };
}
