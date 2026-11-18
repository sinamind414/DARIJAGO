# -*- coding: utf-8 -*-
"""Base du comite de relecture native (R3).

4 regions : Alger, Oran, Constantine, Sud.
Double validation : un item passe en app_ready quand >= 2 relecteurs de regions
DIFFERENTES ont vote 'valide' (ou 'valide_avec_correction' avec texte corrige).
"""
import json
import sqlite3
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
BASE = Path(__file__).resolve().parent
DB = BASE / "comite.db"
ITEMS = BASE / "items-a-valider.json"
REGIONS = ["Alger", "Oran", "Constantine", "Sud"]

cx = sqlite3.connect(DB)
cx.executescript("""
CREATE TABLE IF NOT EXISTS reviewers (
    reviewer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    region TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS votes (
    vote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT NOT NULL,
    reviewer_id INTEGER NOT NULL,
    verdict TEXT NOT NULL,       -- valide | valide_avec_correction | a_revoir | rejete
    ar_corrige TEXT,
    latin_corrige TEXT,
    note_regionale TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(item_id, reviewer_id)
);
CREATE TABLE IF NOT EXISTS items (
    item_id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    source TEXT,
    arabic TEXT,
    latin TEXT,
    french TEXT,
    note TEXT,
    status TEXT DEFAULT 'needs_review'
);
""")

# Relecteurs (a renseigner avec de vrais noms plus tard)
# Un seul relecteur par region, stable d'une execution a l'autre.
cx.execute("DELETE FROM votes WHERE reviewer_id NOT IN (SELECT reviewer_id FROM reviewers WHERE nom LIKE 'Relecteur %')")
for r in REGIONS:
    nom = f"Relecteur {r}"
    existe = cx.execute("SELECT 1 FROM reviewers WHERE nom=? AND region=?", (nom, r)).fetchone()
    if existe:
        cx.execute("UPDATE reviewers SET region=? WHERE nom=? AND region=?", (r, nom, r))
    else:
        cx.execute("INSERT INTO reviewers(nom, region) VALUES (?, ?)", (nom, r))
# Eliminer les doublons de relecteurs crees par les executions precedentes
cx.execute("""DELETE FROM reviewers WHERE reviewer_id NOT IN (
    SELECT MIN(reviewer_id) FROM reviewers GROUP BY nom, region
)""")

# Items
donnees = json.loads(ITEMS.read_text(encoding="utf-8"))
for it in donnees["items"]:
    cx.execute("""INSERT OR IGNORE INTO items(item_id,type,source,arabic,latin,french,note)
                  VALUES (?,?,?,?,?,?,?)""",
               (it["id"], it["type"], it["source"], it["arabic"],
                it["latin"], it["french"], it.get("note", "")))

# Recalcule le statut de chaque item selon la regle de double validation
for (iid,) in cx.execute("SELECT item_id FROM items").fetchall():
    valides = cx.execute("""
        SELECT COUNT(DISTINCT r.region)
        FROM votes v JOIN reviewers r ON r.reviewer_id = v.reviewer_id
        WHERE v.item_id=? AND v.verdict IN ('valide','valide_avec_correction')
    """, (iid,)).fetchone()[0]
    statut = "app_ready" if valides >= 2 else "needs_review"
    cx.execute("UPDATE items SET status=? WHERE item_id=?", (statut, iid))

cx.commit()
print("relecteurs :", cx.execute("SELECT COUNT(*) FROM reviewers").fetchone()[0])
print("items      :", cx.execute("SELECT COUNT(*) FROM items").fetchone()[0])
print("app_ready  :", cx.execute("SELECT COUNT(*) FROM items WHERE status='app_ready'").fetchone()[0])
print("par region :", cx.execute("SELECT region, COUNT(*) FROM reviewers GROUP BY region").fetchall())
cx.close()
