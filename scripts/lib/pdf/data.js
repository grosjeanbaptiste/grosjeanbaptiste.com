const { loadResume } = require('../data');

function sortByRecency(arr) {
  // Entries still ongoing (no endDate, or endDate === "Present") should
  // sort at the top regardless of their startDate. Using "9999-12-31" as
  // the synthetic key means they always compare greater than any real
  // endDate. Otherwise Acteble (startDate 2025-07-01, no endDate) would
  // fall behind Belgian Senate (endDate 2026-06-30) even though Acteble
  // is still active.
  const key = (e) => {
    const raw = e.endDate || e.date || '';
    if (!raw || raw === 'Present') return '9999-12-31';
    return String(raw);
  };
  return [...arr].sort((a, b) => key(b).localeCompare(key(a)));
}

const topN = (arr, n) => sortByRecency(arr || []).slice(0, n);
const findProject = (resume, name) => (resume.projects || []).find((p) => p.name === name);

module.exports = { loadResume, topN, findProject };
