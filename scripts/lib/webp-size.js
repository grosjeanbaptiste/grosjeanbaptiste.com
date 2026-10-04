// A WebP's width and height, read from its RIFF header (simple lossy "VP8 ",
// lossless "VP8L", extended "VP8X") — enough to check the generated previews
// without an image library or a WebP tool on the CI runner.

function webpSize(buf) {
  if (
    buf.length < 30 ||
    buf.toString('ascii', 0, 4) !== 'RIFF' ||
    buf.toString('ascii', 8, 12) !== 'WEBP'
  ) {
    throw new Error('not a WebP file (no RIFF/WEBP header)');
  }
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
  }
  throw new Error(`not a WebP file this reader knows (chunk "${chunk}")`);
}

module.exports = { webpSize };
