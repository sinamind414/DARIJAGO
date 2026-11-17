# Bilan voix off — darijaGO (16/11/2026)

## Résultat : couverture audio 100 % — 0 texte manquant

Voix retenue : **OmniVoice locale, profil `71dfdfc1` (« Yasmine »)**, générée sur RTX 3060 via VoiceStudio.
Aucun appel API à l'usage : tous les clips sont servis statiquement depuis `public/audio/yasmine/`.

### Couverture par rubrique

| Rubrique | Textes jouables | Couverts | Manquants |
|---|---:|---:|---:|
| Phrases leçon | 42 | 42 | 0 |
| Mots de décomposition | 121 | 121 | 0 |
| Sons arabizi | 6 | 6 | 0 |
| Mots-clés histoires | 3 | 3 | 0 |
| Répliques dialogues | 16 | 16 | 0 |
| Exemples grammaire | 15 | 15 | 0 |
| Dictionnaire | 7 083 | 7 083 | 0 |
| Conjugaison (triple canonique) | 6 907 | 6 907 | 0 |
| **Total** | **14 093** | **14 093** | **0** |

**6 706 clips** dans `public/audio/yasmine/manifest.json` (~220 Mo).

### Décision conjugaison

Le bouton « Écouter les 8 pers. » jouait 18 cellules par verbe (165 768 clips ≈ 5 Go / 2 jours).
Il joue désormais **le triple canonique** (`نوطّي، وطّيت، وطّى`) en un seul clip — 6 888 verbes étaient déjà couverts par les clips du dictionnaire (même chaîne, normalisation `/` → `، `), 19 clips seulement ont été générés pour compléter.
Libellé changé en « Écouter le verbe » dans 7 langues.

### Vérifications réelles

- `npm run lint` (tsc --noEmit) → ✅
- `npm run build` (Vite) → ✅
- `npx tsx scripts/verifier-audio-app.ts` → **TOTAL MANQUANT : 0**
- Navigateur `localhost:3000` → Parcours > Table de conjugaison : bouton « Écouter le verbe » présent ; clic → lecture d'un fichier audio, **`speechSynthesis` jamais appelé** (0 voix navigateur).
- Contrôle Whisper sur 7 clips : arabe bien prononcé (Whisper approxime les lettres à chadda : `نهدّ` → « ندهد », mais l'audio est bien la voix Yasmine).

### Clips natifs des 672 segments vidéo (17/11/2026)

En plus des 6 706 clips Yasmine, **672 clips de son réel** ont été extraits des 7 sources vidéo
(`extraire-segments.py`, ffmpeg, marge de 0,10 s autour de chaque segment Whisper) :
- Emplacement : `analyse-speak-algerian/clips-segments/` — **11,1 Mo**, 0 échec
- Manifeste : `analyse-speak-algerian/clips-segments/manifest.json` (segment_id, source, créateur, timings, texte, statut)
- **Pas de TTS** : voix native authentique des deux chaînes autorisées
- **Non publiés dans l'app** : `status: needs_review`

#### ⚠️ Correction importante (vérification du 17/11)
La première vérification disait « langue arabe détectée » — **c'était faux** : `transcrire_verif.py` forçait `language="ar"`.
Une vraie détection (sans forçage, 8 clips par source) donne :

| Source | Langue réelle dominante |
|---|---|
| speakalgerian A1 | anglais (6/8) |
| speakalgerian A2 | anglais (7/8) |
| speakalgerian A3 | anglais (8/8) |
| speakalgerian B1 | arabe (7/8) ✅ |
| djamel D1 | mixte arabe/français |
| djamel D2 | indéterminé (clips très courts) |
| djamel D3 | français (7/8) |

**Conclusion : ces vidéos sont des cours de darija expliqués en anglais/français, pas du contenu audio arabe.**
Les 672 `text_raw` de la base ont été transcrits en forçant l'arabe → ils sont donc erronés.
Ces clips ne doivent **pas** servir de voix off darija. Le lecteur de relecture créé pour eux est à repenser.

### Lecteur de relecture native (17/11/2026)

Outil local : `analyse-speak-algerian/relecture/serveur.py` + `index.html`, sur **http://127.0.0.1:3910/**.
- Liste des 672 segments, filtres par source et par statut, lecture à **0,7×**
- Champs éditables : texte corrigé, translittération, arabe propre, traduction, notes
- Boutons Valider (`app_ready`) / Corriger et valider / Rejeter ; raccourcis Espace, Entrée, ← →
- Les validations écrivent directement dans `speakalgerian.sqlite`
- Vérifié : API 672 segments, audio servu à 0,7×, cycle validation/annulation sans donnée résiduelle

### Points de vigilance

- Licence OmniVoice **CC-BY-NC** : usage éducatif non commercial. Pour une distribution commerciale ou un moteur « à la demande » embarqué, tester **ZONOS3-Mini (Apache 2.0)** en WebGPU.
- Tout le contenu issu du corpus et des vidéos reste `needs_review` jusqu'à validation par un locuteur natif.
- Les 4 corpus importés (19 433 entrées) sont sous droit : usage interne/recherche uniquement.
