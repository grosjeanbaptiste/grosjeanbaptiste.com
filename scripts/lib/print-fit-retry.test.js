// The retry exists to keep one failure from impersonating another, so that is
// what these tests pin down: a browser that produced nothing gets a second
// launch, and anything else — a wrong page count, a broken harness — reaches
// the caller on the first attempt, undiluted.

const test = require('node:test');
const assert = require('node:assert/strict');
const { printedWithRetry, PRINT_ATTEMPTS } = require('./print-fit-retry');

const silent = () => {};

test('a browser that prints on the first try is launched once', async () => {
  let launches = 0;
  const attempts = await printedWithRetry(
    '/fr/',
    () => {
      launches += 1;
      return null;
    },
    silent,
  );
  assert.equal(launches, 1);
  assert.equal(attempts, 1);
});

test('a browser that produced nothing is given a second launch', async () => {
  let launches = 0;
  const attempts = await printedWithRetry(
    '/fr/',
    () => {
      launches += 1;
      return launches === 1 ? 'Chrome produced no PDF' : null;
    },
    silent,
  );
  assert.equal(launches, 2);
  assert.equal(attempts, 2);
});

test('the retry is announced instead of being absorbed', async () => {
  const warnings = [];
  let launches = 0;
  await printedWithRetry(
    '/es/',
    () => {
      launches += 1;
      return launches === 1 ? 'Chrome produced no PDF' : null;
    },
    (m) => warnings.push(m),
  );
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /\/es\//);
  assert.match(warnings[0], /Chrome produced no PDF/);
});

test('each launch is told which attempt it is', async () => {
  // Chrome must not reuse a profile directory across launches: the singleton
  // lock of the launch that just failed can outlive it and make the next one
  // wait forever, which is the very failure being retried.
  const seen = [];
  await printedWithRetry(
    '/fr/',
    (attempt) => {
      seen.push(attempt);
      return attempt === 1 ? 'Chrome produced no PDF' : null;
    },
    silent,
  );
  assert.deepEqual(seen, [1, 2]);
});

test('a browser that never prints fails, naming how often it was asked', async () => {
  await assert.rejects(
    () => printedWithRetry('/nl/', () => 'Firefox never finished a PDF', silent),
    (err) => {
      assert.match(err.message, /\/nl\//);
      assert.match(err.message, /Firefox never finished a PDF/);
      assert.match(err.message, new RegExp(`${PRINT_ATTEMPTS} attempts`));
      return true;
    },
  );
});

test('a thrown error is not retried — only a missing PDF is', async () => {
  let launches = 0;
  await assert.rejects(
    () =>
      printedWithRetry(
        '/de/',
        () => {
          launches += 1;
          throw new Error('xsltproc is not installed');
        },
        silent,
      ),
    /xsltproc is not installed/,
  );
  assert.equal(launches, 1);
});
