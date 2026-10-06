// Tests for the PDF text helpers. Run with `node --test`.

const test = require('node:test');
const assert = require('node:assert/strict');

const { truncate } = require('./tex');

test('returns the string unchanged when within the limit', () => {
  assert.equal(truncate('short text', 50), 'short text');
});

test('collapses internal whitespace', () => {
  assert.equal(truncate('a   b\n c', 50), 'a b c');
});

test('truncates on a word boundary, never mid-word', () => {
  const out = truncate('alpha beta gamma delta', 14);
  assert.ok(out.endsWith('…'), 'ends with an ellipsis');
  const words = out.slice(0, -1).trim().split(' ');
  // "alpha beta gam" would be the naive char cut; a word-boundary cut keeps
  // only whole words, so the last token must be a complete source word.
  assert.ok(['alpha', 'beta', 'gamma', 'delta'].includes(words[words.length - 1]), out);
});

test('does not leave dangling punctuation before the ellipsis', () => {
  const out = truncate('one, two, three, four', 11);
  assert.doesNotMatch(out, /[\s,;:.]…$/, out);
});

test('falls back to a hard cut for a single over-long word', () => {
  const out = truncate('supercalifragilisticexpialidocious', 10);
  assert.ok(out.endsWith('…'));
  assert.ok(out.length <= 10);
});

// The budget is one of width, not of characters: a Chinese character is as
// wide as two Latin letters. Counted one for one, a Chinese description cut
// "at 80" ran to two lines where the same budget gives one in French.
test('a Chinese character counts double in the budget', () => {
  const out = truncate('一二三四五六七八九十', 10);
  // Four characters (8) and the ellipsis: the fifth would make 10 with no room for it.
  assert.equal(out, '一二三四…');
});

test('a Chinese text within its width budget is left whole', () => {
  assert.equal(truncate('一二三四五', 10), '一二三四五');
});

test('a Chinese text is cut anywhere: it has no word boundary to wait for', () => {
  const out = truncate('使用 Rust 编写的模块化单体后端服务', 20);
  assert.ok(out.endsWith('…'));
  assert.ok(out.length > '使用 Rust…'.length, `cut back to the last space: ${out}`);
});

test('Latin text is budgeted as before', () => {
  assert.equal(truncate('alpha beta gamma delta', 14), 'alpha beta…');
});
