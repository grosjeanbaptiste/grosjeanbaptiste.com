// Test harness: the whole app on a memory router, fed by an in-memory source.
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { aViews } from '../domain/fixture-views';
import { aResume } from '../domain/fixtures';
import type { ResumeDocument } from '../domain/resume';
import type { ResumeSource } from '../domain/resume-source';
import { App } from './App';
import type { PdfRenderer, PdfView } from './pdf/pdf-renderer';

export const aUi = (): Record<string, string> => ({
  experience: 'Work Experience',
  education: 'Education',
  projects: 'Projects',
  courseUnits: 'Course units',
  volunteer: 'Volunteering',
  downloadCV: 'Download CV',
  themeLabel: 'Toggle theme',
  langMenuLabel: 'Language',
});

export class InMemorySource implements ResumeSource {
  readonly requested: string[] = [];
  constructor(private readonly failing = false) {}

  async load(lang: string): Promise<ResumeDocument> {
    this.requested.push(lang);
    if (this.failing) throw new Error('offline');
    return { lang, ui: aUi(), resume: aResume(), ...aViews(lang) };
  }
}

// A PDF engine that draws nothing and remembers what it was asked.
export class FakePdfRenderer implements PdfRenderer {
  readonly opened: string[] = [];
  readonly calls: string[] = [];
  constructor(private readonly failing = false) {}

  async open(url: string): Promise<PdfView> {
    this.opened.push(url);
    if (this.failing) throw new Error('corrupt PDF');
    const calls = this.calls;
    return {
      pages: 2,
      zoomIn: () => calls.push('zoomIn'),
      zoomOut: () => calls.push('zoomOut'),
      fitWidth: () => calls.push('fitWidth'),
      destroy: () => calls.push('destroy'),
    };
  }
}

let current = '';
function LocationProbe() {
  const location = useLocation();
  current = `${location.pathname}${location.search}`;
  return null;
}
export const currentLocation = () => current;

export function renderApp(
  path: string,
  source: ResumeSource = new InMemorySource(),
  pdf: PdfRenderer = new FakePdfRenderer(),
) {
  const user = userEvent.setup();
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <App
        source={source}
        pdf={pdf}
        browserLanguages={['nl-BE', 'en']}
        today={new Date('2026-10-01')}
      />
      <LocationProbe />
    </MemoryRouter>,
  );
  return { user, ...view };
}
