#!/usr/bin/env python3
"""
OCR PAR ZONES — corrige le défaut de l'OCR pleine page.

Constat vérifié sur images :
  * pages de dialogue (PDF 187-221) = DEUX COLONNES :
      gauche = transcription latine, droite = texte arabe
      → un OCR pleine page mélange les deux et détruit l'arabe.
  * pages de traduction (PDF paires) = français pleine largeur.
  * pages de lecture arabe du corps = bloc arabe central + notes françaises.

Cette passe recadre et repasse Tesseract avec la bonne langue par zone.
Sortie : ocr/zones/p###.{latin,arabe,fr}.txt + ocr/zones/index.json
"""
import json
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
OFFSET = 10
AR = re.compile(r"[\u0621-\u064A]")
STOP = {'من', 'في', 'على', 'ان', 'ما', 'لا', 'الى', 'هذا', 'كان', 'مع', 'يا',
        'كل', 'هو', 'هي', 'عن', 'ذلك', 'التي', 'الذي', 'بعد', 'حتى', 'غير',
        'بين', 'واحد', 'قال', 'انّ', 'أو', 'او', 'لم', 'قد', 'شي'}


def ocr(png: Path, lang: str, out: Path, psm=3, dpi=260):
    if out.exists() and out.stat().st_size > 0:
        return out.read_text(encoding="utf-8")
    subprocess.run([TESS, str(png), str(out.with_suffix("")), "-l", lang,
                    "--psm", str(psm), "--dpi", str(dpi)],
                   capture_output=True, text=True, env=ENV)
    return out.read_text(encoding="utf-8") if out.exists() else ""


def ar_score(t):
    toks = AR.findall(t) and re.findall(r"[\u0621-\u064A]+", t) or []
    return sum(1 for x in toks if x in STOP)


def render(page, clip, dest, dpi=260):
    page.get_pixmap(dpi=dpi, clip=clip).save(dest)
    return dest


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    tmp = Path("/tmp/zones")
    tmp.mkdir(exist_ok=True)
    doc = pymupdf.open(PDF)
    lo = int(sys.argv[1]) if len(sys.argv) > 1 else 187
    hi = int(sys.argv[2]) if len(sys.argv) > 2 else 221
    index = []

    for pno in range(lo, hi + 1):
        page = doc[pno - 1]
        R = page.rect
        W, H = R.width, R.height
        rec = {"pdf_page": pno, "printed_page": pno - OFFSET}

        # en-tête (titre du dialogue + n° de page)
        head = render(page, pymupdf.Rect(W * 0.06, H * 0.075, W * 0.95, H * 0.125),
                      tmp / f"h{pno}.png", 200)
        rec["header"] = ocr(head, "fra", OUT / f"p{pno:03d}.header.txt", 6, 200).strip()

        # colonne gauche = latin
        left = render(page, pymupdf.Rect(W * 0.08, H * 0.125, W * 0.505, H * 0.97),
                      tmp / f"l{pno}.png")
        lat = ocr(left, "fra", OUT / f"p{pno:03d}.latin.txt", 3)

        # colonne droite = arabe
        right = render(page, pymupdf.Rect(W * 0.495, H * 0.115, W * 0.96, H * 0.97),
                       tmp / f"r{pno}.png")
        ara = ocr(right, "ara", OUT / f"p{pno:03d}.arabe.txt", 3)

        # pleine page français (utile sur les pages de traduction)
        fullp = render(page, pymupdf.Rect(W * 0.06, H * 0.115, W * 0.96, H * 0.97),
                       tmp / f"f{pno}.png", 220)
        fr = ocr(fullp, "fra", OUT / f"p{pno:03d}.fr.txt", 3, 220)

        rec.update({
            "latin_chars": len(lat), "arabe_chars": len(ara), "fr_chars": len(fr),
            "arabe_stopwords": ar_score(ara),
            "latin_letters": len(re.findall(r"[A-Za-zÀ-ÿ]", lat)),
            "type": "dialogue_bilingue" if ar_score(ara) >= 8 and len(re.findall(r"[A-Za-zÀ-ÿ]", lat)) > 300
                    else "traduction_fr" if len(re.findall(r"[A-Za-zÀ-ÿ]", fr)) > 800
                    else "autre",
        })
        index.append(rec)
        for f in tmp.glob(f"*{pno}.png"):
            f.unlink(missing_ok=True)
        print(f"p{pno} {rec['type']} lat={rec['latin_letters']} ar_stop={rec['arabe_stopwords']} fr={rec['fr_chars']}", flush=True)

    p = OUT / "index.json"
    old = {r["pdf_page"]: r for r in json.loads(p.read_text(encoding="utf-8"))} if p.exists() else {}
    for r in index:
        old[r["pdf_page"]] = r
    p.write_text(json.dumps([old[k] for k in sorted(old)], ensure_ascii=False, indent=2), encoding="utf-8")
    print("ZONES_OK", len(old))


if __name__ == "__main__":
    main()
