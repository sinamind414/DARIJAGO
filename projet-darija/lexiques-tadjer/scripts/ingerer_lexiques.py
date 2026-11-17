#!/usr/bin/env python3
"""
Ingestion des Lexiques Tadjer (2010-2012) → lexiques.sqlite (4e base du projet).

POURQUOI UNE BASE SÉPARÉE
Registre différent des trois autres : darija MODERNE (2010-2012), vocabulaire
thématique contemporain (mécanique, médecine, cuisine, argot algérois), et
surtout une TRANSLITTÉRATION LATINE fournie par l'auteur — ce qui manquait
partout ailleurs. On ne mélange pas avec Ben Sedira 1910 ni Tapiéro 1971.

RÈGLES
- Aucune invention : champ absent du PDF = NULL.
- Tout en needs_review, aucun app_ready.
- Provenance : page PDF + colonne + n° d'entrée + section.
- Idempotent par uid ; FTS5 reconstruite par 'rebuild', jamais DELETE.
"""
import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DB = BASE / "db" / "lexiques.sqlite"
PDF = BASE / "raw" / "lexiques-tadjer-2010-2012.pdf"
SRC = BASE / "text" / "lexiques-extrait.jsonl"
STATS = BASE / "text" / "extraction-stats.json"
RECITS = BASE / "text" / "recits.json"
SOURCE_ID = "tadjer-lexiques-2010-2012"

SCHEMA = """
CREATE TABLE IF NOT EXISTS sources (
  source_id TEXT PRIMARY KEY, title TEXT, author TEXT, year_start INTEGER,
  year_end INTEGER, filename TEXT, sha256 TEXT, bytes INTEGER, pdf_pages INTEGER,
  dialect TEXT, register TEXT, extraction TEXT, rights_note TEXT, created_at TEXT
);
CREATE TABLE IF NOT EXISTS sections (
  section_id TEXT PRIMARY KEY, source_id TEXT, title TEXT, theme TEXT,
  entry_count INTEGER, pdf_pages TEXT
);
CREATE TABLE IF NOT EXISTS entries (
  entry_id INTEGER PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  source_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  entry_no INTEGER,
  term_fr TEXT,
  dz_raw TEXT,
  pdf_page INTEGER,
  column TEXT,
  theme TEXT,
  status TEXT DEFAULT 'needs_review',
  flags TEXT,
  extractor TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_entries_fr ON entries(term_fr);
CREATE INDEX IF NOT EXISTS idx_entries_sec ON entries(section_id);
CREATE INDEX IF NOT EXISTS idx_entries_page ON entries(pdf_page);

CREATE TABLE IF NOT EXISTS variants (
  variant_id INTEGER PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES entries(entry_id),
  rank INTEGER,
  latin TEXT,
  ar TEXT,
  ar_raw TEXT,
  status TEXT DEFAULT 'needs_review'
);
CREATE INDEX IF NOT EXISTS idx_var_latin ON variants(latin);
CREATE INDEX IF NOT EXISTS idx_var_ar ON variants(ar);
CREATE INDEX IF NOT EXISTS idx_var_entry ON variants(entry_id);

CREATE TABLE IF NOT EXISTS narratives (
  narrative_id INTEGER PRIMARY KEY,
  section_id TEXT UNIQUE, source_id TEXT, title TEXT, theme TEXT,
  pdf_pages TEXT, body TEXT, status TEXT DEFAULT 'needs_review'
);
CREATE TABLE IF NOT EXISTS review_tasks (
  task_id INTEGER PRIMARY KEY, object_type TEXT, object_id INTEGER,
  reason TEXT, priority TEXT, status TEXT DEFAULT 'open', created_at TEXT
);
CREATE TABLE IF NOT EXISTS processing_runs (
  run_id INTEGER PRIMARY KEY, step TEXT, started_at TEXT, finished_at TEXT,
  details_json TEXT
);
CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
  term_fr, latin, ar, content='', tokenize='unicode61 remove_diacritics 2'
);
"""


def main():
    now = datetime.now(timezone.utc).isoformat()
    sha = hashlib.sha256(PDF.read_bytes()).hexdigest()
    rows = [json.loads(l) for l in SRC.open(encoding="utf-8")]
    stats = json.loads(STATS.read_text(encoding="utf-8"))
    recits = json.loads(RECITS.read_text(encoding="utf-8")) if RECITS.exists() else {}

    DB.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB)
    con.executescript(SCHEMA)

    con.execute("""INSERT OR IGNORE INTO sources (source_id,title,author,year_start,year_end,filename,sha256,bytes,pdf_pages,dialect,register,extraction,rights_note,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", (
        SOURCE_ID,
        "Lexiques algériens — compilation de 25 lexiques thématiques",
        "Saïd Tadjer Jr.", 2010, 2012, PDF.name, sha, PDF.stat().st_size, 44,
        "arq", "tadjer_moderne_2010_2012", "texte natif PDF (sans OCR), normalisation NFKC",
        "Compilation publiée par l'auteur sur son blog (2010-2012). Auteur identifié, "
        "œuvre non libre de droits par défaut : usage interne/recherche ; toute "
        "publication dans l'app nécessite l'accord de l'auteur ou une réécriture "
        "originale. Ne pas confondre avec les sources historiques 1910 / 1971.", now))

    # sections
    sec_pages, sec_count = {}, {}
    for r in rows:
        sec_pages.setdefault(r["section"], set()).add(r["pdf_page"])
        sec_count[r["section"]] = sec_count.get(r["section"], 0) + 1
    titles = {r["section"]: (r["section_title"], r["theme"]) for r in rows}
    for code, n in sec_count.items():
        title, theme = titles[code]
        con.execute("""INSERT INTO sections VALUES (?,?,?,?,?,?)
                       ON CONFLICT(section_id) DO UPDATE SET
                         entry_count=excluded.entry_count, pdf_pages=excluded.pdf_pages""",
                    (code, SOURCE_ID, title, theme, n,
                     json.dumps(sorted(sec_pages[code]))))

    ins_e = ins_v = 0
    for r in rows:
        cur = con.execute("""INSERT OR IGNORE INTO entries
          (uid,source_id,section_id,entry_no,term_fr,dz_raw,pdf_page,column,theme,
           status,flags,extractor,created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""", (
            r["uid"], SOURCE_ID, r["section"], r["entry_no"], r["term_fr"],
            r["dz_raw"], r["pdf_page"], r["column"], r["theme"], "needs_review",
            json.dumps(r["flags"], ensure_ascii=False), r["extractor"], now))
        if cur.rowcount:
            ins_e += 1
            eid = cur.lastrowid
            for i, v in enumerate(r["variants"], 1):
                con.execute("""INSERT INTO variants (entry_id,rank,latin,ar,ar_raw)
                               VALUES (?,?,?,?,?)""",
                            (eid, i, v["latin"], v["ar"], v["ar_raw"]))
                ins_v += 1
            lats = " ".join(v["latin"] for v in r["variants"] if v["latin"])
            ars = " ".join(v["ar"] for v in r["variants"] if v["ar"])
            con.execute("INSERT INTO entries_fts (rowid,term_fr,latin,ar) VALUES (?,?,?,?)",
                        (eid, r["term_fr"] or "", lats, ars))
            if r["flags"]:
                prio = "high" if ("aucune_variante" in r["flags"] or "terme_fr_manquant" in r["flags"]) else "medium"
                con.execute("""INSERT INTO review_tasks
                  (object_type,object_id,reason,priority,created_at) VALUES (?,?,?,?,?)""",
                  ("entry", eid,
                   "Fiche extraite du PDF : " + ", ".join(r["flags"]) +
                   f". Source p.{r['pdf_page']} col.{r['column']}.", prio, now))

    for code, n in recits.items():
        con.execute("""INSERT INTO narratives (section_id,source_id,title,theme,pdf_pages,body)
                       VALUES (?,?,?,?,?,?)
                       ON CONFLICT(section_id) DO UPDATE SET body=excluded.body""",
                    (code, SOURCE_ID, n["title"], n["theme"], json.dumps(n["pages"]),
                     "\n".join(l["text"] for l in n["lines"])))

    con.execute("""INSERT INTO processing_runs (step,started_at,finished_at,details_json)
                   VALUES (?,?,?,?)""",
                ("ingestion-lexiques", now, datetime.now(timezone.utc).isoformat(),
                 json.dumps({"sha256": sha, "entries": ins_e, "variants": ins_v},
                            ensure_ascii=False)))
    con.commit()

    out = {
        "base": str(DB), "source": SOURCE_ID, "sha256": sha[:16] + "…",
        "nouvelles_entrees": ins_e, "nouvelles_variantes": ins_v,
        "total_entrees": con.execute("SELECT COUNT(*) FROM entries").fetchone()[0],
        "total_variantes": con.execute("SELECT COUNT(*) FROM variants").fetchone()[0],
        "sections": con.execute("SELECT COUNT(*) FROM sections").fetchone()[0],
        "recits": con.execute("SELECT COUNT(*) FROM narratives").fetchone()[0],
        "avec_latin": con.execute("SELECT COUNT(DISTINCT entry_id) FROM variants WHERE latin IS NOT NULL").fetchone()[0],
        "avec_arabe": con.execute("SELECT COUNT(DISTINCT entry_id) FROM variants WHERE ar IS NOT NULL").fetchone()[0],
        "statuts": dict(con.execute("SELECT status,COUNT(*) FROM entries GROUP BY 1").fetchall()),
        "review_tasks": con.execute("SELECT COUNT(*) FROM review_tasks").fetchone()[0],
        "par_theme": dict(con.execute("SELECT theme,COUNT(*) FROM entries GROUP BY 1 ORDER BY 2 DESC").fetchall()),
        "integrity_check": con.execute("PRAGMA integrity_check").fetchone()[0],
        "fts_test": con.execute(
            "SELECT e.term_fr FROM entries_fts f JOIN entries e ON e.entry_id=f.rowid "
            "WHERE entries_fts MATCH 'manger' LIMIT 3").fetchall(),
        "bytes": DB.stat().st_size,
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))
    (BASE / "rapport-ingestion.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    con.close()


if __name__ == "__main__":
    main()
