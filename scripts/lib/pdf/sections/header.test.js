// The header's "Updated" line. See ../today.js for why the date is no longer
// LaTeX's \today: babel localises \today from \selectlanguage, and zh is
// deliberately compiled under babel's `english`, so the Chinese CV printed an
// English date beneath its Chinese label.

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildHeader } = require('./header');
const I18N = require('../i18n');

const RESUME = {
  basics: {
    name: 'Baptiste Grosjean',
    label: 'Computer Scientist',
    email: 'someone@example.com',
    phone: '+32 000 00 00 00',
    location: { city: 'Kraainem', region: 'Belgium' },
    profiles: [{ network: 'GitHub', username: 'someone' }],
  },
};

test('the updated date is typeset, not left to babel', () => {
  const tex = buildHeader(RESUME, I18N.zh, 'zh', new Date(2026, 8, 14));
  assert.doesNotMatch(tex, /\\today/, '\\today localizes from babel, which zh does not select');
});

test('the Chinese header carries a Chinese date', () => {
  const tex = buildHeader(RESUME, I18N.zh, 'zh', new Date(2026, 8, 14));
  assert.match(tex, /更新于/, 'the localized label is gone');
  assert.match(tex, /2026年9月14日/, 'the Chinese CV still dates itself in English');
  assert.doesNotMatch(tex, /September/, 'an English month name is still reaching the zh header');
});

test('the other languages keep the wording they had', () => {
  const day = new Date(2026, 8, 14);
  assert.match(buildHeader(RESUME, I18N.en, 'en', day), /Updated September 14, 2026/);
  assert.match(buildHeader(RESUME, I18N.fr, 'fr', day), /Mis à jour le 14 septembre 2026/);
  assert.match(buildHeader(RESUME, I18N.de, 'de', day), /Aktualisiert 14\. September 2026/);
});
