#!/usr/bin/env python3
"""Nettoyage global anti-saturation du workspace projet-darija.

Supprime uniquement des fichiers redondants/régénérables :
- archives ZIP consolidées redondantes avec les dossiers sources ;
- exports intermédiaires par partie du dictionnaire (les masters restent) ;
- exports tunisiens bruts identiques aux exports actifs ;
- caches Python.

Conserve : PDF canoniques raw/, bases SQLite, textes OCR, scripts, rapports,
exports masters, backup de sécurité le plus récent par livre.
"""
from __future__ import annotations
import argparse, hashlib, json, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent

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
    deleted = []
    errors = []

    def remove(p: Path, reason: str):
        if not p.exists():
            return
        size = p.stat().st_size if p.is_file() else sum(x.stat().st_size for x in p.rglob('*') if x.is_file())
        if args.dry_run:
            deleted.append({'path': str(p.relative_to(ROOT)), 'bytes': size, 'reason': reason, 'dry_run': True})
            return
        try:
            if p.is_dir(): shutil.rmtree(p)
            else: p.unlink()
            deleted.append({'path': str(p.relative_to(ROOT)), 'bytes': size, 'reason': reason})
        except Exception as e:
            errors.append({'path': str(p), 'error': str(e)})

    # 1. Archives redondantes (les dossiers complets restent).
    for rel in ['dictionnaire-livre-partie-10.zip', 'manuel-arabe-algerien-partie-01.zip']:
        remove(ROOT / rel, 'archive ZIP redondante avec le dossier source ; régénérable')

    # 2. Exports intermédiaires par partie du dictionnaire.
    exp = ROOT / 'dictionnaire-livre' / 'exports'
    masters = [exp / n for n in [
        'dictionnaire-master-brut.json', 'dictionnaire-master-brut.csv',
        'dictionnaire-master-actif.json', 'dictionnaire-master-actif.csv',
        'dictionnaire-supplement-tunis-actif.json', 'dictionnaire-supplement-tunis-actif.csv',
    ]]
    if all(m.exists() for m in masters):
        for pattern in ['partie-*-entries-brutes.json', 'partie-*-entries-brutes.csv',
                        'partie-*-echantillon-app.json', 'partie-*-apercu.md']:
            for p in sorted(exp.glob(pattern)):
                remove(p, 'export intermédiaire par partie ; masters conservés')
        # exports tunisiens bruts identiques aux actifs
        for ext in ['json', 'csv']:
            brut = exp / f'dictionnaire-supplement-tunis-brut.{ext}'
            actif = exp / f'dictionnaire-supplement-tunis-actif.{ext}'
            if brut.exists() and actif.exists() and sha256(brut) == sha256(actif):
                remove(brut, 'doublon exact de l’export tunisien actif')
    else:
        errors.append({'path': str(exp), 'error': 'masters absents : exports intermédiaires non supprimés'})

    # 3. Caches Python.
    for p in sorted(ROOT.rglob('__pycache__')):
        remove(p, 'cache Python régénérable')
    for p in sorted(ROOT.rglob('*.pyc')):
        remove(p, 'cache Python régénérable')

    report = {
        'dry_run': args.dry_run,
        'deleted_count': len(deleted),
        'deleted_bytes': sum(x['bytes'] for x in deleted),
        'deleted': deleted,
        'errors': errors,
        'kept_policy': 'PDF raw/, SQLite, OCR texte, scripts, rapports, masters, backups récents',
    }
    out = ROOT / 'dictionnaire-livre' / 'review' / 'nettoyage-workspace-sature.json'
    if not args.dry_run:
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: report[k] for k in ['dry_run','deleted_count','deleted_bytes','errors']}, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
