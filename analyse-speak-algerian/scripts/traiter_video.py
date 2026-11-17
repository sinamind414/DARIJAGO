# -*- coding: utf-8 -*-
"""
Pipeline complet en une commande : transcription Whisper -> import SQLite.

Usage :
    python scripts/traiter_video.py "ma_video.mp4"
    python scripts/traiter_video.py "ma_video.mp4" --modele small --titre "How to say HELLO" --lien "https://youtube.com/watch?v=..."

Ce que fait le script :
  1. Transcription locale (faster-whisper) -> .srt + .jsonl
  2. Import du .jsonl dans db/speakalgerian.sqlite (provenance + droits inclus)
  3. Resume : nb segments, statut, ou trouver les resultats
"""

import argparse
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SCRIPT_TRANS = BASE_DIR / "transcrire_darija.py"
SCRIPT_IMPORT = BASE_DIR / "scripts" / "importer_jsonl.py"


def main() -> int:
    parser = argparse.ArgumentParser(description="Pipeline : video -> transcription -> base SQLite")
    parser.add_argument("fichier", help="Video/audio place dans le dossier du projet")
    parser.add_argument("--modele", default="medium", help="tiny|base|small|medium|large-v3")
    parser.add_argument("--langue", default="ar", help="ar par defaut, auto sinon")
    parser.add_argument("--lien", default="", help="URL de la video source")
    parser.add_argument("--titre", default="", help="Titre de la video")
    args = parser.parse_args()

    chemin = Path(args.fichier)
    if not chemin.is_absolute():
        chemin = BASE_DIR / chemin
    if not chemin.exists():
        print(f"ERREUR : fichier introuvable : {chemin}")
        print(f"Placez la video dans : {BASE_DIR}")
        return 1

    print("=" * 60)
    print("ETAPE 1/2 : transcription Whisper")
    print("=" * 60)
    cmd_trans = [
        sys.executable, str(SCRIPT_TRANS), str(chemin),
        "--modele", args.modele, "--langue", args.langue,
    ]
    if args.lien:
        cmd_trans += ["--lien", args.lien]
    if args.titre:
        cmd_trans += ["--source", "speakalgerian"]

    retour = subprocess.run(cmd_trans, cwd=str(BASE_DIR))
    if retour.returncode != 0:
        print("ERREUR : la transcription a echoue.")
        return 1

    jsonl = chemin.with_suffix(".jsonl")
    if not jsonl.exists():
        print(f"ERREUR : {jsonl.name} non produit.")
        return 1

    print()
    print("=" * 60)
    print("ETAPE 2/2 : import en base")
    print("=" * 60)
    cmd_import = [sys.executable, str(SCRIPT_IMPORT), str(jsonl)]
    if args.lien:
        cmd_import += ["--lien", args.lien]
    if args.titre:
        cmd_import += ["--titre", args.titre]
    retour = subprocess.run(cmd_import, cwd=str(BASE_DIR))
    if retour.returncode != 0:
        print("ERREUR : l'import a echoue.")
        return 1

    print()
    print("=" * 60)
    print("TERMINE")
    print("=" * 60)
    print(f"SRT       : {chemin.with_suffix('.srt')}")
    print(f"JSONL     : {jsonl}")
    print(f"Base      : {BASE_DIR / 'db' / 'speakalgerian.sqlite'}")
    print("Suivant   : relecture locuteur natif (texte_corrige, latin, francais)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
