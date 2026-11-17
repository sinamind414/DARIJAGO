# -*- coding: utf-8 -*-
"""Cherche des fenetres vocales propres de 10-20 s dans une transcription JSONL."""
import json, sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
p = sys.argv[1] if len(sys.argv) > 1 else "D1_djamel_15_expressions.jsonl"
segs = [json.loads(l) for l in open(p, encoding="utf-8-sig") if l.strip()]
segs.sort(key=lambda s: s["debut_ms"])

print(f"Segments: {len(segs)} | duree: {segs[-1]['fin_ms']/1000:.1f}s")
print("=== fenetres candidates (12-18 s de parole continue) ===")
for i in range(len(segs)):
    debut = segs[i]["debut_ms"]
    for j in range(i + 1, len(segs)):
        duree = segs[j]["fin_ms"] - debut
        if duree > 18000:
            break
        if duree < 12000:
            continue
        # verifier continuite : pas de trou > 1,2 s
        trous = [segs[k+1]["debut_ms"] - segs[k]["fin_ms"] for k in range(i, j)]
        if max(trous or [0]) > 1200:
            continue
        texte = " ".join(s["texte_brut"] for s in segs[i:j+1])
        # favoriser les segments avec beaucoup de texte arabe
        arabes = sum(1 for c in texte if "\u0600" <= c <= "\u06ff")
        if arabes < 30:
            continue
        print(f"[{debut/1000:7.2f} -> {segs[j]['fin_ms']/1000:7.2f}] {duree/1000:5.1f}s | ar={arabes:4} | {texte[:110]}")
        break
