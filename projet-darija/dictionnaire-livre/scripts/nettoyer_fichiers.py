#!/usr/bin/env python3
"""Conservative cleanup for the dictionary project.

Deletes only verified duplicates, regenerable OCR images, caches, obsolete
intermediate archives/backups, and superseded candidate exports.
Keeps canonical raw PDFs, SQLite DB, OCR text, scripts, exports, reports.
"""
import argparse, hashlib, json, pathlib, shutil, sqlite3
from datetime import datetime, timezone

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', required=True, help='dictionnaire-livre root')
    ap.add_argument('--uploads', required=True)
    ap.add_argument('--project', required=True, help='projet-darija root')
    ap.add_argument('--latest-zip', required=True, help='zip to keep')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    root = pathlib.Path(args.root)
    uploads = pathlib.Path(args.uploads)
    project = pathlib.Path(args.project)
    latest_zip = pathlib.Path(args.latest_zip)
    db = root / 'db/dictionnaire.sqlite'
    deleted = []
    kept = []
    errors = []

    def remove(p, reason):
        p = pathlib.Path(p)
        if not p.exists():
            return
        size = p.stat().st_size if p.is_file() else sum(x.stat().st_size for x in p.rglob('*') if x.is_file())
        if args.dry_run:
            deleted.append({'path': str(p), 'bytes': size, 'reason': reason, 'dry_run': True})
            return
        try:
            if p.is_dir():
                shutil.rmtree(p)
            else:
                p.unlink()
            deleted.append({'path': str(p), 'bytes': size, 'reason': reason})
        except Exception as e:
            errors.append({'path': str(p), 'error': str(e)})

    # 1. Verify canonical raw PDFs against DB sources.
    con = sqlite3.connect(f'file:{db}?mode=ro', uri=True)
    sources = {sid: s for sid, s in con.execute('SELECT id, sha256 FROM sources')}
    con.close()
    raw_hashes = {}
    for part, expected in sources.items():
        p = root / 'raw' / f'{part}.pdf'
        if p.exists() and sha(p) == expected:
            raw_hashes[sha(p)] = str(p)
            kept.append({'path': str(p), 'reason': 'canonical source PDF verified'})
        else:
            errors.append({'path': str(p), 'error': 'missing or hash mismatch; not deleting uploads for this part'})

    # 2. Delete uploaded PDFs only if identical canonical raw exists.
    for p in sorted(uploads.glob('*.pdf')):
        h = sha(p)
        if h in raw_hashes:
            remove(p, f'duplicate upload; canonical copy kept at {raw_hashes[h]}')
        else:
            kept.append({'path': str(p), 'reason': 'no verified canonical duplicate; kept'})

    # 3. Delete regenerable OCR PNG images and sample dirs.
    for p in sorted((root / 'ocr').rglob('page-*.png')):
        remove(p, 'regenerable OCR image; OCR text and raw PDF kept')
    for p in sorted((root / 'ocr').glob('partie-*-sample')):
        remove(p, 'temporary OCR sample directory')
    # old top-level sample images/texts if any
    for p in sorted((root / 'ocr').glob('page-*.png')):
        remove(p, 'old top-level OCR sample image')
    for p in sorted((root / 'ocr').glob('page-*.txt')):
        remove(p, 'old top-level OCR sample text; part OCR kept')

    # 4. Delete caches.
    for p in sorted(root.rglob('__pycache__')):
        remove(p, 'Python cache')

    # 5. Delete obsolete intermediate candidate exports if final entries export exists.
    for p in sorted((root / 'exports').glob('partie-*-candidats.json')):
        part = p.name.replace('-candidats.json', '')
        final = root / 'exports' / f'{part}-entries-brutes.json'
        if final.exists():
            remove(p, 'intermediate candidates superseded by entries-brutes export')

    # 6. Delete obsolete part archives, keep latest consolidated archive.
    for p in sorted(project.glob('dictionnaire-livre-partie-*.zip')):
        if p.resolve() != latest_zip.resolve():
            remove(p, 'obsolete archive superseded by latest consolidated archive')

    # 7. Delete older backups, keep latest pre-part backup.
    backups = sorted((root / 'backups').glob('dictionnaire-avant-partie-*.sqlite'))
    if len(backups) > 1:
        for p in backups[:-1]:
            remove(p, 'older backup superseded by latest pre-import backup')
    for p in backups[-1:]:
        kept.append({'path': str(p), 'reason': 'latest safety backup kept'})

    # 8. Delete obsolete legacy ingestion script if v2 exists.
    legacy = root / 'scripts/ingerer_partie.py'
    v2 = root / 'scripts/ingerer_partie_v2.py'
    if legacy.exists() and v2.exists():
        remove(legacy, 'legacy ingestion script superseded by v2')

    # 9. Checkpoint and remove SQLite sidecar files if empty/closed.
    try:
        con = sqlite3.connect(db)
        con.execute('PRAGMA wal_checkpoint(TRUNCATE)')
        con.close()
        for suffix in ['-wal', '-shm']:
            p = pathlib.Path(str(db) + suffix)
            if p.exists() and p.stat().st_size == 0:
                remove(p, 'empty SQLite sidecar after checkpoint')
    except Exception as e:
        errors.append({'path': str(db), 'error': f'checkpoint failed: {e}'})

    report = {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'dry_run': args.dry_run,
        'deleted_count': len(deleted),
        'deleted_bytes': sum(x['bytes'] for x in deleted),
        'deleted': deleted,
        'kept': kept,
        'errors': errors,
        'policy': 'Conservative: canonical PDFs, DB, OCR text, scripts, exports, reports kept.',
    }
    out = root / 'review' / 'nettoyage-rapport.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    if not args.dry_run:
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({
        'dry_run': args.dry_run,
        'deleted_count': len(deleted),
        'deleted_bytes': report['deleted_bytes'],
        'errors': errors,
        'report': str(out),
    }, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
