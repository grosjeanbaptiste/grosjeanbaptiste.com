import { describe, expect, it } from 'vitest';
import { identify } from './export-lib.mjs';

const canonical = {
  work: [{ company: 'Acteble', position: 'Founder' }],
  education: [{ institution: 'UMons' }],
  projects: [
    { name: 'Baba', type: 'CLI' },
    { name: 'Algorithmique', type: 'Course unit' },
  ],
  volunteer: [{ organization: 'UMons', position: 'Student representative' }],
};

const localized = {
  work: [{ company: 'Acteble', position: 'Fondateur' }],
  education: [{ institution: 'UMons' }],
  projects: [
    { name: 'Baba', type: 'CLI' },
    { name: 'Algorithmique', type: 'Unité d’enseignement' },
  ],
  volunteer: [{ organization: 'UMons', position: 'Délégué étudiant' }],
};

describe('identify', () => {
  it('derives ids from the canonical English entry, not the translation', () => {
    expect(identify(canonical, localized).work[0].id).toBe('acteble-founder');
  });

  it('keeps the translated text', () => {
    expect(identify(canonical, localized).work[0].position).toBe('Fondateur');
  });

  it('marks course units from the canonical type, whatever the translation says', () => {
    expect(identify(canonical, localized).projects.map((p) => p.courseUnit)).toEqual([false, true]);
  });

  it('identifies volunteering by organisation and position', () => {
    expect(identify(canonical, localized).volunteer[0].id).toBe('umons-student-representative');
  });

  it('identifies education by institution and degree, leaving the long field of study out', () => {
    const umons = [
      { institution: 'UMons', studyType: 'Master of Science - MS', area: 'Computer Science' },
    ];
    const ids = identify({ ...canonical, education: umons }, { ...localized, education: umons });
    expect(ids.education[0].id).toBe('umons-master-of-science-ms');
  });

  it('suffixes repeated ids so every entry keeps its own page', () => {
    const twice = { ...canonical, work: [canonical.work[0], canonical.work[0]] };
    const ids = identify(twice, { ...localized, work: twice.work }).work.map((w) => w.id);
    expect(ids).toEqual(['acteble-founder', 'acteble-founder-2']);
  });

  it('fails loudly when the overlay is not index-aligned with the canonical data', () => {
    const short = { ...localized, projects: localized.projects.slice(0, 1) };
    expect(() => identify(canonical, short)).toThrow(/projects.*2.*1/);
  });
});
