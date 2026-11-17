# -*- coding: utf-8 -*-
"""Lecteur local de relecture native des 672 segments audio.

Usage : python analyse-speak-algerian/relecture/serveur.py
Puis ouvrir http://127.0.0.1:3910/

Les validations ecrivent directement dans db/speakalgerian.sqlite
(status app_ready / rejected, textes corriges et notes).
"""
import json
import re
import sqlite3
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

sys.stdout.reconfigure(encoding="utf-8")

BASE = Path(__file__).resolve().parents[1]
DB = BASE / "db" / "speakalgerian.sqlite"
CLIPS = BASE / "clips-segments"
HTML = Path(__file__).resolve().parent / "index.html"
PORT = 3910

STATUTS = {"needs_review", "app_ready", "rejected"}
CHAMPS = {
    "status": str,
    "text_corrected": str,
    "text_latin": str,
    "text_ar": str,
    "french": str,
    "notes": str,
}


def segments():
    cx = sqlite3.connect(DB)
    cx.row_factory = sqlite3.Row
    lignes = cx.execute(
        """
        SELECT s.*, src.creator AS creator, src.title AS source_title
        FROM audio_segments s
        JOIN sources src ON src.source_id = s.source_id
        ORDER BY s.source_id, s.segment_no
        """
    ).fetchall()
    cx.close()
    out = []
    for r in lignes:
        d = dict(r)
        d["file"] = f"/audio/{d['source_id']}/{d['segment_no']:04d}.mp3"
        out.append(d)
    return out


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def _json(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _erreur(self, msg, code=400):
        self._json({"ok": False, "error": msg}, code)

    def do_GET(self):
        chemin = urlparse(self.path).path
        if chemin in ("/", "/index.html"):
            body = HTML.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if chemin == "/api/segments":
            try:
                donnees = segments()
                self._json({
                    "segments": donnees,
                    "counts": {
                        s: sum(1 for d in donnees if d["status"] == s) for s in STATUTS
                    },
                })
            except Exception as e:
                self._erreur(str(e), 500)
            return
        if chemin.startswith("/audio/"):
            rel = unquote(chemin[len("/audio/"):])
            cible = (CLIPS / rel).resolve()
            if CLIPS.resolve() not in cible.parents or not cible.is_file():
                self._erreur("audio introuvable", 404)
                return
            donnees = cible.read_bytes()
            debut, fin = 0, len(donnees) - 1
            code = 200
            entete = self.headers.get("Range")
            if entete:
                m = re.match(r"bytes=(\d+)-(\d*)", entete)
                if m:
                    debut = int(m.group(1))
                    fin = int(m.group(2)) if m.group(2) else fin
                    fin = min(fin, len(donnees) - 1)
                    code = 206
            self.send_response(code)
            self.send_header("Content-Type", "audio/mpeg")
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Length", str(fin - debut + 1))
            if code == 206:
                self.send_header("Content-Range", f"bytes {debut}-{fin}/{len(donnees)}")
            self.end_headers()
            self.wfile.write(donnees[debut:fin + 1])
            return
        self._erreur("route inconnue", 404)

    def do_POST(self):
        if urlparse(self.path).path != "/api/review":
            self._erreur("route inconnue", 404)
            return
        try:
            taille = int(self.headers.get("Content-Length", "0"))
            corps = json.loads(self.rfile.read(taille).decode("utf-8"))
            sid = int(corps["segment_id"])
            statut = corps.get("status")
            if statut not in STATUTS:
                self._erreur("statut invalide")
                return
            affectations = ["status = ?"]
            valeurs = [statut]
            for champ, typ in CHAMPS.items():
                if champ == "status" or champ not in corps:
                    continue
                affectations.append(f"{champ} = ?")
                valeurs.append(typ(corps[champ]))
            valeurs.append(sid)
            cx = sqlite3.connect(DB)
            cx.execute(
                f"UPDATE audio_segments SET {', '.join(affectations)} WHERE segment_id = ?",
                valeurs,
            )
            cx.commit()
            cx.close()
            self._json({"ok": True, "segment_id": sid, "status": statut})
        except Exception as e:
            self._erreur(str(e), 500)


if __name__ == "__main__":
    if not HTML.exists() or not DB.exists() or not CLIPS.exists():
        print("Fichiers manquants (index.html, base ou clips)")
        sys.exit(1)
    print(f"Lecteur de relecture : http://127.0.0.1:{PORT}/")
    print(f"{len(segments())} segments charges")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
