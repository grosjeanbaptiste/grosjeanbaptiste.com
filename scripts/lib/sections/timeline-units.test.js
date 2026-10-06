// A degree's course units on the classic page's timeline: one bar each under
// the academic year it was taken in, leading to its line under the degree. On
// paper they are left out, and every other bar carries the row it then takes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('../config');
const { generateTimeline } = require('./timeline');
const { timelineForXml } = require('../xml-timeline');

const TODAY = new Date(Date.UTC(2026, 9, 3));
const resume = {
  work: [],
  education: [
    {
      institution: 'UMons',
      studyType: 'Master',
      startDate: '2022-10-15',
      endDate: '2026-09-04',
      projects: ['Thesis'],
      blocks: [
        {
          year: '2022-2023',
          startDate: '2022-10-15',
          endDate: '2023-09-13',
          units: ['Algorithmique', 'Réseaux'],
        },
      ],
    },
  ],
  projects: [
    { name: 'Thesis', startDate: '2025-11-13', endDate: '2026-09-04' },
    { name: 'Algorithmique', type: 'Course unit' },
    { name: 'Réseaux', type: 'Course unit' },
  ],
  volunteer: [],
};
const html = generateTimeline(resume, 'en', TODAY, new Set(['project-algorithmique']));
const bars = [...html.matchAll(/<(a|span) class="tl-bar"[^>]*>/g)].map((m) => m[0]);
const named = (name) => bars.find((b) => b.includes(`data-name="${name}"`));
const css = fs.readFileSync(path.join(ROOT, 'css/timeline-entries.css'), 'utf8');
const print = css.slice(css.indexOf('@media print'));

test('a course unit of a block is a bar of its own kind', () => {
  assert.match(named('Algorithmique'), /data-kind="unit" data-depth="1"/);
});

test('a unit bar leads to its line on the page', () => {
  assert.match(named('Algorithmique'), /^<a [^>]*href="#project-algorithmique"/);
});

test('a unit whose line is not on the page is no link', () => {
  assert.match(named('Réseaux'), /^<span /);
});

test('a unit bar has no row on paper', () => {
  assert.doesNotMatch(named('Réseaux'), /--print-row/);
});

test('what the degree carried sits lower on screen than on paper', () => {
  const [, row, printed] = /--row:(\d+);--print-row:(\d+)/.exec(named('Thesis'));
  assert.deepEqual([Number(row), Number(printed)], [4, 2]);
});

test('the lane carries its height on paper', () => {
  assert.match(html, /class="tl-track" style="--rows:5;--print-rows:3"/);
});

test('the outline carries its height on paper', () => {
  assert.match(html, /class="tl-group"[^>]*--group-rows:5;--print-row:0;--print-group-rows:3/);
});

test('the print sheet leaves the units out', () => {
  assert.match(print, /\.tl-bar\[data-kind="unit"\]\s*\{\s*display:\s*none/);
});

test('the print sheet closes the rows up', () => {
  assert.match(print, /--row:\s*var\(--print-row\)\s*!important/);
  assert.match(print, /--rows:\s*var\(--print-rows\)\s*!important/);
  assert.match(print, /--group-rows:\s*var\(--print-group-rows\)\s*!important/);
});

test('the XML mirrors carry both layouts', () => {
  const lane = timelineForXml(resume, 'en', TODAY).lanes.find((l) => l.kind === 'education');
  const thesis = lane.bars.find((b) => b.name === 'Thesis');
  assert.deepEqual([lane.rows, lane.printRows, thesis.row, thesis.printRow], [5, 3, 4, 2]);
});
