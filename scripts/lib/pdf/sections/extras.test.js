// The references, on the landscape verso under the timeline: four columns
// across the page rather than one long column.
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildReferences } = require('./extras');
const I18N = require('../i18n');

const resume = {
  references: [
    { name: 'Ada, CTO at Engines & Co', reference: 'A pleasure to work with.' },
    { name: 'Grace', reference: 'Thorough and kind.' },
  ],
};
const references = () => buildReferences(resume, I18N.en);

test('the references are set in four columns, across the landscape verso', () => {
  assert.match(references(), /\\begin\{multicols\}\{4\}[\s\S]*\\end\{multicols\}/);
});

test('the heading spans the page, above the columns', () => {
  const tex = references();
  assert.ok(tex.indexOf('\\cvsection{References}') < tex.indexOf('\\begin{multicols}'));
});

test('each reference gives who speaks, then what they say', () => {
  assert.match(
    references(),
    /\\textbf\{Ada, CTO at Engines \\& Co\}[\s\S]*A pleasure to work with\./,
  );
});

test('a name is never left alone at the foot of a column', () => {
  assert.match(references(), /\\textbf\{Grace\}\\par\\nobreak/);
});

test('nothing is emitted without references', () => {
  assert.equal(buildReferences({}, I18N.en), '');
});
