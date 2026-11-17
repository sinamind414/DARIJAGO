#!/usr/bin/env python3
"""
Extraction du « Dictionnaire des locutions de l'arabe dialectal algérien »
Mohamed Nazim AZIRI, Éditions ANEP, 2012 — ISBN 978-9947-21-578-4.

PDF en texte sélectionnable (pas d'OCR). La structure est portée par les polices :
  - Andalus 72            → lettre-section (ا, ب, ...)
  - TraditionalArabic-Bold 18, centré (x0 ~224) → racine (vedette)
  - TraditionalArabic-Bold 18, aligné à gauche (x0 ~71) → locution
  - TraditionalArabic 18  → arabe cité dans une glose
  - TimesNewRomanPS* 12   → glose française

Sortie : JSONL + texte brut par page. Aucune donnée inventée.
Idempotent : relire le PDF produit le même résultat.
"""
import json
import re
import hashlib
import unicodedata
from pathlib import Path

import pymupdf

BASE = Path(__file__).resolve().parent.parent
PDF = BASE / "raw" / "locutions-aziri-2012.pdf"
OUT_JSONL = BASE / "text" / "locutions-extrait.jsonl"
OUT_PAGES = BASE / "text" / "pages"
PARSER_VERSION = "aziri-locutions-1.0.0"

AR_DIACRITICS = re.compile(r"[\u064B-\u0652\u0670\u0640\u06D6-\u06ED]")
AR_LETTER = re.compile(r"[\u0621-\u064A\u0671-\u06D3]")


def strip_diacritics(s: str) -> str:
    return AR_DIACRITICS.sub("", s or "")


def norm_ar(s: str) -> str:
    """Forme de recherche : sans diacritiques, alef/ya/ta marbuta unifiés, espaces normalisés."""
    s = strip_diacritics(s)
    s = (s.replace("\u0623", "\u0627").replace("\u0625", "\u0627")
          .replace("\u0622", "\u0627").replace("\u0671", "\u0627")
          .replace("\u0649", "\u064A").replace("\u0629", "\u0647")
          .replace("\u0624", "\u0648").replace("\u0626", "\u064A"))
    s = re.sub(r"[^\u0621-\u064A\u0671-\u06D3 ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def has_arabic(s: str) -> bool:
    return bool(AR_LETTER.search(s or ""))


def page_lines(page):
    """Renvoie les lignes avec leurs spans, dans l'ordre de lecture vertical."""
    lines = []
    for blk in page.get_text("dict")["blocks"]:
        if blk.get("type") != 0:
            continue
        for line in blk["lines"]:
            spans = [s for s in line["spans"] if s["text"].strip()]
            if not spans:
                continue
            lines.append({
                "y": round(line["bbox"][1], 1),
                "x0": round(line["bbox"][0], 1),
                "x1": round(line["bbox"][2], 1),
                "spans": spans,
            })
    lines.sort(key=lambda l: (l["y"], l["x0"]))
    return lines


def classify(line):
    """lettre | racine | locution | glose | bruit"""
    spans = line["spans"]
    fonts = {s["font"] for s in spans}
    sizes = {round(s["size"]) for s in spans}
    text = "".join(s["text"] for s in spans).strip()

    if any(f == "Andalus" for f in fonts) and max(sizes) >= 40:
        return "lettre", text
    # en-tête / pied de page
    if "Dictionnaire des locutions" in text:
        return "bruit", text
    if re.fullmatch(r"\d{1,3}\s*[\u0652]?", text):
        return "bruit", text
    # racine : uniquement de l'arabe bold, centré
    ar_bold = [s for s in spans if s["font"] == "TraditionalArabic-Bold"]
    latin = [s for s in spans if s["font"].startswith("TimesNewRoman")]
    if ar_bold and not latin and line["x0"] > 180:
        return "racine", text
    # locution : commence par ':' ou contient de l'arabe bold aligné à gauche
    if ar_bold and line["x0"] < 120:
        return "locution", text
    if text.startswith(":") or text.startswith(" :"):
        return "locution", text
    return "glose", text


def split_locution(line):
    """Sépare la locution arabe de la glose française à partir des polices."""
    spans = line["spans"]
    ar_parts, fr_parts = [], []
    seen_latin = False
    for s in sorted(spans, key=lambda s: s["bbox"][0]):
        t = s["text"]
        if s["font"].startswith("TimesNewRoman"):
            if t.strip() in (":", ""):
                continue
            seen_latin = True
            fr_parts.append(t)
        else:
            if seen_latin:
                fr_parts.append(t)          # arabe cité dans la glose
            else:
                ar_parts.append(t)
    ar = re.sub(r"\s+", " ", "".join(ar_parts)).strip(" :")
    fr = re.sub(r"\s+", " ", "".join(fr_parts)).strip()
    return ar, fr


def main():
    doc = pymupdf.open(PDF)
    sha = hashlib.sha256(PDF.read_bytes()).hexdigest()
    OUT_PAGES.mkdir(parents=True, exist_ok=True)

    records = []
    current_letter = None
    current_root = None
    pending = None
    stats = {"pages": doc.page_count, "racines": 0, "locutions": 0, "pages_dico": 0}

    # Le dictionnaire court de la p.11 à la p.484 ; avant = intro, après = bibliographie.
    for pno in range(10, 484):
        page = doc[pno]
        pdf_page = pno + 1
        raw = page.get_text()
        (OUT_PAGES / f"p{pdf_page:03d}.txt").write_text(raw, encoding="utf-8")
        if len(raw.strip()) < 80:
            continue
        stats["pages_dico"] += 1
        m = re.search(r"(?m)^\s*(\d{1,3})\s*\u0652?\s*$", raw)
        printed = int(m.group(1)) if m else pdf_page

        for line in page_lines(page):
            kind, text = classify(line)
            if kind == "bruit":
                continue
            if kind == "lettre":
                current_letter = strip_diacritics(text).strip()
                continue
            if kind == "racine":
                current_root = strip_diacritics(text).strip()
                stats["racines"] += 1
                continue
            if kind == "locution":
                if pending:
                    records.append(pending)
                ar, fr = split_locution(line)
                if not has_arabic(ar):
                    # ligne de continuation mal classée
                    if pending:
                        pending["gloss_fr"] = (pending["gloss_fr"] + " " + text).strip()
                    continue
                pending = {
                    "root_ar": current_root,
                    "letter_section": current_letter,
                    "locution_ar": ar,
                    "locution_ar_nodiac": strip_diacritics(ar),
                    "locution_norm": norm_ar(ar),
                    "gloss_fr": fr,
                    "pdf_page": pdf_page,
                    "printed_page": printed,
                    "source_sha256": sha,
                    "parser_version": PARSER_VERSION,
                    "status": "needs_review",
                }
                stats["locutions"] += 1
            else:  # glose = continuation
                if pending:
                    add = re.sub(r"\s+", " ", text).strip()
                    pending["gloss_fr"] = (pending["gloss_fr"] + " " + add).strip()
        # fin de page : on garde pending ouvert (une locution peut continuer page suivante)

    if pending:
        records.append(pending)

    # uid stable → idempotence + dédoublonnage strict
    seen = {}
    dedup = []
    for r in records:
        r["gloss_fr"] = re.sub(r"\s+", " ", r["gloss_fr"]).strip()
        # une locution arabe ne doit pas contenir de latin : sinon la glose a bavé dessus
        flags = []
        mlat = re.search(r"[A-Za-zÀ-ÿ].*$", r["locution_ar"])
        if mlat and has_arabic(r["locution_ar"][:mlat.start()]):
            r["gloss_fr"] = (mlat.group(0).strip(" :") + " " + r["gloss_fr"]).strip()
            r["locution_ar"] = r["locution_ar"][:mlat.start()].strip(" :")
            r["locution_ar_nodiac"] = strip_diacritics(r["locution_ar"])
            r["locution_norm"] = norm_ar(r["locution_ar"])
            flags.append("glose_separee_du_champ_arabe")
        # ligature lam-alef mal encodée par le PDF : signalée, jamais corrigée en silence
        if re.search(r"ا[أإآ]", r["locution_ar"]):
            flags.append("ligature_lam_alef_a_verifier")
        if not re.search(r"[A-Za-zÀ-ÿ]{3,}", r["gloss_fr"]):
            flags.append("glose_absente_ou_trop_courte")
        if len(r["locution_norm"]) < 2:
            flags.append("locution_trop_courte")
        r["extraction_flags"] = ";".join(flags)
        r["has_gloss"] = bool(re.search(r"[A-Za-zÀ-ÿ]{3,}", r["gloss_fr"]))
        key = f"{r['root_ar']}|{r['locution_norm']}|{r['pdf_page']}|{r['gloss_fr'][:60]}"
        r["entry_uid"] = hashlib.sha1(key.encode("utf-8")).hexdigest()[:16]
        if r["entry_uid"] in seen:
            # doublon exact : on fusionne les pages de provenance
            prev = seen[r["entry_uid"]]
            if r["pdf_page"] not in (prev.get("also_pdf_pages") or []) and r["pdf_page"] != prev["pdf_page"]:
                prev.setdefault("also_pdf_pages", []).append(r["pdf_page"])
            continue
        seen[r["entry_uid"]] = r
        dedup.append(r)
    stats["doublons_fusionnes"] = len(records) - len(dedup)
    records = dedup

    with OUT_JSONL.open("w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    stats["locutions_avec_glose"] = sum(1 for r in records if r["has_gloss"])
    stats["locutions_sans_glose"] = sum(1 for r in records if not r["has_gloss"])
    stats["sha256"] = sha
    (BASE / "text" / "extraction-stats.json").write_text(
        json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(stats, ensure_ascii=False, indent=2))
    print("\n=== 5 exemples ===")
    for r in records[:5]:
        print(json.dumps(r, ensure_ascii=False))


if __name__ == "__main__":
    main()
