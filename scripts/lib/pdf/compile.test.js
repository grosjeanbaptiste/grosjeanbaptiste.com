// XeTeX probes a system font with \IfFontExistsTF, and when the font is absent
// it falls back to a TFM lookup — at which point kpathsea tries to BUILD the
// metrics with METAFONT, fails, and ends the run on "Emergency stop". The
// fallback branch the preamble wrote for exactly this case never runs.
//
// That is how the Chinese CV stopped compiling on a machine without the Lato
// font installed, while its own PDF has always rendered in Latin Modern — the
// probe was supposed to answer "no" and move on.

const test = require('node:test');
const assert = require('node:assert/strict');
const { latexEnv, latexFailure } = require('./compile');

test('the LaTeX environment stops kpathsea building a font on the fly', () => {
  const env = latexEnv({ PATH: '/usr/bin' });
  assert.equal(env.MKTEXTFM, '0');
  assert.equal(env.MKTEXMF, '0');
});

test('the LaTeX environment keeps what the shell provides', () => {
  assert.equal(latexEnv({ PATH: '/opt/homebrew/bin' }).PATH, '/opt/homebrew/bin');
});

// A compile killed by the 90s timeout used to print the engine banner and
// nothing else: "pdflatex failed (pass 2)" followed by three lines of version
// header. Under load that reads exactly like a LaTeX error in the document,
// and the log has no trace of the real cause — the process never got to write
// one. Say which it was.
// execFileSync reports its own timeout as code ETIMEDOUT, not as killed/SIGTERM
// — observed, not assumed: the first version of this check only looked at
// `killed` and the real run printed "exit status ETIMEDOUT".
test('a compile stopped by the timeout says so rather than blaming the document', () => {
  for (const err of [{ killed: true, signal: 'SIGTERM' }, { code: 'ETIMEDOUT' }]) {
    const msg = latexFailure(err, 'pdflatex', 1);
    assert.match(msg, /timed out/i);
    assert.match(msg, /pdflatex/);
  }
});

test('a genuine LaTeX error reports the engine exit status', () => {
  assert.match(latexFailure({ status: 1 }, 'xelatex', 0), /exit status 1/);
});
