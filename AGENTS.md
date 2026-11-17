# Règles projet — APPLICATION DARIJAGO

## YouTube / yt-dlp

- Les outils yt-dlp servent exclusivement à enrichir la base pédagogique darija avec les contenus de **@speakalgerian** (autorisation d'usage éducatif déclarée le 16/11/2026, à confirmer par écrit — voir `analyse-speak-algerian/AUTORISATION.md`).
- N'extrais ou ne télécharge jamais de contenu d'une autre chaîne ou protégé sans autorisation.
- Enregistrer les fichiers dans `analyse-speak-algerian/` (et non dans Downloads) pour qu'ils alimentent directement le pipeline :
  1. `python scripts/traiter_video.py "<fichier>" --titre "..." --lien "..."` → transcription Whisper → SRT + JSONL
  2. Import automatique dans `db/speakalgerian.sqlite` (provenance + droits inclus)
- Crédit obligatoire dans l'app : « Contenu pédagogique adapté de @speakalgerian, avec autorisation ».
- Les fichiers audio bruts ne sont pas redistribués ; seuls les segments relus par un locuteur natif (`status: app_ready`) sont publiés.
