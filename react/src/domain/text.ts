// Accent-insensitive text, shared by slugs and search: NFD splits "é" into
// "e" plus a combining mark, and \p{M} removes every combining mark.
export const stripMarks = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '');

// Comparable form for search: no accents, lower case.
export const fold = (text: string): string => stripMarks(text).toLowerCase();
