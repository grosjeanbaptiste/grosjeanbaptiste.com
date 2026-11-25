// The rich XSLT theme's timeline zoom is markup: a radio per zoom, written by
// the stylesheet, and the scale each one sets — worked out from the length of
// the career, which only XSLT has to hand — written as CSS next to it. The
// timeline's PDF on offer follows the choice, one link per zoom. Nothing here
// waits for a script; the browser side is xslt-timeline-zoom-browser.test.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, LANGS } = require('./config');

const render = (lang) =>
  execFileSync(
    'xsltproc',
    [
      path.join(ROOT, 'assets/xslt/resume-transform.xsl'),
      path.join(ROOT, `assets/data/resume-${lang}.xml`),
    ],
    { encoding: 'utf8' },
  );
const xml = (lang) => fs.readFileSync(path.join(ROOT, `assets/data/resume-${lang}.xml`), 'utf8');
const tag = (src, name) => (src.match(new RegExp(`<${name}>([^<]*)</${name}>`)) || [])[1];

for (const lang of LANGS) {
  const html = render(lang);
  const src = xml(lang);
  const zooms = [
    ...src.matchAll(/<zoom>\s*<years>([^<]+)<\/years>\s*<label>([^<]*)<\/label>/g),
  ].map((m) => ({ years: m[1], label: m[2] }));
  const months = Number(tag(src, 'months'));
  const group = (html.match(/<div class="tl-zoom"[^>]*>[\s\S]*?<\/div>/) || [''])[0];

  test(`${lang}: the zoom is a radio per zoom, none chosen: the screen sets the default`, () => {
    assert.equal(zooms.length, 3);
    const radios = [...group.matchAll(/<input type="radio"([^>]*)>/g)].map((m) => m[1]);
    assert.equal(radios.length, 3);
    for (const [i, { years }] of zooms.entries()) {
      assert.match(radios[i], /name="tl-zoom"/);
      assert.match(radios[i], new RegExp(`id="tl-z-${years}"`));
    }
    assert.deepEqual(
      radios.map((r) => /\schecked/.test(r)),
      zooms.map(() => false),
    );
  });

  // A phone starts on two years, anything wider on five: with no radio chosen,
  // the rules that set the scale, and the label that reads as chosen, say which.
  for (const [screen, years, query] of [
    ['phone', '2', '@media \\(max-width: 48em\\)'],
    ['wide screen', '5', '@media \\(min-width: 48\\.01em\\)'],
  ])
    test(`${lang}: on a ${screen} the default zoom is ${years} years`, () => {
      const wanted = Math.max(1, months / (Number(years) * 12));
      const rule = html.match(
        new RegExp(
          `${query}\\s*\\{\\s*#timeline:not\\(:has\\(\\.tl-zoom-input:checked\\)\\) \\.tl-grid\\s*\\{\\s*--stretch:\\s*([\\d.]+)`,
        ),
      );
      assert.ok(rule, `no default rule on a ${screen}`);
      assert.ok(Math.abs(Number(rule[1]) - wanted) < 0.001, `${rule[1]} != ${wanted}`);
    });

  test(`${lang}: the default zoom's label and PDF are set by css/timeline-zoom.css`, () => {
    const css = fs.readFileSync(path.join(ROOT, 'css/timeline-zoom.css'), 'utf8');
    for (const [query, years] of [
      ['max-width: 48em', '2'],
      ['min-width: 48.01em', '5'],
    ]) {
      const block = css.match(new RegExp(`@media \\(${query}\\)\\s*\\{[\\s\\S]*?\\n\\}`));
      assert.ok(block, `no ${query} block`);
      assert.match(block[0], new RegExp(`#tl-z-${years} \\+ label`));
      assert.match(block[0], new RegExp(`\\[data-zoom="${years}"\\]`));
    }
  });

  test(`${lang}: each radio has its label, as the page words it`, () => {
    for (const { years, label } of zooms)
      assert.match(group, new RegExp(`<label for="tl-z-${years}">${label}</label>`));
  });

  test(`${lang}: the zoom shows without a script: no button, nothing hidden`, () => {
    assert.doesNotMatch(group, /<button|hidden/);
  });

  test(`${lang}: each zoom sets the scale that shows that many years of axis`, () => {
    for (const { years } of zooms) {
      const wanted = years === 'all' ? 1 : Math.max(1, months / (Number(years) * 12));
      const rule = html.match(
        new RegExp(
          `#timeline:has\\(#tl-z-${years}:checked\\) \\.tl-grid\\s*\\{\\s*--stretch:\\s*([\\d.]+)`,
        ),
      );
      assert.ok(rule, `no rule for ${years}`);
      assert.ok(Math.abs(Number(rule[1]) - wanted) < 0.001, `${years}: ${rule[1]} != ${wanted}`);
    }
  });

  test(`${lang}: the timeline's PDF is one link per zoom`, () => {
    const pdf = src.match(/<pdf>[\s\S]*?<\/pdf>/)[0];
    const want = { 2: tag(pdf, 'two'), 5: tag(pdf, 'five'), all: tag(pdf, 'all') };
    const offered = Object.fromEntries(
      [...html.matchAll(/<a class="download" data-timeline-pdf=""([^>]*)>/g)].map((m) => [
        m[1].match(/data-zoom="([^"]+)"/)[1],
        m[1].match(/href="([^"]+)"/)[1],
      ]),
    );
    assert.deepEqual(offered, want);
  });
}
