// The same two-page guarantee as print-fit.test.js, measured with Firefox.
//
// This file exists because the Chrome-only version was not enough: it reported
// two pages while the site really printed four in Firefox, which will not
// fragment the two-column block across sheets. One engine is not a guarantee.
//
// Firefox has no --print-to-pdf, so the page is served with a script that calls
// print() itself, and the browser is pointed at a throwaway profile configured
// to print silently to a file. One language is enough to catch an engine-level
// regression; Chrome covers all six next door.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { serve, countPages, EXPECTED_PAGES } = require('./print-fit-harness');

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

// Firefox stays open after printing, so watch for the file and stop it.
async function printWith(bin, profile, pdf, url) {
  const child = spawn(bin, ['--headless', '--profile', profile, url], { stdio: 'ignore' });
  try {
    for (let waited = 0; waited < 90000; waited += 500) {
      await new Promise((r) => setTimeout(r, 500));
      // Wait for the size to settle: the file appears before it is complete.
      if (fs.existsSync(pdf)) {
        const first = fs.statSync(pdf).size;
        await new Promise((r) => setTimeout(r, 1500));
        if (first > 0 && fs.statSync(pdf).size === first) return;
      }
    }
    throw new Error('Firefox never produced a PDF');
  } finally {
    child.kill('SIGKILL');
  }
}

test('the printed CV is two pages in Firefox too', async (t) => {
  if (!firefox) {
    if (process.env.CI) {
      throw new Error('no Firefox on this runner — install one or set FIREFOX_PATH');
    }
    t.skip('no Firefox found — set FIREFOX_PATH to enforce the two-page fit here');
    return;
  }
  const server = await serve();
  const { port } = server.address();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-ff-'));
  try {
    const { dir, pdf } = profileFor(out);
    await printWith(firefox, dir, pdf, `http://127.0.0.1:${port}/__print/`);
    const pages = countPages(pdf);
    assert.equal(
      pages,
      EXPECTED_PAGES,
      `Firefox prints the CV on ${pages} pages, not ${EXPECTED_PAGES} — it will not split the two-column block, so the recto must fit one sheet on its own`,
    );
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
    server.close();
  }
});
