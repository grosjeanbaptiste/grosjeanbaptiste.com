// The time axis of the PDF timelines. A career is not evenly filled: years of
// school hold one bar, recent years a dozen. Drawn to scale, the busy years
// are cramped and the quiet ones waste the page. So each year is given width
// by what it holds — and stays marked on the axis, so the page still tells
// the truth about when.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timeScale } = require('./scale');

const Y = (year) => year * 12;
// A span runs from `start` to `end + 1`, like every bar of the timeline.
const span = (from, to) => ({ start: from, end: to - 1 });
const axis = { from: Y(2020), to: Y(2024) - 1, track: 100 };
const widthOf = (x, year) => x(Y(year + 1)) - x(Y(year));

test('the axis runs from its first month to the end of its last, whatever it holds', () => {
  const x = timeScale({ ...axis, spans: [span(Y(2023), Y(2024))], density: 0.6 });
  assert.equal(x(Y(2020)), 0);
  assert.ok(Math.abs(x(Y(2024)) - 100) < 1e-9);
});

test('an even career is drawn to scale', () => {
  const x = timeScale({ ...axis, spans: [span(Y(2020), Y(2024))], density: 0.6 });
  assert.ok(Math.abs(widthOf(x, 2020) - 25) < 1e-9);
});

test('with no density asked for, time is drawn to scale', () => {
  const x = timeScale({ ...axis, spans: [span(Y(2023), Y(2024))], density: 0 });
  assert.ok(Math.abs(widthOf(x, 2023) - 25) < 1e-9);
});

test('a year that holds more is drawn wider than one that holds less', () => {
  const busy = [span(Y(2023), Y(2024)), span(Y(2023), Y(2024)), span(Y(2023), Y(2024))];
  const x = timeScale({ ...axis, spans: [span(Y(2020), Y(2024)), ...busy], density: 0.6 });
  assert.ok(widthOf(x, 2023) > 2 * widthOf(x, 2020));
});

test('an empty year keeps the share of its width that density leaves it', () => {
  const x = timeScale({ ...axis, spans: [span(Y(2023), Y(2024))], density: 0.6 });
  // 40% of an even 25 mm.
  assert.ok(Math.abs(widthOf(x, 2020) - 10) < 1e-9);
});

test('time never runs backwards', () => {
  const x = timeScale({ ...axis, spans: [span(Y(2021) + 3, Y(2021) + 9)], density: 0.9 });
  for (let m = Y(2020); m < Y(2024); m += 1) assert.ok(x(m + 1) > x(m));
});

test('inside a year time runs evenly', () => {
  const x = timeScale({ ...axis, spans: [span(Y(2023), Y(2024))], density: 0.6 });
  const half = (x(Y(2023)) + x(Y(2024))) / 2;
  assert.ok(Math.abs(x(Y(2023) + 6) - half) < 1e-9);
});

test('an axis that starts mid-year gives its first months their share', () => {
  const x = timeScale({ from: Y(2020) + 6, to: Y(2022) - 1, track: 90, spans: [], density: 0.6 });
  assert.ok(Math.abs(x(Y(2021)) - 30) < 1e-9);
});

test('a bar that reaches past the axis counts for what is on it', () => {
  const x = timeScale({ ...axis, spans: [span(Y(2010), Y(2021))], density: 0.6 });
  assert.ok(widthOf(x, 2020) > widthOf(x, 2021));
});
