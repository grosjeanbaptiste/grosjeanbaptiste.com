// Ranks education entries by degree level (Master > Bachelor > Attestation >
// CESS > other), ties broken by most recent endDate (or startDate when no end).

const I18N = require('./i18n');

function degreeScore(studyType) {
  if (!studyType) return 0;
  // Strip diacritics so localized spellings (es "Máster", fr "Maîtrise") match
  // their unaccented latin forms. CJK titles (zh 硕士/学士) carry no diacritics
  // and are matched by explicit alternatives below.
  const s = studyType.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (/master|magister|maitrise|\bMSc?\b|\bMA\b|硕士/i.test(s)) return 4;
  if (/bachelor|bachelier|licence|\bBSc\b|\bBA\b|学士/i.test(s)) return 3;
  if (/attestation|certificat/i.test(s)) return 2;
  if (/CESS|cours|secondaire/i.test(s)) return 1;
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
  const sep = (I18N[lang] || I18N.en).degreeConnector;
  return parts.join(sep);
}

module.exports = {
  highestObtainedDegree,
  highestInProgressDegree,
  formatDegreeLine,
};
