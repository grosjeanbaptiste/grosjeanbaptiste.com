// The first visit to another display used to pay for everything at the click.
// js/views-ahead.js, once the page is idle, reads the other displays' pages
// and warms the HTTP cache with what they announce — so the click finds it
// there. Asked of a real browser: what did the classic page fetch, unasked?
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { serve } = require('./print-fit-harness');
const { ROOT, LANGS, langOutFile } = require('./config');

const run = promisify(execFile);
const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];
const chrome = process.env.CHROME_PATH || CHROME_CANDIDATES.find((c) => fs.existsSync(c));

const PROBE = `<script>
const warned = [];
const warn = console.warn;
console.warn = (...args) => { warned.push(args.map(String).join(' ')); warn(...args); };
addEventListener('load', () => setTimeout(() => {
  const fetched = performance.getEntriesByType('resource').map((e) => new URL(e.name).pathname);
  document.documentElement.setAttribute('data-warned', JSON.stringify(warned));
  document.documentElement.setAttribute('data-fetched', JSON.stringify(fetched));
}, 14000));
</script>`;

let fetched;
let warned;
test.before(async () => {
  if (!chrome) {
    if (process.env.CI) throw new Error('no Chrome on this runner, so the warm-up went unchecked');
    return;
  }
  const server = await serve(PROBE);
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-ahead-'));
  try {
    const { stdout } = await run(
      chrome,
      [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1280,900',
        `--user-data-dir=${out}`,
        '--virtual-time-budget=40000',
        '--dump-dom',
        `http://127.0.0.1:${server.address().port}/__probe/fr/`,
      ],
      { timeout: 120000, maxBuffer: 1 << 28 },
    );
    const raw = (stdout.match(/data-fetched="([^"]*)"/) || [])[1];
    assert.ok(raw, 'the probe never ran');
    fetched = JSON.parse(raw.replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
    const rawWarned = (stdout.match(/data-warned="([^"]*)"/) || [])[1] ?? '[]';
    warned = JSON.parse(rawWarned.replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
  } finally {
    server.close();
    fs.rmSync(out, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  }
});

const check = (name, fn) =>
  test(name, (t) => {
    if (!fetched) return t.skip('no Chrome found — set CHROME_PATH to check the warm-up here');
    fn();
  });
const some = (pattern) => fetched.some((p) => pattern.test(p));

check('the classic page reads the interactive display ahead', () =>
  assert.ok(some(/^\/app\/fr\/$/)),
);
check('it warms the app’s script', () => assert.ok(some(/^\/app\/assets\/index-[\w-]+\.js$/)));
check('it warms the language’s data', () => assert.ok(some(/^\/app\/data\/fr\.json$/)));
check('it warms the picture of the PDF’s first page', () =>
  assert.ok(some(/^\/assets\/cv\/previews\/cv_grosjean_baptiste_fr-1\.webp$/)),
);
check('it warms the PDF engine', () => assert.ok(some(/^\/app\/assets\/pdf-[\w-]+\.js$/)));
check('it warms the PDF itself', () =>
  assert.ok(some(/^\/assets\/cv\/cv_grosjean_baptiste_fr\.pdf$/)),
);
// A page drawn at build time carries <link rel="preload" imagesrcset> with no
// href (React writes it for the photo): that is not a file to fetch.
check('it asks for nothing that is not a file', () =>
  assert.ok(!some(/\/null$/), 'fetched …/null'),
);
check('it warms the other displays without a single failure', () => assert.deepEqual(warned, []));
check('it leaves the XSLT displays alone', () => assert.ok(!some(/resume-fr.*\.xml$/)));

for (const lang of LANGS) {
  test(`${lang}: the classic page loads the warm-up script`, () => {
    assert.match(
      fs.readFileSync(langOutFile(lang), 'utf8'),
      /<script src="\/js\/views-ahead\.js" defer><\/script>/,
    );
  });
}

test('the app loads the warm-up script too', () => {
  assert.match(
    fs.readFileSync(path.join(ROOT, 'app/fr/index.html'), 'utf8'),
    /<script[^>]*src="\/js\/views-ahead\.js"/,
  );
});

// Chrome and Edge go further than warming files: on the way to a views-bar
// link (hover, touch) they prepare the whole page, so the click shows it at
// once. Speculation rules; other browsers ignore the block.
const rulesOf = (html) => {
  const block = html.match(/<script type="speculationrules">([\s\S]*?)<\/script>/);
  assert.ok(block, 'no speculation rules on the page');
  return JSON.parse(block[1]);
};

test('the classic page has the other displays prepared on the way to their link', () => {
  const [rule] = rulesOf(fs.readFileSync(langOutFile('fr'), 'utf8')).prerender;
  assert.equal(rule.eagerness, 'moderate');
  assert.match(JSON.stringify(rule.where), /\.views-bar-link/);
});

test('the classic page never prepares an XSLT display', () => {
  const [rule] = rulesOf(fs.readFileSync(langOutFile('fr'), 'utf8')).prerender;
  assert.ok(JSON.stringify(rule.where).includes('{"not":{"href_matches":"/*.xml"}}'));
});

test('the app prepares the classic page, not its own displays — those are routes of it', () => {
  const [rule] = rulesOf(fs.readFileSync(path.join(ROOT, 'app/fr/index.html'), 'utf8')).prerender;
  assert.ok(JSON.stringify(rule.where).includes('{"not":{"href_matches":"/app/*"}}'));
});
