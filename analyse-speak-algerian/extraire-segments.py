# -*- coding: utf-8 -*-
"""Extrait les 672 segments audio reels des sources video (pas de TTS).

Les fichiers restent dans clips-segments/ et ne sont PAS publies dans l'app :
ils servent a la relecture native (status needs_review dans la base).
"""
import json
import sqlite3
import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

BASE = Path(__file__).resolve().parent
DB = BASE / "db" / "speakalgerian.sqlite"
OUT = BASE / "clips-segments"
PADDING = 0.10  # secondes de marge autour de chaque segment Whisper

cx = sqlite3.connect(DB)
cx.row_factory = sqlite3.Row
sources = {r["source_id"]: r for r in cx.execute("SELECT * FROM sources")}
segments = list(cx.execute("SELECT * FROM audio_segments ORDER BY source_id, segment_no"))

fichiers = {}
for src in sources.values():
    cible = BASE / src["filename"]
    if not cible.exists():
        cible = BASE / (src["source_id"].split("_", 1)[-1] + ".m4a")
    fichiers[src["source_id"]] = cible if cible.exists() else None

manquant = [s for s, f in fichiers.items() if f is None]
if manquant:
    print("FICHIERS SOURCE ABSENTS:", manquant)
    sys.exit(1)

OUT.mkdir(exist_ok=True)
manifest = []
ok = echecs = 0

for seg in segments:
    src = seg["source_id"]
    dossier = OUT / src
    dossier.mkdir(exist_ok=True)
    dest = dossier / f"{seg['segment_no']:04d}.mp3"

    debut = max(0, seg["start_ms"] / 1000 - PADDING)
    fin = seg["end_ms"] / 1000 + PADDING
    cmd = [
        "ffmpeg", "-y", "-v", "error",
        "-i", str(fichiers[src]),
        "-ss", f"{debut:.3f}", "-to", f"{fin:.3f}",
        "-vn", "-ac", "1", "-ar", "24000",
        "-c:a", "libmp3lame", "-q:a", "5",
        str(dest),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0 or not dest.exists() or dest.stat().st_size < 500:
        echecs += 1
        print("ECHEC", src, seg["segment_no"], r.stderr[:120])
        continue
    ok += 1
    manifest.append({
        "segment_id": seg["segment_id"],
        "source_id": src,
        "creator": sources[src]["creator"],
        "segment_no": seg["segment_no"],
        "start_ms": seg["start_ms"],
        "end_ms": seg["end_ms"],
        "text_raw": seg["text_raw"],
        "status": seg["status"],
        "file": str(dest.relative_to(BASE)).replace("\\", "/"),
        "bytes": dest.stat().st_size,
    })

(OUT / "manifest.json").write_text(
    json.dumps({
        "version": 1,
        "type": "extraction_audio_natif",
        "note": "Son reel extrait des videos sources. needs_review : non publiable sans relecture native.",
        "total": len(manifest),
        "clips": manifest,
    }, ensure_ascii=False, indent=2),
    encoding="utf-8",
)
print(f"Termine : {ok} clips extraits, {echecs} echecs, {len(manifest)} dans le manifeste.")
