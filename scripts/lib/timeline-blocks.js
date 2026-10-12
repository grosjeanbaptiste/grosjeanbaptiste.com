// A degree's academic years — its blocks — and the course units taken in each,
// as bars for the timelines of the CV (timeline-groups.js).
const { anchorOf } = require('./anchors');
const { spanOf } = require('./timeline-dates');

// A degree is followed year by year: each academic year is a block, a part of
// the degree rather than an entry — it links nowhere. "2022-2023" reads "22-23".
const shortYear = (year) => String(year || '').replace(/\b\d\d(\d\d)\b/g, '$1');
function blockBar(block, now) {
  const name = shortYear(block.year);
  const { start, end } = spanOf(block, name, now);
  return {
    kind: 'block',
    ongoing: false,
    anchor: null,
    record: block,
    start,
    end,
    name,
    title: block.label || '',
  };
}
// The course units taken in a block: each as wide as the block, read by its
// official designation, leading to its own line on the page. A block that names a unit
// the CV does not have is refused rather than drawn short of it.
function unitsOf(block, bar, resume) {
  return (block.units || []).map((name, slot) => {
    const project = (resume.projects || []).find((p) => p.name === name);
    if (!project) throw new Error(`Block ${block.year} names an unknown course unit "${name}"`);
    return {
      kind: 'unit',
      ongoing: false,
      // What a block files is a course, whatever its record says.
      anchor: anchorOf('course', project),
      record: block,
      start: bar.start,
      end: bar.end,
      name,
      title: '',
      caption: name,
      slot,
    };
  });
}

// A block is followed as its degree is.
const blocksOf = (record, now, resume) =>
  (record.blocks || [])
    .filter((b) => b.startDate)
    .map((b) => {
      const bar = blockBar(b, now);
      return { ...bar, schedule: record.schedule || 'day', units: unitsOf(b, bar, resume) };
    });

module.exports = { blocksOf };
