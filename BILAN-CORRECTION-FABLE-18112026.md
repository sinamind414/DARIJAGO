# Correction linguistique FABLE — 24 findings (18/11/2026)

Demande : audit FABLE 5.2 XHIGH (commit 44bd604) — relevé mot par mot de 24 erreurs.

## Corrections appliquées

### Scénarios (L01–L16) — `src/data/curriculum.ts`
| ID | Avant | Après |
|---|---|---|
| L03 | `tjem3ek` / `el-batn` | `yewj3ek` / `kerchi rahi tewj3ni` |
| L04 | `l'29er` / `el-dwa` | `Ch7al ydir` / `eddwa` |
| L01 | `3afak` (marocain) | `men fadlek` |
| L02 | `نDIR` (chaîne corrompue) | `واش لازم ندير` |
| L05 | `El-karrossa` (charrette) | `Ettomobil 7absset` |
| L06 | `chmen che7a` | `ma 3labalich 3lach` |
| L07 | `m3a7` (inexistant) | `t9der t3awenni` |
| L10 | `sahit`/`صحيتي` genre mixte | `sa7it`/`صحيت` alignés |
| L08 | `Ma bghitech zouz chwiya` | `Baraka, sa7a! Chba3t` |
| L09 | `tfaddli` (sers-toi) | `Ya3tik essa7a` |
| L11 | `Min hiya?` | `Chkoun m3aya?` |
| L12 | `daba` (marocain) | `dorka` |
| L13 | `Mzyan`/`l'7orra` | `Saha`/`el 7ouma` |
| L14 | `R7mo llah 3likoum` | `3addama Allah ajrkoum` |
| L15 | `3ziz` (cher) | `s3ib` (difficile) |
| L16 | `y'gfar` | `yeghfer` |

### Tronc & charte (L17–L24)
- **L17** : `Sahit` → `Sa7it` (graphie unifiée avec 7)
- **L18** : 10 `q` → `9` dans les darijaLatin ; charte : **9 obligatoire pour ق**
- **L21** : `Chnou` → `Wachnou` (algérois), `eddarija`
- **L23** : traduction `Sma7li...` précisée (« tu permets ? »)
- **L24** : charte — exemple ع `3afak` → `3andi` ; voyelles corrigées (`kif` pour i, `fhemt` pour e)
- **L20/L22** : variantes régionales et unité 07 « Darija d'hier » — notées pour la relecture native (non appliquées au code, car demandant un arbitrage éditorial)

## Vérification réelle
- 0 chaîne arabe avec lettres latines ✅
- 0 occurrence des erreurs listées (karrossa, m3a7, tjem3, l'29er, Min hiya, Mzyan, daba, 3ziz, Chnou, Sahit, el-dwa) ✅
- `npm run lint` ✅ · `npm run build` ✅
- Comité natif régénéré : 97 items, 4 relecteurs ✅

## Limite
Mon avis reste critique sur 2 points de l'audit : L14 (formule de condoléances) et L20/L22
(étiquetage régional) méritent une **validation par un locuteur natif** avant d'être considérés
comme définitifs — c'est précisément le rôle du comité :3920.
