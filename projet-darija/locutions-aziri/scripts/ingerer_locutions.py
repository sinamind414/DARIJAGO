#!/usr/bin/env python3
"""
Ingestion idempotente des locutions AZIRI 2012 dans SQLite.
Modèle aligné sur dictionnaire.sqlite et manuel.sqlite :
provenance (fichier + page PDF + page imprimée + racine), statut de revue,
aucune donnée inventée, FTS pour la recherche.

Usage : python3 scripts/ingerer_locutions.py
Relançable : les compteurs doivent rester identiques (idempotence).
"""
import json
import sqlite3
import hashlib
from pathlib import Path
from datetime import datetime, timezone

BASE = Path(__file__).resolve().parent.parent
DB = BASE / "db" / "locutions.sqlite"
JSONL = BASE / "text" / "locutions-extrait.jsonl"
PDF = BASE / "raw" / "locutions-aziri-2012.pdf"

SCHEMA = """
CREATE TABLE IF NOT EXISTS sources (
  source_id     TEXT PRIMARY KEY,
  filename      TEXT NOT NULL,
  sha256        TEXT NOT NULL UNIQUE,
  title         TEXT,
  author        TEXT,
  publisher     TEXT,
  year          INTEGER,
  isbn          TEXT,
  depot_legal   TEXT,
  pdf_pages     INTEGER,
  dialect       TEXT,
  register      TEXT,
  source_kind   TEXT,
  rights_note   TEXT,
  created_at    TEXT
);

CREATE TABLE IF NOT EXISTS roots (
  root_id       INTEGER PRIMARY KEY,
  root_ar       TEXT NOT NULL,
  root_norm     TEXT NOT NULL,
  letter_section TEXT,
  first_pdf_page INTEGER,
  locution_count INTEGER DEFAULT 0,
  UNIQUE(root_norm, letter_section)
);

CREATE TABLE IF NOT EXISTS locutions (
  locution_id    INTEGER PRIMARY KEY,
  entry_uid      TEXT NOT NULL UNIQUE,
  source_id      TEXT NOT NULL REFERENCES sources(source_id),
  root_id        INTEGER REFERENCES roots(root_id),
  root_ar        TEXT,
  letter_section TEXT,
  locution_ar    TEXT NOT NULL,
  locution_ar_nodiac TEXT,
  locution_norm  TEXT,
  gloss_fr       TEXT,
  translit_latin TEXT,
  region         TEXT,
  register_modern TEXT,
  usage_note     TEXT,
  pdf_page       INTEGER NOT NULL,
  printed_page   INTEGER,
  also_pdf_pages TEXT,
  has_gloss      INTEGER,
  extraction_flags TEXT,
  parser_version TEXT,
  status         TEXT NOT NULL DEFAULT 'needs_review',
  validated_by   TEXT,
  validated_at   TEXT,
  notes          TEXT
);
CREATE INDEX IF NOT EXISTS idx_loc_norm   ON locutions(locution_norm);
CREATE INDEX IF NOT EXISTS idx_loc_root   ON locutions(root_id);
CREATE INDEX IF NOT EXISTS idx_loc_status ON locutions(status);
CREATE INDEX IF NOT EXISTS idx_loc_page   ON locutions(pdf_page);

CREATE VIRTUAL TABLE IF NOT EXISTS locutions_fts USING fts5(
  locution_ar_nodiac, gloss_fr, content='locutions', content_rowid='locution_id'
);

CREATE TABLE IF NOT EXISTS review_tasks (
  task_id     INTEGER PRIMARY KEY,
  locution_id INTEGER NOT NULL REFERENCES locutions(locution_id),
  reason      TEXT,
  priority    TEXT,
  status      TEXT DEFAULT 'open',
  UNIQUE(locution_id, reason)
);

CREATE TABLE IF NOT EXISTS processing_runs (
  run_id      INTEGER PRIMARY KEY,
  sha256      TEXT,
  started_at  TEXT,
  finished_at TEXT,
  parser_version TEXT,
  locutions_seen INTEGER,
  inserted    INTEGER,
  skipped     INTEGER,
  roots       INTEGER,
  status      TEXT
);
"""

REVIEW_REASONS = {
    "ligature_lam_alef_a_verifier": ("Ligature lam-alef mal encodée dans le PDF : forme arabe à corriger manuellement.", "high"),
    "glose_absente_ou_trop_courte": ("Glose française absente ou trop courte : à compléter depuis la page source.", "high"),
    "glose_separee_du_champ_arabe": ("Séparation arabe/français réparée automatiquement : à vérifier.", "medium"),
    "locution_trop_courte": ("Locution très courte : vérifier qu'il ne s'agit pas d'un fragment.", "medium"),
}


def main():
    started = datetime.now(timezone.utc).isoformat()
    sha = hashlib.sha256(PDF.read_bytes()).hexdigest()
    rows = [json.loads(l) for l in JSONL.open(encoding="utf-8")]
    DB.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB)
    con.executescript(SCHEMA)

    con.execute("""INSERT OR IGNORE INTO sources
      (source_id,filename,sha256,title,author,publisher,year,isbn,depot_legal,pdf_pages,
       dialect,register,source_kind,rights_note,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", (
        "aziri-2012", PDF.name, sha,
        "Dictionnaire des locutions de l'arabe dialectal algérien",
        "Mohamed Nazim AZIRI", "Éditions ANEP", 2012,
        "978-9947-21-578-4", "4629-2012", 492, "arq",
        "locutions_patrimoine_2012", "pdf_texte_selectionnable",
        "Œuvre sous droit (ANEP 2012). Usage interne/recherche ; "
        "publication dans une app nécessite licence ou contenu original/licencié. "
        "Locutions patrimoniales : ne pas présenter comme darija moderne sans validation.",
        started))

    before = con.execute("SELECT COUNT(*) FROM locutions").fetchone()[0]
    inserted = skipped = 0

    for r in rows:
        root_norm = r["locution_norm"].split(" ")[0] if not r["root_ar"] else r["root_ar"]
        con.execute("""INSERT OR IGNORE INTO roots (root_ar,root_norm,letter_section,first_pdf_page)
                       VALUES (?,?,?,?)""",
                    (r["root_ar"], r["root_ar"], r["letter_section"], r["pdf_page"]))
        root_id = con.execute("SELECT root_id FROM roots WHERE root_norm=? AND letter_section IS ?",
                              (r["root_ar"], r["letter_section"])).fetchone()[0]
        cur = con.execute("""INSERT OR IGNORE INTO locutions
          (entry_uid,source_id,root_id,root_ar,letter_section,locution_ar,locution_ar_nodiac,
           locution_norm,gloss_fr,pdf_page,printed_page,also_pdf_pages,has_gloss,
           extraction_flags,parser_version,status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'needs_review')""", (
            r["entry_uid"], "aziri-2012", root_id, r["root_ar"], r["letter_section"],
            r["locution_ar"], r["locution_ar_nodiac"], r["locution_norm"], r["gloss_fr"],
            r["pdf_page"], r["printed_page"],
            json.dumps(r.get("also_pdf_pages", [])) if r.get("also_pdf_pages") else None,
            1 if r["has_gloss"] else 0, r["extraction_flags"], r["parser_version"]))
        if cur.rowcount:
            inserted += 1
            lid = cur.lastrowid
            reasons = [x for x in (r["extraction_flags"] or "").split(";") if x]
            if not reasons:
                reasons = ["validation_native"]
            for reason in reasons:
                if reason == "validation_native":
                    txt, prio = ("Validation native de la locution, du sens et du registre "
                                 "(patrimoine 2012 → usage moderne à confirmer).", "normal")
                else:
                    txt, prio = REVIEW_REASONS.get(reason, (reason, "normal"))
                con.execute("""INSERT OR IGNORE INTO review_tasks (locution_id,reason,priority)
                               VALUES (?,?,?)""", (lid, txt, prio))
        else:
            skipped += 1

    # racines : compteur
    con.execute("""UPDATE roots SET locution_count =
                   (SELECT COUNT(*) FROM locutions WHERE locutions.root_id = roots.root_id)""")
    # FTS : reconstruction complète (idempotent)
    con.execute("INSERT INTO locutions_fts(locutions_fts) VALUES('rebuild')")

    after = con.execute("SELECT COUNT(*) FROM locutions").fetchone()[0]
    nroots = con.execute("SELECT COUNT(*) FROM roots").fetchone()[0]
    con.execute("""INSERT INTO processing_runs
      (sha256,started_at,finished_at,parser_version,locutions_seen,inserted,skipped,roots,status)
      VALUES (?,?,?,?,?,?,?,?,?)""", (
        sha, started, datetime.now(timezone.utc).isoformat(), rows[0]["parser_version"],
        len(rows), inserted, skipped, nroots, "ok"))
    con.commit()
    con.execute("VACUUM")

    print(json.dumps({
        "avant": before, "apres": after, "inseres": inserted, "ignores": skipped,
        "racines": nroots,
        "taches_revue": con.execute("SELECT COUNT(*) FROM review_tasks").fetchone()[0],
        "avec_glose": con.execute("SELECT COUNT(*) FROM locutions WHERE has_gloss=1").fetchone()[0],
        "statuts": dict(con.execute("SELECT status,COUNT(*) FROM locutions GROUP BY 1").fetchall()),
        "taille_db_octets": DB.stat().st_size,
    }, ensure_ascii=False, indent=2))
    con.close()


if __name__ == "__main__":
    main()
