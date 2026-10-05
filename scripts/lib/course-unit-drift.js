// Query: which recorded wordings are no longer on their official sheet.
// `units` is the record of dsl/course-unit-sources.json; `read(name, unit)` is
// the port that returns a sheet's text (scripts/check-course-unit-sources.js
// fetches it). A sheet that cannot be read is an error, not "no drift".

const fold = (text) =>
  String(text)
    .normalize('NFKD')
    // The accents NFKD has just split off their letters.
    .replace(/\p{M}/gu, '')
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .toLowerCase();

async function driftOf(units, read) {
  const drift = [];
  for (const [name, unit] of Object.entries(units)) {
    if (!unit.url) continue;
    let sheet;
    try {
      sheet = fold(await read(name, unit));
    } catch (cause) {
      throw new Error(`${name}: its official sheet could not be read — ${cause.message}`, {
        cause,
      });
    }
    for (const [keyword, wording] of Object.entries(unit.evidence)) {
      if (wording && !sheet.includes(fold(wording))) drift.push({ unit: name, keyword, wording });
    }
  }
  return drift;
}

module.exports = { driftOf, fold };
