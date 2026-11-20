# -*- coding: utf-8 -*-
"""Telecharge une selection de sons CC0 depuis Openverse pour darijaGO.

Usage : python scripts/telecharger-sfx-openverse.py
Sortie : public/assets/sfx/<nom>.mp3 + manifest.json (attributions CC0)
"""
import json, sys, urllib.request
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8")

OUT = Path("public/assets/sfx")
OUT.mkdir(parents=True, exist_ok=True)

# Selection verifiee via l'API Openverse (license=cc0), URLs des previews MP3
SELECTION = [
    ("ui_click",       "aa763a9d-...", "https://cdn.freesound.org/previews/528/528561_10360410-hq.mp3", "Soft UI Button Click", "freesound"),
    ("ui_success",     "adb6e260-...", "https://cdn.freesound.org/previews/380/380482_6512973-hq.mp3", "Chime Notification", "freesound"),
    ("ui_correct",     "59594111-...", "https://cdn.freesound.org/previews/528/528957_10334845-hq.mp3", "Correct Answer / That's Right!", "freesound"),
    ("ui_wrong",       "51d8f7dd-...", "https://cdn.freesound.org/previews/650/650842_11771918-hq.mp3", "Wrong Answer Buzzer", "freesound"),
    ("ui_notification","03cfa89b-...", "https://cdn.freesound.org/previews/571/571511_2226836-hq.mp3", "Soft-Notification Bell LowDing", "freesound"),
    ("amb_souk",       "9c31e792-...", "https://cdn.freesound.org/previews/139/139981_2228523-hq.mp3", "Market environment", "freesound"),
    ("amb_cafe",       "57ae06e1-...", "https://cdn.freesound.org/previews/509/509950_4458028-hq.mp3", "Bustling Cafe Ambience", "freesound"),
    ("amb_tea",        "9d101746-...", "https://cdn.freesound.org/previews/240/240125_1061768-hq.mp3", "Tea Pouring", "freesound"),
]

# Recuperer les vraies metadonnees (attribution complete) depuis l'API
import urllib.parse
manifest = {"version": 1, "source": "Openverse API", "license": "CC0 1.0", "sounds": []}

for nom, _, url, titre, provider in SELECTION:
    dest = OUT / f"{nom}.mp3"
    print(f"\n>>> {nom} : {titre}")
    # attribution depuis l'API detail (on retrouve l'id via recherche du titre)
    try:
        q = urllib.parse.urlencode({"q": titre, "license": "cc0", "page_size": 5})
        req = urllib.request.Request("https://api.openverse.org/v1/audio/?" + q,
                                     headers={"User-Agent": "darijago/1.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode("utf-8"))
        match = next((x for x in data.get("results", []) if x.get("url") == url), None)
        attribution = match.get("attribution", f'"{titre}" via Openverse (CC0 1.0)') if match else f'"{titre}" via Openverse (CC0 1.0)'
        creator = match.get("creator", "unknown") if match else "unknown"
        oid = match.get("id", "") if match else ""
    except Exception as e:
        print("   (metadata API indisponible, attribution generique)")
        attribution = f'"{titre}" via Openverse (CC0 1.0)'
        creator, oid = "unknown", ""

    # telechargement
    try:
        req2 = urllib.request.Request(url, headers={"User-Agent": "darijago/1.0"})
        with urllib.request.urlopen(req2, timeout=30) as r:
            contenu = r.read()
        if len(contenu) < 2000:
            print("   TROP COURT, ignore"); continue
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
print(f"\n=== TOTAL : {len(manifest['sounds'])} sons, {sum(s['bytes'] for s in manifest['sounds'])/1024:.0f} Ko ===")
