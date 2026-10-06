// Re-reading the official sheets against the record: has a wording the CV
// relies on left its sheet? The sheets are read through a port, faked here.
const test = require('node:test');
const assert = require('node:assert/strict');
const { driftOf } = require('./course-unit-drift');

const units = {
  Réseaux: { url: 'https://school/reseaux', evidence: { OSPF: 'OSPF', Ethernet: 'Ethernet' } },
  Maths: { url: 'https://school/maths', evidence: { GraphTheory: 'Théorie des Graphes' } },
};
const sheets = {
  Réseaux: 'protocoles de routage : OSPF, RIP ; liaison : Ethernet',
  Maths: 'Partie 1) Théorie des\n   Graphes, Algorithmique',
};
const read =
  (over = {}) =>
  async (name) =>
    ({ ...sheets, ...over })[name];

test('sheets that still carry every recorded wording show no drift', async () => {
  assert.deepEqual(await driftOf(units, read()), []);
});

test('a wording that has left its sheet is reported, with its unit and keyword', async () => {
  const drift = await driftOf(units, read({ Réseaux: 'protocoles : RIP ; liaison : Ethernet' }));
  assert.deepEqual(drift, [{ unit: 'Réseaux', keyword: 'OSPF', wording: 'OSPF' }]);
});

test('accents, case and line breaks of the sheet do not count as drift', async () => {
  assert.deepEqual(await driftOf(units, read({ Maths: 'THEORIE DES\nGRAPHES' })), []);
});

test('a keyword the record does not back is not looked for', async () => {
  const unbacked = { BD: { url: 'https://school/bd', evidence: { XPath: null } } };
  assert.deepEqual(await driftOf(unbacked, async () => 'XML XSLT'), []);
});

test('a unit without a sheet is not read', async () => {
  const none = { Langue: { url: null, evidence: { English: null } } };
  const refuse = async () => {
    throw new Error('read');
  };
  assert.deepEqual(await driftOf(none, refuse), []);
});

test('a sheet that cannot be read fails the check, naming the unit', async () => {
  const down = async () => {
    throw new Error('HTTP 404');
  };
  await assert.rejects(driftOf(units, down), /Réseaux.*HTTP 404/);
});

// A unit whose own sheet published no content the year it was taken leans on
// a later year's sheet of the same unit: that one is re-read too.
test('the wordings a later sheet backs are looked for on that sheet', async () => {
  const leaning = {
    Maths: {
      url: 'https://school/2022/maths',
      evidence: { GraphTheory: null },
      later: { url: 'https://school/2025/maths', evidence: { GraphTheory: 'Théorie des Graphes' } },
    },
  };
  const read = async (_name, sheet) =>
    sheet.url.includes('2025') ? 'Analyse numérique' : 'rien de publié';
  assert.deepEqual(await driftOf(leaning, read), [
    { unit: 'Maths', keyword: 'GraphTheory', wording: 'Théorie des Graphes' },
  ]);
});
