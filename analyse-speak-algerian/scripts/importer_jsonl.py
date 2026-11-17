# -*- coding: utf-8 -*-
"""
Import JSONL Whisper -> SQLite corpus @speakalgerian.

Usage :
    python importer_jsonl.py transcription.jsonl
    python importer_jsonl.py transcription.jsonl --lien "https://..." --titre "Lecon 1"
    python importer_jsonl.py dossier/            # importe tous les .jsonl du dossier

Creer/mettre a jour la base :
    sqlite3 db/speakalgerian.sqlite < db/schema.sql   (ou laisse le script le faire)
"""

import argparse
import hashlib
import json
import sqlite3
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "db" / "speakalgerian.sqlite"
SCHEMA_PATH = BASE_DIR / "db" / "schema.sql"

DROITS_SPEAKALGERIAN = "Usage educatif autorise par la creatrice @speakalgerian (16/11/2026, voir AUTORISATION.md)"
DROITS_DJAMEL = "Usage educatif autorise par le createur @parleralgerienavecdjamel, cousin du porteur du projet (16/11/2026, voir AUTORISATION.md)"
CREATORS = {
    "speakalgerian": DROITS_SPEAKALGERIAN,
    "parleralgerienavecdjamel": DROITS_DJAMEL,
}


def droits_pour(createur: str) -> str:
    return CREATORS.get(createur, f"Usage educatif autorise par @{createur} (voir AUTORISATION.md)")


def ensure_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not DB_PATH.exists():
        conn = sqlite3.connect(DB_PATH)
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        conn.commit()
        conn.close()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for bloc in iter(lambda: f.read(1 << 20), b""):
            h.update(bloc)
    return h.hexdigest()


def find_media(jsonl_path: Path) -> Path | None:
    """Cherche le media associe : meme nom, .mp4/.mp3/.wav/.m4a/.mkv."""
    for ext in (".mp4", ".mp3", ".wav", ".m4a", ".mkv", ".webm", ".mpga"):
        candidat = jsonl_path.with_suffix(ext)
        if candidat.exists():
            return candidat
    return None


def importer(jsonl_path: Path, lien: str, titre: str, createur: str, conn: sqlite3.Connection) -> int:
    lignes = [json.loads(l) for l in jsonl_path.read_text(encoding="utf-8-sig").splitlines() if l.strip()]
    if not lignes:
        print(f"  VIDE, ignore : {jsonl_path.name}")
        return 0

    premier = lignes[0]
    fichier_media = premier.get("fichier_source") or jsonl_path.stem
    media_local = find_media(jsonl_path)

    if media_local:
        empreinte = sha256_file(media_local)
        filename = media_local.name
    else:
        empreinte = hashlib.sha256(fichier_media.encode("utf-8")).hexdigest()
        filename = fichier_media
        print(f"  ATTENTION media local introuvable, empreinte derivee du nom.")

    source_id = f"{createur}_{jsonl_path.stem}"

    conn.execute(
        """
        INSERT INTO sources(source_id, creator, media_type, title, url, filename, sha256,
                            language_detected, whisper_model, rights_note, authorization_status)
        VALUES(?, ?, 'video', ?, ?, ?, ?, ?, ?, ?, 'declared')
        ON CONFLICT(source_id) DO UPDATE SET
            title=excluded.title, url=excluded.url, filename=excluded.filename,
            sha256=excluded.sha256, language_detected=excluded.language_detected,
            whisper_model=excluded.whisper_model
        """,
        (source_id, createur, titre or jsonl_path.stem, lien or premier.get("lien_source"), filename,
         empreinte, premier.get("langue_detectee"), premier.get("modele_whisper"), droits_pour(createur)),
    )

    nb = 0
    for seg in lignes:
        debut_ms, fin_ms = seg["debut_ms"], seg["fin_ms"]

        def ms_vers_srt(ms: int) -> str:
            h, r = divmod(ms, 3_600_000)
            m, r = divmod(r, 60_000)
            s, ms2 = divmod(r, 1_000)
            return f"{h:02}:{m:02}:{s:02},{ms2:03}"

        conn.execute(
            """
            INSERT INTO audio_segments(source_id, segment_no, start_ms, end_ms,
                                       start_time, end_time, text_raw,
                                       text_corrected, text_latin, text_ar, french,
                                       status, notes)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'needs_review', NULL)
            ON CONFLICT(source_id, segment_no) DO UPDATE SET
                text_raw=excluded.text_raw
            """,
            (source_id, seg["id"], debut_ms, fin_ms,
             ms_vers_srt(debut_ms), ms_vers_srt(fin_ms), seg["texte_brut"],
             seg.get("texte_corrige"), seg.get("latin"), seg.get("texte_ar"),
             seg.get("francais")),
        )
        nb += 1

    conn.execute(
        "INSERT INTO processing_runs(source_id, step, whisper_model, segments_count, finished_at)"
        " VALUES(?, 'import', ?, ?, datetime('now'))",
        (source_id, premier.get("modele_whisper"), nb),
    )
    conn.commit()
    print(f"  OK : {nb} segments -> {source_id}")
    return nb


def main() -> int:
    parser = argparse.ArgumentParser(description="Import JSONL -> SQLite speakalgerian")
    parser.add_argument("chemin", help="Fichier .jsonl ou dossier de .jsonl")
    parser.add_argument("--lien", default="", help="URL de la video source")
    parser.add_argument("--titre", default="", help="Titre de la video")
    parser.add_argument("--createur", default="speakalgerian",
                        help="Cane source (speakalgerian, parleralgerienavecdjamel...)")
    args = parser.parse_args()

    ensure_db()
    chemin = Path(args.chemin)
    if chemin.is_dir():
        fichiers = sorted(chemin.glob("*.jsonl"))
    elif chemin.suffix == ".jsonl" and chemin.exists():
        fichiers = [chemin]
    else:
        print(f"ERREUR : introuvable ou pas un .jsonl : {chemin}")
        return 1

    if not fichiers:
        print(f"Aucun .jsonl a importer dans {chemin}")
        return 1

    conn = sqlite3.connect(DB_PATH)
    try:
        total = 0
        for f in fichiers:
            print(f"Import : {f.name}")
            total += importer(f, args.lien, args.titre, args.createur, conn)

        curseur = conn.execute(
            "SELECT COUNT(*) FROM audio_segments WHERE status='needs_review'")
        restants = curseur.fetchone()[0]
        print(f"\nTotal segments importes : {total}")
        print(f"Segments needs_review en base : {restants}")
        print(f"Base : {DB_PATH}")
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
