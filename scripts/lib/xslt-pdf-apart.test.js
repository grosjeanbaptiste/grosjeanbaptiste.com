// Recto and verso never show the same page: each side disables the other's pick.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const button = (file, page, on) => ({
  dataset: { file, page },
  disabled: false,
  on,
  getAttribute: () => String(on),
});
const group = (buttons) => ({
  querySelector: () => buttons.find((b) => b.on),
  querySelectorAll: () => buttons,
});

test('the page one side shows is disabled on the other', async () => {
  const { apart } = await import(
    `data:text/javascript,${encodeURIComponent(fs.readFileSync('js/xslt-pdf-parts.js', 'utf8'))}`
  );
  const make = (on) => [
    button('cv', '1', on === 0),
    button('cv', '2', on === 1),
    button('t', '1', on === 2),
  ];
  const [recto, verso] = [make(0), make(1)];
  apart([group(recto), group(verso)]);
  assert.deepEqual(
    recto.map((b) => b.disabled),
    [false, true, false],
  );
  assert.deepEqual(
    verso.map((b) => b.disabled),
    [true, false, false],
  );
});
