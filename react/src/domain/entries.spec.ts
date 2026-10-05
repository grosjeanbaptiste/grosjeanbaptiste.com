import { describe, expect, it } from 'vitest';
import { entriesOf } from './entries';
import { aResume } from './fixtures';

describe('entriesOf', () => {
  const entries = entriesOf(aResume());
  const byId = (id: string) => entries.find((e) => e.id === id);

  it('turns a job into a work entry titled by position, at its company', () => {
    expect(byId('acteble-founder')).toMatchObject({
      kind: 'work',
      title: 'Founder',
      organisation: 'Acteble',
    });
  });

  it('takes a project’s skills from its keywords', () => {
    expect(byId('baba')?.skills).toEqual(['Rust', 'Prolog']);
  });

  it('files course units apart from projects', () => {
    expect(byId('algorithmique')?.kind).toBe('course');
  });

  it('links a job to the projects it names, by id', () => {
    expect(byId('acteble-founder')?.related).toEqual(['acteble']);
  });

  it('links a project back to the job that names it', () => {
    expect(byId('acteble')?.related).toContain('acteble-founder');
  });

  it('dates a course unit with the degree that lists it', () => {
    expect(byId('algorithmique')?.period?.start).toEqual({ year: 2022, month: 10 });
  });

  it('titles a degree by its type and keeps the field of study as subtitle', () => {
    expect(byId('umons-master')).toMatchObject({ title: 'Master', subtitle: 'Computer Science' });
  });

  it('lists volunteering under its organisation', () => {
    expect(byId('umons-rep')).toMatchObject({ kind: 'volunteer', organisation: 'UMons' });
  });

  it('fails loudly on a reference to a project that does not exist', () => {
    const broken = aResume();
    const work = broken.work.map((w) => ({ ...w, projects: ['Ghost'] }));
    expect(() => entriesOf({ ...broken, work })).toThrow(/Ghost/);
  });

  // The page embeds a volunteering role under the entry of its organisation;
  // the model said nothing of it, so the timeline could not nest it.
  it('links a volunteering role to the degree of its organisation', () => {
    expect(byId('umons-rep')?.related).toEqual(['umons-master']);
  });

  it('makes an entry of a competition, on the day it was held', () => {
    const entries = entriesOf({
      ...aResume(),
      competitions: [
        { id: 'hackathon-2024', title: 'Hackathon 2024', organizer: 'COW', date: '2024-03-17' },
      ],
    });
    expect(entries.find((e) => e.id === 'hackathon-2024')).toMatchObject({
      kind: 'competition',
      title: 'Hackathon 2024',
      organisation: 'COW',
    });
  });

  it('links a competition to the project built there', () => {
    const entries = entriesOf({
      ...aResume(),
      competitions: [
        { id: 'hackathon', title: 'Hackathon', date: '2025-07-05', projects: ['Acteble'] },
      ],
    });
    expect(entries.find((e) => e.id === 'hackathon')?.related).toEqual(['acteble']);
  });
});
