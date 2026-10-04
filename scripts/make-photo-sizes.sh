#!/usr/bin/env bash
# The sized copies of the photo: WebP for the displays' srcset
# (scripts/lib/photo.test.js), and a JPEG at print resolution for the LaTeX CV
# (scripts/lib/pdf-weight.test.js). Rerun after replacing
# assets/images/profil.jpeg, then rebuild the PDFs (npm run pdf).
# Needs cwebp (brew: webp) and magick (brew: imagemagick).
set -euo pipefail

cd "$(dirname "$0")/.."
command -v cwebp > /dev/null || {
  echo "make-photo-sizes: cwebp not found (brew install webp)" >&2
  exit 1
}
command -v magick > /dev/null || {
  echo "make-photo-sizes: magick not found (brew install imagemagick)" >&2
  exit 1
}
# The PDF sets the photo 4 cm wide: 480 px is 305 ppi there. The 837 px original
# was 531 ppi, and 160 kB of every PDF.
magick assets/images/profil.jpeg -resize 480x -strip -quality 88 assets/images/profil-print.jpeg
echo "assets/images/profil-print.jpeg"
for width in 160 320 500; do
  cwebp -quiet -q 80 -resize "$width" 0 assets/images/profil.jpeg -o "assets/images/profil-$width.webp"
  echo "assets/images/profil-$width.webp"
done
