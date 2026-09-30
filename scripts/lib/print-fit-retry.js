// Telling a starved machine apart from a layout regression.
//
// The print-fit tests measure the two-page guarantee the only way that is not a
// guess: print the page with a real browser and count the sheets. That makes
// them the slowest checks in the suite and the only ones whose result depends on
// how busy the machine is. On a loaded laptop Chrome exits without writing its
// PDF and Firefox never reaches its trailer inside the deadline — and the test
// then reported a two-page CV as unprintable, which reads exactly like the
// regression it exists to catch.
//
// So the two outcomes are separated. A browser that produced *nothing* is a
// resource failure: it gets one more launch, and says out loud that it needed
// it. A browser that produced a PDF with the wrong number of pages is the
// regression, is never retried, and fails on the spot — the page count is
// asserted by the caller, after this returns, so no amount of retrying can
// launder it. Anything thrown rather than reported (no xsltproc, an unreadable
// file) is a broken harness and also travels straight out.
//
// Two attempts, not more: a second launch costs a minute at worst and catches
// the transient case, while a loop that kept trying would turn a genuinely
// hanging browser into a test that never finishes.
const PRINT_ATTEMPTS = 2;

/**
 * Run `print` until it reports a PDF, at most PRINT_ATTEMPTS times.
 *
 * `print` receives the attempt number — a browser that needs a scratch
 * directory has to use a fresh one each time, or it inherits the lock of the
 * launch that just failed — and returns a falsy value once the file is on disk,
 * or a message saying what is missing. It must not throw for that case, since a
 * throw means the harness itself is broken and is deliberately not retried.
 * Resolves with the number of attempts it took; `warn` is injectable so the
 * tests can read the degradation notice instead of printing it.
 */
async function printedWithRetry(label, print, warn = console.warn) {
  for (let attempt = 1; ; attempt += 1) {
    const missing = await print(attempt);
    if (!missing) return attempt;
    if (attempt === PRINT_ATTEMPTS) {
      throw new Error(`${label}: ${missing} — still nothing after ${PRINT_ATTEMPTS} attempts`);
    }
    warn(
      `${label}: ${missing} — retrying (${attempt + 1}/${PRINT_ATTEMPTS}); the machine is probably loaded`,
    );
  }
}

module.exports = { printedWithRetry, PRINT_ATTEMPTS };
