#!/usr/bin/env python3
"""
Intégration du scan complet Tapiéro 1978 (227 pages simples) dans manuel.sqlite.

CONTEXTE
Le manuel Tapiéro est DÉJÀ en base, issu de 5 PDF en doubles-pages (113 L/R).
Le nouveau PDF est un scan DIFFÉRENT du MÊME ouvrage : 227 pages simples,
complet, incluant les pages arabes et les 15 dialogues du supplément.
→ On ne recrée PAS les 850 fiches de vocabulaire / 30 leçons / 86 règles.
→ On ajoute une SOURCE et on fournit les TEXTES qui manquaient.

APPORT RÉEL DE CE SCAN
  study_texts : 30/30 sans latin_text, ar_text, fr_translation
  dialogues   : 15/15 sans ar_text, latin_text, fr_translation

RÈGLE ABSOLUE
L'OCR n'est jamais publié. Tout est déposé dans `ocr_candidates` en
`needs_review`, avec provenance (page PDF + page imprimée + zone). Les champs
de référence (dialogues.ar_text, study_texts.latin_text, vocabulary.form_ar…)
ne sont PAS écrasés par de l'OCR brut. La promotion se fera après relecture.

Idempotent : réexécuter ne crée aucun doublon.
"""
import hashlib
import json
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SCAN = BASE / "scan-complet-2023"
DB = BASE / "db" / "manuel.sqlite"
PDF = SCAN / "raw" / "tapiero-manuel-complet-1978.pdf"
OCR = SCAN / "ocr"
ZON = OCR / "zones"
SOURCE_ID = "tapiero-manuel-scan-complet-1978"
OFFSET = 10  # imprimé = PDF - 10 (vérifié sur 6 pages témoins)

# Découpage vérifié page par page sur les images du scan.
# ar = pages bilingues (colonne gauche latine, colonne droite arabe)
# fr = pages de traduction française
DIALOGUES = {
    1:  {"ar": [187],       "fr": [188]},
    2:  {"ar": [189],       "fr": [190]},
    3:  {"ar": [191],       "fr": [192]},
    4:  {"ar": [193],       "fr": [194]},
    5:  {"ar": [195],       "fr": [196]},
    6:  {"ar": [197],       "fr": [198]},
    7:  {"ar": [199],       "fr": [200]},
    8:  {"ar": [201],       "fr": [202]},
    9:  {"ar": [203],       "fr": [204]},
    10: {"ar": [205],       "fr": [206]},
    11: {"ar": [207],       "fr": [208, 209]},
    12: {"ar": [210, 211],  "fr": [212]},
    13: {"ar": [213, 214],  "fr": [215]},
    14: {"ar": [216, 217],  "fr": [218]},
    15: {"ar": [219, 220],  "fr": [221]},
}

SCHEMA = """
CREATE TABLE IF NOT EXISTS scan_pages (
  scan_page_id  INTEGER PRIMARY KEY,
  source_id     TEXT NOT NULL,
  pdf_page      INTEGER NOT NULL,
  printed_page  INTEGER,
  ocr_fra       TEXT,
  ocr_ara       TEXT,
  fra_letters   INTEGER,
  ara_letters   INTEGER,
  has_arabic    INTEGER DEFAULT 0,
  ocr_engine    TEXT,
  ocr_dpi       INTEGER,
  quality       TEXT DEFAULT 'ocr_raw_unverified',
  UNIQUE(source_id, pdf_page)
);
CREATE INDEX IF NOT EXISTS idx_scan_printed ON scan_pages(printed_page);

CREATE TABLE IF NOT EXISTS ocr_candidates (
  candidate_id  INTEGER PRIMARY KEY,
  object_type   TEXT NOT NULL,
  object_id     INTEGER NOT NULL,
  field         TEXT NOT NULL,
  value_ocr     TEXT,
  source_id     TEXT,
  pdf_pages     TEXT,
  printed_pages TEXT,
  zone          TEXT,
  confidence    TEXT,
  char_count    INTEGER,
  status        TEXT DEFAULT 'needs_review',
  created_at    TEXT,
  UNIQUE(object_type, object_id, field, source_id)
);
CREATE INDEX IF NOT EXISTS idx_cand_status ON ocr_candidates(status);
"""

AR_STOP = {'من', 'في', 'على', 'ان', 'ما', 'لا', 'الى', 'هذا', 'كان', 'مع', 'يا',
           'كل', 'هو', 'هي', 'عن', 'ذلك', 'التي', 'الذي', 'بعد', 'حتى', 'غير',
           'بين', 'واحد', 'قال', 'أو', 'او', 'لم', 'قد', 'شي', 'انّ'}


def clean(t):
    t = (t or "").replace("\x0c", " ")
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def read(p):
    return clean(p.read_text(encoding="utf-8")) if p.exists() else ""


def ar_stopwords(t):
    return sum(1 for x in re.findall(r"[\u0621-\u064A]+", t) if x in AR_STOP)


def main():
    now = datetime.now(timezone.utc).isoformat()
    sha = hashlib.sha256(PDF.read_bytes()).hexdigest()
    idx = json.loads((OCR / "index.json").read_text(encoding="utf-8"))
    con = sqlite3.connect(DB)
    con.executescript(SCHEMA)

    con.execute("""INSERT OR IGNORE INTO sources
      (source_id,book,part,title,author,publisher,edition,isbn,filename,sha256,bytes,
       pdf_pages,dialect,register,rights_note,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", (
        SOURCE_ID, "manuel", "scan-complet",
        "Manuel d'arabe algérien moderne — supplément de 15 dialogues entre Maghrébins",
        "Norbert Tapiéro", "Presses Universitaires de Lyon / Klincksieck, Paris",
        "2e édition 1978", "2-252-02062-8", PDF.name, sha, PDF.stat().st_size, 227,
        "arq", "tapiero_1978_scan_complet",
        "Œuvre sous droit (Klincksieck). Usage interne/recherche ; toute publication "
        "dans l'app nécessite licence ou contenu original. Scan complet du MÊME ouvrage "
        "que les 5 parties déjà intégrées (ISBN porté au catalogue : 2-252-03395-9, "
        "réimpression 2002) : ne pas dupliquer les fiches. ISBN du scan : 2-252-02062-8.", now))

    # ---------- 1. pages OCR ----------
    new_pages = 0
    for r in idx:
        p = r["pdf_page"]
        fr = read(OCR / f"p{p:03d}.fra.txt")
        ar = read(OCR / f"p{p:03d}.ara.txt")
        cur = con.execute("""INSERT OR IGNORE INTO scan_pages
          (source_id,pdf_page,printed_page,ocr_fra,ocr_ara,fra_letters,ara_letters,
           has_arabic,ocr_engine,ocr_dpi) VALUES (?,?,?,?,?,?,?,?,?,?)""", (
            SOURCE_ID, p, r["printed_page"], fr, ar, r["fra_letters"],
            r["ara_arabic_letters"], 1 if ar_stopwords(ar) >= 12 else 0,
            r["ocr_engine"], r["ocr_dpi"]))
        new_pages += cur.rowcount

    def add_cand(otype, oid, field, value, pages, zone, conf):
        """UPSERT : crée le candidat, ou le remplace si l'extraction s'est améliorée.
        Ne touche jamais aux champs de référence. Repasse en needs_review."""
        if not value or len(value) < 60:
            return 0
        cur = con.execute("""INSERT INTO ocr_candidates
          (object_type,object_id,field,value_ocr,source_id,pdf_pages,printed_pages,
           zone,confidence,char_count,status,created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,'needs_review',?)
          ON CONFLICT(object_type,object_id,field,source_id) DO UPDATE SET
            value_ocr=excluded.value_ocr, pdf_pages=excluded.pdf_pages,
            printed_pages=excluded.printed_pages, zone=excluded.zone,
            confidence=excluded.confidence, char_count=excluded.char_count,
            status='needs_review', created_at=excluded.created_at
          WHERE ocr_candidates.value_ocr <> excluded.value_ocr""", (
            otype, oid, field, value, SOURCE_ID,
            json.dumps(pages), json.dumps([p - OFFSET for p in pages]),
            zone, conf, len(value), now))
        return cur.rowcount

    cands = 0

    # ---------- 2. dialogues ----------
    # Les pages « traduction » contiennent souvent la FIN du texte bilingue en
    # haut, puis « N. Traduction », puis le français. decouper_traductions.py
    # a produit : .trad.txt (français pur), .queue_latin.txt / .queue_arabe.txt
    # (fin du bilingue). On assemble dans le bon ordre.
    dial_ok = 0
    for did, numeral in con.execute("SELECT dialogue_id,numeral FROM dialogues").fetchall():
        spec = DIALOGUES.get(did)
        if not spec:
            continue
        dial_ok += 1
        ar_pages = spec["ar"]
        fr_pages = spec["fr"]
        all_pages = ar_pages + fr_pages

        latin_parts = [read(ZON / f"p{p:03d}.latin.txt") for p in ar_pages]
        arabe_parts = [read(ZON / f"p{p:03d}.arabe400.txt") or
                       read(ZON / f"p{p:03d}.arabe.txt") for p in ar_pages]
        fr_parts = []
        for p in fr_pages:
            ql = read(ZON / f"p{p:03d}.queue_latin.txt")
            qa = read(ZON / f"p{p:03d}.queue_arabe.txt")
            if ql:
                latin_parts.append(ql)
            if qa:
                arabe_parts.append(qa)
            fr_parts.append(read(ZON / f"p{p:03d}.trad.txt") or
                            read(ZON / f"p{p:03d}.fr.txt"))

        latin = "\n\n".join(x for x in latin_parts if x)
        arabe = "\n\n".join(x for x in arabe_parts if x)
        fr = "\n\n".join(x for x in fr_parts if x)
        cands += add_cand("dialogue", did, "latin_text", latin, all_pages,
                          "colonne_gauche_260dpi+queue", "medium")
        cands += add_cand("dialogue", did, "ar_text", arabe, all_pages,
                          "colonne_droite_400dpi+queue", "low")
        cands += add_cand("dialogue", did, "fr_translation", fr, fr_pages,
                          "zone_traduction_220dpi", "high")

    # ---------- 3. textes d'étude ----------
    text_ok = 0
    for tid, lid, ppage in con.execute(
            "SELECT text_id,lesson_id,printed_page FROM study_texts").fetchall():
        pdfp = ppage + OFFSET
        # Le repère « N. Texte. — » peut se trouver sur la page imprimée portée
        # en base OU sur la précédente (cas des leçons 5 et 9, vérifié).
        latin, start_pdf = "", pdfp
        for cand_pdf in (pdfp, pdfp - 1):
            page_fr = read(OCR / f"p{cand_pdf:03d}.fra.txt")
            m = re.search(r"\d+\s*[\.:]?\s*Texte\s*\.?\s*[—\-–:]\s*(.+)", page_fr, re.S)
            if m:
                latin = clean(m.group(1))
                start_pdf = cand_pdf
                break
        if latin:
            # couper avant les notes de bas de page numérotées
            latin = re.split(r"\n\s*\d+\.\s+[a-zâêîôû]", latin)[0].strip()
        pages_latin = [start_pdf] if start_pdf == pdfp else [start_pdf, pdfp]
        if start_pdf != pdfp:
            suite = read(OCR / f"p{pdfp:03d}.fra.txt")
            suite = re.split(r"(?i)le verbe|récapitulation|vocabulaire", suite)[0]
            if suite:
                latin = (latin + "\n\n" + clean(suite)).strip()
        # version arabe : page imprimée suivante (vérifié sur 21 pages)
        ar_pdf = pdfp + 1
        ar_txt = read(OCR / f"p{ar_pdf:03d}.ara.txt")
        has_ar = ar_stopwords(ar_txt) >= 12
        if latin:
            cands += add_cand("study_text", tid, "latin_text", latin, pages_latin,
                              "section_texte_220dpi", "medium")
            text_ok += 1
        if has_ar:
            cands += add_cand("study_text", tid, "ar_text", ar_txt, [ar_pdf],
                              "page_lecture_arabe_220dpi", "low")

    # ---------- 4. tâches de revue ----------
    con.execute("""INSERT INTO review_tasks (object_type,object_id,reason,priority,status,created_at)
                   SELECT 'ocr_candidate',c.candidate_id,
                     'Texte OCR du scan complet 1978 ('||c.object_type||'.'||c.field||
                     ', pages PDF '||c.pdf_pages||'). À corriger puis valider par un locuteur natif.',
                     CASE c.confidence WHEN 'low' THEN 'high' WHEN 'medium' THEN 'medium' ELSE 'low' END,
                     'open',?
                   FROM ocr_candidates c
                   WHERE c.source_id=?
                     AND NOT EXISTS (SELECT 1 FROM review_tasks t
                                     WHERE t.object_type='ocr_candidate' AND t.object_id=c.candidate_id)""",
                (now, SOURCE_ID))

    con.execute("""INSERT INTO processing_runs (part,step,started_at,finished_at,details_json)
                   VALUES (?,?,?,?,?)""", (
        "scan-complet", "integration-scan-ocr", now,
        datetime.now(timezone.utc).isoformat(),
        json.dumps({"sha256": sha, "nouvelles_pages": new_pages,
                    "nouveaux_candidats": cands, "dialogues": dial_ok,
                    "textes": text_ok}, ensure_ascii=False)))
    con.commit()

    out = {
        "source_ajoutee": SOURCE_ID,
        "sha256": sha[:16] + "…",
        "pages_ocr_stockees": con.execute("SELECT COUNT(*) FROM scan_pages WHERE source_id=?", (SOURCE_ID,)).fetchone()[0],
        "nouvelles_pages_cette_execution": new_pages,
        "pages_avec_bloc_arabe": con.execute("SELECT COUNT(*) FROM scan_pages WHERE source_id=? AND has_arabic=1", (SOURCE_ID,)).fetchone()[0],
        "candidats_ocr_total": con.execute("SELECT COUNT(*) FROM ocr_candidates WHERE source_id=?", (SOURCE_ID,)).fetchone()[0],
        "nouveaux_candidats_cette_execution": cands,
        "repartition": {f"{a}.{b}": n for a, b, n in con.execute(
            "SELECT object_type,field,COUNT(*) FROM ocr_candidates WHERE source_id=? GROUP BY 1,2", (SOURCE_ID,))},
        "dialogues_couverts": con.execute("SELECT COUNT(DISTINCT object_id) FROM ocr_candidates WHERE object_type='dialogue'").fetchone()[0],
        "textes_couverts": con.execute("SELECT COUNT(DISTINCT object_id) FROM ocr_candidates WHERE object_type='study_text'").fetchone()[0],
        "confiance": dict(con.execute("SELECT confidence,COUNT(*) FROM ocr_candidates WHERE source_id=? GROUP BY 1", (SOURCE_ID,)).fetchall()),
        "aucune_donnee_ecrasee": {
            "vocabulary": con.execute("SELECT COUNT(*) FROM vocabulary").fetchone()[0],
            "lessons": con.execute("SELECT COUNT(*) FROM lessons").fetchone()[0],
            "dialogues": con.execute("SELECT COUNT(*) FROM dialogues").fetchone()[0],
            "study_texts": con.execute("SELECT COUNT(*) FROM study_texts").fetchone()[0],
            "champs_reference_toujours_vides": {
                "dialogues.ar_text": con.execute("SELECT COUNT(*) FROM dialogues WHERE ar_text IS NULL OR ar_text=''").fetchone()[0],
                "study_texts.latin_text": con.execute("SELECT COUNT(*) FROM study_texts WHERE latin_text IS NULL OR latin_text=''").fetchone()[0],
                "vocabulary.form_ar": con.execute("SELECT COUNT(*) FROM vocabulary WHERE form_ar IS NULL OR form_ar=''").fetchone()[0],
            },
        },
        "integrity_check": con.execute("PRAGMA integrity_check").fetchone()[0],
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))
    (SCAN / "rapport-ingestion.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    con.close()


if __name__ == "__main__":
    main()
