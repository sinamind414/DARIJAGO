#!/usr/bin/env python3
"""Transcription locale avec horodatage via faster-whisper.
Usage: python3 transcrire_darija.py chemin/vers/audio.mp3 --model medium --language ar
"""
import argparse
import json
from pathlib import Path
from faster_whisper import WhisperModel


def stamp(seconds: float) -> str:
    ms = round(seconds * 1000)
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def main():
    p = argparse.ArgumentParser(description="Transcrire un audio darija avec horodatages.")
    p.add_argument("audio", type=Path, help="Fichier audio/vidéo local autorisé")
    p.add_argument("--model", default="medium", choices=["small", "medium", "large-v3"], help="Taille/qualité; le modèle se télécharge au premier lancement")
    p.add_argument("--language", default="ar", help="Code de langue Whisper (ar par défaut; la darija peut être mal reconnue)")
    p.add_argument("--out", type=Path, default=None, help="Préfixe de sortie (défaut: nom du fichier source)")
    args = p.parse_args()
    if not args.audio.is_file():
        p.error(f"Fichier introuvable : {args.audio}")
    out = args.out or args.audio.with_suffix("")
    out.parent.mkdir(parents=True, exist_ok=True)

    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    segments, info = model.transcribe(str(args.audio), language=args.language, vad_filter=True, beam_size=5)
    rows = []
    for i, seg in enumerate(segments, 1):
        rows.append({"segment": i, "start": round(seg.start, 3), "end": round(seg.end, 3), "text_raw": seg.text.strip(), "review_status": "needs_human_review"})
    with out.with_suffix(".jsonl").open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    with out.with_suffix(".srt").open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(f"{row['segment']}\n{stamp(row['start'])} --> {stamp(row['end'])}\n{row['text_raw']}\n\n")
    print(f"Langue détectée/choisie : {info.language} (probabilité {info.language_probability:.2f})")
    print(f"Segments : {len(rows)}")
    print(f"Sorties : {out.with_suffix('.srt')} et {out.with_suffix('.jsonl')}")
    print("Important : transcription automatique non validée; relire la darija avec un locuteur natif.")


if __name__ == "__main__":
    main()
