#!/usr/bin/env python3
"""Passe de fusion glossaire -> vocabulaire (Manuel Tapiéro, livre complet).

Mode REVEUE : on n'écrase jamais les champs curés des 850 fiches de leçon.
On indexe les glossaires OCR, on les rapproche du vocabulaire, on produit des
propositions (genre / pluriel / sens) et un lookup FR->DZ, le tout traçable et
`needs_review`. Les conflits et propositions sont envoyés en review_tasks.

Objectifs :
  1. Indexer les glossaires OCR 4 colonnes (p.129-149 ar-fr, p.150-170 fr-ar)
     dans des tables de staging traçables (jamais publiées brutes).
  2. Cross-checker les 850 fiches de vocabulaire des leçons contre le glossaire
     ar-fr : rapprochements exacts / variants / fuzzy, propositions de genre,
     pluriel et sens, conflits signalés en review_tasks.
  3. Construire un lookup FR -> DZ (français vers darija) à partir du glossaire
     fr-ar + du vocabulaire des leçons, avec provenance et statut needs_review.

Règles de sécurité :
  - Aucune modification des champs existants du vocabulaire curé.
  - Les propositions sont stockées dans vocab_glossary_links + review_tasks.
  - Tout reste `needs_review` ; rien ne passe `app_ready`.
  - Script idempotent : purge scopée des tables de staging puis reconstruction.

Usage : python3 scripts/fusionner_glossaires.py
"""
from __future__ import annotations
import csv, json, re, sqlite3, unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'db' / 'manuel.sqlite'
OCR = ROOT / 'ocr' / 'glossaire-4col'
EXP = ROOT / 'exports' / 'fusion-glossaires'
TAG = '[fusion-glossaires]'

# ---------------------------------------------------------------------------
# Normalisation
# ---------------------------------------------------------------------------

def norm_latin(s: str) -> str:
    if not s:
        return ''
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
    s = s.replace('’', "'").replace('œ', 'oe').replace('æ', 'ae')
    s = s.replace('š', 's').replace('ġ', 'g').replace('ɛ', 'e')
    s = re.sub(r'[^a-z0-9]+', '', s)
    return s


def norm_fr(s: str) -> str:
    if not s:
        return ''
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
    s = s.replace('’', "'").replace('œ', 'oe')
    s = re.sub(r'[^a-z0-9]+', ' ', s).strip()
    return s


def fr_words(s: str) -> set[str]:
    return {w for w in norm_fr(s).split() if len(w) >= 3}


def strip_article(s: str) -> str:
    n = norm_latin(s)
    for pref in ('el', 'l', 'la', 'le', 'es', 'et', 'en'):
        if n.startswith(pref) and len(n) > len(pref) + 2:
            return n[len(pref):]
    return n


def clean_head(s: str) -> bool:
    n = norm_latin(s)
    return len(n) >= 2 and sum(ch.isalpha() for ch in n) >= 2


def plausible_plural(s: str) -> bool:
    """Filtre anti-bruit OCR pour les propositions de pluriel (jamais appliqué)."""
    if not s:
        return False
    if re.search(r'[0-9{/®©£¥§|\\=]', s):
        return False
    if 'ou col.' in s.lower():
        return False
    if len(s) < 3 or len(s.split()) > 4:
        return False
    if norm_latin(s) in {'dt', 'et', 'fn', 'in', 'an', 'a', 'ou', 'col'}:
        return False
    return bool(re.search(r'[A-Za-zÀ-ÿ]{3,}', s))

# ---------------------------------------------------------------------------
# Parsing OCR
# ---------------------------------------------------------------------------
POS = (r'(?:n\.|v\.|adj\.|adv\.|prép\.|conj\.|pron\.|part\.|interj\.|loc\.|'
       r'ord\.|pl\.|col\.|subst\.|num\.|dém\.|ind\.|rel\.|pers\.|suf\.)')
AR_START = re.compile(r'^\s*[\[\(«"\']?([A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9\-\u0027’\. ]{0,45}?)\s*\(' + POS)
FIRST_POS = re.compile(r'\((' + POS + r'[^)]*)\)')


def parse_ar_fr(meta):
    entries = []
    for m in meta:
        if m['direction'] != 'ar-fr':
            continue
        txt = (OCR / m['file']).read_text(encoding='utf-8')
        cur = None
        for ln in txt.splitlines():
            s = ln.strip().lstrip('|').strip()
            if not s:
                continue
            mm = AR_START.match(s)
            if mm:
                if cur:
                    entries.append(cur)
                cur = dict(head=mm.group(1).strip(), text=s, **m)
            elif cur:
                cur['text'] += ' ' + s
        if cur:
            entries.append(cur)
    for e in entries:
        t = e['text']
        # première parenthèse POS seulement (évite de capturer le genre d'une entrée suivante)
        fp = FIRST_POS.search(t)
        pos_text = fp.group(1) if fp else ''
        g = None
        if re.search(r'\bn\.\s*f\.', pos_text):
            g = 'f'
        elif re.search(r'\bn\.\s*m\.', pos_text):
            g = 'm'
        pl = re.search(r'pl\.\s*([^);,]+)', pos_text)
        e['gender'] = g
        raw_plural = pl.group(1).strip() if pl else None
        e['plural'] = raw_plural if plausible_plural(raw_plural) else None
        e['plural_raw'] = raw_plural
        mm = re.search(r'\)\s*,?\s*(.+)$', t)
        e['gloss'] = mm.group(1).strip() if mm else t
        e['head_norm'] = norm_latin(e['head'])
        e['head_clean'] = clean_head(e['head'])
        # confiance : entrée courte + head propre + POS présent
        e['confidence'] = 'high' if (e['head_clean'] and fp and len(t) <= 140) else 'medium' if e['head_clean'] else 'low'
    return entries


FR_START = re.compile(r'^[A-Za-zÀ-ÿ\(]')


def parse_fr_ar(meta):
    entries = []
    for m in meta:
        if m['direction'] != 'fr-ar':
            continue
        txt = (OCR / m['file']).read_text(encoding='utf-8')
        cur = None
        for ln in txt.splitlines():
            s = ln.strip().lstrip('|').strip()
            if not s:
                continue
            if (FR_START.match(s) and not s.startswith('—') and ',' in s):
                head = s.split(',', 1)[0]
                if len(head) <= 60 and not re.search(r'\((?:v|n|adj|adv|prép|conj|part|interj|loc|ord|pl|col)\.', head):
                    if cur:
                        entries.append(cur)
                    cur = dict(fr=head.strip(), text=s, **m)
                    continue
            if cur:
                cur['text'] += ' ' + s
        if cur:
            entries.append(cur)
    for e in entries:
        e['fr_norm'] = norm_fr(e['fr'])
        rest = e['text'].split(',', 1)[1] if ',' in e['text'] else ''
        rest = re.split(r'\((?:v|n|adj|adv|prép|conj|part|interj|loc|ord|pl|col)\.', rest)[0]
        e['dz_raw'] = rest.strip(' ,;')
    return entries

# ---------------------------------------------------------------------------
# Matching
# ---------------------------------------------------------------------------

def match_vocab(vocab, ar_entries):
    usable = [e for e in ar_entries if e['head_clean']]
    idx = defaultdict(list)
    for e in usable:
        idx[e['head_norm']].append(e)
    links = []
    for v in vocab:
        nv = norm_latin(v['form_latin'])
        hits = idx.get(nv, [])
        match_type = 'exact'
        if not hits:
            nv2 = strip_article(v['form_latin'])
            hits = [e for e in usable if strip_article(e['head']) == nv2 and nv2]
            match_type = 'variant'
        if not hits:
            vw = fr_words(v['gloss_fr'])
            cand = []
            for e in usable:
                ne = e['head_norm']
                if len(nv) >= 4 and len(ne) >= 4 and (nv[:4] == ne[:4] or nv in ne or ne in nv):
                    ov = len(fr_words(e['gloss']) & vw)
                    if ov:
                        cand.append((ov, e))
            if cand:
                cand.sort(key=lambda x: -x[0])
                hits = [cand[0][1]]
                match_type = 'fuzzy'
        for e in hits:
            compatible = bool(fr_words(v['gloss_fr']) & fr_words(e['gloss']))
            links.append(dict(vocab_id=v['vocab_id'], entry=e, match_type=match_type,
                              compatible=compatible))
    return links


def main():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    con.execute('PRAGMA foreign_keys=ON')
    con.executescript((ROOT / 'db' / 'schema.sql').read_text())

    meta = json.loads((OCR / 'meta.json').read_text(encoding='utf-8'))
    ar_entries = parse_ar_fr(meta)
    fr_entries = parse_fr_ar(meta)
    vocab = [dict(r) for r in con.execute('SELECT * FROM vocabulary ORDER BY vocab_id')]

    # purge scopée
    con.execute("DELETE FROM review_tasks WHERE reason LIKE ?", (TAG + '%',))
    con.execute("DELETE FROM processing_runs WHERE part='fusion-glossaires'")
    con.execute('DELETE FROM vocab_glossary_links')
    con.execute('DELETE FROM fr_dz_lookup')
    con.execute('DELETE FROM glossary_ar_fr')
    con.execute('DELETE FROM glossary_fr_ar')

    for i, e in enumerate(ar_entries, 1):
        e['uid'] = f"gl-ar-fr-p{e['printed']}-c{e['col']}-{i:04d}"
        con.execute('''INSERT INTO glossary_ar_fr
            (entry_uid,source_id,printed_page,pdf_page,side,col,headword,headword_norm,
             gender,plural,gloss_fr,raw_text,status)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (e['uid'], 'tapiero-manuel-partie-03' if e['printed'] <= 137 else 'tapiero-manuel-partie-04',
             e['printed'], e['pdf'], e['side'], e['col'], e['head'], e['head_norm'],
             e['gender'], e['plural'], e['gloss'], e['text'], 'needs_review'))
    for i, e in enumerate(fr_entries, 1):
        e['uid'] = f"gl-fr-ar-p{e['printed']}-c{e['col']}-{i:04d}"
        con.execute('''INSERT INTO glossary_fr_ar
            (entry_uid,source_id,printed_page,pdf_page,side,col,fr_headword,fr_norm,dz_raw,raw_text,status)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)''',
            (e['uid'], 'tapiero-manuel-partie-04', e['printed'], e['pdf'], e['side'], e['col'],
             e['fr'], e['fr_norm'], e['dz_raw'], e['text'], 'needs_review'))

    links = match_vocab(vocab, ar_entries)
    v_by_id = {v['vocab_id']: v for v in vocab}
    n_exact = n_variant = n_fuzzy = n_conf = n_prop = 0
    proposals = []
    for lk in links:
        v = v_by_id[lk['vocab_id']]
        e = lk['entry']
        gid = con.execute('SELECT entry_id FROM glossary_ar_fr WHERE entry_uid=?', (e['uid'],)).fetchone()[0]
        con.execute('''INSERT INTO vocab_glossary_links
            (vocab_id,entry_id,match_type,sense_compatible,proposed_gender,proposed_plural,proposed_gloss,status)
            VALUES(?,?,?,?,?,?,?,?)''',
            (v['vocab_id'], gid, lk['match_type'], int(lk['compatible']),
             e['gender'], e['plural'], e['gloss'], 'needs_review'))
        if lk['match_type'] == 'exact':
            n_exact += 1
        elif lk['match_type'] == 'variant':
            n_variant += 1
        else:
            n_fuzzy += 1
        # propositions de remplissage (champ NULL dans la fiche curée).
        # Exact uniquement : les variantes/fuzzy restent des liens à relire.
        if lk['match_type'] == 'exact' and lk['compatible'] and e['confidence'] in ('high', 'medium'):
            if e['gender'] and not v['gender']:
                n_prop += 1
                proposals.append(dict(vocab_id=v['vocab_id'], form=v['form_latin'], field='gender',
                                      current=None, proposed=e['gender'], page=e['printed'],
                                      match=lk['match_type'], confidence=e['confidence']))
                con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                            ('vocabulary', v['vocab_id'],
                             f"{TAG} proposition genre={e['gender']} (glossaire p.{e['printed']}, {lk['match_type']}/{e['confidence']})",
                             2, 'open'))
            if e['plural'] and not v['plural']:
                n_prop += 1
                proposals.append(dict(vocab_id=v['vocab_id'], form=v['form_latin'], field='plural',
                                      current=None, proposed=e['plural'], page=e['printed'],
                                      match=lk['match_type'], confidence=e['confidence']))
                con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                            ('vocabulary', v['vocab_id'],
                             f"{TAG} proposition pluriel={e['plural']} (glossaire p.{e['printed']}, {lk['match_type']}/{e['confidence']})",
                             2, 'open'))
        # conflits
        if e['gender'] and v['gender'] and e['gender'] != v['gender']:
            n_conf += 1
            con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                        ('vocabulary', v['vocab_id'], f"{TAG} conflit genre : leçon={v['gender']} glossaire={e['gender']} (p.{e['printed']})", 1, 'open'))
        if e['plural'] and v['plural'] and norm_latin(e['plural']) != norm_latin(v['plural']):
            n_conf += 1
            con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                        ('vocabulary', v['vocab_id'], f"{TAG} conflit pluriel : leçon={v['plural']} glossaire={e['plural']} (p.{e['printed']})", 2, 'open'))

    # lookup FR -> DZ
    seen = set()
    n_lookup = 0
    for v in vocab:
        key = (norm_fr(v['gloss_fr']), norm_latin(v['form_latin']), 'vocab')
        if key in seen:
            continue
        seen.add(key)
        con.execute('''INSERT INTO fr_dz_lookup
            (fr_norm,fr_display,dz_form,dz_norm,source_type,source_id,vocab_id,printed_page,status)
            VALUES(?,?,?,?,?,?,?,?,?)''',
            (norm_fr(v['gloss_fr']), v['gloss_fr'], v['form_latin'], norm_latin(v['form_latin']),
             'vocab', v['source_id'], v['vocab_id'], v['printed_page'], 'needs_review'))
        n_lookup += 1
    for e in fr_entries:
        dz = e['dz_raw']
        if not dz:
            continue
        key = (e['fr_norm'], norm_latin(dz), 'glossary')
        if key in seen:
            continue
        seen.add(key)
        gid = con.execute('SELECT entry_id FROM glossary_fr_ar WHERE entry_uid=?', (e['uid'],)).fetchone()[0]
        con.execute('''INSERT INTO fr_dz_lookup
            (fr_norm,fr_display,dz_form,dz_norm,source_type,source_id,glossary_entry_id,printed_page,status)
            VALUES(?,?,?,?,?,?,?,?,?)''',
            (e['fr_norm'], e['fr'], dz, norm_latin(dz), 'glossary',
             'tapiero-manuel-partie-04', gid, e['printed'], 'needs_review'))
        n_lookup += 1

    con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)',
                ('sources', 0, f'{TAG} passe fusion exécutée : {n_exact} exacts, {n_variant} variants, {n_fuzzy} fuzzy ; '
                 f'{n_prop} propositions ; {n_conf} conflits ; {n_lookup} entrées lookup FR->DZ. '
                 'Validation native requise avant app_ready.', 2, 'open'))

    con.execute('INSERT INTO processing_runs(part,step,finished_at,details_json) VALUES(?,?,datetime("now"),?)',
                ('fusion-glossaires', 'fusion_glossaires', json.dumps(dict(
                    ar_fr_entries=len(ar_entries), fr_ar_entries=len(fr_entries),
                    exact=n_exact, variant=n_variant, fuzzy=n_fuzzy,
                    proposals=n_prop, conflicts=n_conf, lookup=n_lookup), ensure_ascii=False)))
    con.commit()

    EXP.mkdir(parents=True, exist_ok=True)

    def dump(name, rows):
        (EXP / f'{name}.json').write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding='utf-8')
        if rows:
            with (EXP / f'{name}.csv').open('w', newline='', encoding='utf-8') as f:
                w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
                w.writeheader(); w.writerows(rows)

    dump('glossary_ar_fr', [dict(r) for r in con.execute('SELECT * FROM glossary_ar_fr ORDER BY printed_page,col,entry_id')])
    dump('glossary_fr_ar', [dict(r) for r in con.execute('SELECT * FROM glossary_fr_ar ORDER BY printed_page,col,entry_id')])
    dump('vocab_glossary_links', [dict(r) for r in con.execute('''SELECT l.*, v.form_latin, v.gloss_fr AS vocab_gloss, g.headword, g.printed_page
        FROM vocab_glossary_links l JOIN vocabulary v ON v.vocab_id=l.vocab_id JOIN glossary_ar_fr g ON g.entry_id=l.entry_id
        ORDER BY l.vocab_id''')])
    dump('fr_dz_lookup', [dict(r) for r in con.execute('SELECT * FROM fr_dz_lookup ORDER BY fr_norm,dz_norm')])
    dump('proposals', proposals)
    counts = dict(ar_fr=len(ar_entries), fr_ar=len(fr_entries), exact=n_exact, variant=n_variant,
                  fuzzy=n_fuzzy, proposals=n_prop, conflicts=n_conf, lookup=n_lookup)
    (EXP / 'counts.json').write_text(json.dumps(counts, ensure_ascii=False, indent=1), encoding='utf-8')
    print(json.dumps(counts, ensure_ascii=False, indent=2))
    print('integrity', con.execute('PRAGMA integrity_check').fetchone()[0])
    print('fk', con.execute('PRAGMA foreign_key_check').fetchall())
    con.close()


if __name__ == '__main__':
    main()
