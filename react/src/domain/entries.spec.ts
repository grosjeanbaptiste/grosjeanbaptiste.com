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
});
