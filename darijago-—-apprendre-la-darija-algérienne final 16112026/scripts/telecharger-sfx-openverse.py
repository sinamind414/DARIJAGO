# -*- coding: utf-8 -*-
"""Telecharge 8 sons CC0 depuis Openverse pour darijaGO (verifie le 20/11/2026).

Sortie : public/assets/sfx/<nom>.mp3 + manifest.json avec attributions.
"""
import json, sys, urllib.parse, urllib.request
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")

OUT = Path("public/assets/sfx")
OUT.mkdir(parents=True, exist_ok=True)

SELECTION = [
    ("ui_click",        "https://cdn.freesound.org/previews/528/528561_10360410-hq.mp3", "Soft UI Button Click",        "freesound", "aa763a9d"),
    ("ui_success",      "https://cdn.freesound.org/previews/380/380482_6512973-hq.mp3",  "Chime Notification",          "freesound", "adb6e260"),
    ("ui_correct",      "https://cdn.freesound.org/previews/528/528957_10334845-hq.mp3", "Correct Answer / That's Right!","freesound", "59594111"),
    ("ui_wrong",        "https://cdn.freesound.org/previews/650/650842_11771918-hq.mp3", "Wrong Answer Buzzer",         "freesound", "51d8f7dd"),
    ("ui_notification", "https://cdn.freesound.org/previews/571/571511_2226836-hq.mp3",  "Soft-Notification Bell LowDing","freesound", "03cfa89b"),
    ("amb_souk",        "https://cdn.freesound.org/previews/139/139981_2228523-hq.mp3",  "Market environment",          "freesound", "9c31e792"),
    ("amb_cafe",        "https://cdn.freesound.org/previews/509/509950_4458028-hq.mp3",  "Bustling Cafe Ambience",      "freesound", "57ae06e1"),
    ("amb_tea",         "https://cdn.freesound.org/previews/240/240125_1061768-hq.mp3",  "Tea Pouring",                 "freesound", "9d101746"),
]

manifest = {"version": 1, "source": "Openverse API", "license": "CC0 1.0", "sounds": []}

for nom, url, titre, provider, prefix in SELECTION:
    dest = OUT / f"{nom}.mp3"
    print(f"\n>>> {nom} : {titre}")
    # attribution depuis l'API
    attribution = f'"{titre}" via Openverse (CC0 1.0)'
    creator = "unknown"
    oid = ""
    try:
        q = urllib.parse.urlencode({"q": titre, "license": "cc0", "page_size": 10})
        req = urllib.request.Request("https://api.openverse.org/v1/audio/?" + q,
                                     headers={"User-Agent": "darijago/1.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode("utf-8"))
        match = next((x for x in data.get("results", []) if x.get("url") == url), None)
        if match:
            attribution = match.get("attribution", attribution)
            creator = match.get("creator", "unknown")
            oid = match.get("id", "")
    except Exception as e:
        print(f"   (metadata API: {e})")

    try:
        req2 = urllib.request.Request(url, headers={"User-Agent": "darijago/1.0"})
        with urllib.request.urlopen(req2, timeout=45) as r:
            contenu = r.read()
        if len(contenu) < 2000:
            print("   TROP COURT, ignore")
            continue
        dest.write_bytes(contenu)
        manifest["sounds"].append({
            "id": nom, "title": titre, "creator": creator, "openverseId": oid,
            "file": f"/assets/sfx/{nom}.mp3", "bytes": len(contenu),
            "license": "cc0", "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
            "attribution": attribution, "provider": provider,
        })
        print(f"   OK {len(contenu)} octets — {creator}")
    except Exception as e:
        print(f"   ECHEC: {e}")

(OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
total = sum(s['bytes'] for s in manifest['sounds'])
print(f"\n=== TOTAL : {len(manifest['sounds'])} sons, {total/1024:.0f} Ko ===")
