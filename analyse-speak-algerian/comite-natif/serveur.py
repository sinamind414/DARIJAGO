# -*- coding: utf-8 -*-
"""Serveur du comite de relecture native (R3) sur http://127.0.0.1:3920.

Double validation : un item passe app_ready quand au moins 2 relecteurs de
regions differentes ont vote valide / valide_avec_correction.
"""
import json
import sqlite3
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

sys.stdout.reconfigure(encoding="utf-8")
BASE = Path(__file__).resolve().parent
DB = BASE / "comite.db"
HTML = BASE / "index.html"
PORT = 3920
VERDICTS = {"valide", "valide_avec_correction", "a_revoir", "rejete"}


def cx():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c


def recalculer(c, iid):
    n = c.execute("""
        SELECT COUNT(DISTINCT r.region) FROM votes v
        JOIN reviewers r ON r.reviewer_id=v.reviewer_id
        WHERE v.item_id=? AND v.verdict IN ('valide','valide_avec_correction')
    """, (iid,)).fetchone()[0]
    statut = "app_ready" if n >= 2 else "needs_review"
    c.execute("UPDATE items SET status=? WHERE item_id=?", (statut, iid))
    return statut, n


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _json(self, data, code=200):
        b = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        u = urlparse(self.path)
        if u.path in ("/", "/index.html"):
            b = HTML.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers()
            self.wfile.write(b)
            return
        if u.path == "/api/reviewers":
            c = cx()
            rows = [dict(r) for r in c.execute("SELECT * FROM reviewers ORDER BY region")]
            c.close()
            self._json({"reviewers": rows})
            return
        if u.path == "/api/items":
            q = parse_qs(u.query)
            rid = q.get("reviewer_id", [None])[0]
            c = cx()
            rows = []
            for r in c.execute("SELECT * FROM items ORDER BY type, item_id"):
                d = dict(r)
                d["votes"] = [dict(v) for v in c.execute(
                    "SELECT verdict, reviewer_id, ar_corrige, note_regionale FROM votes WHERE item_id=?",
                    (d["item_id"],))]
                d["nb_valides"] = c.execute("""
                    SELECT COUNT(DISTINCT r2.region) FROM votes v2
                    JOIN reviewers r2 ON r2.reviewer_id=v2.reviewer_id
                    WHERE v2.item_id=? AND v2.verdict IN ('valide','valide_avec_correction')
                """, (d["item_id"],)).fetchone()[0]
                if rid:
                    mon = next((v for v in d["votes"] if str(v["reviewer_id"]) == str(rid)), None)
                    d["monVote"] = mon
                rows.append(d)
            c.close()
            self._json({"items": rows, "total": len(rows)})
            return
        self._json({"error": "route inconnue"}, 404)

    def do_POST(self):
        if urlparse(self.path).path != "/api/vote":
            self._json({"error": "route inconnue"}, 404)
            return
        try:
            n = int(self.headers.get("Content-Length", "0"))
            d = json.loads(self.rfile.read(n).decode("utf-8"))
            iid = d["item_id"]
            rid = int(d["reviewer_id"])
            verdict = d["verdict"]
            if verdict not in VERDICTS:
                self._json({"error": "verdict invalide"}, 400)
                return
            c = cx()
            c.execute("""INSERT INTO votes(item_id,reviewer_id,verdict,ar_corrige,latin_corrige,note_regionale)
                          VALUES (?,?,?,?,?,?)
                          ON CONFLICT(item_id,reviewer_id) DO UPDATE SET
                            verdict=excluded.verdict, ar_corrige=excluded.ar_corrige,
                            latin_corrige=excluded.latin_corrige,
                            note_regionale=excluded.note_regionale, created_at=datetime('now')""",
                      (iid, rid, verdict, d.get("ar_corrige", ""),
                       d.get("latin_corrige", ""), d.get("note_regionale", "")))
            statut, nb = recalculer(c, iid)
            c.commit()
            c.close()
            self._json({"ok": True, "item_id": iid, "status": statut, "nb_regions_valides": nb})
        except Exception as e:
            self._json({"error": str(e)}, 500)


if __name__ == "__main__":
    print(f"Comite natif : http://127.0.0.1:{PORT}/")
    c = cx()
    print("items:", c.execute("SELECT COUNT(*) FROM items").fetchone()[0],
          "| relecteurs:", c.execute("SELECT COUNT(*) FROM reviewers").fetchone()[0])
    c.close()
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
