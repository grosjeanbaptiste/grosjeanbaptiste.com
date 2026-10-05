// The same two-page guarantee, for the rich XSLT theme — the view you get by
// opening the XML itself, which only Firefox still renders.
//
// It printed on nine to ten sheets: none of the content reductions or density
// work had ever been applied there, and the sheet's own max-width: 820px
// breakpoint matches a printed page, so it came out in the MOBILE layout.
//
// Measured in Firefox for the same reason as its sibling: it is the only engine
// that renders this view at all.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');
const { serve, countPages, pageHeads, EXPECTED_PAGES } = require('./print-fit-harness');
const { printedWithRetry } = require('./print-fit-retry');

const CANDIDATES = [
  process.env.FIREFOX_PATH,
  '/Applications/Firefox.app/Contents/MacOS/firefox',
  '/usr/bin/firefox',
  '/snap/bin/firefox',
].filter(Boolean);

const firefox = CANDIDATES.find((c) => fs.existsSync(c));

// A fresh profile per launch: the retry must not inherit the lock or the cache
// of the launch that just timed out.
function profileFor(out, attempt, pdf) {
  const dir = path.join(out, `profile-${attempt}`);
  fs.mkdirSync(dir, { recursive: true });
  const p = 'print.printer_Mozilla_Save_to_PDF';
  fs.writeFileSync(
    path.join(dir, 'user.js'),
    [
      'user_pref("print.always_print_silent", true);',
      'user_pref("print_printer", "Mozilla Save to PDF");',
      `user_pref("${p}.print_to_file", true);`,
      `user_pref("${p}.print_to_filename", ${JSON.stringify(pdf)});`,
      `user_pref("${p}.print_paper_id", "iso_a4");`,
      `user_pref("${p}.print_headerleft", "");`,
      `user_pref("${p}.print_headerright", "");`,
      `user_pref("${p}.print_footerleft", "");`,
      `user_pref("${p}.print_footerright", "");`,
      'user_pref("browser.cache.disk.enable", false);',
      'user_pref("browser.cache.memory.enable", false);',
      '',
    ].join('\n'),
  );
  return dir;
}

// A PDF is only finished once its trailer is on disk. Waiting for the size to
// settle is not enough — it catches a file mid-write, which parses as zero
// pages and reads like a layout failure instead of a harness one.
function isComplete(pdf) {
  if (!fs.existsSync(pdf) || fs.statSync(pdf).size === 0) return false;
  const bytes = fs.readFileSync(pdf, 'latin1');
  return bytes.startsWith('%PDF') && bytes.includes('%%EOF');
}

// Firefox stays open after printing, so watch for the file and stop it. A
// deadline that runs out is reported, not thrown: on a loaded machine the render
// simply did not fit in two minutes, and print-fit-retry.js gives it one more
// launch before calling the layout broken.
async function printWith(bin, profile, pdf, url) {
  fs.rmSync(pdf, { force: true });
  const child = spawn(bin, ['--headless', '--profile', profile, url], {
    stdio: 'ignore',
    env: { ...process.env, MOZ_HEADLESS: '1' },
  });
  try {
    for (let waited = 0; waited < 120000; waited += 500) {
      await new Promise((r) => setTimeout(r, 500));
      if (isComplete(pdf)) return null;
    }
    const size = fs.existsSync(pdf) ? fs.statSync(pdf).size : 'no file';
    return `Firefox never finished a PDF (${size} bytes after 120s)`;
  } finally {
    child.kill('SIGKILL');
  }
}

test('the printed Education section states each degree once', () => {
  // The identity block carries a degrees summary that repeats the first
  // Education entry word for word, three lines apart. The entries win — they
  // carry the institution and the dates as well — so the summary is hidden.
  const xsl = fs.readFileSync(
    path.resolve(__dirname, '../../assets/xslt/resume-transform.xsl'),
    'utf8',
  );
  assert.match(
    xsl,
    /\.sidebar \.degree \{ display: none/,
    'the degrees summary prints alongside the Education entries, so the degree appears twice',
  );
});

test('the XSLT theme prints on two pages too', async (t) => {
  if (!firefox) {
    if (process.env.CI) {
      throw new Error('no Firefox on this runner — install one or set FIREFOX_PATH');
    }
    t.skip('no Firefox found — set FIREFOX_PATH to enforce the XSLT two-page fit here');
    return;
  }
  const server = await serve();
  const { port } = server.address();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-xslt-'));
  try {
    const pdf = path.join(out, 'firefox.pdf');
    const url = `http://127.0.0.1:${port}/__xslt/en`;
    // A launch that produced nothing is retried once and says so; the page
    // count below never is. See print-fit-retry.js.
    await printedWithRetry('Firefox (XSLT theme)', (attempt) =>
      printWith(firefox, profileFor(out, attempt, pdf), pdf, url),
    );
    const pages = countPages(pdf);
    assert.equal(
      pages,
      EXPECTED_PAGES,
      `the XSLT view prints on ${pages} pages, not ${EXPECTED_PAGES} — ${pageHeads(pdf, pages)}`,
    );
    // Two pages is not enough on its own: the left column used to run past the
    // first sheet and sit on the verso. The verso opens with the timeline —
    // it is part of the page, so it is printed — then gives the references.
    assert.match(
      pageHeads(pdf, pages),
      /p2: Timeline/i,
      `the verso does not open on the timeline — the left column has spilled onto it: ${pageHeads(pdf, pages)}`,
    );
    const verso = execFileSync('pdftotext', ['-f', '2', '-l', '2', pdf, '-'], { encoding: 'utf8' });
    assert.match(verso, /References/, 'the references are not on the verso, under the timeline');
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
    server.close();
  }
});

test('the minimal theme prints the timeline too, where the page has it', () => {
  const minimal = fs.readFileSync(
    path.resolve(__dirname, '../../assets/xslt/resume-transform-minimal.xsl'),
    'utf8',
  );
  assert.match(minimal, /@media print \{[\s\S]*html #timeline \{ display: block/);
});
