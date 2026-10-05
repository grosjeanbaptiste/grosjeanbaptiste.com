// @vitest-environment node
// A page of the app, drawn at build time: the HTML a visitor sees before the
// app's JavaScript has arrived. Rendered here as the build does, in Node, with
// no browser at all.
import { describe, expect, it } from 'vitest';
import { prerender } from './prerender';
import { InMemorySource } from './ui/app-harness';

const TODAY = new Date('2026-10-01');
const en = await new InMemorySource().load('en');

describe('a page drawn at build time', () => {
  it('shows who the CV is about', () => {
    expect(prerender('/en', en, TODAY)).toMatch(/<h1[^>]*>Baptiste Grosjean<\/h1>/);
  });

  it('draws the timeline, bars and all', () => {
    expect(prerender('/en', en, TODAY)).toContain('class="timeline-bar"');
  });

  it('shows an entry’s panel on that entry’s page', () => {
    expect(prerender('/en/project/baba', en, TODAY)).toContain('class="entry-panel"');
  });

  it('shows the PDF reader with the pictures of its pages', () => {
    const html = prerender('/en/pdf', en, TODAY);
    expect(html).toContain('class="pdf-toolbar"');
    expect(html).toContain('src="/cv_en-1.webp"');
  });

  it('marks the current display in the views bar', () => {
    expect(prerender('/en/pdf/timeline', en, TODAY)).toMatch(
      /aria-current="page"[^>]*>Timeline \(PDF\)/,
    );
  });

  // The build cannot know the visitor's theme: the icon is CSS's to choose,
  // from the theme the page's inline script has already set.
  it('leaves the theme icon to the page’s theme', () => {
    const html = prerender('/en', en, TODAY);
    expect(html).toContain('class="theme-icon"');
    expect(html).not.toMatch(/[☾☀]/);
  });

  it('never leaves a loading message on the page', () => {
    expect(prerender('/en', en, TODAY)).not.toContain('aria-busy');
  });
});
