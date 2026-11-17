# -*- coding: utf-8 -*-
import sqlite3, sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
root = Path(r"C:\Users\zakaria\Documents\APPLICATION DARIJAGO\projet-darija")
for db in sorted(root.rglob("*.sqlite")):
    print(f"\n=== {db.relative_to(root)} ({db.stat().st_size//1024} Ko) ===")
    try:
        conn = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
        for (name,) in conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
            cols = list(conn.execute(f"PRAGMA table_info('{name}')"))
            blob = [c[1] for c in cols if 'BLOB' in (c[2] or '').upper()]
            audio = [c[1] for c in cols if any(k in c[1].lower() for k in ('audio','wav','mp3','voice','son','pronon'))]
            n = conn.execute(f"SELECT COUNT(*) FROM '{name}'").fetchone()[0]
            flag = ""
            if blob or audio: flag = f"  <-- BLOB={blob} AUDIO={audio}"
            print(f"  {name}: {n} lignes{flag}")
        conn.close()
    except Exception as e:
        print("  ERREUR:", e)
