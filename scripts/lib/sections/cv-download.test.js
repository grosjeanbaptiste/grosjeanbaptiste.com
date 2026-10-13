// The timeline has three PDFs per language — the whole career, its last five
// years, its last two. The page's link carries the three, so js/timeline.js
// can hand out the one that matches the zoom on screen; without the script it
// stays on the whole career.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('../config');
const { generateCvDownload } = require('./cv-download');

const link = /<a href="([^"]+)" class="cv-download-button" data-timeline-pdf([^>]*)>/.exec(
  generateCvDownload('fr'),
);

test('the timeline link opens on the whole career', () => {
  assert.equal(link[1], '/assets/cv/cv_grosjean_baptiste_timeline_fr.pdf');
});

test('the timeline link carries the PDF of each zoom', () => {
  assert.match(link[2], /data-pdf-2="\/assets\/cv\/cv_grosjean_baptiste_timeline_2y_fr\.pdf"/);
  assert.match(link[2], /data-pdf-5="\/assets\/cv\/cv_grosjean_baptiste_timeline_5y_fr\.pdf"/);
  assert.match(link[2], /data-pdf-all="\/assets\/cv\/cv_grosjean_baptiste_timeline_fr\.pdf"/);
});

test('every PDF the link carries exists', () => {
  for (const [, file] of link[2].matchAll(/data-pdf-\w+="([^"]+)"/g))
    assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} is missing`);
});
