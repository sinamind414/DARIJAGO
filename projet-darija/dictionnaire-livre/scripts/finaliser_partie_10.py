#!/usr/bin/env python3
"""Finalisation curation partie 10 : corpus algérien + supplément tunisien séparé.

- Répare les vedettes absorbées/oubliées sur les 9 pages lexicales.
- Restaure les sous-entrées légitimes (parent_headword) au lieu de les jeter.
- Ingère le supplément tunisien p.15-41 avec register=tunisien_1910,
  in_algerian_corpus=0 (jamais mélangé au corpus algérien grand public).
- Ajoute règles skill, échantillon app, aperçu, exports.
Tout reste needs_review / unverified.
"""
import csv, hashlib, json, pathlib, re, sqlite3, unicodedata
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1]
DB = ROOT / 'db/dictionnaire.sqlite'
EXPORTS = ROOT / 'exports'
BIDI = dict.fromkeys(map(ord, '\u200e\u200f\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069'), None)
AR_RE = re.compile(r'[\u0600-\u06FF]')

def clean(s):
    s = unicodedata.normalize('NFKC', s).translate(BIDI)
    s = s.replace('’', "'").replace('‘', "'").replace('`', "'")
    return re.sub(r'[ \t]+', ' ', s).strip()

def norm(s):
    return re.sub(r'\s+', ' ', clean(s)).strip()

def uid_for(part, page, headword, raw):
    h = hashlib.sha256(f'{part}|{page}|{norm(headword).lower()}|{norm(raw)}'.encode()).hexdigest()
    return f'{part}-{h[:20]}'

def ensure_columns(con):
    cols = {r[1] for r in con.execute('PRAGMA table_info(entries)')}
    for col, typ in [('register', "TEXT DEFAULT 'algerien_1910'"), ('in_algerian_corpus', 'INTEGER DEFAULT 1'),
                     ('parent_headword', 'TEXT'), ('section', "TEXT DEFAULT 'dictionnaire'")]:
        if col not in cols:
            con.execute(f'ALTER TABLE entries ADD COLUMN {col} {typ}')
    con.execute("UPDATE entries SET register='algerien_1910' WHERE register IS NULL")
    con.execute('UPDATE entries SET in_algerian_corpus=1 WHERE in_algerian_corpus IS NULL')
    con.execute("UPDATE entries SET section='dictionnaire' WHERE section IS NULL")

def flags_of(row):
    try: return json.loads(row or '[]')
    except Exception: return []

def set_flags(con, eid, flags):
    con.execute('UPDATE entries SET extraction_flags=? WHERE id=?', (json.dumps(flags, ensure_ascii=False), eid))

def add_flag(con, eid, flag):
    r = con.execute('SELECT extraction_flags FROM entries WHERE id=?', (eid,)).fetchone()
    if not r: return
    f = flags_of(r[0])
    if flag not in f:
        f.append(flag); set_flags(con, eid, f)

def remove_flag(con, eid, flag):
    r = con.execute('SELECT extraction_flags FROM entries WHERE id=?', (eid,)).fetchone()
    if not r: return
    f = [x for x in flags_of(r[0]) if x != flag]
    set_flags(con, eid, f)

def find(con, hw, page, qual=None):
    if qual is None:
        return con.execute("SELECT id FROM entries WHERE source_id='partie-10' AND section='dictionnaire' AND page_start=? AND headword_fr=? AND (headword_qualifier IS NULL OR headword_qualifier='')", (page, hw)).fetchone()
    return con.execute("SELECT id FROM entries WHERE source_id='partie-10' AND section='dictionnaire' AND page_start=? AND headword_fr=? AND headword_qualifier=?", (page, hw, qual)).fetchone()

def upsert_entry(con, hw, page, raw, qual=None, parent=None, pos=None, manual=True):
    raw = norm(raw)
    hwn = hw.lower()
    ac = len(AR_RE.findall(raw))
    uid = uid_for('partie-10', page, hw + ('|' + qual if qual else ''), raw)
    flags = ['manual_transcription', 'needs_native_review'] if manual else []
    if parent: flags.append('subentry')
    if ac == 0: flags.append('no_arabic_detected')
    existing = find(con, hw, page, qual)
    if existing:
        eid = existing[0]
        con.execute('''UPDATE entries SET raw_block=?, arabic_char_count=?, headword_norm=?, headword_qualifier=?,
            parent_headword=?, pos_guess=?, printed_page_start=?, printed_page_end=?, status='needs_review',
            confidence='unverified', parser_version='manual-curation-10', extraction_flags=? WHERE id=?''',
            (raw, ac, hwn, qual, parent, pos, page + 742, page + 742, json.dumps(flags, ensure_ascii=False), eid))
        con.execute("UPDATE review_tasks SET status='open', priority='medium', issue='Entrée réparée/séparée manuellement; OCR + forme historique à vérifier.' WHERE entry_id=?", (eid,))
        return eid, False
    cur = con.execute('''INSERT INTO entries(source_id,page_start,page_end,headword_fr,headword_norm,pos_guess,raw_block,
        arabic_char_count,status,confidence,headword_qualifier,printed_page_start,printed_page_end,parser_version,
        extraction_flags,entry_uid,register,in_algerian_corpus,parent_headword,section)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
        ('partie-10', page, page, hw, hwn, pos, raw, ac, 'needs_review', 'unverified', qual, page + 742, page + 742,
         'manual-curation-10', json.dumps(flags, ensure_ascii=False), uid, 'algerien_1910', 1, parent, 'dictionnaire'))
    eid = cur.lastrowid
    con.execute("INSERT INTO review_tasks(entry_id,issue,priority) VALUES(?,?,?)",
                (eid, 'Entrée ajoutée par curation manuelle; vérifier page source et forme moderne.', 'medium'))
    return eid, True

def main():
    con = sqlite3.connect(DB)
    con.execute('PRAGMA foreign_keys=ON')
    ensure_columns(con)

    # 1. Restaurer les sous-entrées légitimes marquées à tort comme faux positifs.
    subentries = [
        ('Voie droite', 1, 'Voie', None), ('Bateau à voiles', 1, 'Voile', None), ('Se voir', 1, 'Voir', '(soi-même)'),
        ('Faire voir', 1, 'Voir', None), ("A vol d'oiseau", 2, 'Vol', None), ('Marchand de volaille', 2, 'Volaille', None),
        ('Faire voler', 3, 'Voler', None),
    ]
    restored = 0
    for hw, page, parent, qual in subentries:
        r = find(con, hw, page, qual)
        if r:
            eid = r[0]
            con.execute("UPDATE entries SET status='needs_review', parent_headword=?, in_algerian_corpus=1 WHERE id=?", (parent, eid))
            remove_flag(con, eid, 'example_or_ocr_false_positive')
            add_flag(con, eid, 'subentry')
            con.execute("UPDATE review_tasks SET status='open', priority='medium', issue=? WHERE entry_id=?",
                        (f'Sous-entrée de {parent}; vérifier forme et registre.', eid))
            restored += 1
    # Zébré est sous-entrée de Zébrure.
    r = find(con, 'Zébré', 8, '(rayé)')
    if r:
        con.execute("UPDATE entries SET parent_headword='Zébrure' WHERE id=?", (r[0],))
        add_flag(con, r[0], 'subentry')

    # 2. Corriger vedettes/qualificatifs OCR.
    r = find(con, 'Voüté', 6)
    if r:
        eid = r[0]
        con.execute("UPDATE entries SET headword_fr='Voûté', headword_norm='voûté', raw_block=?, arabic_char_count=?, parser_version='manual-curation-10' WHERE id=?",
                    ('Voûté, مقوس mqaoues, — مقبب mqabbeb.', len(AR_RE.findall('Voûté, مقوس mqaoues, — مقبب mqabbeb.')), eid))
        remove_flag(con, eid, 'suspect_headword')
        add_flag(con, eid, 'headword_corrected')
        con.execute("UPDATE review_tasks SET priority='medium', issue='Vedette corrigée Voüté → Voûté; vérifier page source.' WHERE entry_id=?", (eid,))
    r = find(con, 'Votation', 5)
    if r:
        con.execute("UPDATE entries SET headword_qualifier='vote' WHERE id=?", (r[0],))
        remove_flag(con, r[0], 'suspect_headword')
    r = find(con, 'Yatagan', 8, '(sahre-poignard)')
    if r:
        con.execute("UPDATE entries SET headword_qualifier='(sabre-poignard)' WHERE id=?", (r[0],))
    r = find(con, 'Zaouïa', 8, "(établiss' religieux)")
    if r:
        con.execute("UPDATE entries SET headword_qualifier='(établissement religieux)' WHERE id=?", (r[0],))

    # 3. Ajouter les vedettes principales absorbées/oubliées par le parseur.
    missing = [
        ('Voir', 1, None, None, "Voir. Je vois, nchouf; j'ai vu, cheft; il a vu, شاف chaf ou رأى raa. Voyez donc! شف ترى chouf tra. Vois s'il est venu, شف إذا جاء chouf ida ja.", 'verb_candidate'),
        ('Volontiers', 4, None, None, "Volontiers, على الراس والعين âla erras ouelâin.", None),
        ('Volume', 4, '(livre)', None, "Volume (livre), كتاب ketab, pl. كتب ketoub, — جزء jouza, pl. أجزاء ajsa. || (grosseur), قدر ما يكون qadr ma ikoun.", None),
        ('Vorace', 5, None, None, "Vorace, وكال ouekkal, f. ة a, pl. ين in.", None),
        ('Votre', 5, None, None, "Votre, كم koum. Votre maison, داركم darkoum. || Le vôtre, متاعك mtaâk, — ذيالك dialek. || Les vôtres (vos parents), أهلكم ahelkoum.", None),
        ('Vouer', 5, '(se)', 'Vouer', "Vouer (se), وهب نفسه ouahab nefshou.", 'verb_candidate'),
        ('Vouloir', 5, '(subst.)', 'Vouloir', "Vouloir (subst.), مراد mourad, — قصد qasd.", None),
        ('Voulu', 5, None, None, "Voulu, مقصود maqsoud, f. ة a, pl. ين in.", None),
        ('Vous', 5, None, None, "Vous (sing.), انت enta, f. انت enti. || (plur.), انتم entoum, — انتوما entouma. Vous et moi, انا واياكم ana ou iyakoum.", None),
        ('Vue', 7, '(vision)', None, "Vue (vision), نظر nad'er, — رؤية rouia, — بصر becer. Ma vue baisse, يقل بصري iqell becri. À vue d'œil, à première vue, بنظر العين benad'er elâïn, — بالوهي bel ouahi. À perte de vue, على مد البصر âla medd elbecer. || (but, dessein), قصد qasd. En vue de, بقصد bigasd, — قاصدًا qaciden. || (perspective, panorama), فرجة fourja.", None),
        ('Vulgaire', 7, '(usité, qui a cours)', None, "Vulgaire (usité, qui a cours), جايز jaïz, — جاري jari, — عمومي âmoumi. Le langage vulgaire, الكلام الجايز elklam eljaïz. || Le vulgaire (le peuple), العامة elâamma.", None),
        ('Y', 8, '(ici, là)', None, "Y (ici, là), هنا hena, — ثم themm, — فيه fih. || Il y a, كان kan, — كاين kaïn; il n'y a pas, ما كان شي ma kan ch, — ما فيه شي ma fih ch. Il n'y a pas de mal, ما كان باس ma kan bas. || Il y aura, يكون ikoun; il n'y aura pas, ما يكون شي ma ikoun ch.", None),
        ('You! you!', 8, '(cris de joie des mauresques)', None, "You! you! (cris de joie des mauresques), تزغريط tezr'erit. || Pousser des you! you!, زغرط zer'eret.", None),
        ('Zèle', 9, None, None, "Zèle, حرص h'ars, — فريحة qerih'a, — جهد jehed.", None),
        ('Zélé', 9, None, None, "Zélé, حارس h'ares, — مجتهد mejtehed.", None),
        ('Zouïdja', 9, '(paire de bœufs ; étendue de terre labourable de 10 hectares environ)', None, "Zouïdja (paire de bœufs ; étendue de terre labourable de 10 hectares environ), زويجة zouïja.", None),
    ]
    inserted = 0
    for hw, page, qual, parent, raw, pos in missing:
        _, created = upsert_entry(con, hw, page, raw, qual, parent, pos)
        inserted += int(created)

    # 3bis. Nettoyer les blocs fusionnés : garder la vedette parente seule.
    trims = [
        ('Voilier', '(navire à voiles)', "Voilier (navire à voiles), مركب بالقلاع merkeb belqelaâ."),
        ('Volubilité', '(de paroles)', "Volubilité (de paroles), كثرة الهضرة koutlret elhadra, — كثرة الكلام kouthret elklam."),
        ('Vomitif', None, "Vomitif, دواء الرداد doua erredad."),
        ('Voter', None, "Voter, انتخب entakheb, — اختار ekhtar."),
        ('Vouer', None, "Vouer, وهب ouahab."),
        ('Vouloir', None, "Vouloir. Je veux, neh'abb ou nebr'i; j'ai voulu, h'abbit ou br'eit; il a voulu, h'abb ou br'a. Si Dieu veut, إن شاء الله in cha allah. Comme vous voudrez, كما تحب kima teh'abb. || Je voudrais bien, ما ذا بي ma d'a biya; tu voudrais bien, ما ذا بك ma d'a bik, etc. || (en vouloir à qn): Il ne faut pas m'en vouloir, لا تؤاخذني la touakhed'ni, — لا تلوم علي la tloum âliya."),
        ('Vrille', '(outil)', "Vrille (outil), برنينة bernina, pl. ات at."),
        ('Vu que', None, "Vu que, لأجل liajl, — بحيث أنه bih'aïth ennahou."),
        ('Yole', '(canot)', "Yole (canot), فلوكة flouka, pl. فلايك flaïk."),
        ('Zekkat', '(impôt sur les bestiaux)', "Zekkat (impôt sur les bestiaux), زكاة zekat."),
        ('Zoologie', None, "Zoologie, معرفة الحيوان mârefet elh'aïouan."),
        ('Volonté', None, "Volonté, إرادة irada, — غرض r'ard, — مراد mourad, — مرام meram, — خاطر khat'er. À la volonté de Dieu! كما حب ربي kema h'abb rabbi. À votre volonté! كما حب خاطرك kema h'abb khat'rek, — على رايك âla raïek. De ma propre volonté, برضاي birardi. Contre ma volonté, بالسيف علي bessif âliya, — ما على خاطري ma âla khat'ri."),
        ('Vol', '(larcin)', "Vol (larcin), سرقة serqa, — خيانة khiana, — خنبة khanba. || (d'un oiseau), طيران t'eiran."),
        ('Vraiment', None, "Vraiment, بالصح becçah'h', — حقا h'aqqen."),
        ('Voler', "(s'envoler)", "Voler (s'envoler). Je vole, nt'ir; j'ai volé, t'ort; il a volé, t'ar."),
    ]
    for hw, qual, raw in trims:
        page = {'Voilier':1,'Volubilité':4,'Vomitif':5,'Voter':5,'Vouer':5,'Vouloir':5,'Vrille':7,'Vu que':7,'Yole':8,'Zekkat':9,'Zoologie':9,'Volonté':3,'Vol':2,'Vraiment':6,'Voler':3}[hw]
        r = find(con, hw, page, qual)
        if r:
            eid = r[0]
            add_flag(con, eid, 'split_from_merged_block')
            con.execute("UPDATE entries SET raw_block=?, arabic_char_count=?, parser_version='manual-curation-10' WHERE id=?",
                        (raw, len(AR_RE.findall(raw)), eid))

    # 4. Ingérer le supplément tunisien séparé.
    supp_path = EXPORTS / 'partie-10-supplement-tunis-candidats.json'
    if not supp_path.exists():
        from segmenter_partie_v2 import segment
        entries, _ = segment(ROOT / 'ocr/partie-10', 15, 41)
        supp_path.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding='utf-8')
    supp = json.loads(supp_path.read_text(encoding='utf-8'))
    supp_inserted = 0
    for e in supp:
        raw = norm(e['raw_block'])
        hw = norm(e['headword_fr'])
        uid = uid_for('partie-10-tunis', e['page_start'], hw + ('|' + e.get('headword_qualifier','') if e.get('headword_qualifier') else ''), raw)
        flags = list(e.get('flags', [])) + ['supplement_tunis', 'register_tunisien_1910', 'excluded_from_algerian_corpus']
        cur = con.execute('''INSERT OR IGNORE INTO entries(source_id,page_start,page_end,headword_fr,headword_norm,pos_guess,raw_block,
            arabic_char_count,status,confidence,headword_qualifier,printed_page_start,printed_page_end,parser_version,
            extraction_flags,entry_uid,register,in_algerian_corpus,parent_headword,section)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            ('partie-10', e['page_start'], e['page_end'], hw, hw.lower(), e.get('pos_guess'), raw,
             e['arabic_char_count'], 'needs_review', 'unverified', e.get('headword_qualifier') or None,
             e['page_start'] + 742, e['page_end'] + 742, 'lexical-2.1-draft', json.dumps(flags, ensure_ascii=False), uid,
             'tunisien_1910', 0, None, 'supplement_tunis'))
        if cur.rowcount:
            supp_inserted += 1
            eid = cur.lastrowid
            priority = 'high' if e['arabic_char_count'] == 0 or 'weak_entry_evidence' in flags else 'medium'
            con.execute("INSERT INTO review_tasks(entry_id,issue,priority) VALUES(?,?,?)",
                        (eid, 'Supplément tunisien 1910 : registre distinct, exclu du corpus algérien; OCR à vérifier.', priority))
    if not con.execute("SELECT 1 FROM processing_runs WHERE source_id='partie-10' AND parser_version='lexical-2.1-draft-supplement'").fetchone():
        con.execute('''INSERT INTO processing_runs(source_id,sha256,started_at,finished_at,parser_version,pages,candidates,inserted,skipped,warnings,status)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)''',
            ('partie-10', con.execute("SELECT sha256 FROM sources WHERE id='partie-10'").fetchone()[0],
             datetime.now(timezone.utc).isoformat(), datetime.now(timezone.utc).isoformat(), 'lexical-2.1-draft-supplement',
             27, len(supp), supp_inserted, len(supp) - supp_inserted, json.dumps(['supplement_tunisien_separe'], ensure_ascii=False), 'completed'))

    # 5. Pages imprimées des annexes non blanches.
    printed_map = {10: 752, **{n: n + 742 for n in range(11, 42)}, 43: 785, 45: 787, 46: 788, 47: 789, 48: 790}
    for n, pp in printed_map.items():
        con.execute('UPDATE pages SET printed_page_number=? WHERE source_id=? AND page_number=?', (pp, 'partie-10', n))

    # 6. Règles skill ciblées.
    rules = [
        ('voir_chouf', 'partie-10 p1 (impr. 743)', 'Voir : nchouf / cheft / chaf. Proposition moderne : nchouf / cheft / chaf. À valider.',
         [{'fr': 'je vois', 'hist': 'nchouf', 'modern_proposed': 'nchouf'}, {'fr': "j'ai vu", 'hist': 'cheft', 'modern_proposed': 'cheft'}]),
        ('y_hena', 'partie-10 p8 (impr. 750)', 'Y (ici, là) : hena / themm / fih. Proposition moderne : hna / temma / fih. À valider.',
         [{'fr': 'ici', 'hist': 'hena', 'modern_proposed': 'hna'}, {'fr': 'là-bas', 'hist': 'themm', 'modern_proposed': 'temma'}]),
        ('voie_tri', 'partie-10 p1 (impr. 743)', 'Voie : triq / meslek / taouil. Proposition moderne : triq / msalek. À valider.',
         [{'fr': 'voie/chemin', 'hist': 'triq', 'modern_proposed': 'triq'}, {'fr': 'moyen', 'hist': 'meslek', 'modern_proposed': 'msalek'}]),
        ('voile_setter', 'partie-10 p1 (impr. 743)', 'Voiler (cacher) : nestor / setert / seter. Proposition moderne : nseter / setert / seter. À valider.',
         [{'fr': 'je voile', 'hist': 'nestor', 'modern_proposed': 'nseter'}, {'fr': "j'ai voilé", 'hist': 'setert', 'modern_proposed': 'setert'}]),
        ('volonte_irada', 'partie-10 p3-4 (impr. 745-746)', 'Volonté : irada / r\'ard / mourad / meram / khat\'er. Proposition moderne : irada / mourad / khat\'er. À valider.',
         [{'fr': 'volonté', 'hist': 'irada', 'modern_proposed': 'irada'}, {'fr': 'à votre volonté', 'hist': 'kema h\'abb khat\'rek', 'modern_proposed': 'kima bghit khat\'rek'}]),
        ('zele_hars', 'partie-10 p9 (impr. 751)', 'Zèle : h\'ars / qerih\'a / jehed. Proposition moderne : 7ars / jehd. À valider.',
         [{'fr': 'zèle', 'hist': "h'ars", 'modern_proposed': '7ars'}, {'fr': 'effort', 'hist': 'jehed', 'modern_proposed': 'jehd'}]),
    ]
    for topic, pages, rule, ex in rules:
        if not con.execute("SELECT 1 FROM skill_rules WHERE topic=? AND source_id='partie-10'", (topic,)).fetchone():
            con.execute("INSERT INTO skill_rules(topic,rule_text,source_pages,examples_json,validated,register_warning,source_id,status) VALUES(?,?,?,?,0,?,?,?)",
                        (topic, rule, pages, json.dumps(ex, ensure_ascii=False), 'Formes historiques/OCR; validation native requise.', 'partie-10', 'needs_review'))

    con.commit()

    # 7. Exports partie 10 corpus algérien.
    cols = [r[1] for r in con.execute('PRAGMA table_info(entries)')]
    def export_rows(name, rows):
        (EXPORTS / f'{name}.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
        with (EXPORTS / f'{name}.csv').open('w', encoding='utf-8', newline='') as f:
            w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(rows)
    main_rows = [dict(zip(cols, r)) for r in con.execute("SELECT * FROM entries WHERE source_id='partie-10' AND section='dictionnaire' ORDER BY page_start,id")]
    export_rows('partie-10-entries-brutes', main_rows)
    supp_rows = [dict(zip(cols, r)) for r in con.execute("SELECT * FROM entries WHERE source_id='partie-10' AND section='supplement_tunis' ORDER BY page_start,id")]
    export_rows('partie-10-supplement-tunis-entries-brutes', supp_rows)

    main_active = [r for r in main_rows if r['status'] != 'false_positive']
    stats = {
        'part': 'partie-10', 'pdf_pages': 54, 'lexical_pages': 9, 'lexical_printed': '743-751',
        'main_candidates_initial': 93, 'main_entries_after_curation': len(main_rows),
        'main_active': len(main_active), 'main_false_positives': len(main_rows) - len(main_active),
        'subentries_restored': restored, 'missing_headwords_added': len(missing), 'new_this_run': inserted,
        'with_arabic': sum(1 for r in main_rows if r['arabic_char_count'] > 0),
        'supplement_tunis': {'pages': 27, 'printed': '757-783', 'candidates': len(supp), 'entries_total': len(supp_rows), 'inserted_this_run': supp_inserted,
                             'register': 'tunisien_1910', 'in_algerian_corpus': False,
                             'with_arabic': sum(1 for r in supp_rows if r['arabic_char_count'] > 0)},
        'status': 'needs_review',
    }
    (EXPORTS / 'partie-10-stats.json').write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding='utf-8')

    # 8. Échantillon app 24.
    samples = [
        ('Voisin', 'jar', 'جار', 'Mon voisin.', 'jari'), ('Voix', 'sawt', 'صوت', 'La voix.', 'ssawt'),
        ('Voler', 'nsreq', 'نسرق', 'Je vole.', 'nsreq'), ('Vouloir', 'nbghi', 'نبغي', 'Je veux.', 'nbghi'),
        ('Voyage', 'sefer', 'سفر', 'Le voyage.', 'ssefer'), ('Vrai', 'sa7i7', 'صحيح', 'C’est vrai.', 'sa7i7'),
        ('Yeux', '3inin', 'عينين', 'Les yeux.', 'l3inin'), ('Zéro', 'sfer', 'صفر', 'Zéro.', 'sfer'),
        ('Voiture', 'karrousa', 'كاروسة', 'La voiture.', 'lkarrousa'), ('Volonté', 'irada', 'إرادة', 'La volonté.', 'lirada'),
        ('Vomir', 'nredd', 'نرد', 'Je vomis.', 'nredd'), ('Voyager', 'nsafer', 'نسافر', 'Je voyage.', 'nsafer'),
        ('Voûte', 'qobba', 'قبة', 'La voûte.', 'lqobba'), ('Zizanie', 'fetna', 'فتنة', 'La zizanie.', 'lfetna'),
        ('Zinc', 'gezdir', 'قزدير', 'Le zinc.', 'lgezdir'), ('Voile', '7ijab', 'حجاب', 'Le voile.', 'l7ijab'),
        ('Voir', 'nchouf', 'نشوف', 'Je vois.', 'nchouf'), ('Votre', 'koum', 'كم', 'Votre maison.', 'darkoum'),
        ('Vous', 'ntouma', 'نتوما', 'Vous.', 'ntouma'), ('Voulu', 'mqsoud', 'مقصود', 'Voulu.', 'mqsoud'),
        ('Vorace', 'wekkal', 'وكال', 'Vorace.', 'wekkal'), ('Volume', 'ktab', 'كتاب', 'Le volume.', 'lktab'),
        ('Vue', 'nadra', 'نظرة', 'La vue.', 'nnadra'), ('Y', 'hna', 'هنا', 'Ici.', 'hna'),
    ]
    items = []
    for hw, lat, ar, exfr, exlat in samples:
        r = con.execute("SELECT id,page_start,printed_page_start,raw_block FROM entries WHERE source_id='partie-10' AND section='dictionnaire' AND headword_fr=? AND status!='false_positive' ORDER BY page_start,id LIMIT 1", (hw,)).fetchone()
        if not r: continue
        items.append({'id': 'fr-' + hw.lower().replace(' ', '-').replace("'", ''), 'fr': hw.lower(),
                      'historical': {'source': 'partie-10', 'page_pdf': r[1], 'page_printed': r[2], 'entry_id': r[0], 'raw': r[3]},
                      'modern_proposed': {'lat': lat, 'ar': ar, 'validated': False},
                      'example_fr': exfr, 'example_proposed_lat': exlat, 'status': 'needs_native_review', 'rights': 'original_example'})
    (EXPORTS / 'partie-10-echantillon-app.json').write_text(json.dumps({'version': '0.1.0', 'status': 'prototype_not_validated', 'items': items}, ensure_ascii=False, indent=2), encoding='utf-8')

    rows = con.execute("SELECT headword_fr,headword_qualifier,page_start,printed_page_start,confidence FROM entries WHERE source_id='partie-10' AND section='dictionnaire' AND status!='false_positive' ORDER BY page_start,id LIMIT 60").fetchall()
    md = f"""# Aperçu partie 10 — fin du dictionnaire (VOI → ZOU)

- Pages PDF du fichier : 54
- Pages dictionnaire algérien intégrées : 9 (p. 1–9, impr. 743–751)
- Entrées algériennes après curation : {len(main_rows)}
- Entrées algériennes actives : {len(main_active)}
- Faux positifs OCR / fragments : {len(main_rows) - len(main_active)}
- Sous-entrées restaurées : {restored}
- Vedettes principales ajoutées : {inserted}
- Supplément tunisien séparé : {len(supp_rows)} entrées, register `tunisien_1910`, exclu du corpus algérien
- Statut : needs_review / unverified

| Français | Qualificatif | Page PDF | Page livre | Confiance |
|---|---|---:|---:|---|
"""
    for hw, q, p, pp, c in rows:
        md += f"| {hw} | {q or ''} | {p} | {pp or ''} | {c} |\n"
    (EXPORTS / 'partie-10-apercu.md').write_text(md, encoding='utf-8')

    con.close()
    print(json.dumps({'restored': restored, 'inserted': inserted, 'main_entries': len(main_rows), 'main_active': len(main_active),
                      'supplement_entries': len(supp_rows), 'sample': len(items)}, ensure_ascii=False))

if __name__ == '__main__':
    main()
