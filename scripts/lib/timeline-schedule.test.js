// A degree is followed by day or on an evening schedule ("horaire décalé").
// The timeline tells the two apart: an evening degree, and its blocks, are
// marked — a crescent moon before the name — and a legend says what the moon
// means.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineOf } = require('./timeline-model');
const { generateTimeline } = require('./sections/timeline');
const { timelineForXml } = require('./xml-timeline');
const { TODAY, resume } = require('./timeline-model.fixture');

const BLOCK = { year: '2022-2023', startDate: '2022-10-15', endDate: '2023-09-13', units: [] };
const studied = (schedule) => {
  const base = resume();
  return {
    ...base,
    education: [
      { ...base.education[0], schedule, blocks: [BLOCK] },
      {
        institution: 'Saint-Louis',
        studyType: 'Bachelor',
        startDate: '2016-09-30',
        endDate: '2017-06-30',
        schedule: 'day',
      },
    ],
  };
};
const bars = (r) => timelineOf(r, TODAY).lanes.find((l) => l.kind === 'education').bars;
const html = (r, lang = 'fr') => generateTimeline(r, lang, TODAY, new Set());

test('a degree followed in the evening is marked as such', () => {
  const [master] = bars(studied('evening')).filter((b) => b.name === 'UMons');
  assert.equal(master.schedule, 'evening');
});

test('its blocks are marked with it', () => {
  const block = bars(studied('evening')).find((b) => b.kind === 'block');
  assert.equal(block.schedule, 'evening');
});

test('a degree followed by day is not', () => {
  const [bachelor] = bars(studied('evening')).filter((b) => b.name === 'Saint-Louis');
  assert.equal(bachelor.schedule, 'day');
});

test('what a degree carried takes no schedule of its own', () => {
  const carried = bars(studied('evening')).filter((b) => b.depth === 1 && b.kind !== 'block');
  assert.ok(carried.length > 0);
  assert.ok(carried.every((b) => b.schedule === undefined));
});

test('on the page an evening degree carries the mark the stylesheet turns into a moon', () => {
  assert.match(
    html(studied('evening')),
    /class="tl-bar"[^>]*data-schedule="evening"[^>]*data-name="UMons"/,
  );
});

test('a day degree carries none', () => {
  assert.doesNotMatch(
    html(studied('evening')),
    /data-schedule="evening"[^>]*data-name="Saint-Louis"/,
  );
});

test('assistive technology is told a degree is followed in the evening', () => {
  assert.match(html(studied('evening')), /aria-label="UMons[^"]*horaire décalé"/);
});

test('a legend says what the moon means, in the language of the page', () => {
  const page = html(studied('evening'));
  assert.match(page, /class="tl-legend"><span class="tl-moon"[^>]*><\/span>horaire décalé</);
  assert.match(
    html(studied('evening'), 'en'),
    /class="tl-legend"><span class="tl-moon"[^>]*><\/span>evening schedule</,
  );
});

test('a career without an evening degree shows no legend', () => {
  assert.doesNotMatch(html(studied('day')), /tl-legend/);
});

test('the XSLT themes get the mark and the legend with their data', () => {
  const xml = timelineForXml(studied('evening'), 'fr', TODAY);
  const lane = xml.lanes.find((l) => l.kind === 'education');
  assert.equal(lane.bars.find((b) => b.name === 'UMons').schedule, 'evening');
  assert.deepEqual(xml.legend, { evening: 'horaire décalé' });
});

test('the XSLT data carries no legend without an evening degree', () => {
  assert.equal(timelineForXml(studied('day'), 'fr', TODAY).legend, undefined);
});
