# -*- coding: utf-8 -*-
"""Normalise les transcriptions latines des corpus vers l'arabizi darijaGO.

Implmente exactement la charte CHARTE-TRANSCRIPTION.md (v1.0).
Idempotent : relancer plusieurs fois ne change plus rien.

Usage :
  python scripts/normaliser-transcription.py --check        # rapport, aucune ecriture
  python scripts/normaliser-transcription.py --write        # ecrit les fichiers normalises
  python scripts/normaliser-transcription.py --write --backup  # avec sauvegarde .orig

Sortie : src/data/corpus/*.json avec champ supplementaire "latOriginal" (provenance).
"""
import argparse
import json
import shutil
import sys
import unicodedata
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

CORPUS = Path("src/data/corpus")
FICHIERS = ["benSediraCorpus.json", "tadjerCorpus.json", "tapieroCorpus.json", "aziriCorpus.json"]

# Regles de la charte : caractere source -> arabizi darijaGO
# Ordre important : les sequences multi-caracteres avant les simples.
REGLES = [
    # Sequences multi-caracteres d'abord
    ("ḫ", "kh"), ("ġ", "gh"), ("ǥ", "gh"), ("š", "ch"),
    ("x", "kh"),  # Tadjer/Tapiero utilisent x pour la velaire kh
    # Pharyngales / emphatiques
    ("ḥ", "7"), ("ħ", "7"), ("ṣ", "s"), ("ḍ", "d"), ("ṭ", "t"), ("ẓ", "z"),
    ("ṯ", "t"), ("ḏ", "d"),
    # Voyelles longues et accents (non notes en darijaGO)
    ("ā", "a"), ("ē", "e"), ("ī", "i"), ("ū", "u"),
    ("â", "a"), ("î", "i"), ("û", "u"), ("ï", "i"), ("ü", "u"),
    ("ê", "e"), ("é", "e"), ("è", "e"), ("ô", "o"), ("ò", "o"), ("à", "a"),
    # Ben Sedira / Tadjer : ɛ et ε = son 'a/e' avale (consonne 3 en arabizi quand initial)
    ("ɛ", "3"), ("Ɛ", "3"), ("ε", "3"),
    ("æ", "a"), ("ǽ", "a"), ("Æ", "a"), ("Ǽ", "a"),
    ("ÿ", "y"),
]

# Apres regles : apostrophes typographiques -> apostrophe droite
REGLES_FINALES = [
    ("’", "'"), ("‘", "'"), ("`", "'"),
]

# Caracteres interdits a l'affichage (controle conformite)
INTERDITS = set("ɛæǽḥṣḍṭẓḫġšāēīūâîûïüêéèôòàñÿƐεǥħṯḏx")
# Caracteres de presentation arabe (U+FB50-FDFF, U+FE70-FEFF) -> supprimes
def est_presentation_arabe(ch):
    o = ord(ch)
    return 0xFB50 <= o <= 0xFDFF or 0xFE70 <= o <= 0xFEFF

def nettoyer(texte):
    if not texte:
        return texte
    out = []
    for ch in texte:
        if est_presentation_arabe(ch):
            continue
        out.append(ch)
    s = "".join(out)
    for src, dst in REGLES:
        s = s.replace(src, dst)
    for src, dst in REGLES_FINALES:
        s = s.replace(src, dst)
    # tirets entre mots arabizi : "el-khobz" -> "el khobz"
    s = s.replace("-", " ")
    # espaces multiples
    s = " ".join(s.split())
    return s

def est_conforme(texte):
    if not texte:
        return True
    return not any(ch in INTERDITS or est_presentation_arabe(ch) for ch in texte)

def traiter(backup=False):
    total = modif = 0
    rapport = []
    for nom in FICHIERS:
        p = CORPUS / nom
        donnees = json.loads(p.read_text(encoding="utf-8"))
        modifs = 0
        for e in donnees:
            latin = e.get("lat", "")
            if not latin:
                continue
            total += 1
            if not est_conforme(latin):
                original = latin
                nouveau = nettoyer(latin)
                if nouveau != original:
                    if "latOriginal" not in e:
                        e["latOriginal"] = original
                    e["lat"] = nouveau
                    modifs += 1
                    modif += 1
        rapport.append((nom, len(donnees), modifs))
        if backup and modifs:
            shutil.copy2(p, p.with_suffix(".json.orig"))
        p.write_text(json.dumps(donnees, ensure_ascii=False, indent=2), encoding="utf-8")
    return total, modif, rapport

def verifier():
    total = nonconf = 0
    exemples = []
    for nom in FICHIERS:
        donnees = json.loads((CORPUS / nom).read_text(encoding="utf-8"))
        for e in donnees:
            latin = e.get("lat", "")
            if not latin:
                continue
            total += 1
            if not est_conforme(latin):
                nonconf += 1
                if len(exemples) < 12:
                    exemples.append((nom, e.get("fr", "")[:20], latin[:45]))
    return total, nonconf, exemples

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--backup", action="store_true")
    args = ap.parse_args()

    if args.check or not args.write:
        total, nonconf, ex = verifier()
        print(f"VERIFICATION — {total} entrees avec translitteration")
        print(f"  non conformes a la charte : {nonconf}")
        for nom, fr, lat in ex:
            print(f"    {nom:20} {fr:22} {lat}")
        if nonconf == 0:
            print("  OK : 0 caractere hors charte")
    else:
        avant = verifier()[1]
        total, modif, rapport = traiter(backup=args.backup)
        apres = verifier()[1]
        print(f"CONVERSION — {total} entrees traitees, {modif} modifiees")
        for nom, n, m in rapport:
            print(f"  {nom:24} {n:6} entrees | {m:5} modifiees")
        print(f"  non conformes : {avant} -> {apres}")
