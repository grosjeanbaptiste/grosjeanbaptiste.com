// Every link of the rich XSLT theme wears the theme's accent, as every link of
// the classic page wears its own: a link outside the few blocks styled one by
// one (the menu, the projects, the skill tags) came out in the browser's blue.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./config');

const sheet = fs.readFileSync(path.join(ROOT, 'assets/xslt/resume-transform.xsl'), 'utf8');

test('the rich theme colours every link with its accent', () => {
  assert.match(sheet, /^\s*a \{ color: var\(--accent\); text-decoration: none; \}$/m);
});
