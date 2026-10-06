// The vertical CV as a whole: a recto in two columns, then a verso that opens
// with the timeline, the degrees and the references under it.
const test = require('node:test');
const assert = require('node:assert/strict');
const { generateLatex } = require('./document');
const { loadResume } = require('./data');
const { FIT_PLANS, PRINT_PLAN_INDEX } = require('./config');
const { TRACK, TITLES } = require('./sections/timeline');

const TODAY = new Date(Date.UTC(2026, 9, 5));
const PLAN = FIT_PLANS[PRINT_PLAN_INDEX];
const latex = (resume = loadResume('en')) => generateLatex(resume, 'en', PLAN, TODAY);
const verso = (resume) => latex(resume).split('\\clearpage')[1];
const at = (text, needle) => {
  const index = text.search(needle);
  assert.ok(index >= 0, `${needle} is not in the document`);
  return index;
};

test('the recto closes its two columns before the verso starts', () => {
  const tex = latex();
  assert.ok(at(tex, /\\end\{paracol\}/) < at(tex, /\\clearpage/));
});

test('the verso opens with the timeline', () => {
  assert.match(
    verso(),
    /\\cvsectiontight\s*\\cvsection\{Timeline\}\s*\\noindent\\begin\{tikzpicture\}/,
  );
});

test('the timeline shows what each entry carried inside it', () => {
  // The outline of an entry with its projects, drawn behind the bars.
  assert.match(verso(), /\\filldraw\[draw=/);
});

test('the references come right under the timeline, in columns', () => {
  const page = verso();
  assert.match(
    page,
    /\\end\{tikzpicture\}\\par\s*\\cvsection\{References\}\s*\\begin\{multicols\}/,
  );
});

test('the verso carries nothing but the timeline and the references', () => {
  assert.equal([...verso().matchAll(/\\cvsection\{/g)].length, 2);
});

test('the verso is no longer split into a sidebar and a main column', () => {
  assert.doesNotMatch(verso(), /paracol|switchcolumn/);
});

// Three sections share the verso with the picture: their headings sit closer
// than on the recto, and the change is undone before the document ends.
test('the verso tightens its section headings, for itself only', () => {
  assert.match(
    verso(),
    /\\begingroup\\let\\cvsection\\cvsectiontight[\s\S]*\\endgroup\s*\\end\{landscape\}/,
  );
});

test('volunteering is no section of its own any more', () => {
  assert.doesNotMatch(latex(), /\\cvsectionsidebar\{[^}]*Volunteer/);
});

test('the recto is what it was: sidebar, about, experience', () => {
  const recto = latex().split('\\clearpage')[0];
  assert.match(
    recto,
    /\\columnratio\{0\.30\}[\s\S]*\\switchcolumn[\s\S]*\\cvsection\{Experience\}/,
  );
  assert.doesNotMatch(recto, /tikzpicture|multicols/);
});

// The verso is a landscape page: the timeline needs the width, and the
// references run in four columns under it. The recto stays upright.
test('the verso is set in landscape, the recto is not', () => {
  const tex = latex();
  assert.match(verso(), /^\s*\\begin\{landscape\}[\s\S]*\\end\{landscape\}\s*\\end\{document\}/);
  assert.doesNotMatch(tex.split('\\clearpage')[0], /\\begin\{landscape\}/);
});

test('the landscape verso is a page a reader sees turned, not text set sideways', () => {
  // pdflscape rotates the page itself in the PDF, where lscape only turns the text.
  assert.match(latex(), /\\usepackage\{pdflscape\}/);
});

test('the timeline is no wider than the landscape text block', () => {
  // The long side of A4 less the two 8 mm margins it gets once turned.
  assert.ok(-TITLES.x + TRACK <= 297 - 16);
});

test('the timeline uses the width the landscape page gives it', () => {
  assert.ok(-TITLES.x + TRACK > 210, 'it is still sized for an upright page');
});
