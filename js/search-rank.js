// The ranking behind the classic page's search (js/search.js), kept apart so
// it can be tested without a browser. Same rules as the interactive view
// (react/src/domain/search.ts): every word of the query must match somewhere
// in an entry, a match is weighted by where it lands and doubled at the start
// of a word, and a skill is a hit of its own.
((root) => {
  const WORD_START_BONUS = 2;
  const SKILL_EXACT = 10;
  const SKILL_PARTIAL = 4;

  // Comparable form: no accents, lower case.
  const fold = (text) =>
    String(text ?? '')
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase();

  // One query word against one field: 0 when absent, doubled at a word start.
  function wordScore(word, field, weight) {
    const at = field.indexOf(word);
    if (at === -1) return 0;
    const startsWord = at === 0 || !/[a-z0-9]/.test(field.charAt(at - 1));
    return startsWord ? weight * WORD_START_BONUS : weight;
  }

  const fieldsOf = (entry) => [
    [fold(entry.title), 4],
    [fold(entry.organisation), 3],
    [fold((entry.skills || []).join(' · ')), 2],
    [fold(entry.subtitle), 1.5],
    [fold(entry.summary), 1],
  ];

  function entryScore(entry, words) {
    const fields = fieldsOf(entry);
    let total = 0;
    for (const word of words) {
      const best = Math.max(...fields.map(([field, weight]) => wordScore(word, field, weight)));
      if (best === 0) return 0;
      total += best;
    }
    return total;
  }

  function skillScore(skill, words) {
    const name = fold(skill);
    if (name === words.join(' ')) return SKILL_EXACT;
    return words.every((word) => name.includes(word)) ? SKILL_PARTIAL : 0;
  }

  // `usage`: the skills with the number of entries using each.
  function search(entries, usage, query) {
    const words = fold(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    const entryHits = entries
      .map((entry) => ({ type: 'entry', entry, score: entryScore(entry, words) }))
      .filter((hit) => hit.score > 0);
    const skillHits = usage
      .map(({ skill, uses }) => ({ type: 'skill', skill, uses, score: skillScore(skill, words) }))
      .filter((hit) => hit.score > 0);
    return [...skillHits, ...entryHits].sort((a, b) => b.score - a.score);
  }

  const api = { search, fold };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.cvSearch = api;
})(globalThis);
