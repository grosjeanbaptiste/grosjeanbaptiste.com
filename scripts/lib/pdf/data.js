const { loadResume } = require('../data');

function sortByRecency(arr) {
  return [...arr].sort((a, b) => {
    const keyA = a.endDate || a.startDate || a.date || '';
    const keyB = b.endDate || b.startDate || b.date || '';
    return String(keyB).localeCompare(String(keyA));
  });
}

const topN = (arr, n) => sortByRecency(arr || []).slice(0, n);
const findProject = (resume, name) => (resume.projects || []).find((p) => p.name === name);

module.exports = { loadResume, topN, findProject };
