// A text shortened to the room it is given, marked as cut.
const SHORTEST = 3; // characters, the ellipsis included: under that, no label

// The longest beginning of `text` that fits `room`, marked as cut; '' if none.
function cut(text, room, measure) {
  if (measure(text) <= room) return text;
  const chars = [...text];
  for (let n = chars.length - 1; n >= SHORTEST - 1; n -= 1) {
    const candidate = `${chars.slice(0, n).join('').trimEnd()}…`;
    if (measure(candidate) <= room) return candidate;
  }
  return '';
}

module.exports = { cut };
