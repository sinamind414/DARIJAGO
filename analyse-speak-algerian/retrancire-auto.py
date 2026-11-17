# -*- coding: utf-8 -*-
"""Re-transcrit les 672 segments avec detection automatique de langue.
RELENABLE : reprend depuis le checkpoint transcriptions-auto.json.
"""
import gc
import json
import os
import sqlite3
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

import av
import av.container.core as core
_orig_open = core.open

def _patched_open(*args, **kwargs):
    kwargs.pop("metadata_errors", None)
    return _orig_open(*args, **kwargs)

core.open = _patched_open
av.open = _patched_open

from faster_whisper import WhisperModel

BASE = Path(__file__).resolve().parent
DB = BASE / "db" / "speakalgerian.sqlite"
MANIFEST = BASE / "clips-segments" / "manifest.json"
RAPPORT = BASE / "transcriptions-auto.json"

clips = json.loads(MANIFEST.read_text(encoding="utf-8"))["clips"]
cx = sqlite3.connect(DB)
colonnes = [r[1] for r in cx.execute("PRAGMA table_info(audio_segments)")]
for nom, typ in [("text_auto", "TEXT"), ("language_auto", "TEXT"), ("language_probability", "REAL")]:
    if nom not in colonnes:
        cx.execute(f"ALTER TABLE audio_segments ADD COLUMN {nom} {typ}")
cx.commit()

modele = WhisperModel("small", device="cpu", compute_type="int8")
resultats = []
if RAPPORT.exists():
    try:
        anciens = json.loads(RAPPORT.read_text(encoding="utf-8")).get("clips", [])
        connus = {r["segment_id"] for r in anciens}
        resultats = [r for r in anciens if r.get("text_auto") is not None]
        print(f"Reprise : {len(resultats)} deja transcrits sur {len(clips)}", flush=True)
    except Exception as e:
        print("Checkpoint illisible, on repart de zero :", e, flush=True)

faits = {r["segment_id"] for r in resultats}
debut = time.time()

def transcrire(chemin, langue=None):
    segs, info = modele.transcribe(chemin, language=langue, vad_filter=False, beam_size=1)
    return " ".join(s.text.strip() for s in segs).strip(), info.language, float(info.language_probability), float(info.duration)

def sauvegarder():
    RAPPORT.write_text(json.dumps({"total": len(clips), "clips": resultats}, ensure_ascii=False, indent=2), encoding="utf-8")

for i, c in enumerate(clips, 1):
    if c["segment_id"] in faits:
        continue
    chemin = str(BASE / c["file"].replace("/", os.sep))
    txt, langue, proba, duree = transcrire(chemin)
    resultats.append({
        "segment_id": c["segment_id"],
        "source_id": c["source_id"],
        "segment_no": c["segment_no"],
        "language_auto": langue,
        "language_probability": round(proba, 3),
        "text_auto": txt,
        "duration_s": round(duree, 2),
        "file": c["file"],
        "corrige_par_source": False,
    })
    faits.add(c["segment_id"])
    cx.execute(
        "UPDATE audio_segments SET text_auto=?, language_auto=?, language_probability=? WHERE segment_id=?",
        (txt, langue, proba, c["segment_id"]),
    )
    if i % 25 == 0:
        cx.commit()
        sauvegarder()
        gc.collect()
        print(f"  {i}/{len(clips)} ({time.time()-debut:.0f}s)", flush=True)

cx.commit()
sauvegarder()
gc.collect()
print("1er passage termine. Correction des detections douteuses...", flush=True)

par_source = defaultdict(Counter)
for r in resultats:
    if r["language_probability"] >= 0.6 and r["language_auto"] in ("fr", "en", "ar"):
        par_source[r["source_id"]][r["language_auto"]] += 1
dominantes = {s: c.most_common(1)[0][0] for s, c in par_source.items() if c}
print("Langues dominantes :", dominantes, flush=True)

corriges = 0
for r in resultats:
    if r["language_probability"] >= 0.5 and r["language_auto"] in ("fr", "en", "ar"):
        continue
    langue = dominantes.get(r["source_id"])
    if not langue or r.get("corrige_par_source"):
        continue
    chemin = str(BASE / r["file"].replace("/", os.sep))
    txt, lang, proba, duree = transcrire(chemin, langue=langue)
    r.update({
        "language_auto": lang,
        "language_probability": round(proba, 3),
        "text_auto": txt,
        "duration_s": round(duree, 2),
        "corrige_par_source": True,
    })
    cx.execute(
        "UPDATE audio_segments SET text_auto=?, language_auto=?, language_probability=? WHERE segment_id=?",
        (txt, lang, proba, r["segment_id"]),
    )
    corriges += 1
    if corriges % 25 == 0:
        cx.commit()
        sauvegarder()
        gc.collect()

cx.commit()
cx.close()
RAPPORT.write_text(json.dumps({
    "total": len(resultats),
    "langues_dominantes": dominantes,
    "corriges_par_source": corriges,
    "clips": resultats,
}, ensure_ascii=False, indent=2), encoding="utf-8")

print("\n=== BILAN ===", flush=True)
for langue, n in Counter(r["language_auto"] for r in resultats).most_common():
    print(f"  {langue:5} {n:4}", flush=True)
print(f"Corriges par source : {corriges}", flush=True)
print(f"Duree : {time.time()-debut:.0f}s", flush=True)
