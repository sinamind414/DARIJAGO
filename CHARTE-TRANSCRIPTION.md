# Charte de transcription — darijaGO

**Version 1.0 — 18/11/2026**
Système unique d'écriture latine de la darija algérienne, utilisé dans toute l'application
(cartes, quiz, dialogues, dictionnaire, conjugaison, audio).

Objectif : **un seul système, lisible par un débutant francophone, tapable au clavier AZERTY,
sans caractère spécial** (aucun diacritique sémitique, aucun symbole réservé aux linguistes).

---

## 1. Règle d'or

> **Tout texte latin affiché à l'apprenant doit être en arabizi darijaGO.**
> Les transcriptions savantes des sources (Ben Sedira 1910, Tapiéro, Tadjer) sont des
> **données internes** : elles sont converties automatiquement avant affichage.

Critère automatique de conformité (dans les tests) :

```
0 caractère hors charte dans les champs affichés (ar / arabizi / latin).
```

Caractères **interdits** à l'affichage : `ɛ æ ǽ ḥ ṣ ḍ ṭ ẓ ḫ ġ š ā ē ī ū â î û ö ÿ ñ ç`
(sauf `ç`, `é`, `è`, `à`, `ù`, `ê`, `œ` tolérés dans les **définitions françaises** uniquement).

---

## 2. Les 6 sons clés (chiffres arabizi)

| Chiffre | Lettre arabe | Son | Équivalent français | Exemple darijaGO |
|:---:|---|---|---|---|
| **3** | ع | ʕ (pharyngale) | gorge serrée, « a » avalé | `3afak` = s'il te plaît |
| **7** | ح | ħ (pharyngale sourde) | « h » soufflé, tendu | `7lib` = lait |
| **9** | ق | q/q' (uvulaire) | « k » du fond de gorge | `9hwa` = café |
| **kh** | خ | x (velaire sourde) | « ch » de *Bach* / *jota* | `khobz` = pain |
| **gh** | غ | ɣ (velaire voisée) | « r » grasseyé parisien | `ghalya` = chère |
| **ch** | ش | ʃ | « ch » de *chat* | `chrit` = j'ai acheté |

Lettres arabizi complémentaires :

| Latin | Arabe | Remarque |
|---|---|---|
| `h` | ه | « h » simple |
| `r` | ر | « r » roulé (sauf `gh`) |
| `s` | س | toujours « s » (jamais « z ») |
| `z` | ز | « z » |
| `t` / `d` | ت / د | — |
| `q` | ق | **réservé** aux cas où `9` n'est pas voulu (rare) |

---

## 3. Voyelles

| Convention | Usage | Exemple |
|---|---|---|
| `a` | voyelle « a » | `ktab` = livre |
| `i` | voyelle « i » | `fhemt` = j'ai compris |
| `u` | voyelle « u » | `koul` = mange |
| `e` | « e » bref (schwa) | `bshhal` = combien |
| **Pas de voyelle longue marquée** | `ā ē ī ū` interdits → écrire la voyelle simple | `mûḥal` → `mohal`, `mrîḍ` → `mrid` |

Les voyelles longues de l'arabe standard (ā, ī, ū) **ne sont pas notées** : la darija ne les
prononce pas toutes, et le débutant n'a pas à les distinguer à l'écrit.

---

## 4. Table de conversion automatique (sources → arabizi darijaGO)

Le script `scripts/normaliser-transcription.py` applique **exactement** ces règles :

| Source / caractère | → darijaGO | Note |
|---|---|---|
| `ḥ` (U+1E25) | `7` ou `h` selon le mot | voir exceptions |
| `ṣ` (U+1E63) | `s` | |
| `ḍ` (U+1E0D) | `d` | |
| `ṭ` (U+1E6D) | `t` | |
| `ẓ` (U+1E90) | `z` | |
| `ḫ` (U+1E2B) | `kh` | |
| `ġ` (U+0121) | `gh` | |
| `š` (U+0161) | `ch` | |
| `ā` (U+0101) | `a` | voyelle longue non notée |
| `ē` (U+0113) | `e` | |
| `ī` (U+012B) | `i` | |
| `ū` (U+016B) | `u` | |
| `â` (U+00E2) | `a` | |
| `î` (U+00EE) | `i` | |
| `û` (U+00FB) | `u` | |
| `ɛ` (U+025B) | `e` ou `a` selon contexte | Ben Sedira : « h· » |
| `æ` / `ǽ` (U+00E6 / U+01FD) | `a` | Ben Sedira : « ǽ » |
| `ε` (U+03B5) | `e` | |
| `ǥ` (U+01E5) | `gh` | |
| `ṯ` (U+1E6F) | `t` | |
| `ḏ` (U+1E0F) | `d` | |
| caractères de présentation arabes (U+FB50–FDFF, U+FE70–FEFF) | supprimés | artefacts d'OCR, doublons du champ arabe |

---

## 5. Ponctuation et mise en forme

- **Pas de tiret** entre préfixe et mot : `el-khobz` → `el khobz`, `ma-fhemt-ch` → `ma fhemtch`.
- Apostrophe uniquement pour l'élision arabe : `h’alib` → `h'alib` (apostrophe droite `'`).
- Négation : `ma … ch` accolé au verbe → `ma fhemtch`.
- Possession : `ta3` (ex. `el kitab ta3i`).
- Chiffres arabizi (3, 7, 9) conservés **tels quels** — jamais remplacés par des lettres.

---

## 6. Exemples avant / après

| Avant (source) | Après (darijaGO) |
|---|---|
| `ktâb` (Tapiéro) | `ktab` |
| `šems` (Tapiéro) | `chmes` |
| `wâš` (Tapiéro) | `wach` |
| `mûḥal` (Tadjer) | `mohal` |
| `mrîḍ` (Tadjer) | `mrid` |
| `ḥurr` (Tadjer) | `h'urr` / `7orr` |
| `h·absi` (Ben Sedira) | `habssi` |
| `ǽna` (Ben Sedira) | `ana` |
| `el-khobz` (curriculum) | `el khobz` |

---

## 7. Gouvernance

- Toute nouvelle entrée de corpus doit être **convertie** avant intégration.
- Le script de conversion est **idempotent** et testable (`0 caractère hors charte`).
- Les exceptions de prononciation réelles (`ḥ` → `7` ou `h`) sont **validées par un locuteur
  natif** (statut `app_ready`) — la conversion automatique est un premier jet, pas une vérité.
- Versionné : toute évolution de la charte incrémente `Version x.y`.