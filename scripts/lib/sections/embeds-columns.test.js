// The LaTeX CV sets a list of four projects or more in three columns, each
// project with its kind only (pdf/sections/_trailer.js). The printed page does
// the same, or the founder entry's nine projects push the recto onto a second
// sheet. On screen the row keeps its description.
const test = require('node:test');
const assert = require('node:assert/strict');
const { appendEmbeds } = require('./embeds');
const { PROJECT_COLUMNS_FROM } = require('../pdf/config');
const I18N = require('../i18n');

const project = (i) => ({ name: `P${i}`, summary: `What P${i} does.`, type: `Kind${i}` });
const html = (count) => {
  const projects = Array.from({ length: count }, (_, i) => project(i));
  const entry = { name: 'Acteble', projects: projects.map((p) => p.name) };
  const ctx = { projects, courses: [], volunteer: [], references: [] };
  const parts = [];
  appendEmbeds(parts, entry, entry.name, ctx, I18N.en, 'en');
  return parts.join('\n');
};

test('a list of four projects is marked long, as the PDF counts it', () => {
  assert.equal(PROJECT_COLUMNS_FROM, 4);
  assert.match(html(4), /<div class="embedded-projects many">/);
});

test('a list of three projects is not', () => {
  assert.match(html(3), /<div class="embedded-projects">/);
  assert.doesNotMatch(html(3), /many|project-kind/);
});

test('a long list gives each project its kind, beside its description', () => {
  assert.match(
    html(4),
    /<strong>P0<\/strong><span class="project-desc"> — <span[^>]*>What P0 does\.<\/span><\/span><span class="project-kind"> · Kind0<\/span>/,
  );
});

test('a project without a kind gets no empty kind', () => {
  const projects = [0, 1, 2, 3].map((i) => ({ name: `P${i}`, summary: 's' }));
  const ctx = { projects, courses: [], volunteer: [], references: [] };
  const parts = [];
  appendEmbeds(parts, { projects: projects.map((p) => p.name) }, 'X', ctx, I18N.en, 'en');
  assert.doesNotMatch(parts.join('\n'), /project-kind/);
});

test('a long course-unit list is never set in columns', () => {
  const courses = [0, 1, 2, 3].map((i) => ({ name: `U${i}`, type: 'Course' }));
  const ctx = { projects: [], courses, volunteer: [], references: [] };
  const parts = [];
  appendEmbeds(parts, { courses: courses.map((c) => c.name) }, 'X', ctx, I18N.en, 'en');
  assert.doesNotMatch(parts.join('\n'), /many|project-kind/);
});
