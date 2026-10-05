// Runs a probe script against a page of the site in headless Chrome and gives
// back what the probe left in an attribute of <html>, parsed from JSON. `null`
// when no Chrome is installed (a test then skips) — except in CI, where a
// missing Chrome is an error: the check must not go quietly unrun.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { serve } = require('./print-fit-harness');

const run = promisify(execFile);
const CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];
const chrome = process.env.CHROME_PATH || CANDIDATES.find((c) => fs.existsSync(c));

async function probePage(page, probe, attribute) {
  if (!chrome) {
    if (process.env.CI) throw new Error('no Chrome on this runner, so the page went unchecked');
    return null;
  }
  const server = await serve(probe);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-probe-'));
  try {
    const url = `http://127.0.0.1:${server.address().port}/__probe/${page}`;
    const { stdout } = await run(
      chrome,
      [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1280,900',
        `--user-data-dir=${profile}`,
        '--virtual-time-budget=8000',
        '--dump-dom',
        url,
      ],
      { timeout: 90000, maxBuffer: 1 << 28 },
    );
    const raw = (stdout.match(new RegExp(`${attribute}="([^"]*)"`)) || [])[1];
    if (!raw) throw new Error(`the probe never ran on /${page}`);
    return JSON.parse(raw.replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
  } finally {
    server.close();
    // A Chrome killed by the timeout may still be writing its profile: retry,
    // so a failed clean-up never hides the error that matters.
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  }
}

module.exports = { probePage };
