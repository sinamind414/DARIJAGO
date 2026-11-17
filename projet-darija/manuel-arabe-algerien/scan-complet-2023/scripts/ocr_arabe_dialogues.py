#!/usr/bin/env python3
"""
OCR haute résolution de la colonne ARABE des pages de dialogue.
Test comparatif : 400 dpi + psm 6 > 260 dpi + psm 3 sur ce scan.
Ne touche que la colonne droite (x 50,5 % → 93 %), jamais la colonne latine.
"""
import os
import re
import subprocess
import sys
from pathlib import Path

import pymupdf

BASE = Path(__file__).resolve().parent.parent
PDF = BASE / "raw" / "tapiero-manuel-complet-1978.pdf"
OUT = BASE / "ocr" / "zones"
TESS = "/tmp/ocr-root/usr/bin/tesseract"
ENV = dict(os.environ,
           LD_LIBRARY_PATH="/tmp/ocr-root/usr/lib/x86_64-linux-gnu:/tmp/libs/usr/lib/x86_64-linux-gnu",
           TESSDATA_PREFIX="/tmp/ocr-root/usr/share/tesseract-ocr/5/tessdata",
           OMP_THREAD_LIMIT="1")

# pages portant le texte arabe + latin des 15 dialogues (vérifié sur images et en-têtes)
AR_PAGES = [187, 189, 191, 193, 195, 197, 199, 201, 203, 205, 207,
            210, 211, 213, 214, 216, 217, 219, 220]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    tmp = Path("/tmp/ar400")
    tmp.mkdir(exist_ok=True)
    doc = pymupdf.open(PDF)
    for pno in AR_PAGES:
        dest = OUT / f"p{pno:03d}.arabe400.txt"
        if dest.exists() and dest.stat().st_size > 0:
            continue
        page = doc[pno - 1]
        R = page.rect
        png = tmp / f"a{pno}.png"
        page.get_pixmap(dpi=400, clip=pymupdf.Rect(
            R.width * 0.500, R.height * 0.115, R.width * 0.945, R.height * 0.975)).save(png)
        subprocess.run([TESS, str(png), str(dest.with_suffix("")), "-l", "ara",
                        "--psm", "6", "--dpi", "400"],
                       capture_output=True, text=True, env=ENV)
        png.unlink(missing_ok=True)
        t = dest.read_text(encoding="utf-8") if dest.exists() else ""
        print(f"p{pno} ar400={len(t)} car.", flush=True)
    print("AR400_OK")


if __name__ == "__main__":
    main()
