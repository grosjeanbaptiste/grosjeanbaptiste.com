#!/usr/bin/env bash
# The sized WebP copies of the photo the displays offer through srcset
# (scripts/lib/photo.test.js holds them to it). Rerun after replacing
# assets/images/profil.jpeg. Needs cwebp (brew: webp).
set -euo pipefail

cd "$(dirname "$0")/.."
command -v cwebp > /dev/null || {
  echo "make-photo-sizes: cwebp not found (brew install webp)" >&2
  exit 1
}
for width in 160 320 500; do
  cwebp -quiet -q 80 -resize "$width" 0 assets/images/profil.jpeg -o "assets/images/profil-$width.webp"
  echo "assets/images/profil-$width.webp"
done
