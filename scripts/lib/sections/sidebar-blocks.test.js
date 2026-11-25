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

const { renderProjectsBlock, renderSkillsBlocks } = require('./sidebar-blocks');

const T = { projects: 'Projects', softSkills: 'Personality' };

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

// A degree's course units are not projects — the data keeps them in their own
// section: listing them here put 42 course names between Kwalitijd and WebMenu
// in the sidebar.
test('course units are excluded from the sidebar projects list', () => {
  const resume = {
    projects: [{ name: 'Acteble', description: 'Short desc.' }],
    courses: [{ name: 'Algorithmique', entity: 'UMONS' }],
  };
  const html = renderProjectsBlock(resume, T);
  assert.match(html, /<strong>Acteble<\/strong>/);
  assert.doesNotMatch(html, /Algorithmique/);
});

test('a CV of nothing but course units yields no block', () => {
  const resume = { projects: [], courses: [{ name: 'Algorithmique' }] };
  assert.equal(renderProjectsBlock(resume, T), null);
});

test('a personality tag leads to the first recommendation that names it', () => {
  const resume = {
    skills: [{ name: 'SoftSkills', keywords: ['Teamwork', 'Creativity'] }],
    references: [{ traits: ['Leadership'] }, { traits: ['Teamwork'] }],
  };
  const html = renderSkillsBlocks(resume, T);
  assert.match(html, /<a class="skill-tag" href="#ref-1">Teamwork<\/a>/);
  assert.match(html, /<span class="skill-tag">Creativity<\/span>/);
});

test('the technical skills the sheet leaves out are folded in a <details> with their count', () => {
  const keywords = Array.from({ length: 80 }, (_, i) => `S${i}`);
  const html = renderSkillsBlocks(
    { skills: [{ name: 'HardSkills', keywords }] },
    { technicalSkills: 'T' },
  );
  const [before, folded] = html.split('<details class="skill-more">');
  assert.equal((before.match(/class="skill-tag"/g) || []).length, 71);
  assert.match(folded, /<summary>\+9<\/summary>/);
  assert.equal((folded.match(/class="skill-tag"/g) || []).length, 9);
});

test('a short list of skills is not folded', () => {
  const html = renderSkillsBlocks(
    { skills: [{ name: 'HardSkills', keywords: ['A', 'B'] }] },
    { technicalSkills: 'T' },
  );
  assert.doesNotMatch(html, /skill-more/);
});
