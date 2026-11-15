#!/usr/bin/env python3
"""OCR a scanned dictionary part into per-page text files.
Usage: python ocr_partie.py --pdf ../raw/partie-01.pdf --out ../ocr/partie-01
"""
import argparse, pathlib, subprocess, concurrent.futures, sys
import pymupdf as fitz

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--pdf', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--dpi-scale', type=float, default=4.0)
    ap.add_argument('--psm', default='6')
    ap.add_argument('--langs', default='fra+ara')
    ap.add_argument('--workers', type=int, default=3)
    args=ap.parse_args()
    out=pathlib.Path(args.out); out.mkdir(parents=True,exist_ok=True)
    doc=fitz.open(args.pdf)
    images=[]
    for i,page in enumerate(doc):
        img=out/f'page-{i+1:03d}.png'
        if not img.exists():
            pix=page.get_pixmap(matrix=fitz.Matrix(args.dpi_scale,args.dpi_scale), alpha=False)
            pix.save(img)
        images.append((i,img))
    def OCR(item):
        i,img=item
        txt=out/f'page-{i+1:03d}.txt'
        if txt.exists() and txt.stat().st_size>0:
            return i, txt.stat().st_size
        base=out/f'page-{i+1:03d}'
        r=subprocess.run(['tesseract',str(img),str(base),'-l',args.langs,'--psm',args.psm,'--oem','1'],capture_output=True,text=True)
        if r.returncode!=0:
            return i, f'ERR {r.stderr[:200]}'
        return i, txt.stat().st_size if txt.exists() else 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        for i,res in ex.map(OCR, images):
            print(f'page {i+1:03d}: {res}', flush=True)
    print('DONE', len(images))
if __name__=='__main__':
    main()
