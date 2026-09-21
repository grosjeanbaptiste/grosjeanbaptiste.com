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
const { spawn } = require('node:child_process');
const { serve, countPages, pageHeads, EXPECTED_PAGES } = require('./print-fit-harness');

const CANDIDATES = [
  process.env.FIREFOX_PATH,
  '/Applications/Firefox.app/Contents/MacOS/firefox',
  '/usr/bin/firefox',
  '/snap/bin/firefox',
].filter(Boolean);

const firefox = CANDIDATES.find((c) => fs.existsSync(c));

function profileFor(out) {
  const dir = path.join(out, 'profile');
  fs.mkdirSync(dir, { recursive: true });
  const pdf = path.join(out, 'firefox.pdf');
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
  return { dir, pdf };
}

// A PDF is only finished once its trailer is on disk. Waiting for the size to
// settle is not enough — it catches a file mid-write, which parses as zero
// pages and reads like a layout failure instead of a harness one.
function isComplete(pdf) {
  if (!fs.existsSync(pdf) || fs.statSync(pdf).size === 0) return false;
  const bytes = fs.readFileSync(pdf, 'latin1');
  return bytes.startsWith('%PDF') && bytes.includes('%%EOF');
}

// Firefox stays open after printing, so watch for the file and stop it.
async function printWith(bin, profile, pdf, url) {
  const child = spawn(bin, ['--headless', '--profile', profile, url], {
    stdio: 'ignore',
    env: { ...process.env, MOZ_HEADLESS: '1' },
  });
  try {
    for (let waited = 0; waited < 120000; waited += 500) {
      await new Promise((r) => setTimeout(r, 500));
      if (isComplete(pdf)) return;
    }
    const size = fs.existsSync(pdf) ? fs.statSync(pdf).size : 'no file';
    throw new Error(`Firefox never finished a PDF (${size} bytes after 120s)`);
  } finally {
    child.kill('SIGKILL');
  }
}

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
    const { dir, pdf } = profileFor(out);
    await printWith(firefox, dir, pdf, `http://127.0.0.1:${port}/__xslt/en`);
    const pages = countPages(pdf);
    assert.equal(
      pages,
      EXPECTED_PAGES,
      `the XSLT view prints on ${pages} pages, not ${EXPECTED_PAGES} — ${pageHeads(pdf, pages)}`,
    );
    // Two pages is not enough on its own: the left column used to run past the
    // first sheet and sit beside the references, where the PDF gives the verso
    // to the references alone.
    assert.match(
      pageHeads(pdf, pages),
      /p2: References/,
      `the verso does not open on the references — the left column has spilled onto it: ${pageHeads(pdf, pages)}`,
    );
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
    server.close();
  }
});
