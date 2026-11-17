#!/usr/bin/env python3
"""
Découpe correcte des pages de traduction des dialogues.

Problème constaté : sur 12 des 15 dialogues, la page « traduction » commence par
la FIN du texte bilingue (latin + arabe), puis le titre « N. Traduction », puis
la traduction française. Un OCR pleine page mélange donc les trois.

Solution : Tesseract TSV donne la position du mot « Traduction ».
  - au-dessus  → fin du dialogue bilingue (colonnes latin / arabe)
  - en dessous → traduction française pure
On recadre et on repasse l'OCR avec la bonne langue sur chaque zone.

Sortie : ocr/zones/p###.trad.txt, p###.queue_latin.txt, p###.queue_arabe.txt
         ocr/zones/coupes.json
"""
import csv
import json
import os
import re
import subprocess
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

FR_PAGES = [188, 190, 192, 194, 196, 198, 200, 202, 204, 206, 208, 209,
            212, 215, 218, 221]
DPI = 220


def ocr(png, lang, dest, psm=3, dpi=DPI):
    subprocess.run([TESS, str(png), str(dest.with_suffix("")), "-l", lang,
                    "--psm", str(psm), "--dpi", str(dpi)],
                   capture_output=True, text=True, env=ENV)
    return dest.read_text(encoding="utf-8") if dest.exists() else ""


def main():
    tmp = Path("/tmp/coupes")
    tmp.mkdir(exist_ok=True)
    doc = pymupdf.open(PDF)
    coupes = {}
    for pno in FR_PAGES:
        page = doc[pno - 1]
        R = page.rect
        full = tmp / f"f{pno}.png"
        pix = page.get_pixmap(dpi=DPI)
        pix.save(full)
        img_h = pix.height
        tsv = tmp / f"f{pno}.tsv"
        subprocess.run([TESS, str(full), str(tsv.with_suffix("")), "-l", "fra",
                        "--psm", "3", "--dpi", str(DPI), "tsv"],
                       capture_output=True, text=True, env=ENV)
        y_cut = None
        if tsv.exists():
            for r in csv.DictReader(open(tsv, encoding="utf-8"), delimiter="\t",
                                    quoting=csv.QUOTE_NONE):
                if re.fullmatch(r"Traduction\.?", r["text"].strip() or ""):
                    y_cut = int(r["top"])
                    break
        rec = {"pdf_page": pno, "printed_page": pno - 10,
               "y_cut_px": y_cut, "dpi": DPI}
        if y_cut and y_cut > img_h * 0.13:
            # hauteur en points PDF
            yh = y_cut / DPI * 72
            rec["y_cut_pt"] = round(yh, 1)
            rec["mode"] = "coupe"
            # zone haute = fin du bilingue
            ql = tmp / f"ql{pno}.png"
            page.get_pixmap(dpi=260, clip=pymupdf.Rect(
                R.width * 0.08, R.height * 0.115, R.width * 0.505, yh - 3)).save(ql)
            ocr(ql, "fra", OUT / f"p{pno:03d}.queue_latin.txt", 3, 260)
            qr = tmp / f"qr{pno}.png"
            page.get_pixmap(dpi=400, clip=pymupdf.Rect(
                R.width * 0.500, R.height * 0.115, R.width * 0.945, yh - 3)).save(qr)
            ocr(qr, "ara", OUT / f"p{pno:03d}.queue_arabe.txt", 6, 400)
            # zone basse = traduction pure
            tb = tmp / f"tb{pno}.png"
            page.get_pixmap(dpi=DPI, clip=pymupdf.Rect(
                R.width * 0.06, yh - 2, R.width * 0.96, R.height * 0.975)).save(tb)
            ocr(tb, "fra", OUT / f"p{pno:03d}.trad.txt", 3)
        else:
            rec["mode"] = "page_entiere"
            tb = tmp / f"tb{pno}.png"
            page.get_pixmap(dpi=DPI, clip=pymupdf.Rect(
                R.width * 0.06, R.height * 0.115, R.width * 0.96, R.height * 0.975)).save(tb)
            ocr(tb, "fra", OUT / f"p{pno:03d}.trad.txt", 3)
        coupes[pno] = rec
        t = (OUT / f"p{pno:03d}.trad.txt")
        print(f"p{pno} {rec['mode']} y={y_cut} trad={t.stat().st_size if t.exists() else 0}o", flush=True)
        for f in tmp.glob(f"*{pno}.*"):
            f.unlink(missing_ok=True)

    (OUT / "coupes.json").write_text(json.dumps(coupes, ensure_ascii=False, indent=2),
                                     encoding="utf-8")
    print("COUPES_OK")


if __name__ == "__main__":
    main()
