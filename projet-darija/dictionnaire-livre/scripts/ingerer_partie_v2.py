#!/usr/bin/env python3
"""Idempotent ingestion of a dictionary part with draft lexical segmentation.

Keeps raw OCR + provenance. Does NOT create validated modern forms or audio.
"""
import argparse, csv, hashlib, json, pathlib, re, sqlite3, unicodedata
from datetime import datetime, timezone
from segmenter_partie_v2 import segment, clean

PARSER_VERSION = 'lexical-2.1-draft'

SCHEMA_ADDITIONS = [
    ("entries", "headword_qualifier", "TEXT"),
    ("entries", "printed_page_start", "INTEGER"),
    ("entries", "printed_page_end", "INTEGER"),
    ("entries", "parser_version", "TEXT"),
    ("entries", "extraction_flags", "TEXT"),
    ("entries", "entry_uid", "TEXT"),
    ("pages", "printed_page_number", "INTEGER"),
    ("pages", "ocr_engine", "TEXT"),
    ("pages", "ocr_langs", "TEXT"),
    ("pages", "ocr_psm", "TEXT"),
    ("skill_rules", "source_id", "TEXT"),
    ("skill_rules", "status", "TEXT DEFAULT 'needs_review'"),
]

def ensure_schema(con):
    con.executescript('''
    CREATE TABLE IF NOT EXISTS sources(
      id TEXT PRIMARY KEY, filename TEXT, sha256 TEXT, title TEXT, year INTEGER,
      language_pair TEXT, status TEXT, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS pages(
      id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT, page_number INTEGER,
      section TEXT, ocr_text TEXT, image_path TEXT, ocr_quality TEXT,
      UNIQUE(source_id, page_number)
    );
    CREATE TABLE IF NOT EXISTS entries(
      id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT, page_start INTEGER, page_end INTEGER,
      headword_fr TEXT, headword_norm TEXT, pos_guess TEXT, raw_block TEXT,
      arabic_char_count INTEGER, status TEXT, confidence TEXT,
      UNIQUE(source_id, page_start, headword_norm, raw_block)
    );
    CREATE TABLE IF NOT EXISTS entry_forms(
      id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER, form_type TEXT,
      ar_script TEXT, translit_historical TEXT, translit_modern TEXT,
      audio_path TEXT, validated INTEGER DEFAULT 0, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS senses(
      id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER, sense_order INTEGER,
      fr_gloss TEXT, register TEXT, domain TEXT, example_fr TEXT, example_ar TEXT,
      example_lat TEXT, validated INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS skill_rules(
      id INTEGER PRIMARY KEY AUTOINCREMENT, topic TEXT, rule_text TEXT,
      source_pages TEXT, examples_json TEXT, validated INTEGER DEFAULT 0,
      register_warning TEXT
    );
    CREATE TABLE IF NOT EXISTS review_tasks(
      id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER, issue TEXT,
      priority TEXT, status TEXT DEFAULT 'open'
    );
    CREATE TABLE IF NOT EXISTS processing_runs(
      id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT, sha256 TEXT,
      started_at TEXT, finished_at TEXT, parser_version TEXT,
      pages INTEGER, candidates INTEGER, inserted INTEGER, skipped INTEGER,
      warnings TEXT, status TEXT
    );
    ''')
    existing = {}
    for table in ['entries', 'pages', 'skill_rules']:
        existing[table] = {r[1] for r in con.execute(f'PRAGMA table_info({table})')}
    for table, col, typ in SCHEMA_ADDITIONS:
        if col not in existing.get(table, set()):
            con.execute(f'ALTER TABLE {table} ADD COLUMN {col} {typ}')
    con.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_uid ON entries(entry_uid) WHERE entry_uid IS NOT NULL')
    con.execute('CREATE INDEX IF NOT EXISTS idx_sources_sha ON sources(sha256)')
    con.commit()

def norm(s):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', clean(s))).strip()

def uid_for(part, page, headword, raw):
    h = hashlib.sha256(f'{part}|{page}|{norm(headword).lower()}|{norm(raw)}'.encode()).hexdigest()
    return f'{part}-{h[:20]}'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ocr-dir', required=True)
    ap.add_argument('--pdf', required=True)
    ap.add_argument('--part', required=True)
    ap.add_argument('--db', required=True)
    ap.add_argument('--exports', required=True)
    ap.add_argument('--dict-start', type=int, required=True)
    ap.add_argument('--dict-end', type=int, required=True)
    ap.add_argument('--ocr-engine', default='tesseract')
    ap.add_argument('--ocr-langs', default='fra+ara')
    ap.add_argument('--ocr-psm', default='6')
    args = ap.parse_args()

    started = datetime.now(timezone.utc).isoformat()
    pdf = pathlib.Path(args.pdf)
    sha = hashlib.sha256(pdf.read_bytes()).hexdigest()
    ocr = pathlib.Path(args.ocr_dir)
    exports = pathlib.Path(args.exports); exports.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(args.db)
    con.execute('PRAGMA foreign_keys=ON')
    ensure_schema(con)

    dup = con.execute('SELECT id FROM sources WHERE sha256=? AND id!=?', (sha, args.part)).fetchone()
    if dup:
        raise SystemExit(f'Duplicate PDF already stored as {dup[0]}; refusing to import twice.')
    same = con.execute('SELECT COUNT(*) FROM entries WHERE source_id=?', (args.part,)).fetchone()[0]
    if same:
        raise SystemExit(f'{args.part} already has {same} entries; refusing to overwrite. Use a new part id or restore a backup.')

    entries, pages = segment(ocr, args.dict_start, args.dict_end)
    inserted = 0
    skipped = 0
    warnings = []
    if not entries:
        warnings.append('no_candidates_detected')
    if len(pages) != (args.dict_end - args.dict_start + 1):
        warnings.append('missing_ocr_pages')

    try:
        con.execute('BEGIN')
        con.execute('''INSERT INTO sources(id,filename,sha256,title,year,language_pair,status,notes)
          VALUES(?,?,?,?,?,?,?,?)''', (
            args.part, pdf.name, sha,
            'Dictionnaire français-arabe de la langue parlée en Algérie', 1910,
            'fr -> arq (historique)', 'ocr_raw',
            'Source historique. OCR bruité. Segmentation brouillon lexical-2. Ne pas publier sans revue humaine et validation native.'
        ))
        for n, page in pages.items():
            f = ocr / f'page-{n:03d}.txt'
            text = f.read_text(encoding='utf-8', errors='replace') if f.exists() else ''
            quality = 'low' if len(text) < 100 else 'raw_unverified'
            con.execute('''INSERT OR REPLACE INTO pages(source_id,page_number,section,ocr_text,image_path,ocr_quality,
              printed_page_number,ocr_engine,ocr_langs,ocr_psm)
              VALUES(?,?,?,?,?,?,?,?,?,?)''', (
                args.part, n, 'dictionnaire', text, str(f.with_suffix('.png')), quality,
                page.get('printed'), args.ocr_engine, args.ocr_langs, args.ocr_psm
            ))
        for e in entries:
            raw = norm(e['raw_block'])
            hw = norm(e['headword_fr'])
            hwn = hw.lower()
            ac = e['arabic_char_count']
            flags = e.get('flags', [])
            uid = uid_for(args.part, e['page_start'], hw, raw)
            cur = con.execute('''INSERT OR IGNORE INTO entries(
              source_id,page_start,page_end,headword_fr,headword_norm,pos_guess,raw_block,
              arabic_char_count,status,confidence,headword_qualifier,printed_page_start,printed_page_end,
              parser_version,extraction_flags,entry_uid)
              VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', (
                args.part, e['page_start'], e['page_end'], hw, hwn, e.get('pos_guess'), raw,
                ac, 'needs_review', 'unverified', e.get('headword_qualifier') or None,
                e.get('printed_page_start'), e.get('printed_page_end'),
                e.get('parser_version', PARSER_VERSION), json.dumps(flags, ensure_ascii=False), uid
            ))
            if cur.rowcount:
                inserted += 1
                eid = cur.lastrowid
                issue = 'OCR + segmentation + forme historique à vérifier; proposer forme moderne seulement après revue.'
                priority = 'high' if ac == 0 or 'weak_entry_evidence' in flags else 'medium'
                con.execute('INSERT INTO review_tasks(entry_id,issue,priority) VALUES(?,?,?)', (eid, issue, priority))
                e['id'] = eid
                e['entry_uid'] = uid
            else:
                skipped += 1
        con.execute('''INSERT INTO processing_runs(source_id,sha256,started_at,finished_at,parser_version,
          pages,candidates,inserted,skipped,warnings,status)
          VALUES(?,?,?,?,?,?,?,?,?,?,?)''', (
            args.part, sha, started, datetime.now(timezone.utc).isoformat(), PARSER_VERSION,
            len(pages), len(entries), inserted, skipped, json.dumps(warnings, ensure_ascii=False), 'completed'
        ))
        con.commit()
    except Exception:
        con.rollback()
        raise

    # Export only this part, with DB ids.
    cols = [r[1] for r in con.execute('PRAGMA table_info(entries)')]
    rows = []
    for r in con.execute('SELECT * FROM entries WHERE source_id=? ORDER BY page_start,id', (args.part,)):
        rows.append(dict(zip(cols, r)))
    (exports / f'{args.part}-entries-brutes.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
    with (exports / f'{args.part}-entries-brutes.csv').open('w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader(); w.writerows(rows)
    stats = {
        'part': args.part,
        'pages': len(pages),
        'candidates': len(entries),
        'inserted': inserted,
        'skipped': skipped,
        'with_arabic': sum(1 for e in entries if e['arabic_char_count'] > 0),
        'weak_evidence': sum(1 for e in entries if 'weak_entry_evidence' in e.get('flags', [])),
        'cross_page': sum(1 for e in entries if 'cross_page_block' in e.get('flags', [])),
        'parser_version': PARSER_VERSION,
        'warnings': warnings,
        'status': 'needs_review',
    }
    (exports / f'{args.part}-stats.json').write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(stats, ensure_ascii=False, indent=2))
    con.close()

if __name__ == '__main__':
    main()
