#!/usr/bin/env python3
"""Ingestion structurée du Manuel d'arabe algérien moderne — partie 05 (dernière).

Partie 05 = 1 PDF (14 spreads), pages imprimées 188 à 215.
Contenu :
  - fin de la traduction du dialogue VI (p.188) -> dialogue VI complété ;
  - dialogues VII à XV complets (arabe + traduction) ;
  - table des matières (p.213-214).

Après cette partie le livre est COMPLET : 30 leçons + 15 dialogues + glossaires
(ar-fr / fr-ar) + index grammatical + table des matières.
Les dialogues sont indexés (jamais transcrits automatiquement). Tout `needs_review`.
La fusion glossaire->vocabulaire reste une passe dédiée (tâches de review ouvertes).
"""
from __future__ import annotations
import csv, hashlib, json, re, sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'db' / 'manuel.sqlite'
SOURCE_ID = 'tapiero-manuel-partie-05'
PART = 'partie-05'
PDF_NAME = 'partie-05.pdf'


def slug(s: str) -> str:
    s = s.lower().replace('’', "'")
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:60] or 'x'


def j(x):
    return json.dumps(x, ensure_ascii=False)


# numeral, title, pdf_ar, printed_ar, pdf_fr, printed_fr
DIALOGUES = [
    ('VII', 'L’hôpital', 1, 189, 2, 190),
    ('VIII', 'Au supermarché', 2, 191, 3, 192),
    ('IX', 'Le travail en usine', 3, 193, 4, 194),
    ('X', 'Le chômage et la vie chère', 4, 195, 5, 196),
    ('XI', 'Le retour', 5, 197, 6, 198),
    ('XII', 'Les papiers officiels', 7, 200, 8, 202),
    ('XIII', 'L’automobile', 8, 203, 9, 205),
    ('XIV', 'Les loisirs', 10, 206, 11, 208),
    ('XV', 'Les vacances', 11, 209, 12, 211),
]


def main():
    con = sqlite3.connect(DB)
    con.executescript((ROOT / 'db' / 'schema.sql').read_text())
    con.execute('PRAGMA foreign_keys=ON')
    m = json.loads((ROOT / 'manifest.json').read_text())
    raw = ROOT / 'raw' / PDF_NAME
    sha = hashlib.sha256(raw.read_bytes()).hexdigest()
    con.execute('''INSERT OR REPLACE INTO sources
        (source_id,book,part,title,author,publisher,edition,isbn,filename,sha256,bytes,pdf_pages,dialect,register,rights_note)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        (SOURCE_ID, 'manuel-arabe-algerien', PART, m['title'], m['author'], m['publisher'],
         m['edition'], m['isbn'], PDF_NAME, sha, raw.stat().st_size, 14, 'arq', m['register'],
         'Œuvre sous droit (Klincksieck). Usage interne/recherche ; publication app nécessite licence ou contenu original/licencié.'))

    # purge ciblée partie 05
    ids = [r[0] for r in con.execute('SELECT dialogue_id FROM dialogues WHERE source_id=?', (SOURCE_ID,))]
    for oid in ids:
        con.execute('DELETE FROM review_tasks WHERE object_type=? AND object_id=?', ('dialogues', oid))
    con.execute('DELETE FROM dialogues WHERE source_id=?', (SOURCE_ID,))
    con.execute('DELETE FROM pages WHERE source_id=?', (SOURCE_ID,))
    con.execute("DELETE FROM review_tasks WHERE object_type='sources' AND reason LIKE '%(partie 05)%'")

    # pages (14 spreads, 188..215)
    meta = json.loads((ROOT / 'ocr' / 'partie-05-colonnes' / 'ocr-columns.json').read_text())
    for p in meta['pages']:
        n = p['pdf_page']
        printed = [2 * n + 186, 2 * n + 187]
        for side, key in [('L', 'left'), ('R', 'right')]:
            info = p[key]
            con.execute('''INSERT INTO pages
                (source_id,pdf_page,printed_page,side,ocr_file,ocr_langs,ocr_psm,ocr_chars,quality,pdf_file)
                VALUES(?,?,?,?,?,?,?,?,?,?)''',
                (SOURCE_ID, n, printed[0] if side == 'L' else printed[1], side, info['file'],
                 info['langs'], info['psm'], info['chars'], 'ocr_columns', PDF_NAME))

    # compléter le dialogue VI (traduction p.188, partie 05)
    con.execute('''UPDATE dialogues SET completeness='complete', pdf_page_fr=1, printed_page_fr=188,
        notes = CASE WHEN notes LIKE '%Traduction française en partie 05%' THEN notes
                     ELSE notes || ' Traduction française en partie 05 (p.188, pdf 1 L).' END
        WHERE numeral='VI' ''')

    # dialogues VII..XV
    for numeral, title, pa, pra, pf, prf in DIALOGUES:
        uid = f'tapiero-p05-dialogue-{numeral.lower()}'
        note = ('Dialogue du supplément « 15 dialogues entre Maghrébins (vie des immigrés) ». '
                'Indexé (titre + provenance) ; transcription arabe/latin et traduction à produire et valider avant publication.')
        con.execute('''INSERT INTO dialogues
            (source_id,dialogue_uid,numeral,title_fr,pdf_page_ar,printed_page_ar,pdf_page_fr,printed_page_fr,
             ar_text,latin_text,fr_translation,completeness,status,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (SOURCE_ID, uid, numeral, title, pa, pra, pf, prf, None, None, None, 'complete', 'needs_review', note))
        did = con.execute('SELECT dialogue_id FROM dialogues WHERE dialogue_uid=?', (uid,)).fetchone()[0]
        con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                    ('dialogues', did, 'Transcription/validation dialogue (arabe + latin + traduction) avant publication (partie 05)', 1, 'open'))

    # table des matières + clôture livre
    con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                ('sources', 0, 'Table des matières p.213-214 (partie 05) : référence de navigation ; livre complet (30 leçons + 15 dialogues + glossaires + index) (partie 05)', 3, 'open'))
    con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                ('sources', 0, 'Passe dédiée fusion glossaire->vocabulaire (pluriels/genres/sens + lookup FR->DZ) à exécuter maintenant que le livre est complet (partie 05)', 2, 'open'))

    con.execute('INSERT INTO processing_runs(part,step,finished_at,details_json) VALUES(?,?,datetime("now"),?)',
                (PART, 'ingestion_curated',
                 j(dict(pdf=PDF_NAME, sha256=sha, printed_range=[188, 215],
                        dialogues_new=len(DIALOGUES), dialogue_VI_completed=True,
                        table_matieres=[213, 214], book_complete=True))))
    con.commit()

    # exports
    exp = ROOT / 'exports' / 'partie-05'
    exp.mkdir(parents=True, exist_ok=True)

    def dump(name, rows):
        (exp / f'{name}.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
        if rows:
            with (exp / f'{name}.csv').open('w', newline='', encoding='utf-8') as f:
                w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
                w.writeheader(); w.writerows(rows)

    dump('dialogues', [dict(dialogue_uid=f'tapiero-p05-dialogue{n.lower()}', numeral=n, title_fr=t,
                            pdf_page_ar=pa, printed_page_ar=pra, pdf_page_fr=pf, printed_page_fr=prf,
                            completeness='complete', status='needs_review') for n, t, pa, pra, pf, prf in DIALOGUES])
    cur = con.execute('SELECT dialogue_uid,numeral,title_fr,printed_page_ar,printed_page_fr,completeness,status,source_id FROM dialogues ORDER BY dialogue_id')
    cols = [d[0] for d in cur.description]
    dump('dialogues_all', [dict(zip(cols, r)) for r in cur.fetchall()])
    counts = {t: con.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0]
              for t in ['sources', 'pages', 'lessons', 'vocabulary', 'grammar_rules', 'exercises',
                        'study_texts', 'dialogues', 'review_tasks']}
    per_source = {t: con.execute(f'SELECT COUNT(*) FROM {t} WHERE source_id=?', (SOURCE_ID,)).fetchone()[0]
                  for t in ['pages', 'dialogues']}
    (exp / 'counts.json').write_text(json.dumps(dict(total=counts, partie_05=per_source, book_complete=True),
                                                 ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(dict(total=counts, partie_05=per_source, book_complete=True), ensure_ascii=False, indent=2))
    print('integrity', con.execute('PRAGMA integrity_check').fetchone()[0])
    print('fk', con.execute('PRAGMA foreign_key_check').fetchall())
    con.close()


if __name__ == '__main__':
    main()
