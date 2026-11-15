#!/usr/bin/env python3
"""Consolidate dictionary DB: indexes, FTS, master exports, manifest.

Supports dialect registers. The default public Algerian corpus excludes the
Tunisian supplement (register tunisien_1910), which is exported separately.
"""
import csv, json, pathlib, sqlite3, argparse

def ensure_register_columns(con):
    cols = {r[1] for r in con.execute('PRAGMA table_info(entries)')}
    additions = [
        ('register', "TEXT DEFAULT 'algerien_1910'"),
        ('in_algerian_corpus', 'INTEGER DEFAULT 1'),
        ('parent_headword', 'TEXT'),
        ('section', "TEXT DEFAULT 'dictionnaire'"),
    ]
    for col, typ in additions:
        if col not in cols:
            con.execute(f'ALTER TABLE entries ADD COLUMN {col} {typ}')
    con.execute("UPDATE entries SET register='algerien_1910' WHERE register IS NULL")
    con.execute('UPDATE entries SET in_algerian_corpus=1 WHERE in_algerian_corpus IS NULL')
    con.execute("UPDATE entries SET section='dictionnaire' WHERE section IS NULL")
    con.commit()

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--db', required=True)
    ap.add_argument('--exports', required=True)
    ap.add_argument('--root', required=True)
    args=ap.parse_args()
    con=sqlite3.connect(args.db)
    ensure_register_columns(con)
    con.executescript('''
    CREATE INDEX IF NOT EXISTS idx_entries_headword_norm ON entries(headword_norm);
    CREATE INDEX IF NOT EXISTS idx_entries_source ON entries(source_id);
    CREATE INDEX IF NOT EXISTS idx_entries_page ON entries(source_id,page_start);
    CREATE INDEX IF NOT EXISTS idx_entries_register ON entries(register);
    CREATE INDEX IF NOT EXISTS idx_entries_corpus ON entries(in_algerian_corpus);
    CREATE INDEX IF NOT EXISTS idx_review_status ON review_tasks(status);
    CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
      headword_fr, raw_block, content='entries', content_rowid='id',
      tokenize='unicode61 remove_diacritics 2'
    );
    CREATE TRIGGER IF NOT EXISTS entries_ai AFTER INSERT ON entries BEGIN
      INSERT INTO entries_fts(rowid,headword_fr,raw_block) VALUES(new.id,new.headword_fr,new.raw_block);
    END;
    CREATE TRIGGER IF NOT EXISTS entries_ad AFTER DELETE ON entries BEGIN
      INSERT INTO entries_fts(entries_fts,rowid,headword_fr,raw_block) VALUES('delete',old.id,old.headword_fr,old.raw_block);
    END;
    CREATE TRIGGER IF NOT EXISTS entries_au AFTER UPDATE ON entries BEGIN
      INSERT INTO entries_fts(entries_fts,rowid,headword_fr,raw_block) VALUES('delete',old.id,old.headword_fr,old.raw_block);
      INSERT INTO entries_fts(rowid,headword_fr,raw_block) VALUES(new.id,new.headword_fr,new.raw_block);
    END;
    DROP VIEW IF EXISTS v_entries_review;
    CREATE VIEW v_entries_review AS
      SELECT e.*, s.filename FROM entries e JOIN sources s ON s.id=e.source_id
      WHERE e.status != 'false_positive';
    DROP VIEW IF EXISTS v_entries_algerien;
    CREATE VIEW v_entries_algerien AS
      SELECT e.*, s.filename FROM entries e JOIN sources s ON s.id=e.source_id
      WHERE e.status != 'false_positive' AND e.in_algerian_corpus=1;
    ''')
    con.execute("INSERT INTO entries_fts(entries_fts) VALUES('rebuild')")
    con.commit()

    exports=pathlib.Path(args.exports); exports.mkdir(parents=True,exist_ok=True)
    cols=[c[0] for c in con.execute('SELECT * FROM entries LIMIT 0').description]
    rows=[dict(zip(cols,r)) for r in con.execute('SELECT * FROM entries ORDER BY source_id,page_start,id')]
    def write_pair(name, data):
        (exports/f'{name}.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
        with (exports/f'{name}.csv').open('w',encoding='utf-8',newline='') as f:
            w=csv.DictWriter(f,fieldnames=cols)
            w.writeheader(); w.writerows(data)
    write_pair('dictionnaire-master-brut', rows)
    active=[r for r in rows if r.get('status')!='false_positive' and r.get('in_algerian_corpus')==1]
    write_pair('dictionnaire-master-actif', active)
    tunis=[r for r in rows if r.get('register')=='tunisien_1910']
    tunis_active=[r for r in tunis if r.get('status')!='false_positive']
    write_pair('dictionnaire-supplement-tunis-brut', tunis)
    write_pair('dictionnaire-supplement-tunis-actif', tunis_active)

    root=pathlib.Path(args.root)
    parts=[]
    for sid,fn,sha,status in con.execute('SELECT id,filename,sha256,status FROM sources ORDER BY id'):
        cnt=con.execute('SELECT COUNT(*) FROM entries WHERE source_id=?',(sid,)).fetchone()[0]
        act=con.execute("SELECT COUNT(*) FROM entries WHERE source_id=? AND status!='false_positive' AND in_algerian_corpus=1",(sid,)).fetchone()[0]
        tun=con.execute("SELECT COUNT(*) FROM entries WHERE source_id=? AND register='tunisien_1910'",(sid,)).fetchone()[0]
        pages=con.execute('SELECT COUNT(*) FROM pages WHERE source_id=?',(sid,)).fetchone()[0]
        parsers=[r[0] for r in con.execute('SELECT DISTINCT parser_version FROM entries WHERE source_id=? AND parser_version IS NOT NULL',(sid,))]
        parts.append({'id':sid,'pdf':f'raw/{sid}.pdf','filename':fn,'sha256':sha,'pages':pages,
                      'entries':cnt,'active_algerian_entries':act,'tunisian_supplement_entries':tun,
                      'status':status,'parser_versions':parsers or ['legacy-1']})
    complete = len(parts)>=10
    manifest={'project':'dictionnaire-livre','db':'db/dictionnaire.sqlite','parts':parts,
              'total_entries':len(rows),'total_active_algerian_entries':len(active),
              'total_tunisian_supplement_entries':len(tunis),
              'total_active_tunisian_supplement_entries':len(tunis_active),
              'next': None if complete else f'partie-{len(parts)+1:02d}',
              'book_complete': complete,
              'quality_note':'Toutes les entrées restent needs_review/unverified tant que validation native et correction OCR ne sont pas faites. Le supplément tunisien est séparé du corpus algérien.'}
    (root/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'total_entries':len(rows),'total_active_algerian':len(active),
                      'tunisian_supplement':len(tunis),'tunisian_active':len(tunis_active),
                      'parts':[(p['id'],p['entries'],p['active_algerian_entries'],p['tunisian_supplement_entries']) for p in parts]},ensure_ascii=False))
    con.close()
if __name__=='__main__': main()
