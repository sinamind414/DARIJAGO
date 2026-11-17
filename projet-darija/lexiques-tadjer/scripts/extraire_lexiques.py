#!/usr/bin/env python3
"""
Extraction des Lexiques algériens de Saïd Tadjer Jr. (2010-2012).

SOURCE : compilation de 25 lexiques thématiques publiés sur le blog de l'auteur,
réunis dans un PDF de 44 pages. Darija MODERNE (2010-2012), avec arabe ET
translittération latine. Texte natif du PDF : AUCUN OCR.

DIFFICULTÉS TRAITÉES
1. Deux colonnes (x < 300 = gauche, x >= 300 = droite), lues colonne par colonne.
2. L'ordre de get_text() est faux : spans arabes/latins entrelacés par le moteur
   bidi. → tri des spans par x0 dans chaque ligne, puis fusion par y.
3. L'arabe est en FORMES DE PRÉSENTATION (U+FE70–FEFF). → normalisation NFKC,
   transformation déterministe ; la forme brute est conservée dans ar_raw.
4. Les numéros d'entrée sont dans un bloc séparé → regroupement par y.
5. Beaucoup de sections n'ont PAS de numéros (cuisine, expressions, herboriste,
   lézards, monnaie…) → détection par présence d'un séparateur '=' / ':' et
   d'un terme français en tête.
6. Les limites de sections sont repérées par la signature de publication
   « par Saïd Tadjer Jr., <date> » et le titre qui la précède.

AUCUNE INVENTION : champ absent du PDF = NULL. Tout sort en needs_review.
Sortie : text/lexiques-extrait.jsonl + text/extraction-stats.json
"""
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

import pymupdf

VERSION = "tadjer-lexiques-10.0.0"
BASE = Path(__file__).resolve().parent.parent
PDF = BASE / "raw" / "lexiques-tadjer-2010-2012.pdf"
OUT = BASE / "text"

# Limites de sections en coordonnées réelles (page PDF, colonne, y de départ).
# col 0 = gauche, 1 = droite. Une section court jusqu'au début de la suivante.
SECTIONS = [
    (2, 0, 0,    "verbes-273",         "Les 273 verbes les plus courants du français traduits en algérien", "verbes", "numbered"),
    (4, 1, 197,  "adjectifs",          "Adjectifs et qualités (blanc, chaud, cher, vieux…)", "adjectifs", "numbered"),
    (5, 1, 124,  "noms-courants",      "Noms courants (sujet, téléphone, train, travail…)", "noms", "numbered"),
    (8, 1, 461,  "possessifs",         "Adjectifs possessifs : dâr (maison)", "grammaire", "plain"),
    (9, 0, 294,  "medical",            "Petit lexique de termes médicaux en algérien", "santé", "numbered"),
    (13, 1, 150, "corps-humain",       "Le corps humain en arabe algérien", "corps", "plain"),
    (15, 0, 150, "epices-herbes",      "Lexique des épices, herbes & condiments en algérien", "cuisine", "numbered"),
    (16, 0, 250, "cuisine-pratique",   "Lexique pratique de la cuisine", "cuisine", "plain"),
    (17, 0, 60,  "kouzina",            "Kouzina / Khyama — ustensiles de cuisine", "cuisine", "plain"),
    (19, 0, 60,  "plantes",            "Les plantes bel εerbiya djazayriya", "nature", "numbered"),
    (21, 0, 120, "herboriste",         "Le petit herboriste illustré en arabe algérien", "nature", "dz_first"),
    (21, 0, 410, "hchayech",           "Ħchảwech w εchàcheb en arabe algérien", "nature", "dz_first"),
    (25, 0, 60,  "terre",              "'ārđh = la terre", "nature", "plain"),
    (26, 0, 60,  "montagne",           "À la montagne — fel jbel", "voyage", "plain"),
    (27, 0, 60,  "hotel-camping",      "Hôtel - Camping, en arabe algérien", "voyage", "numbered"),
    (29, 0, 60,  "marine",             "Petit lexique de la marine bel Jazairiya", "transport", "numbered"),
    (31, 0, 600, "mecanique",          "Moteur Mercedes M130 + pièces mécaniques en algérien moderne", "technique", "numbered"),
    (33, 0, 60,  "velo-electrique",    "Vilou triciti — vélo électrique", "technique", "plain"),
    (34, 0, 60,  "algamoos-haddar",    "القاموس الهدّار — arabe algérien", "registre_algérois", "plain"),
    (35, 0, 165, "algerois-belda",     "Léxique algérois « Belda »", "registre_algérois", "plain"),
    (38, 0, 60,  "expressions",        "Expressions usuelles en arabe algérien", "conversation", "plain"),
    (39, 0, 60,  "lezards",            "Lézards d'Algérie en arabe algérien", "nature", "dz_first"),
    (40, 0, 60,  "monnaie",            "Drahem dzayer bekri we ḍorwek — l'argent d'hier et d'aujourd'hui", "société", "plain"),
    (42, 0, 60,  "conte-serdouk",      "Serdouk, el kelb w teεleb — le coq, le chien et le renard", "littérature", "narrative"),
    (43, 0, 60,  "conte-sidi-bimol",   "Ġunyet eš-šix Sidi Bimol … El-Bandi", "littérature", "narrative"),
]
# sections où le contenu est un récit continu : on ne découpe pas en fiches
NARRATIVE = {"conte-serdouk", "conte-sidi-bimol"}

AR = re.compile(r"[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]")
AR_CORE = re.compile(r"[\u0621-\u064A]")
LAT = re.compile(r"[A-Za-zÀ-ÿɛḥṣṭẓεġšžḤḌṬẒŠ]")
ENTRY_START = re.compile(r"^\s*(\d{1,3})\s*[\.°]\s*(.*)$")
ENTRY_NOP = re.compile(r"^\s*(\d{1,3})\s+([a-zàâäéèêëîïôöùûüçA-Z].{3,})$")
SKIP = re.compile(r"^(par\s|Par\s|Par:|Voici|Bel fransawiya|API:|Légende|_{3,}|En français)")


def nfkc(t):
    return unicodedata.normalize("NFKC", t)


def clean(t):
    t = t.replace("\u00a0", " ")
    return re.sub(r"[ \t]+", " ", t).strip()


def join_bidi(spans):
    """Recolle les spans d'une ligne en respectant la lecture de l'arabe.

    Les spans sont triés par x croissant (ordre visuel gauche→droite). L'arabe
    se lit droite→gauche : dans un groupe de spans arabes, l'ordre LOGIQUE est
    l'inverse de l'ordre visuel. Les spans purement blancs/ponctuation sont
    NEUTRES : ils ne doivent pas casser un groupe arabe (sinon chaque mot
    arabe se retrouvait isolé et l'ordre restait faux).
    """
    runs = []   # (kind, [spans]) ; kind in {'ar','lat'}
    for s in spans:
        txt = s["text"]
        has_ar, has_lat = bool(AR.search(txt)), bool(LAT.search(txt))
        if has_ar and not has_lat:
            kind = "ar"
        elif has_lat and not has_ar:
            kind = "lat"
        elif not has_ar and not has_lat:
            kind = runs[-1][0] if runs else "lat"   # neutre : colle au run courant
        else:
            kind = "lat"                            # mixte : laisser l'ordre du span
        if runs and runs[-1][0] == kind:
            runs[-1][1].append(s)
        else:
            runs.append((kind, [s]))
    out = []
    for kind, group in runs:
        if kind == "ar":
            core = [s for s in group if AR.search(s["text"])]
            if len(core) > 1:
                group = sorted(group, key=lambda s: -s["bbox"][0])
        out.append("".join(s["text"] for s in group))
    return "".join(out)


def page_lines(page):
    """Reconstruit les lignes : regroupement par bande y, puis tri par x.
    Indispensable : le numéro d'entrée et son texte sont dans deux blocs
    distincts, souvent à des y légèrement différents (0,8 pt). Trier par y
    puis x mettait parfois le numéro APRÈS le texte."""
    raw = []
    for b in page.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            spans = sorted(l["spans"], key=lambda s: s["bbox"][0])
            txt = join_bidi(spans)
            if not txt.strip():
                continue
            raw.append({"x": l["bbox"][0], "y": l["bbox"][1], "text": txt,
                        "size": max(round(s["size"], 1) for s in spans),
                        "col": 0 if l["bbox"][0] < 300 else 1})
    out = []
    for col in (0, 1):
        items = sorted([r for r in raw if r["col"] == col], key=lambda r: r["y"])
        bands = []
        for r in items:
            if bands and abs(bands[-1][0]["y"] - r["y"]) < 4.0:
                bands[-1].append(r)
            else:
                bands.append([r])
        for band in bands:
            band.sort(key=lambda r: r["x"])
            out.append({"x": min(r["x"] for r in band),
                        "y": min(r["y"] for r in band),
                        "text": "".join(r["text"] for r in band),
                        "size": max(r["size"] for r in band),
                        "col": col})
    return out


def section_at(pno, col, y):
    cur = None
    for sp, sc, sy, code, title, theme, kind in SECTIONS:
        if (pno, col, y) >= (sp, sc, sy):
            cur = (code, title, theme, kind)
        else:
            break
    return cur


def split_fr_dz(body):
    for sep in ("=", ":", " - ", "–", "—"):
        if sep in body:
            a, b = body.split(sep, 1)
            if a.strip() and b.strip():
                return clean(a), clean(b), sep
    return clean(body), "", ""


def ar_logical(chars):
    """Reconstruit l'arabe d'une ligne à partir des caractères et de leur x.
    En layout RTL visuel, le 1er caractère logique est le plus à droite.
    Le tatweel (U+0640) est un allongement typographique : retiré de la forme
    normalisée, conservé dans ar_raw."""
    ar = [(x, c) for x, c in chars if AR.match(c)]
    if not ar:
        return None, None
    raw = "".join(c for x, c in sorted(ar, key=lambda t: -t[0]))
    return clean(nfkc(raw).replace("\u0640", "")) or None, raw


def parse_variants(dz):
    out = []
    for chunk in re.split(r"\s*/\s*", dz):
        chunk = clean(chunk)
        if not chunk:
            continue
        ar_raw = "".join(AR.findall(chunk))
        lat = clean(AR.sub(" ", chunk))
        lat = clean(re.sub(r"[\-–—\u0640]+$", "", lat).strip(" -–—"))
        ar = clean(nfkc(ar_raw).replace("\u0640", ""))
        if not ar and not lat:
            continue
        out.append({"latin": lat or None, "ar": ar or None, "ar_raw": ar_raw or None})
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(PDF)
    records, narratives = [], {}
    stats, per_section = Counter(), Counter()

    for pno in range(1, doc.page_count + 1):
        current = None
        for ln in page_lines(doc[pno - 1]):
            raw_txt = ln["text"]
            txt = clean(raw_txt)
            if not txt:
                continue
            sec = section_at(pno, ln["col"], ln["y"])
            if not sec:
                stats["lignes_hors_section"] += 1
                continue
            code, title, theme, kind = sec

            if kind == "narrative":
                narratives.setdefault(code, {"title": title, "theme": theme, "pages": [], "lines": []})
                narratives[code]["lines"].append({"pdf_page": pno, "text": nfkc(txt)})
                if pno not in narratives[code]["pages"]:
                    narratives[code]["pages"].append(pno)
                continue

            is_bare_num = re.fullmatch(r"\d{1,3}\s*[\.°]?", txt)
            if (ln["size"] >= 11 and not is_bare_num) or SKIP.match(txt) or "Tadjer" in txt:
                stats["lignes_ignorees"] += 1
                continue

            bare = re.fullmatch(r"(\d{1,3})\s*[\.°]?", txt)
            m = ENTRY_START.match(txt) or ENTRY_NOP.match(raw_txt)
            if bare:
                # numéro seul : le texte suit plus bas (image intercalée).
                # On ouvre l'entrée pour ne pas perdre le numéro.
                m = re.match(r"^(\d{1,3})$", bare.group(1))
                class _M:
                    def __init__(s, n): s.n = n
                    def group(s, i): return s.n if i == 1 else ""
                m = _M(bare.group(1))
                m_len_ok = True
            else:
                m_len_ok = bool(m and len(m.group(2)) > 2)
            is_entry = False
            num, body = None, txt
            dz_first = False
            if m and m_len_ok:
                num, body = m.group(1), clean(m.group(2))
                is_entry = True
            elif kind == "plain" and re.search(r"[=:]" if code != "expressions" else r"[=:]|\s-\s|\?\s", txt) and len(txt) > 4:
                head = re.split(r"[=:]|\s-\s" if code == "expressions" else r"[=:]", txt, maxsplit=1)[0]
                if head.strip() and not AR.search(head):
                    is_entry = True
            elif kind == "dz_first" and " - " in txt and AR.search(txt):
                # herboriste / lézards : « nom_dz - arabe », le français vient après
                head = txt.split(" - ", 1)[0]
                if head.strip() and not AR.search(head) and len(head) > 2:
                    is_entry, dz_first = True, True
                    body = txt

            if is_entry:
                if current:
                    records.append(current)
                if dz_first:
                    fr, dz, sep = "", clean(body), "-"
                else:
                    fr, dz, sep = split_fr_dz(body)
                    if not dz and code == "expressions":
                        qm = re.match(r"^(.+?[?!])\s+(.+)$", body)
                        if qm:
                            fr, dz, sep = clean(qm.group(1)), clean(qm.group(2)), "?"
                key = f"p{pno:02d}{'L' if ln['col']==0 else 'R'}-" + (num or f"y{int(ln['y'])}")
                current = {
                    "uid": f"tadjer-{code}-{key}",
                    "source_id": "tadjer-lexiques-2010-2012",
                    "section": code, "section_title": title, "theme": theme,
                    "entry_no": int(num) if num else None,
                    "term_fr": fr or None, "dz_raw": dz or None,
                    "separator": sep or None,
                    "pdf_page": pno, "column": "L" if ln["col"] == 0 else "R",
                    "variants": parse_variants(dz) if dz else [],
                    "continuation": [], "dz_first": dz_first, "extractor": VERSION, "status": "needs_review",
                }
                stats["entrees"] += 1
                per_section[code] += 1
            elif current is not None and not current["dz_raw"] and not current["term_fr"] \
                    and len(txt) > 3 and re.search(r"[=:]", txt):
                fr, dz, sep = split_fr_dz(txt)
                current["term_fr"], current["dz_raw"], current["separator"] = fr or None, dz or None, sep or None
                current["variants"] = parse_variants(dz) if dz else []
                stats["corps_rempli_apres_numero_seul"] += 1
            elif current is not None and len(txt) > 1 and not re.match(r"^\d+\s*[\.°]", txt):
                if current.get("dz_first"):
                    fm = re.search(r"(?:En français\s*:?|Bel fransawiya\s*-\s*En français\s*:?)\s*(.+)", txt)
                    if fm:
                        current["term_fr"] = clean(fm.group(1))
                        stats["fr_recupere_dz_first"] += 1
                        continue
                    if not AR.search(txt) and not current["term_fr"] and len(txt) < 90:
                        current["term_fr"] = clean(txt)
                        stats["fr_recupere_dz_first"] += 1
                        continue
                current["continuation"].append(txt)
                stats["lignes_continuation"] += 1
        if current:
            records.append(current)

    for r in records:
        if r["continuation"]:
            r["dz_raw"] = clean((r["dz_raw"] or "") + " " + " ".join(r["continuation"]))
            r["variants"] = parse_variants(r["dz_raw"])
            r["has_continuation"] = True
        else:
            r["has_continuation"] = False

    seen, uniq = set(), []
    for r in records:
        if r["uid"] in seen:
            stats["doublons_uid"] += 1
            continue
        seen.add(r["uid"])
        uniq.append(r)

    for r in uniq:
        flags = []
        if not r["term_fr"]:
            flags.append("terme_fr_manquant")
        if not r["variants"]:
            flags.append("aucune_variante")
        else:
            if not any(v["ar"] for v in r["variants"]):
                flags.append("sans_arabe")
            if not any(v["latin"] for v in r["variants"]):
                flags.append("sans_latin")
            if any(v["latin"] and AR_CORE.search(v["latin"]) for v in r["variants"]):
                flags.append("arabe_dans_latin")
            if any(v["ar"] and LAT.search(v["ar"]) for v in r["variants"]):
                flags.append("latin_dans_arabe")
        if r["has_continuation"]:
            flags.append("continuation_a_verifier")
        if any(v["ar"] for v in r["variants"]):
            flags.append("arabe_source_a_verifier")
        r["flags"] = flags
        for f in flags:
            stats["flag_" + f] += 1
        if not flags:
            stats["sans_signalement"] += 1

    with (OUT / "lexiques-extrait.jsonl").open("w", encoding="utf-8") as f:
        for r in uniq:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    (OUT / "recits.json").write_text(json.dumps(narratives, ensure_ascii=False, indent=2),
                                     encoding="utf-8")

    summary = {
        "extractor": VERSION, "pdf_pages": doc.page_count,
        "entrees_uniques": len(uniq), "sections_couvertes": len(per_section),
        "par_section": dict(per_section),
        "variantes_total": sum(len(r["variants"]) for r in uniq),
        "avec_arabe": sum(1 for r in uniq if any(v["ar"] for v in r["variants"])),
        "avec_latin": sum(1 for r in uniq if any(v["latin"] for v in r["variants"])),
        "recits": {k: {"pages": v["pages"], "lignes": len(v["lines"])} for k, v in narratives.items()},
        "controles": {k: v for k, v in sorted(stats.items())},
    }
    (OUT / "extraction-stats.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
