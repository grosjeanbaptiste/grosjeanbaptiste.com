// What the classic page's search offers besides the entries and the skills:
// the CV in another language, the theme, the two PDFs — the actions of the
// interactive view's palette. Handed to js/search.js with the rest of its data.
const test = require('node:test');
const assert = require('node:assert/strict');
const { generateBrowsing } = require('./browsing');

const { search } = generateBrowsing({}, 'en', new Date(Date.UTC(2026, 9, 3)), new Set());
const index = JSON.parse(
  /<script type="application\/json" id="cv-index">([\s\S]*?)<\/script>/.exec(search)[1],
);

test('the search offers the other languages, each leading to its page', () => {
  const languages = index.actions.filter((a) => a.hint === 'Language');
  assert.deepEqual(
    languages.map((a) => [a.label, a.href]),
    [
      ['Français', '/fr/'],
      ['Nederlands', '/nl/'],
      ['Español', '/es/'],
      ['Deutsch', '/de/'],
      ['中文', '/zh/'],
    ],
  );
});

test('the search offers the theme, which the page’s own button toggles', () => {
  assert.deepEqual(
    index.actions.find((a) => a.press),
    {
      label: 'Toggle theme',
      press: '#theme-toggle',
    },
  );
});

test('the search offers the two PDFs of the language', () => {
  assert.deepEqual(
    index.actions.filter((a) => a.hint === 'PDF').map((a) => [a.label, a.href]),
    [
      ['Download CV', '/assets/cv/cv_grosjean_baptiste_en.pdf'],
      ['Download the timeline', '/assets/cv/cv_grosjean_baptiste_timeline_en.pdf'],
    ],
  );
});
