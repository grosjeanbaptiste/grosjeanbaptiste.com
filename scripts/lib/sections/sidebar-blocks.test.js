// Behavioural tests for the sidebar projects block. Run with `node --test`.
//
// Parity guard: the JS sidebar projects list must match the XSLT
// `sidebar-projects` template (assets/xslt/resume-transform.xsl), which
// renders the project's short `description` — NOT its longer `summary`.
// A project with both fields previously diverged between the two renderers
// (JS showed summary, XSLT showed description); this pins the JS side to
// description so the two views stay identical.

const test = require('node:test');
const assert = require('node:assert/strict');

const { renderProjectsBlock } = require('./sidebar-blocks');

const T = { projects: 'Projects' };

test('sidebar projects use the short description, not the summary', () => {
  const resume = {
    projects: [
      { name: 'Acteble', description: 'Short desc.', summary: 'Much longer summary text.' },
    ],
  };
  const html = renderProjectsBlock(resume, T);
  assert.match(html, /Short desc\./);
  assert.doesNotMatch(html, /longer summary/);
});

test('a project without a description renders name-only (no summary fallback)', () => {
  const resume = { projects: [{ name: 'Kwalitijd', summary: 'Survey manager.' }] };
  const html = renderProjectsBlock(resume, T);
  assert.match(html, /<strong>Kwalitijd<\/strong>/);
  assert.doesNotMatch(html, /Survey manager/);
  assert.doesNotMatch(html, /—/);
});

test('a project url wraps the name in a link', () => {
  const resume = {
    projects: [{ name: 'Acteble', url: 'https://www.acteble.com', description: 'Short desc.' }],
  };
  const html = renderProjectsBlock(resume, T);
  assert.match(html, /<a href="https:\/\/www\.acteble\.com"[^>]*><strong>Acteble<\/strong><\/a>/);
});

test('an empty projects list yields no block', () => {
  assert.equal(renderProjectsBlock({ projects: [] }, T), null);
});
