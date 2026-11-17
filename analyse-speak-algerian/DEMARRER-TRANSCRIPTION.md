# Transcrire des audios Speak Algerian (darija)

## Outil installé
`faster-whisper` 1.2.1, moteur local de reconnaissance vocale. Le script `transcrire_darija.py` produit des segments horodatés dans un fichier `.srt` (sous-titres) et un `.jsonl` (données à intégrer/revoir).

## À savoir avant de lancer
- Il faut avoir un fichier audio/vidéo local fourni par la créatrice ou couvert par l'autorisation d'utilisation. Le lien public seul ne donne pas un fichier audio prêt à intégrer.
- Au premier lancement, le modèle choisi est téléchargé. `medium` est un compromis; `large-v3` est plus lourd. Le CPU est utilisé.
- Whisper ne possède pas de garantie de qualité pour la darija algérienne : le résultat est un brouillon. Les segments gardent le texte brut et le statut `needs_human_review`.
- Le script transcrit en arabe (`--language ar`) par défaut. Pour une chaîne où le texte parlé est surtout en français/mixte, essayer `--language fr` sur une copie, comparer et vérifier manuellement. Le moteur ne convertit pas à lui seul la darija en translittération latine fiable.

## Utilisation
Dans un terminal, depuis ce dossier :

```bash
python3 transcrire_darija.py "/chemin/vers/video.mp4" --model medium --language ar
```

Ou avec les chemins de sortie explicités :

```bash
python3 transcrire_darija.py "/chemin/vers/audio.m4a" --model medium --language ar --out "sorties/video-01"
```

Le premier lancement télécharge les poids du modèle; il faut une connexion Internet. Ensuite le traitement est local. Les fichiers générés seront `sorties/video-01.srt` et `sorties/video-01.jsonl`.

## Procédure qualité avant intégration
1. Conserver l'identifiant et le lien de la vidéo ainsi que le nom du fichier source.
2. Générer SRT + JSONL.
3. Écouter chaque segment et corriger la transcription sans effacer le texte brut.
4. Faire relire par un locuteur algérien; ajouter région/registre quand c'est justifié.
5. Garder le timecode, la source et le statut de validation pour chaque segment.
6. N'intégrer dans la base applicative que les éléments autorisés et relus; ne pas publier les fichiers audio d'origine sans droits explicites couvrant la distribution dans l'application.

## Dépendance
`python3 -m pip install --user -r requirements-transcription.txt`
