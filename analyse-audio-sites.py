# -*- coding: utf-8 -*-
"""Inventaire des points d'ecoute (playDarijaPronunciation / PhrasePlayButton) par composant."""
from pathlib import Path
import re

root = Path(r"C:\Users\zakaria\Documents\APPLICATION DARIJAGO\darijago-—-apprendre-la-darija-algérienne final 16112026\src\components")
for f in sorted(root.glob("*.tsx")):
    lig = f.read_text(encoding="utf-8").splitlines()
    hits = [i for i, l in enumerate(lig) if "playDarijaPronunciation" in l or "<PhrasePlayButton" in l]
    if not hits:
        continue
    print(f"\n{'='*70}\n{f.name} ({len(hits)} point(s) d'ecoute)")
    for i in hits:
        debut = max(0, i - 7)
        fin = min(len(lig), i + 10)
        print(f"  --- lignes {debut+1}-{fin} ---")
        for n in range(debut, fin):
            marque = ">>" if n == i else "  "
            print(f"  {marque} {n+1:4}: {lig[n][:150]}")
