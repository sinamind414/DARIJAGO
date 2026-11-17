# Comparatif — `projet-darija` vs application finale darijaGO

Analyse du 16/11/2026. Sources mesurées, pas estimées.

## 1. Rôle des deux ensembles

| | `projet-darija` | Application finale darijaGO |
|---|---|---|
| Nature | **Atelier de recherche / corpus** | **Application fonctionnelle** |
| Exécutable | Non (prototype `index.html` cliquable seulement) | Oui — Express + React, `localhost:3000` |
| Stockage | 4 bases SQLite + 1 892 fichiers txt OCR | Données embarquées en modules TypeScript (`src/data/`) |
| Public | Chercheur / préparateur de contenu | Apprenant (XP, quiz, parcours, dictionnaire) |
| Statut données | `needs_review` 100 %, `app_ready = 0` | À relire également ; audio surtout incomplet |

## 2. Volume de données

| Source | `projet-darija` (SQLite) | Application (TypeScript) | Écart |
|---|---:|---:|---|
| Ben Sedira 1910 | 9 622 mots | 7 083 mots | **−2 539** dans l'app |
| AZIRI | 7 123 locutions | 8 184 verbes (4 092 + 4 parts de 1 023) | périmètre différent (locutions vs verbes) |
| Tadjer | 1 707 entrées + 2 230 variantes | 382 verbes | l'app n'a qu'une fraction |
| Tapiéro | 850 vocabulaire, 30 leçons, 15 dialogues | 312 verbes, 5 sections de grammaire | l'app n'a qu'une fraction |
| Phrases de cours | — | **42 phrases** (7 modules × 6) | propre à l'app |
| Sons Arabizi | — | 6 | propre à l'app |
| Stories / dialogues | — | 4 scénarios | propre à l'app |

→ **Les deux ensembles ne sont pas redondants** : l'app contient une sous-partie structurée pour l'apprentissage, le projet contient le corpus brut complet avec des champs différents.

## 3. Audio — le point critique

| | `projet-darija` | Application | Pipeline `@speakalgerian` + Djamel |
|---|---|---|---|
| Fichiers audio | **0** | **7 clips MP3** (sur 42 phrases) | 672 segments dans `speakalgerian.sqlite` |
| Colonne `audio_path` | Existe dans `entry_forms` mais **table vide** | Manifest `public/audio/yasmine/manifest.json` | SRT + JSONL + provenance |
| Statut | Aucun audio natif validé | Voix Yasmine (Gemini) en cours de correction | 100 % `needs_review` |

**Conclusion : ni l'un ni l'autre ne contient une banque audio complète.** Les 672 segments du pipeline ne sont pas encore intégrés à l'app.

## 4. Forces / faiblesses

### `projet-darija`
+ Corpus riche et traçable (sources datées, pages, OCR, `needs_review`, sauvegardes)
+ Latin fiable chez Tadjer (1 639 entrées) → meilleur texte pour voix off
+ 15 dialogues bilingues du manuel Tapiéro
− Aucun audio, aucun produit utilisable par un apprenant
− Données non curées (`app_ready = 0`)

### Application darijaGO
+ Interface complète, gamifiée, multilingue (FR/EN/ES/DE/IT/NL/中文)
+ 42 phrases pédagogiques déjà structurées et ordonnées
+ Pack audio statique prévu (`public/audio/yasmine`) → zéro API à l'usage
− Seulement 7 voix off sur 42
− Données de dictionnaire réduites par rapport au corpus source
− Dépendance API Gemini en cours de suppression (quota épuisé, prompt corrigé, VoiceStudio local en installation)

## 5. Décision recommandée

1. **Garder `projet-darija` comme source de vérité** pour les mots et tournures (ne pas le supprimer).
2. **Utiliser l'app comme cible** : y générer et sauvegarder les fichiers audio (42 phrases d'abord, puis les mots Tadjer au latin fiable).
3. **Ne pas fusionner aveuglément** : les écarts de volume (Ben Sedira 9 622 vs 7 083) indiquent des extractions différentes — une réconciliation est nécessaire avant import.
4. **Audio local VoiceStudio** : faire un test unitaire, écoute, validation, puis génération en masse et sauvegarde dans `public/audio/yasmine/`.
