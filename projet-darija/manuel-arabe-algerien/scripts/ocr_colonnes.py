#!/usr/bin/env python3
"""OCR column-aware pour le Manuel d'arabe algérien (Norbert Tapiéro).

Le PDF est composé de doubles pages imprimées : chaque page PDF contient
une page gauche (français / transcription latine) et une page droite
(texte arabe + transcription + notes). Un OCR pleine page en --psm 6
entreligne les deux pages. Ce script découpe chaque page PDF en deux
moitiés, puis applique :
  - moitié gauche : tesseract -l fra --psm 6
  - moitié droite : tesseract -l ara+fra --psm 4 (sauf front matter)
Les sorties sont séparées par moitié : page-NNN-L.txt / page-NNN-R.txt.
"""
from __future__ import annotations
import argparse, concurrent.futures as cf, hashlib, json, subprocess, sys, tempfile
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image

SCALE = 4.0
# Boîtes de découpe empiriques sur les scans 2990x2232 (dpi ~ 288).
# Ajustées pour éviter la reliure centrale et les marges extérieures.
LEFT_BOX = (40, 20, 1475, 2212)
RIGHT_BOX = (1505, 20, 2970, 2212)


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def ocr_image(img: Image.Image, langs: str, psm: int, tmpdir: Path, tag: str) -> str:
    src = tmpdir / f'{tag}.png'
    img.save(src)
    out = tmpdir / tag
    cmd = ['tesseract', str(src), str(out), '-l', langs, '--psm', str(psm), '--oem', '1']
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f'tesseract failed {tag}: {r.stderr[:500]}')
    return out.with_suffix('.txt').read_text(encoding='utf-8', errors='replace')


def process_page(pdf_path: Path, page_index: int, out_dir: Path, front_matter_max: int,
                 page_offset: int = 0, printed_left_first: int | None = None) -> dict:
    doc = fitz.open(pdf_path)
    page = doc[page_index]
    pix = page.get_pixmap(matrix=fitz.Matrix(SCALE, SCALE), alpha=False)
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples).convert('L')
    doc.close()
    local_n = page_index + 1
    n = local_n + page_offset
    # Front matter : pas de colonne arabe attendue, français seul des deux côtés.
    is_front = local_n <= front_matter_max
    left = img.crop(LEFT_BOX)
    right = img.crop(RIGHT_BOX)
    with tempfile.TemporaryDirectory(prefix='ocr-col-') as td:
        tmp = Path(td)
        tl = ocr_image(left, 'fra', 6, tmp, f'{n:03d}-L')
        if is_front:
            tr = ocr_image(right, 'fra', 6, tmp, f'{n:03d}-R')
            right_langs, right_psm = 'fra', 6
        else:
            tr = ocr_image(right, 'ara+fra', 4, tmp, f'{n:03d}-R')
            right_langs, right_psm = 'ara+fra', 4
    (out_dir / f'page-{n:03d}-L.txt').write_text(tl, encoding='utf-8')
    (out_dir / f'page-{n:03d}-R.txt').write_text(tr, encoding='utf-8')
    # Pages imprimées : à partir de la page PDF 7, gauche=2n-12, droite=2n-11.
    if printed_left_first is not None:
        # Parties sans front matter : numérotation continue des doubles pages.
        left_printed = printed_left_first + 2 * (local_n - 1)
        printed = [left_printed, left_printed + 1]
    elif n >= 7:
        printed = [2 * n - 12, 2 * n - 11]
    elif n == 6:
        printed = [None, 1]  # abréviations non paginées / leçon 1 page 1
    else:
        printed = [None, None]
    return {
        'pdf_page': n,
        'pdf_page_local': local_n,
        'pdf_file': pdf_path.name,
        'printed_pages': printed,
        'left': {'file': f'page-{n:03d}-L.txt', 'langs': 'fra', 'psm': 6, 'chars': len(tl)},
        'right': {'file': f'page-{n:03d}-R.txt', 'langs': right_langs, 'psm': right_psm, 'chars': len(tr)},
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--pdf', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--workers', type=int, default=3)
    ap.add_argument('--front-matter-max', type=int, default=6,
                    help='Dernière page PDF considérée comme front matter (français seul des deux côtés).')
    ap.add_argument('--page-offset', type=int, default=0,
                    help='Décalage de numérotation PDF (segments d’une même partie).')
    ap.add_argument('--printed-left-first', type=int, default=None,
                    help='Page imprimée de la moitié gauche de la 1re page PDF du segment.')
    ap.add_argument('--meta-name', default='ocr-columns.json',
                    help='Nom du fichier de métadonnées (segments multiples).')
    args = ap.parse_args()
    pdf = Path(args.pdf)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf)
    count = len(doc)
    doc.close()
    results = []
    with cf.ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {ex.submit(process_page, pdf, i, out, args.front_matter_max,
                          args.page_offset, args.printed_left_first): i for i in range(count)}
        for fut in cf.as_completed(futs):
            i = futs[fut]
            try:
                res = fut.result()
                results.append(res)
                print(f"OK page {res['pdf_page']:03d} L={res['left']['chars']} R={res['right']['chars']}", flush=True)
            except Exception as e:
                print(f'ERROR page {i+1}: {e}', file=sys.stderr, flush=True)
                raise
    results.sort(key=lambda r: r['pdf_page'])
    meta = {
        'pdf': str(pdf), 'sha256': sha256(pdf), 'pdf_pages': count,
        'page_offset': args.page_offset, 'printed_left_first': args.printed_left_first,
        'method': 'column-aware halves; left fra/psm6; right ara+fra/psm4 (front matter fra/psm6)',
        'scale': SCALE, 'left_box': LEFT_BOX, 'right_box': RIGHT_BOX,
        'pages': results,
    }
    (out / args.meta_name).write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'DONE {len(results)} pages -> {out}', flush=True)
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
