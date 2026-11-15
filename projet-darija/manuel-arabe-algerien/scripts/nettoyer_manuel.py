#!/usr/bin/env python3
"""Nettoyage répétable du chantier Manuel d'arabe algérien.

Supprime :
- doublon d'upload vérifié par SHA ;
- PNG OCR régénérables ;
- ancien OCR pleine page entreligné (partie-01) si l'OCR colonnes existe ;
- script OCR pleine page obsolète ;
- caches Python.
Conserve : PDF canonique raw/, OCR colonnes, base, exports, rapports, scripts utiles, backup récent.
"""
from __future__ import annotations
import argparse, hashlib, json, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJET = ROOT.parent
UPLOADS = Path('/home/user/uploads')


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    removed = []
    errors = []
    def rm(p: Path):
        if not p.exists():
            return
        if args.dry_run:
            removed.append({'path': str(p), 'bytes': p.stat().st_size if p.is_file() else None, 'dry_run': True})
            return
        try:
            if p.is_dir():
                shutil.rmtree(p)
            else:
                p.unlink()
            removed.append({'path': str(p), 'bytes': None, 'dry_run': False})
        except Exception as e:
            errors.append({'path': str(p), 'error': str(e)})
    # 1. doublon upload
    raw = ROOT / 'raw' / 'partie-01.pdf'
    up = UPLOADS / 'Manuel-arab-algerien-1.pdf'
    if raw.exists() and up.exists():
        if sha256(raw) == sha256(up):
            rm(up)
        else:
            errors.append({'path': str(up), 'error': 'SHA différent du canonique : non supprimé'})
    # 2. ancien OCR pleine page + PNG
    old = ROOT / 'ocr' / 'partie-01'
    cols = ROOT / 'ocr' / 'partie-01-colonnes'
    if cols.exists() and (cols / 'ocr-columns.json').exists():
        rm(old)
    else:
        # au moins supprimer les PNG si présent
        if old.exists():
            for png in old.glob('*.png'):
                rm(png)
    # 3. script obsolète
    rm(ROOT / 'scripts' / 'ocr_partie.py')
    # 4. caches
    for cache in ROOT.rglob('__pycache__'):
        rm(cache)
    for pyc in ROOT.rglob('*.pyc'):
        rm(pyc)
    report = {'removed': removed, 'errors': errors, 'dry_run': args.dry_run}
    out = ROOT / 'review' / ('nettoyage-partie-01-dry-run.json' if args.dry_run else 'nettoyage-partie-01.json')
    if not args.dry_run:
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
