# -*- coding: utf-8 -*-
"""Exporte les 4 bases SQLite de projet-darija vers src/data/corpus/ dans l'app.

Chaque enregistrement garde : source, identifiant, texte arabe/latin/francais,
provenance page et statut needs_review. Aucune publication automatique.
"""
import json
import sqlite3
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJET = Path(r"C:\Users\zakaria\Documents\APPLICATION DARIJAGO\projet-darija")
APP = Path(r"C:\Users\zakaria\Documents\APPLICATION DARIJAGO\darijago-—-apprendre-la-darija-algérienne final 16112026")
OUT = APP / "src" / "data" / "corpus"
OUT.mkdir(parents=True, exist_ok=True)

BASES = {
    "ben_sedira": PROJET / "dictionnaire-livre/db/dictionnaire.sqlite",
    "tapiero": PROJET / "manuel-arabe-algerien/db/manuel.sqlite",
    "aziri": PROJET / "locutions-aziri/db/locutions.sqlite",
    "tadjer": PROJET / "lexiques-tadjer/db/lexiques.sqlite",
}


def lire(chemin, sql):
    conn = sqlite3.connect(f"file:{chemin}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    try:
        return [dict(r) for r in conn.execute(sql)]
    finally:
        conn.close()


def propre(v):
    if v is None:
        return ""
    return str(v).strip()


def ecrire(nom, data):
    chemin = OUT / nom
    chemin.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"  {nom}: {len(data)} entrees, {chemin.stat().st_size // 1024} Ko")


print("Export corpus vers", OUT)

# 1. Ben Sedira 1910 — mots historiques
src = BASES["ben_sedira"]
rows = lire(src, "SELECT entry_uid, headword_fr, raw_block, printed_page_start, printed_page_end, status FROM entries ORDER BY entry_uid")
data = []
for r in rows:
    data.append({
        "id": propre(r["entry_uid"]),
        "source": "ben_sedira_1910",
        "fr": propre(r["headword_fr"]),
        "ar": "",
        "lat": "",
        "raw": propre(r["raw_block"])[:600],
        "page": propre(r["printed_page_start"]),
        "status": "needs_review",
    })
ecrire("benSediraCorpus.json", data)

# 2. Tapiéro — vocabulaire, dialogues, grammaire, textes
src = BASES["tapiero"]
data = []
for r in lire(src, "SELECT entry_uid, form_latin, form_ar, gloss_fr, printed_page, status FROM vocabulary WHERE form_latin<>'' OR form_ar<>''"):
    data.append({
        "id": f"voc-{propre(r['entry_uid'])}", "source": "tapiero_vocab",
        "fr": propre(r["gloss_fr"]), "ar": propre(r["form_ar"]), "lat": propre(r["form_latin"]),
        "raw": "", "page": propre(r["printed_page"]), "status": "needs_review",
    })
for r in lire(src, "SELECT dialogue_uid, numeral, title_fr, ar_text, latin_text, fr_translation, printed_page_ar FROM dialogues"):
    data.append({
        "id": f"dlg-{propre(r['dialogue_uid'])}", "source": "tapiero_dialogue",
        "fr": propre(r["title_fr"]), "ar": propre(r["ar_text"]), "lat": propre(r["latin_text"]),
        "raw": propre(r["fr_translation"])[:600], "page": propre(r["printed_page_ar"]), "status": "needs_review",
    })
for r in lire(src, "SELECT rule_uid, title, summary_fr, printed_page FROM grammar_rules"):
    data.append({
        "id": f"gram-{propre(r['rule_uid'])}", "source": "tapiero_grammar",
        "fr": propre(r["title"]), "ar": "", "lat": "",
        "raw": propre(r["summary_fr"])[:600], "page": propre(r["printed_page"]), "status": "needs_review",
    })
for r in lire(src, "SELECT text_uid, title_latin, latin_text, ar_text, fr_translation, printed_page FROM study_texts"):
    data.append({
        "id": f"txt-{propre(r['text_uid'])}", "source": "tapiero_text",
        "fr": propre(r["title_latin"]), "ar": propre(r["ar_text"]), "lat": propre(r["latin_text"]),
        "raw": propre(r["fr_translation"])[:600], "page": propre(r["printed_page"]), "status": "needs_review",
    })
ecrire("tapieroCorpus.json", data)

# 3. AZIRI 2012 — locutions
src = BASES["aziri"]
rows = lire(src, "SELECT entry_uid, locution_ar, locution_ar_nodiac, gloss_fr, translit_latin, region, printed_page, status FROM locutions ORDER BY entry_uid")
data = []
for r in rows:
    data.append({
        "id": propre(r["entry_uid"]), "source": "aziri_2012",
        "fr": propre(r["gloss_fr"]), "ar": propre(r["locution_ar"]),
        "lat": propre(r["translit_latin"]), "raw": "",
        "page": propre(r["printed_page"]),
        "region": propre(r["region"]),
        "status": "needs_review",
    })
ecrire("aziriCorpus.json", data)

# 4. Tadjer 2010-2012 — vocabulaire moderne + latin fiable
src = BASES["tadjer"]
rows = lire(src, """
SELECT e.uid, e.term_fr, e.pdf_page, e.theme,
       (SELECT v.latin FROM variants v WHERE v.entry_id=e.entry_id AND v.latin<>'' ORDER BY v.rank LIMIT 1) AS latin,
       (SELECT v.ar FROM variants v WHERE v.entry_id=e.entry_id AND v.ar<>'' ORDER BY v.rank LIMIT 1) AS arabe
FROM entries e ORDER BY e.uid
""")
data = []
for r in rows:
    data.append({
        "id": propre(r["uid"]), "source": "tadjer_2010_2012",
        "fr": propre(r["term_fr"]), "ar": propre(r["arabe"]), "lat": propre(r["latin"]),
        "raw": "", "page": propre(r["pdf_page"]), "theme": propre(r["theme"]),
        "status": "needs_review",
    })
ecrire("tadjerCorpus.json", data)
print("Termine.")
