# -*- coding: utf-8 -*-
import json, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
segs = [json.loads(l) for l in open("D1_djamel_15_expressions.jsonl", encoding="utf-8-sig") if l.strip()]
debut, fin = 22000, 34000
parts = [s for s in segs if s["fin_ms"] > debut and s["debut_ms"] < fin]
for s in parts:
    print(f'[{s["debut_ms"]/1000:6.2f} -> {s["fin_ms"]/1000:6.2f}] {s["texte_brut"]}')
print("\nTEXTE EXACT:")
print(" ".join(s["texte_brut"] for s in parts))