// Ranks education entries by degree level (Master > Bachelor > Attestation >
// CESS > other), ties broken by most recent endDate (or startDate when no end).

function degreeScore(studyType) {
  if (!studyType) return 0;
  if (/master|MSc?\b|MA\b/i.test(studyType)) return 4;
  if (/bachelor|bachelier|BSc|BA\b/i.test(studyType)) return 3;
  if (/attestation|certificat/i.test(studyType)) return 2;
  if (/CESS|cours|secondaire/i.test(studyType)) return 1;
  return 0;
}

function rankDegrees(entries) {
  return [...entries].sort((a, b) => {
    const ds = degreeScore(b.studyType) - degreeScore(a.studyType);
    if (ds !== 0) return ds;
    return (b.endDate || b.startDate || '').localeCompare(a.endDate || a.startDate || '');
  });
}

function highestObtainedDegree(education) {
  const today = new Date().toISOString().slice(0, 10);
  const completed = (education || []).filter(
    (e) => e.endDate && e.endDate !== 'Present' && e.endDate <= today,
  );
  return rankDegrees(completed)[0] || null;
}

function highestInProgressDegree(education) {
  const today = new Date().toISOString().slice(0, 10);
  const ongoing = (education || []).filter(
    (e) => !e.endDate || e.endDate === 'Present' || e.endDate > today,
  );
  return rankDegrees(ongoing)[0] || null;
}

function formatDegreeLine(degree, lang) {
  if (!degree) return null;
  const parts = [degree.studyType, degree.area].filter(Boolean);
  if (!parts.length) return null;
  const sep = lang === 'en' ? ' in ' : ' — ';
  return parts.join(sep);
}

module.exports = {
  highestObtainedDegree,
  highestInProgressDegree,
  formatDegreeLine,
};
