# Chantier transcription unique — Bilan (18/11/2026)

Demande : recommandation R2 de l'audit CLAUDE OPUS 5.5 MAX — « Une seule convention de transcription ».

## Livré

### 1. Charte de transcription — `CHARTE-TRANSCRIPTION.md` (v1.0)
- Un seul système : **arabizi darijaGO**, sans diacritique, tapable au clavier.
- Les **6 sons clés** codés `3 / 7 / 9 / kh / gh / ch`.
- Table de conversion complète des 4 systèmes historiques :
  Arabizi · phonétique FR · Ben Sedira 1910 (`ɛ æ`) · Tadjer/Tapiéro (`ā ṣ ḍ ṭ š ḥ`).
- Critère de conformité automatisable : **0 caractère hors charte**.

### 2. Moteur de conversion — `scripts/normaliser-transcription.py`
- Modes `--check` (rapport) et `--write` (+ `--backup`).
- **Idempotent** (vérifié : 2e passage = 0 modification).
- Conserve `latOriginal` dans chaque entrée pour la provenance.

## Résultats mesurés

| Corpus | Entrées | Converties |
|---|---:|---:|
| Ben Sedira 1910 | 9 622 | 0 |
| Tadjer 2010-2012 | 1 707 | **884** |
| Tapiéro 1978 | 981 | **453** |
| AZIRI 2012 | 7 123 | 0 |
| **Total** | **19 433** | **1 337** |

- Caractères non conformes : **1 337 → 0**
- Vérification dans l'app : `ktâb` → **`ktab`**, `šems` → **`chems`**, `wâš` → **`wach`**
- `npm run lint` ✅ · `npm run build` ✅
- Sauvegardes : `*.json.orig` dans `src/data/corpus/`

## Exemples avant / après

| Avant | Après |
|---|---|
| `ktâb` | `ktab` |
| `šems` | `chems` |
| `wâš` | `wach` |
| `mûḥal` | `mu7al` |
| `sḥiḥ` | `s7i7` |
| `mrîḍ` | `mrid` |
| `mussex` | `mussekh` |

## Limites (à valider par un natif)
- `ḥ` → `7` systématique : à confirmer mot par mot en relecture native.
- `ɛ` → `3` : choix par défaut, certains mots peuvent préférer `a`/`e`.
- Les contenus restent **`needs_review`** — cette conversion n'est qu'un premier jet mécanique.
