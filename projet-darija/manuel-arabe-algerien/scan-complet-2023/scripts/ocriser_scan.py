#!/usr/bin/env python3
"""
OCR du scan complet du Manuel d'arabe algérien moderne (Tapiéro, Klincksieck, 2e éd. 1978).
227 pages, PDF image (aucun texte natif) → OCR Tesseract.

Stratégie :
  - rendu 220 dpi
  - OCR `fra` sur toutes les pages (le manuel est majoritairement en français + transcription latine)
  - OCR `ara` en second passage sur les pages détectées comme contenant de l'arabe
  - page imprimée = page PDF - 10 (vérifié sur 6 pages témoins)

Sortie : ocr/p###.fra.txt, ocr/p###.ara.txt, ocr/index.json
Reprise possible : les pages déjà OCRisées sont sautées.
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
OCR = BASE / "ocr"
TESS = "/tmp/ocr-root/usr/bin/tesseract"
ENV = dict(os.environ,
           LD_LIBRARY_PATH="/tmp/ocr-root/usr/lib/x86_64-linux-gnu:/tmp/libs/usr/lib/x86_64-linux-gnu",
           TESSDATA_PREFIX="/tmp/ocr-root/usr/share/tesseract-ocr/5/tessdata",
           OMP_THREAD_LIMIT="1")
DPI = 220
OFFSET = 10  # printed = pdf - 10

AR = re.compile(r"[\u0621-\u064A]")


def run_ocr(png: Path, lang: str, out: Path):
    if out.exists() and out.stat().st_size > 0:
        return out.read_text(encoding="utf-8")
    r = subprocess.run([TESS, str(png), str(out.with_suffix("")), "-l", lang, "--psm", "3"],
                       capture_output=True, text=True, env=ENV)
    txt = out.read_text(encoding="utf-8") if out.exists() else ""
    return txt


def main():
    OCR.mkdir(parents=True, exist_ok=True)
    tmp = Path("/tmp/fr64-ocr")
    tmp.mkdir(exist_ok=True)
    doc = pymupdf.open(PDF)
    index = []
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    end = int(sys.argv[2]) if len(sys.argv) > 2 else doc.page_count

    for pno in range(start, end + 1):
        page = doc[pno - 1]
        png = tmp / f"p{pno:03d}.png"
        if not png.exists():
            page.get_pixmap(dpi=DPI).save(png)
        fr = run_ocr(png, "fra", OCR / f"p{pno:03d}.fra.txt")
        # détection arabe : le OCR fra sort du bruit sur les pages arabes ;
        # on teste la densité de caractères arabes dans un passage ara rapide
        ar_txt = ""
        fra_letters = len(re.findall(r"[A-Za-zÀ-ÿ]", fr))
        # Une page arabe a peu de latin reconnu et beaucoup de traits : on lance ara
        # sur toutes les pages du corps (11-226) pour ne rien manquer.
        if 11 <= pno <= 226:
            ar_txt = run_ocr(png, "ara", OCR / f"p{pno:03d}.ara.txt")
        ar_count = len(AR.findall(ar_txt))
        m = re.search(r"(?m)^\s*(\d{1,3})\s", fr)
        rec = {
            "pdf_page": pno,
            "printed_page": pno - OFFSET if 11 <= pno <= 226 else None,
            "fra_chars": len(fr),
            "fra_letters": fra_letters,
            "ara_chars": len(ar_txt),
            "ara_arabic_letters": ar_count,
            "dominant": "ar" if ar_count > 200 and ar_count > fra_letters else "fr",
            "ocr_engine": "tesseract-5.5.0",
            "ocr_dpi": DPI,
        }
        index.append(rec)
        png.unlink(missing_ok=True)
        if pno % 10 == 0:
            print(f"p{pno}/{end} fr={fra_letters} ar={ar_count} → {rec['dominant']}", flush=True)

    # fusion d'index si exécution par lots
    idx_path = OCR / "index.json"
    existing = {}
    if idx_path.exists():
        for r in json.loads(idx_path.read_text(encoding="utf-8")):
            existing[r["pdf_page"]] = r
    for r in index:
        existing[r["pdf_page"]] = r
    merged = [existing[k] for k in sorted(existing)]
    idx_path.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "pages_ocrisees": len(merged),
        "pages_dominante_ar": sum(1 for r in merged if r["dominant"] == "ar"),
        "pages_dominante_fr": sum(1 for r in merged if r["dominant"] == "fr"),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
