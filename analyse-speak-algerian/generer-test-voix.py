# -*- coding: utf-8 -*-
"""Genere un clip de test avec la voix Yasmine (profil OmniVoice 71dfdfc1).

Usage : python generer-test-voix.py <fichier_texte.txt> [nom_sortie] [speed]
Le fichier texte doit etre UTF-8 et contenir uniquement ce qui doit etre prononce.
Sortie : test-voix/<nom_sortie>.mp3 (+ .txt)
"""
import sys
from pathlib import Path
from urllib.request import Request, urlopen

sys.stdout.reconfigure(encoding="utf-8")

BASE = Path(__file__).resolve().parent
OUT = BASE / "test-voix"
OUT.mkdir(exist_ok=True)

if len(sys.argv) < 2:
    print("Usage: python generer-test-voix.py <fichier_texte.txt> [nom_sortie] [speed]")
    sys.exit(1)

src = Path(sys.argv[1])
texte = src.read_text(encoding="utf-8").strip()
if not texte:
    print("Fichier texte vide")
    sys.exit(1)

nom = sys.argv[2] if len(sys.argv) > 2 else src.stem
speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0

corps = {
    "model": "omnivoice",
    "input": texte,
    "voice": "71dfdfc1",
    "language": "arq",
    "response_format": "mp3",
    "speed": speed,
}
req = Request(
    "http://127.0.0.1:3900/v1/audio/speech",
    data=__import__("json").dumps(corps, ensure_ascii=False).encode("utf-8"),
    headers={"Content-Type": "application/json", "Authorization": "Bearer darijago-local-2026"},
    method="POST",
)
with urlopen(req, timeout=120) as rep:
    donnees = rep.read()

if len(donnees) < 1000:
    print("Audio trop court, echec")
    sys.exit(1)

dest = OUT / (nom + ".mp3")
dest.write_bytes(donnees)
(OUT / (nom + ".txt")).write_text(texte, encoding="utf-8")
print("TEXTE :", texte)
print("FICHIER :", dest)
print("OCTETS :", len(donnees))
