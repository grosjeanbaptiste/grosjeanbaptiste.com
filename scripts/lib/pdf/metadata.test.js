// A PDF carries document properties — Title, Author, Subject, Keywords — that
// are independent of the file name. Ours were empty, so every reader fell back
// to "cv_grosjean_baptiste_fr.pdf" in its tab, its window title, the Finder's
// Title column and a search engine's result line.

const test = require('node:test');
const assert = require('node:assert/strict');
const I18N = require('./i18n');
const { LANGS } = require('./config');
const { loadResume } = require('./data');
const { buildXmpData, xmpEscape } = require('./metadata');

const field = (xmp, name) => {
  const m = new RegExp(`\\\\${name}\\{([\\s\\S]*?)\\}\\n`).exec(`${xmp}\n`);
  return m ? m[1] : null;
};
const xmpFor = (lang) => buildXmpData(loadResume(lang), I18N[lang], lang);

test('the title names the person and the document, in the page language', () => {
  assert.equal(field(xmpFor('fr'), 'Title'), 'Baptiste Grosjean — Curriculum vitæ');
  assert.equal(field(xmpFor('de'), 'Title'), 'Baptiste Grosjean — Lebenslauf');
  assert.equal(field(xmpFor('zh'), 'Title'), 'Baptiste Grosjean — 简历');
});

test('every language gets a title, an author, a subject and a language tag', () => {
  for (const lang of LANGS) {
    const xmp = xmpFor(lang);
    assert.ok(field(xmp, 'Title'), `${lang}: no \\Title`);
    assert.equal(field(xmp, 'Author'), 'Baptiste Grosjean');
    assert.ok(field(xmp, 'Language'), `${lang}: no \\Language`);
  }
});

test('the subject is the localized professional label', () => {
  assert.equal(field(xmpFor('fr'), 'Subject'), 'Informaticien');
  assert.equal(field(xmpFor('nl'), 'Subject'), 'Informaticus');
});

// Keywords are what an ATS reads to index the file. The technical skills are
// the useful ones — soft skills are translated prose, the hard skills are the
// tool names a recruiter actually searches for.
test('the keywords are the technical skills, pdfx-separated', () => {
  const kw = field(xmpFor('en'), 'Keywords');
  assert.match(kw, /(^|\\sep )SQL(\\sep|$)/);
  assert.match(kw, /\\sep Python/);
  assert.ok(!kw.includes('Resilience'), 'soft skills do not belong in the keywords');
});

// pdfx reads the .xmpdata file as LaTeX: an unescaped "%" comments out the
// closing brace and the compile dies with "File ended while scanning use of
// \xmp@doparse" — a hard failure, several hundred lines into the log.
test('the characters that derail the LaTeX parse are escaped', () => {
  assert.equal(xmpEscape('100% remote'), '100\\% remote');
  assert.equal(xmpEscape('a^b'), 'a\\^{}b');
  assert.equal(xmpEscape('{x}'), '\\{x\\}');
});

// \textbackslash{} comes out of pdfx as the literal "\{}", so there is nothing
// to escape a backslash with — better a loud refusal than a mangled property.
test('a backslash has no escape here and is refused loudly', () => {
  assert.throws(() => xmpEscape('a\\b'), /backslash/i);
});

// & and # travel through pdfx as-is (it XML-escapes & itself). Escaping them
// keeps the backslash: "C#" would ship as "C\#".
test('characters pdfx handles itself are left alone', () => {
  assert.equal(xmpEscape('C# & R&D_x'), 'C# & R&D_x');
});
