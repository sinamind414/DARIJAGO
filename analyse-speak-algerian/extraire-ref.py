# -*- coding: utf-8 -*-
import json, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
p = r"C:\Users\zakaria\Documents\APPLICATION DARIJAGO\analyse-speak-algerian\A1_hello_1.jsonl"
lignes = [json.loads(l) for l in open(p, encoding="utf-8-sig") if l.strip()]
for seg in lignes:
    if 18000 <= seg["debut_ms"] <= 33000:
        print(f'[{seg["debut_ms"]/1000:6.2f}] {seg["texte_brut"]}')
