# Manuel d'arabe algérien moderne — Tapiéro

Source **séparée** du dictionnaire 1910.

- Livre : *Manuel d'arabe algérien moderne*, Norbert Tapiéro, Klincksieck, série linguistique 7.
- Édition : 1re 1971 / 2e 1978 / © Klincksieck 2002 — ISBN 2-252-03395-9.
- Structure de l'ouvrage : 30 leçons + 15 dialogues + glossaire.
- Parties attendues : **5**.
- Dossier source Drive : [DEUXIEME LIVRE DARIJA](https://drive.google.com/drive/folders/1wds9v7GwsIpDwMFSR3-m_oXm6BJ1LHR8).

## Avancement

| Partie | Fichier(s) Drive | Pages PDF | Pages imprimées | Leçons | État |
|---|---|---|---|---|---|
| 01 | `Manuel-arab-algerien-1.pdf` | 25 | 1 – 39 | 1 → 10, début 11 | **intégrée** |
| 02 | `-2-1.pdf`, `-2-2.pdf`, `-2-3.pdf` | 10 + 10 + 5 | 40 – 89 | fin 11, 12 → 21, début 22 | **intégrée** |
| 03 | `Manuel-arab-algerien-3.pdf` | 25 | 90 – 137 | fin 22, 23 → 30 ; glossaire p.129+ | **intégrée** |
| 04 | `Manuel-arab-algerien-4.pdf` | 25 | 138 – 187 | glossaires complets, index, dialogues I-VI | **intégrée** |
| 05 | `Manuel-arab-algerien-5.pdf` | 14 | 188 – 215 | dialogues VII-XV + table des matières | **intégrée** |

**Anomalie partie 03** : le spread imprimé 104/105 est scanné deux fois (pages PDF 8 et 9). La page PDF 9 est un doublon (`duplicate_of = 8`) et n'est pas ingérée. Plage imprimée unique 90–137 (48 demi-pages).

## Base et exports

- Base : `db/manuel.sqlite` — **LIVRE COMPLET** : 5 sources, 226 demi-pages, **30 leçons**, **850 vocabulaire**, **86 règles**, **97 exercices**, **30 textes indexés**, **15 dialogues**, 1140 tâches de relecture.
- Exports : `exports/partie-01/`, `exports/partie-02/`, `exports/partie-03/`, `exports/partie-04/`, `exports/partie-05/` (JSON + CSV + `counts.json`).
- Rapports : `review/partie-01-rapport.md`, `review/partie-02-rapport.md`, `review/partie-03-rapport.md`, `review/partie-04-rapport.md`, `review/partie-05-rapport.md`, `review/nettoyage-partie-02.json`, `review/nettoyage-partie-03.json`.
- Sauvegarde : `backups/manuel-apres-partie-05.sqlite` (une seule sauvegarde, la plus récente).
- Référence agent : `../agent-darija/references/manuel-partie-01.md`, `-partie-02.md`, `-partie-03.md`, `-partie-04.md`, `-partie-05.md`.
- Glossaire : `ocr/partie-03-glossaire/` (OCR 4 colonnes, référence seulement, non fusionné ; à cross-checker après partie 05).
- Aucune archive ZIP conservée : redondante avec le dossier et avec la sauvegarde Drive.

## Statut qualité

Toutes les entrées sont `needs_review`. `app_ready = 0`.
Aucune publication dans l'application sans validation par un locuteur natif **et** droits/licence.
Les textes des leçons sont **indexés** (titre + provenance), jamais transcrits automatiquement.

## Sources PDF

Les PDF sont conservés sur Drive. Localement, seule la partie 01 est gardée dans `raw/` ;
les PDF des parties 02 et 03 ont été supprimés après vérification MD5 (copies conformes sur Drive).
`manifest.json` conserve les empreintes SHA256/MD5 et les identifiants Drive de chaque segment.

## Pipeline

```bash
# 1) OCR colonnes (adapter la pagination à la partie)
python scripts/ocr_colonnes.py --pdf raw/partie-NN.pdf --out ocr/partie-NN-colonnes \
  --workers 3 --front-matter-max 0 --printed-left-first <page imprimée gauche de la 1re page>

# cas de la partie 02 (3 segments) : script dédié
bash scripts/ocr_partie02.sh

# 2) ingestion curée (un script par partie, idempotent)
python scripts/ingerer_manuel.py            # partie 01
python scripts/ingerer_manuel_partie02.py   # partie 02
python scripts/ingerer_manuel_partie03.py   # partie 03
python scripts/ingerer_manuel_partie04.py   # partie 04
python scripts/ingerer_manuel_partie05.py   # partie 05

# 3) nettoyage
python scripts/nettoyer_manuel.py
```

Pagination :
- partie 01 : `pdf >= 7` → gauche `2n-12`, droite `2n-11` ; `pdf 6` droite = 1.
- partie 02 : gauche `2n+38`, droite `2n+39` (n = 1…25, segments confondus).
- partie 03 : `pdf <= 8` → gauche `2n+88`, droite `2n+89` ; `pdf 9` = doublon (ignoré) ; `pdf >= 10` → gauche `2n+86`, droite `2n+87`.
- partie 04 : gauche `2n+136`, droite `2n+137` (n = 1…25).
- partie 05 : gauche `2n+186`, droite `2n+187` (n = 1…14).

**Livre complet.** Ne jamais réimporter une partie déjà intégrée (vérifier SHA/MD5).
Passe ouverte : fusion glossaire→vocabulaire (pluriels/genres/sens + lookup FR→DZ) puis validation native avant publication.
