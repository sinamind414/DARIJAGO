# -*- coding: utf-8 -*-
"""Apercu de la base speakalgerian : usage = python apercu.py [nb_segments]"""
import sqlite3
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
DB = Path(__file__).resolve().parent.parent / "db" / "speakalgerian.sqlite"
limite = int(sys.argv[1]) if len(sys.argv) > 1 else 10
offset = int(sys.argv[2]) if len(sys.argv) > 2 else 0

conn = sqlite3.connect(DB)
cur = conn.cursor()
print("SOURCES :")
for row in cur.execute("SELECT source_id, title FROM sources"):
    print("  -", row)

print(f"\nSEGMENTS ({limite} a partir de #{offset + 1}) :")
for row in cur.execute(
    "SELECT segment_no, start_time, text_raw FROM audio_segments ORDER BY source_id, segment_no LIMIT ? OFFSET ?",
    (limite, offset),
):
    print(f"  #{row[0]:>3} [{row[1]}] {row[2]}")

n = cur.execute("SELECT COUNT(*) FROM audio_segments").fetchone()[0]
nr = cur.execute("SELECT COUNT(*) FROM audio_segments WHERE status='needs_review'").fetchone()[0]
print(f"\nTotal : {n} segments | needs_review : {nr}")
conn.close()
