# Chantier R4 — Studio voix native (18/11/2026)

Demande : recommandation R4 des audits — « enregistrer de vraies voix natives,
2 voix (femme/homme), 2 régions, débit naturel + lent ».

## Constat
- Le clonage Djamel précédent avait échoué car la référence était **extraite d'une vidéo YouTube
  bruitée** (mélange arabe/français, musique) → `ref_text` approximatif.
- Seuls 4 / 42 phrases sont couvertes par les segments natifs existants (faible recouvrement).
- `reference-native-darija.wav` (13,7 s) est également un mélange arabe/français → pas utilisable
  comme référence propre.

## Livré — Studio d'enregistrement natif
**http://127.0.0.1:3930/**

Fichiers : `analyse-speak-algerian/studio-natif/{index.html, serveur.py}`

Fonctions :
- **Feuille de route des 42 phrases** (arabe + latin + français), navigation
- **Enregistrement micro** navigateur (annulation d'écho + réduction de bruit)
- **Écoute et validation** de chaque prise
- **Concaténation** des prises en une référence WAV propre
- **Création du profil vocal** via `POST /profiles` de VoiceStudio (kind=clone, language=Arabic)
- **Génération des 42 clips** avec le profil créé → `public/audio/natif/` + manifeste
- Métadonnées : identité du locuteur, région (Alger/Oran/Constantine/Sud), sexe

## Vérification réelle
- API `/api/phrases` : 42 phrases chargées ✅
- Interface navigateur : arabe affiché correctement (`السلام عليكم، واش راك؟`) ✅
- Enregistrement / concaténation / génération : à faire par un **vrai locuteur** (micro requis)

## Pourquoi c'est la bonne approche
Contrairement au clonage depuis YouTube, la référence est **enregistrée proprement au micro**
sans musique ni bruit, avec le texte exact lu par le locuteur — condition indispensable pour que
OmniVoice produise une voix clonée intelligible. Le locuteur garde le contrôle et peut réécouter
chaque prise avant création du profil.

## Limites
- Nécessite un **vrai locuteur natif** et un micro (je ne peux pas enregistrer à sa place).
- OmniVoice reste **CC-BY-NC** → la voix clonée reste non commerciale. Pour le commercial,
  refaire la même opération avec **ZONOS3-Mini (Apache 2.0)** une fois testé.
- Le consentement écrit du locuteur doit être archivé avant création du profil
  (déjà le cas pour le cousin Djamel ; à faire pour tout nouveau locuteur).

## État des recommandations des audits
| Recommandation | Statut |
|---|---|
| R1 Bascule d'écriture | ✅ fait |
| R2 Charte transcription | ✅ fait |
| R3 Comité natif | ✅ fait (outil prêt) |
| R4 Voix natives | 🟢 **outil prêt, en attente d'un locuteur réel** |
