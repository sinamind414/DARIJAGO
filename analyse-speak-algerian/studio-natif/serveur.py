# -*- coding: utf-8 -*-
"""Studio voix native (R4) sur http://127.0.0.1:3930.

- /api/phrases : les 42 phrases de lecon (arabe + latin + francais)
- /api/creer-profil : multipart -> POST /profiles de VoiceStudio
- /api/generer : genere les 42 clips avec le profil cree, dans public/audio/natif/
"""
import json
import sys
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

sys.stdout.reconfigure(encoding="utf-8")
BASE = Path(__file__).resolve().parent
HTML = BASE / "index.html"
ITEMS = BASE.parent / "comite-natif" / "items-a-valider.json"
APP = BASE.parent.parent / "darijago-—-apprendre-la-darija-algérienne final 16112026"
SORTIE = APP / "public" / "audio" / "natif"
VS = "http://127.0.0.1:3900"
KEY = "darijago-local-2026"
PORT = 3930

phrases = [i for i in json.loads(ITEMS.read_text(encoding="utf-8"))["items"] if i["type"] == "phrase"]


def post_vs(path, data, headers=None, timeout=180):
    h = {"Authorization": f"Bearer {KEY}"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(VS + path, data=data, headers=h, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _json(self, data, code=200):
        b = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        p = urlparse(self.path).path
        if p in ("/", "/index.html"):
            b = HTML.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers()
            self.wfile.write(b)
            return
        if p == "/api/phrases":
            self._json({"phrases": [
                {"id": x["id"], "latin": x["latin"], "arabic": x["arabic"],
                 "french": x.get("french", ""), "source": x.get("source", "")}
                for x in phrases
            ]})
            return
        self._json({"error": "route inconnue"}, 404)

    def do_POST(self):
        p = urlparse(self.path).path
        n = int(self.headers.get("Content-Length", "0"))
        corps = self.rfile.read(n)
        try:
            if p == "/api/creer-profil":
                # Transfert multipart tel quel vers VoiceStudio
                ct = self.headers.get("Content-Type", "")
                boundary = ct.split("boundary=")[-1].strip().strip('"')
                # reconstruire le multipart avec le bon nom de champ deja present
                resultat = post_vs("/profiles", corps, {"Content-Type": ct}, timeout=300)
                self._json({"ok": True, "id": resultat.get("id"), "name": resultat.get("name")})
                return
            if p == "/api/generer":
                d = json.loads(corps.decode("utf-8"))
                voice = d["voice"]
                SORTIE.mkdir(parents=True, exist_ok=True)
                manifest = {"version": 1, "voice": voice, "type": "voix_native_clonee", "clips": []}
                ok = 0
                for i, ph in enumerate(phrases, 1):
                    req_body = json.dumps({
                        "model": "omnivoice",
                        "input": ph["arabic"],
                        "voice": voice,
                        "language": "arq",
                        "response_format": "mp3",
                        "speed": 0.85,
                    }).encode("utf-8")
                    try:
                        rq = urllib.request.Request(
                            VS + "/v1/audio/speech", data=req_body,
                            headers={"Content-Type": "application/json",
                                     "Authorization": f"Bearer {KEY}"},
                            method="POST")
                        with urllib.request.urlopen(rq, timeout=180) as r:
                            audio = r.read()
                        if len(audio) < 1000:
                            continue
                        nom = f"{i:02d}.mp3"
                        (SORTIE / nom).write_bytes(audio)
                        manifest["clips"].append({
                            "id": ph["id"], "ar": ph["arabic"], "lat": ph["latin"],
                            "file": f"/audio/natif/{nom}", "bytes": len(audio),
                        })
                        ok += 1
                    except Exception as e:
                        print(f"  echec {i}: {e}", flush=True)
                (SORTIE / "manifest.json").write_text(
                    json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
                self._json({"ok": True, "generes": ok, "total": len(phrases)})
                return
        except Exception as e:
            self._json({"error": str(e)}, 500)
            return
        self._json({"error": "route inconnue"}, 404)


if __name__ == "__main__":
    print(f"Studio voix native : http://127.0.0.1:{PORT}/")
    print(f"{len(phrases)} phrases chargees")
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
