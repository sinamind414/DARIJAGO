#!/usr/bin/env bash
# OCR colonnes de la partie 02 (3 segments PDF, 25 pages au total).
# Pagination continue : segment 1 -> pages imprimées 40-59, segment 2 -> 60-79, segment 3 -> 80-89.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="ocr/partie-02-colonnes"
mkdir -p "$OUT"
python scripts/ocr_colonnes.py --pdf raw/partie-02-1.pdf --out "$OUT" \
  --workers 3 --front-matter-max 0 --page-offset 0 --printed-left-first 40 --meta-name ocr-columns-seg1.json
python scripts/ocr_colonnes.py --pdf raw/partie-02-2.pdf --out "$OUT" \
  --workers 3 --front-matter-max 0 --page-offset 10 --printed-left-first 60 --meta-name ocr-columns-seg2.json
python scripts/ocr_colonnes.py --pdf raw/partie-02-3.pdf --out "$OUT" \
  --workers 3 --front-matter-max 0 --page-offset 20 --printed-left-first 80 --meta-name ocr-columns-seg3.json
echo "ALL_SEGMENTS_DONE"
