# -*- coding: utf-8 -*-
"""
Transcription locale Whisper -> SRT + JSON d'index pour la base darija.

Usage :
    python transcrire.py ma_video.mp4
    python transcrire.py ma_video.mp4 --modele small --langue ar --lien "https://..."
    python transcrire.py ma_video.mp4 --sortie dossier_sortie

Prerequis :
    pip install faster-whisper
    ffmpeg installe et accessible dans le PATH
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

from faster_whisper import WhisperModel

# --- Compat PyAV >= 14 : 'metadata_errors' a ete supprime de av.open ---
# faster-whisper 1.2.1 le passe encore ; on le retire proprement a l'execution.
import av as _av
import faster_whisper.transcribe as _fwt
from faster_whisper.audio import decode_audio as _decode_audio_orig

def _decode_audio_compat(*args, **kwargs):
    _orig_open = _av.open
    def _open_compat(*a, **kw):
        kw.pop("metadata_errors", None)
        return _orig_open(*a, **kw)
    _av.open = _open_compat
    try:
        return _decode_audio_orig(*args, **kwargs)
    finally:
        _av.open = _orig_open

_fwt.decode_audio = _decode_audio_compat
# --- Fin compat ---

MODELES_VALIDES = ("tiny", "base", "small", "medium", "large-v3")


def horodatage(ms: int) -> str:
    h, reste = divmod(ms, 3_600_000)
    m, reste = divmod(reste, 60_000)
    s, ms = divmod(reste, 1_000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def horodatage_srt(ms: int) -> str:
    h, reste = divmod(ms, 3_600_000)
    m, reste = divmod(reste, 60_000)
    s, ms = divmod(reste, 1_000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def main() -> int:
    parser = argparse.ArgumentParser(description="Transcription Whisper locale pour la base darija")
    parser.add_argument("fichier", help="Chemin de la video ou de l'audio (mp4, mp3, wav, m4a...)")
    parser.add_argument("--modele", default="medium", choices=MODELES_VALIDES,
                        help="Taille du modele (defaut: medium ; small = plus rapide)")
    parser.add_argument("--langue", default="ar", help="Code langue (ar = arabe, auto = detection)")
    parser.add_argument("--lien", default="", help="Lien de la video source (YouTube, URL...) pour l'index")
    parser.add_argument("--source", default="", help="Nom de la source / createur")
    parser.add_argument("--sortie", default="", help="Dossier de sortie (defaut: meme dossier que le fichier)")
    args = parser.parse_args()

    chemin = Path(args.fichier)
    if not chemin.exists():
        print(f"ERREUR : fichier introuvable : {chemin}")
        return 1

    dossier_sortie = Path(args.sortie) if args.sortie else chemin.parent
    dossier_sortie.mkdir(parents=True, exist_ok=True)
    stem = chemin.stem

    fichier_srt = dossier_sortie / f"{stem}.srt"
    fichier_json = dossier_sortie / f"{stem}.json"

    print(f"Modele : {args.modele} | Langue : {args.langue} | Fichier : {chemin.name}")
    print("Chargement du modele (premier lancement : telechargement)...")
    modele = WhisperModel(args.modele, device="cpu", compute_type="int8")

    langue = None if args.langue.lower() in ("auto", "") else args.langue
    print("Transcription en cours (peut prendre plusieurs minutes)...")
    segments, info = modele.transcribe(
        str(chemin),
        language=langue,
        vad_filter=True,
    )

    print(f"Langue detectee : {info.language} (proba {info.language_probability:.2f})")

    enregistrements = []
    lignes_srt = []

    for numero, segment in enumerate(segments, 1):
        debut_ms = int(segment.start * 1000)
        fin_ms = int(segment.end * 1000)
        texte = segment.text.strip()

        # SRT : transcription brute sans correction
        lignes_srt.append(f"{numero}")
        lignes_srt.append(f"{horodatage_srt(debut_ms)} --> {horodatage_srt(fin_ms)}")
        lignes_srt.append(texte)
        lignes_srt.append("")

        # JSON : index pour la base darija
        enregistrements.append({
            "id": numero,
            "debut_ms": debut_ms,
            "fin_ms": fin_ms,
            "debut": horodatage(debut_ms),
            "fin": horodatage(fin_ms),
            "texte_brut": texte,          # transcription automatique, NON corrigee
            "texte_corrige": None,        # a remplir apres relecture locuteur natif
            "latin": None,                # phonetique arabizi (3, 7, 9)
            "francais": None,             # traduction
            "notes": None,
        })

    # Ecriture SRT
    fichier_srt.write_text("\n".join(lignes_srt), encoding="utf-8")

    # Ecriture JSON d'index
    index = {
        "fichier_source": chemin.name,
        "lien_source": args.lien,
        "source_createur": args.source,
        "droits": "A VERIFIER - ne pas integrer les audios originaux sans autorisation explicite",
        "modele_whisper": args.modele,
        "langue_detectee": info.language,
        "langue_probabilite": round(info.language_probability, 3),
        "duree_audio_s": round(info.duration, 1),
        "date_transcription": datetime.now().isoformat(timespec="seconds"),
        "nb_segments": len(enregistrements),
        "statut_validation": "needs_review",
        "segments": enregistrements,
    }
    fichier_json.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")

    print()
    print(f"OK - {len(enregistrements)} segments")
    print(f"SRT  : {fichier_srt}")
    print(f"JSON : {fichier_json}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
