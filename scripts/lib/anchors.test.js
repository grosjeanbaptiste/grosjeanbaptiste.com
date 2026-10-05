// The id an entry carries on a page, for the timeline's bars to link to. It
// must tell two entries apart in every language: the first version kept Latin
// letters only, so two roles at one employer, written in Chinese, got the same
// id — and the second role's bar led to the first.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { LANGS, langOutFile } = require('./config');
const { loadResume } = require('./data');
const { applyHtmlOverrides } = require('./site-overrides');
const { anchorOf } = require('./anchors');

test('an anchor names the kind, then the entry', () => {
  assert.equal(
    anchorOf('work', { company: 'Sénat belge', position: 'Chercheur en IA' }),
    'work-senat-belge-chercheur-en-ia',
  );
});

test('two roles at one employer, written in Chinese, get different anchors', () => {
  const lead = anchorOf('work', { company: 'Emvi.ai', position: 'AI 软件工艺负责人' });
  const crafter = anchorOf('work', { company: 'Emvi.ai', position: 'AI 软件工艺师' });
  assert.notEqual(lead, crafter);
});

test('an anchor holds nothing an id or a URL fragment would need escaped', () => {
  assert.match(anchorOf('project', { name: 'R&D "Lab" <1>' }), /^[\p{L}\p{N}-]+$/u);
});

for (const lang of LANGS) {
  test(`${lang}: every job and every degree has its own anchor`, () => {
    const resume = applyHtmlOverrides(loadResume(lang));
    const anchors = [
      ...resume.work.map((w) => anchorOf('work', w)),
      ...resume.education.map((e) => anchorOf('education', e)),
    ];
    assert.deepEqual(
      anchors.filter((a, i) => anchors.indexOf(a) !== i),
      [],
    );
  });

  test(`${lang}: the classic page carries each of them`, () => {
    const page = fs.readFileSync(langOutFile(lang), 'utf8');
    const resume = applyHtmlOverrides(loadResume(lang));
    for (const w of resume.work)
      assert.ok(page.includes(`id="${anchorOf('work', w)}"`), `no #${anchorOf('work', w)}`);
  });
}
