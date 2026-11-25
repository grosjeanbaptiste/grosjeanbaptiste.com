// The PDF reader of the XSLT themes, in a real Chrome: on a phone the pages
// keep a size a thumb can read and the frame scrolls sideways, instead of the
// whole page width being squeezed into the screen's; on a wide screen the width
// is still fitted and nothing scrolls sideways.
//
// SKIPPED, on purpose: under the probe's 8 s virtual-time budget PDF.js never
// reaches its first rendered page (the reader's frame is built, the document is
// not drawn), so the test cannot tell the two behaviours apart. The phone case
// was checked by hand in Chrome (a 500 px window: the frame is 992 px wide for
// 436 px shown, and scrolls). Drop the skip once the probe can wait on a page.
const test = require('node:test');
const assert = require('node:assert/strict');
const { probed } = require('./browser-probe');

const PROBE = `<script>
// A headless page paints no frames, so an IntersectionObserver never reports:
// this one says at once that whatever is watched is on screen.
window.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; }
  observe(target) {
    setTimeout(() => this.callback([{ target, isIntersecting: true, intersectionRatio: 1, boundingClientRect: target.getBoundingClientRect() }], this), 0);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
};
window.__errors = [];
addEventListener('error', (e) => window.__errors.push(String(e.message || e.filename)));
addEventListener('unhandledrejection', (e) => window.__errors.push(String(e.reason)));
addEventListener('load', () => {
  const finish = (seen) => document.documentElement.setAttribute('data-reader', JSON.stringify(seen));
  // The page is dumped when the virtual-time budget runs out, with whatever
  // was written last: each poll writes, so the dump never finds nothing.
  const measure = () => {
    const reader = document.querySelector('.pdf-reader');
    const container = document.querySelector('.pdf-container');
    const drawn = !!reader && reader.hasAttribute('data-drawn') && !!container;
    finish(drawn
      ? { drawn, scrollWidth: container.scrollWidth, clientWidth: container.clientWidth }
      : {
          drawn,
          // What stopped it, for the failure message.
          toolbarHidden: document.querySelector('.pdf-toolbar')?.hidden,
          failedShown: document.querySelector('.pdf-failed')?.hidden === false,
          framed: !!document.querySelector('.pdf-frame'),
          errors: window.__errors || [],
        });
  };
  const wait = () => {
    measure();
    setTimeout(wait, 250);
  };
  document.getElementById('pdf').scrollIntoView();
  wait();
});
</script>`;

for (const [screen, size, sideways] of [
  ['phone', '390,844', true],
  ['desktop', '1280,900', false],
]) {
  test.skip(`reader: on a ${screen} the frame ${sideways ? 'scrolls' : 'does not scroll'} sideways`, async (t) => {
    const seen = await probed(PROBE, '/en', 'data-reader', '/__xslt-probe', size);
    if (!seen) return t.skip('no Chrome found — set CHROME_PATH to check the reader here');
    assert.equal(seen.drawn, true, `PDF.js never drew the first page: ${JSON.stringify(seen)}`);
    const wider = seen.scrollWidth > seen.clientWidth + 1;
    assert.equal(
      wider,
      sideways,
      `scrollWidth ${seen.scrollWidth}, clientWidth ${seen.clientWidth}`,
    );
  });
}
