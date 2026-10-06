// Query: which recorded wordings are no longer on their official sheet.
// `units` is the record of dsl/course-unit-sources.json; `read(name, sheet)` is
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

// The wordings of one sheet that its text no longer carries.
async function goneFrom(name, sheet, read) {
  let text;
  try {
    text = fold(await read(name, sheet));
  } catch (cause) {
    throw new Error(`${name}: its official sheet could not be read — ${cause.message}`, { cause });
  }
  return Object.entries(sheet.evidence)
    .filter(([, wording]) => wording && !text.includes(fold(wording)))
    .map(([keyword, wording]) => ({ unit: name, keyword, wording }));
}

// `later`: the sheet of a later year, for what the sheet of the year the unit
// was taken did not publish.
async function driftOf(units, read) {
  const drift = [];
  for (const [name, unit] of Object.entries(units)) {
    if (!unit.url) continue;
    drift.push(...(await goneFrom(name, unit, read)));
    if (unit.later) drift.push(...(await goneFrom(name, unit.later, read)));
  }
  return drift;
}

module.exports = { driftOf, fold };
