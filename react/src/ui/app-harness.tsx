// Test harness: the whole app on a memory router, fed by an in-memory source.
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { aViews } from '../domain/fixture-views';
import { aResume } from '../domain/fixtures';
import type { ResumeDocument } from '../domain/resume';
import type { ResumeSource } from '../domain/resume-source';
import { App } from './App';
import { APP_BASE } from './paths';
import type { PdfRenderer, PdfView } from './pdf/pdf-renderer';

export const aUi = (): Record<string, string> => ({
  about: 'About',
  experience: 'Work Experience',
  education: 'Education',
  projects: 'Projects',
  courseUnits: 'Course units',
  volunteer: 'Volunteering',
  downloadCV: 'Download CV',
  downloadTimeline: 'Download the timeline',
  themeLabel: 'Toggle theme',
  langMenuLabel: 'Language',
});

export class InMemorySource implements ResumeSource {
  readonly requested: string[] = [];
  constructor(private readonly failing = false) {}

  async load(lang: string): Promise<ResumeDocument> {
    this.requested.push(lang);
    if (this.failing) throw new Error('offline');
    const page = (file: string, n: number) => ({
      src: `/${file}-${n}.webp`,
      width: 1000,
      height: 1414,
    });
    const pictures = {
      [`/assets/cv/cv_grosjean_baptiste_${lang}.pdf`]: [
        page(`cv_${lang}`, 1),
        page(`cv_${lang}`, 2),
      ],
      [`/assets/cv/cv_grosjean_baptiste_timeline_${lang}.pdf`]: [page(`timeline_${lang}`, 1)],
      [`/assets/cv/cv_grosjean_baptiste_timeline_5y_${lang}.pdf`]: [page(`timeline_5y_${lang}`, 1)],
      [`/assets/cv/cv_grosjean_baptiste_timeline_2y_${lang}.pdf`]: [page(`timeline_2y_${lang}`, 1)],
    };
    return { lang, ui: aUi(), resume: aResume(), ...aViews(lang), pictures };
  }
}

// A PDF engine that draws nothing and remembers what it was asked.
export class FakePdfRenderer implements PdfRenderer {
  readonly opened: string[] = [];
  readonly calls: string[] = [];
  readonly prefetched: string[] = [];
  prepared = 0;
  private finish: () => void = () => {};
  private readonly drawing: Promise<void>;

  // `holding`: the first page stays undrawn until finishDrawing().
  constructor(
    private readonly failing = false,
    private readonly failingAhead = false,
    holding = false,
  ) {
    this.drawing = new Promise((resolve) => {
      this.finish = resolve;
    });
    if (!holding) this.finish();
  }

  finishDrawing() {
    this.finish();
  }

  async prepare(): Promise<void> {
    this.prepared += 1;
    if (this.failingAhead) throw new Error('engine unavailable');
  }

  async prefetch(url: string): Promise<void> {
    this.prefetched.push(url);
    if (this.failingAhead) throw new Error('offline');
  }

  // Draws one marker per document, as a real engine draws its pages.
  async open(url: string, container: HTMLDivElement): Promise<PdfView> {
    this.opened.push(url);
    const page = document.createElement('div');
    page.className = 'fake-page';
    page.textContent = url;
    container.append(page);
    if (this.failing) throw new Error('corrupt PDF');
    const calls = this.calls;
    return {
      pages: 2,
      drawn: this.drawing,
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
    <MemoryRouter basename={APP_BASE} initialEntries={[`${APP_BASE}${path}`]}>
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
