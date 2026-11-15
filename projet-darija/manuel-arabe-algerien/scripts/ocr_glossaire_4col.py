#!/usr/bin/env python3
"""OCR 4 colonnes des glossaires du Manuel Tapiéro (p.129-170).

Chaque page PDF est un spread (2 pages imprimées). Chaque page imprimée a
2 colonnes. On découpe donc 4 colonnes par spread :
  col1 = page gauche, colonne 1   (x 0.070-0.285)
  col2 = page gauche, colonne 2   (x 0.285-0.495)
  col3 = page droite, colonne 1   (x 0.505-0.705)
  col4 = page droite, colonne 2   (x 0.705-0.925)

Glossaire arabe-français : p.129-149
  p03 : pdf21 R (p129), pdf22-25 L+R (p130-137)
  p04 : pdf1-6 L+R (p138-149)
Glossaire français-arabe : p.150-170
  p04 : pdf7-16 L+R (p150-169), pdf17 L (p170)

Sortie : ocr/glossaire-4col/p{printed}-c{1..2}.txt + meta.json
Les headwords italiques sont parfois mal lus par Tesseract ; le texte est
une RÉFÉRENCE pour la passe de fusion, jamais publié brut.
"""
from __future__ import annotations
import json, sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

import pymupdf
import pytesseract
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'ocr' / 'glossaire-4col'
PDF3 = Path('/home/user/google_drive/Manuel-arab-algerien-3.pdf')
PDF4 = Path('/home/user/google_drive/Manuel-arab-algerien-4.pdf')

# (pdf_path, pdf_page_1based, printed_left, printed_right, cols_to_do)
# cols_to_do: 'L' = left page only, 'R' = right page only, 'LR' = both
JOBS = []
# ar-fr p129 : p03 pdf21 R
JOBS.append((PDF3, 21, 128, 129, 'R'))
# ar-fr p130-137 : p03 pdf22-25 LR
for n in range(22, 26):
    JOBS.append((PDF3, n, 2*n+86, 2*n+87, 'LR'))
# ar-fr p138-149 : p04 pdf1-6 LR
for n in range(1, 7):
    JOBS.append((PDF4, n, 2*n+136, 2*n+137, 'LR'))
# fr-ar p150-169 : p04 pdf7-16 LR
for n in range(7, 17):
    JOBS.append((PDF4, n, 2*n+136, 2*n+137, 'LR'))
# fr-ar p170 : p04 pdf17 L
JOBS.append((PDF4, 17, 170, 171, 'L'))

COLS = {
    'L': [(1, 0.070, 0.285), (2, 0.285, 0.495)],
    'R': [(1, 0.505, 0.705), (2, 0.705, 0.925)],
}


def process(job):
    pdf_path, n, pl, pr, sides = job
    doc = pymupdf.open(pdf_path)
    page = doc[n-1]
    pix = page.get_pixmap(matrix=pymupdf.Matrix(4, 4), alpha=False)
    img = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    w, h = img.size
    results = []
    for side in sides:
        printed = pl if side == 'L' else pr
        # p129 a un titre + nota en haut ; les colonnes commencent plus bas
        y0 = 0.28 if printed == 129 else 0.06
        for col_no, xa, xb in COLS[side]:
            crop = img.crop((int(w*xa), int(h*y0), int(w*xb), int(h*0.965)))
            crop = ImageOps.expand(crop.convert('L'), border=(30, 10, 30, 10), fill=255)
            txt = pytesseract.image_to_string(crop, lang='fra', config='--psm 6')
            fname = f'p{printed}-c{col_no}.txt'
            (OUT / fname).write_text(txt, encoding='utf-8')
            results.append({
                'printed': printed, 'pdf': n, 'side': side, 'col': col_no,
                'file': fname, 'chars': len(txt),
                'direction': 'ar-fr' if printed <= 149 else 'fr-ar',
            })
    doc.close()
    return results


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    meta = []
    workers = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    with ProcessPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(process, j): j for j in JOBS}
        for fut in as_completed(futs):
            meta.extend(fut.result())
    meta.sort(key=lambda r: (r['printed'], r['col']))
    (OUT / 'meta.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'OK {len(meta)} colonnes OCR → {OUT}')


if __name__ == '__main__':
    main()
