// One headless Chrome run against a page of the site with a probe script in
// its <head> (print-fit-harness.js serves it): the probe writes what it saw as
// JSON in an attribute of <html>, read back here from the dumped DOM. Gives
// undefined when the machine has no Chrome — except in CI, where a browser
// test that did not run is a failure, not a skip.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { serve } = require('./print-fit-harness');

const run = promisify(execFile);
const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];
const chrome = process.env.CHROME_PATH || CHROME_CANDIDATES.find((c) => fs.existsSync(c));

// `page`: the path to open, query included; `attribute`: where the probe writes.
async function probed(probe, page, attribute) {
  if (!chrome) {
    if (process.env.CI) throw new Error(`no Chrome on this runner, so ${page} went unchecked`);
    return undefined;
  }
  const server = await serve(probe);
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-probe-'));
  try {
    const { stdout } = await run(
      chrome,
      [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1280,900',
        `--user-data-dir=${out}`,
        '--virtual-time-budget=8000',
        '--dump-dom',
        `http://127.0.0.1:${server.address().port}/__probe${page}`,
      ],
      { timeout: 90000, maxBuffer: 1 << 28 },
    );
    const raw = (stdout.match(new RegExp(`${attribute}="([^"]*)"`)) || [])[1];
    assert.ok(raw, 'the probe never ran to its end');
    return JSON.parse(raw.replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
  } finally {
    server.close();
    // A Chrome killed by the timeout may still be writing its profile: retry,
    // so a failed clean-up never hides the error that matters.
    fs.rmSync(out, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  }
}

module.exports = { probed };
