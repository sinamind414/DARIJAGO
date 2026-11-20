# Règles projet — APPLICATION DARIJAGO

## Discipline de travail (inspiré de Karpathy — rédigé localement, licence source absente)

- **Penser avant de coder.** Énoncer les hypothèses ; si plusieurs lectures sont possibles,
  les présenter au lieu de choisir silencieusement. Si quelque chose est flou, s'arrêter et demander.
- **Simplicité d'abord.** Le minimum de code qui résout le problème. Pas de fonctionnalités,
  abstractions ou « flexibilité » non demandées. Si 200 lignes peuvent faire 50, réécrire.
- **Modifications chirurgicales.** Toucher uniquement à ce qui est nécessaire. Ne pas « améliorer »
  le code voisin, ne pas reformater, ne pas refactorer ce qui fonctionne. Si du code mort est
  repéré sans lien avec la tâche, le signaler plutôt que de le supprimer.
- **Exécuter par objectifs vérifiables.** Transformer chaque tâche en critère mesurable
  (ex. « corriger le bug » → « écrire un test qui le reproduit, puis le faire passer »).
  Pour une tâche en plusieurs étapes, énoncer un plan court avec une vérification par étape.
- **Compiler et vérifier avant d'annoncer.** `npm run lint`, `npm run build` et un contrôle
  navigateur réel font partie de la définition de « terminé ».

## YouTube / yt-dlp

- Les outils yt-dlp servent exclusivement à enrichir la base pédagogique darija avec les contenus de **@speakalgerian** (autorisation d'usage éducatif déclarée le 16/11/2026, à confirmer par écrit — voir `analyse-speak-algerian/AUTORISATION.md`).
- N'extrais ou ne télécharge jamais de contenu d'une autre chaîne ou protégé sans autorisation.
- Enregistrer les fichiers dans `analyse-speak-algerian/` (et non dans Downloads) pour qu'ils alimentent directement le pipeline :
  1. `python scripts/traiter_video.py "<fichier>" --titre "..." --lien "..."` → transcription Whisper → SRT + JSONL
  2. Import automatique dans `db/speakalgerian.sqlite` (provenance + droits inclus)
- Crédit obligatoire dans l'app : « Contenu pédagogique adapté de @speakalgerian, avec autorisation ».
- Les fichiers audio bruts ne sont pas redistribués ; seuls les segments relus par un locuteur natif (`status: app_ready`) sont publiés.
