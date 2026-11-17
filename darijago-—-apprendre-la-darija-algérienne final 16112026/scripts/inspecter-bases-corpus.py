# -*- coding: utf-8 -*-
"""Inspecte les colonnes des tables utiles des 4 bases projet-darija."""
import sqlite3, sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
root = Path(r"C:\Users\zakaria\Documents\APPLICATION DARIJAGO\projet-darija")
bases = {
    "dictionnaire": root / "dictionnaire-livre/db/dictionnaire.sqlite",
    "manuel": root / "manuel-arabe-algerien/db/manuel.sqlite",
    "locutions": root / "locutions-aziri/db/locutions.sqlite",
    "tadjer": root / "lexiques-tadjer/db/lexiques.sqlite",
}
tables = {
    "dictionnaire": ["entries", "entry_forms", "senses"],
    "manuel": ["vocabulary", "lessons", "dialogues", "grammar_rules", "study_texts", "glossary_ar_fr", "fr_dz_lookup"],
    "locutions": ["locutions", "roots"],
    "tadjer": ["entries", "variants", "sections"],
}
for nom, chemin in bases.items():
    print(f"\n=== {nom} ===")
    conn = sqlite3.connect(f"file:{chemin}?mode=ro", uri=True)
    for t in tables[nom]:
        try:
            cols = [c[1] for c in conn.execute(f"PRAGMA table_info('{t}')")]
            n = conn.execute(f"SELECT COUNT(*) FROM '{t}'").fetchone()[0]
            print(f" {t} ({n}): {', '.join(cols)}")
        except Exception as e:
            print(f" {t}: ERREUR {e}")
    conn.close()
