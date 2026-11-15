#!/usr/bin/env python3
"""Ingestion structurée du Manuel d'arabe algérien moderne — partie 04.

Partie 04 = 1 PDF (25 spreads), pages imprimées 138 à 187.
Contenu :
  - fin du glossaire arabe-français (p.138-149) ;
  - glossaire français-arabe (p.150-170) ;
  - index grammatical (p.171-173) ;
  - supplément de 15 dialogues entre Maghrébins (vie des immigrés) :
    dialogues I à V complets (arabe + traduction) et VI commencé (arabe p.187,
    traduction attendue en partie 05).

Les glossaires (désormais complets) et l'index sont conservés en OCR de référence
(2 et 4 colonnes) et NON fusionnés au vocabulaire : une passe dédiée de
cross-check/fusion (pluriels, genres, sens) sera faite après la partie 05.
Les dialogues sont indexés (numéro, titre, provenance arabe + traduction) dans la
table `dialogues` ; jamais transcrits automatiquement. Tout reste `needs_review`.
"""
from __future__ import annotations
import csv, hashlib, json, re, sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'db' / 'manuel.sqlite'
SOURCE_ID = 'tapiero-manuel-partie-04'
PART = 'partie-04'
PDF_NAME = 'partie-04.pdf'


def slug(s: str) -> str:
    s = s.lower().replace('’', "'")
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:60] or 'x'


def j(x):
    return json.dumps(x, ensure_ascii=False)


# numeral, title, pdf_ar, printed_ar, pdf_fr, printed_fr, completeness
DIALOGUES = [
    ('I', 'La famille et le logement', 20, 177, 21, 178, 'complete'),
    ('II', 'Mère de famille malade', 21, 179, 22, 180, 'complete'),
    ('III', 'La famille et l’école', 22, 181, 23, 182, 'complete'),
    ('IV', 'La préformation', 23, 183, 24, 184, 'complete'),
    ('V', 'L’alphabétisation', 24, 185, 25, 186, 'complete'),
    ('VI', 'La sécurité sociale', 25, 187, None, None, 'partial'),
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
         m['edition'], m['isbn'], PDF_NAME, sha, raw.stat().st_size, 25, 'arq', m['register'],
         'Œuvre sous droit (Klincksieck). Usage interne/recherche ; publication app nécessite licence ou contenu original/licencié.'))

    # purge ciblée partie 04
    ids = [r[0] for r in con.execute('SELECT dialogue_id FROM dialogues WHERE source_id=?', (SOURCE_ID,))]
    for oid in ids:
        con.execute('DELETE FROM review_tasks WHERE object_type=? AND object_id=?', ('dialogues', oid))
    con.execute('DELETE FROM dialogues WHERE source_id=?', (SOURCE_ID,))
    con.execute('DELETE FROM pages WHERE source_id=?', (SOURCE_ID,))
    con.execute("DELETE FROM review_tasks WHERE object_type='sources' AND reason LIKE '%(partie 04)%'")

    # pages (25 spreads, 138..187, pas de doublon)
    meta = json.loads((ROOT / 'ocr' / 'partie-04-colonnes' / 'ocr-columns.json').read_text())
    for p in meta['pages']:
        n = p['pdf_page']
        printed = [2 * n + 136, 2 * n + 137]
        for side, key in [('L', 'left'), ('R', 'right')]:
            info = p[key]
            con.execute('''INSERT INTO pages
                (source_id,pdf_page,printed_page,side,ocr_file,ocr_langs,ocr_psm,ocr_chars,quality,pdf_file)
                VALUES(?,?,?,?,?,?,?,?,?,?)''',
                (SOURCE_ID, n, printed[0] if side == 'L' else printed[1], side, info['file'],
                 info['langs'], info['psm'], info['chars'], 'ocr_columns', PDF_NAME))

    # dialogues
    for numeral, title, pa, pra, pf, prf, comp in DIALOGUES:
        uid = f'tapiero-p04-dialogue-{numeral.lower()}'
        note = ('Dialogue du supplément « 15 dialogues entre Maghrébins (vie des immigrés) ». '
                'Indexé (titre + provenance) ; transcription arabe/latin et traduction à produire et valider avant publication.')
        if comp == 'partial':
            note += ' Traduction française attendue en partie 05 (p.188).'
        con.execute('''INSERT INTO dialogues
            (source_id,dialogue_uid,numeral,title_fr,pdf_page_ar,printed_page_ar,pdf_page_fr,printed_page_fr,
             ar_text,latin_text,fr_translation,completeness,status,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (SOURCE_ID, uid, numeral, title, pa, pra, pf, prf, None, None, None, comp, 'needs_review', note))
        did = con.execute('SELECT dialogue_id FROM dialogues WHERE dialogue_uid=?', (uid,)).fetchone()[0]
        con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                    ('dialogues', did, 'Transcription/validation dialogue (arabe + latin + traduction) avant publication (partie 04)', 1, 'open'))

    # tâches de référence glossaires / index
    con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                ('sources', 0, 'Glossaire arabe-français complet p.129-149 (parties 03+04) : OCR de référence ; passe dédiée de cross-check/fusion au vocabulaire après partie 05 (partie 04)', 3, 'open'))
    con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                ('sources', 0, 'Glossaire français-arabe p.150-170 (partie 04) : OCR de référence pour lookup FR→DZ ; non fusionné (partie 04)', 3, 'open'))
    con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                ('sources', 0, 'Index grammatical p.171-173 (partie 04) : référence pour retrouver les § par thème (partie 04)', 3, 'open'))

    con.execute('INSERT INTO processing_runs(part,step,finished_at,details_json) VALUES(?,?,datetime("now"),?)',
                (PART, 'ingestion_curated',
                 j(dict(pdf=PDF_NAME, sha256=sha, printed_range=[138, 187],
                        dialogues=len(DIALOGUES), dialogues_complete=sum(1 for d in DIALOGUES if d[6] == 'complete'),
                        glossaire_ar_fr=[138, 149], glossaire_fr_ar=[150, 170], index=[171, 173]))))
    con.commit()

    # exports
    exp = ROOT / 'exports' / 'partie-04'
    exp.mkdir(parents=True, exist_ok=True)

    def dump(name, rows):
        (exp / f'{name}.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
        if rows:
            with (exp / f'{name}.csv').open('w', newline='', encoding='utf-8') as f:
                w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
                w.writeheader(); w.writerows(rows)

    dump('dialogues', [dict(dialogue_uid=f'tapiero-p04-dialogue{n.lower()}', numeral=n, title_fr=t,
                            pdf_page_ar=pa, printed_page_ar=pra, pdf_page_fr=pf, printed_page_fr=prf,
                            completeness=c, status='needs_review') for n, t, pa, pra, pf, prf, c in DIALOGUES])
    counts = {t: con.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0]
              for t in ['sources', 'pages', 'lessons', 'vocabulary', 'grammar_rules', 'exercises',
                        'study_texts', 'dialogues', 'review_tasks']}
    per_source = {t: con.execute(f'SELECT COUNT(*) FROM {t} WHERE source_id=?', (SOURCE_ID,)).fetchone()[0]
                  for t in ['pages', 'dialogues']}
    (exp / 'counts.json').write_text(json.dumps(dict(total=counts, partie_04=per_source), ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(dict(total=counts, partie_04=per_source), ensure_ascii=False, indent=2))
    print('integrity', con.execute('PRAGMA integrity_check').fetchone()[0])
    print('fk', con.execute('PRAGMA foreign_key_check').fetchall())
    con.close()


if __name__ == '__main__':
    main()
