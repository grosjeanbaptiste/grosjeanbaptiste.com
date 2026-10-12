// The XML the XSLT themes read keeps course units in their own collection, as
// the data does: a <course> is never a <project>, and a degree names its
// courses apart from its projects.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { ROOT } = require('./config');

const xml = fs.readFileSync(path.join(ROOT, 'assets/data/resume-en.xml'), 'utf8');
// A top-level collection sits one level under <resume>: two spaces deep.
const collection = (name) =>
  xml.match(new RegExp(`\\n  <${name}>\\n([\\s\\S]*?)\\n  </${name}>`))[1];
const master = xml.slice(xml.indexOf('<studyType>Master of Science'));
const degree = master.slice(0, master.indexOf('</school>'));

test('the XML carries the fifty course units as courses', () => {
  assert.equal(collection('courses').match(/<course>/g).length, 50);
});

test('a course of the XML carries its translated title', () => {
  assert.match(
    collection('courses'),
    /<name>Réseaux<\/name>\s*<keywords>[\s\S]*?<summary>Networks<\/summary>/,
  );
});

test('no project of the XML is a course unit', () => {
  assert.doesNotMatch(collection('projects'), /Course unit|<name>Algorithmique<\/name>/);
});

test('a degree of the XML names its courses apart from its projects', () => {
  assert.match(degree, /<courses>\s*<course>Algorithmique<\/course>/);
  assert.doesNotMatch(degree, /<project>Algorithmique<\/project>/);
});
