# Manuel d'arabe algérien moderne — partie 04/5

**Source** : Norbert Tapiéro, *Manuel d'arabe algérien moderne*, Klincksieck, série linguistique 7 — © Klincksieck 2002, ISBN 2-252-03395-9.
**Provenance** : Drive `DEUXIEME LIVRE DARIJA`, fichier `Manuel-arab-algerien-4.pdf` (`1GiiQyFH3GCL9k-leam8QdicbAXr_mm5O`).
**Statut** : ingérée, curée, `needs_review` — `app_ready = 0`.

---

## 1. Fichier vérifié

| Local | Drive | Pages PDF | Octets | MD5 |
|---|---|---|---|---|
| `raw/partie-04.pdf` | `Manuel-arab-algerien-4.pdf` | 25 | 10 900 199 | `8fb8903dfde56ce0eeb4408417ee0a01` |

SHA256 : `bb24082f5fbe5dc4d342e932f21695ad1403de516c4b28f5f0ce9a6c6b5ff4dd`. Absent de la base avant traitement.

## 2. Pagination

Doubles pages imprimées, **pas de doublon** sur cette partie :
```
gauche = 2n + 136 ; droite = 2n + 137   (n = 1…25)  →  138 … 187
```

## 3. Contenu

- **Glossaire arabe-français (fin)** p.138-149 : complète le glossaire commencé p.129 (partie 03). Désormais **complet** (A→Z + ɛ en fin).
- **Glossaire français-arabe** p.150-170 : index inverse pour lookup FR→DZ.
- **Index grammatical** p.171-173 : retrouve les § par thème.
- **Supplément de 15 dialogues** entre Maghrébins (vie des immigrés), avec traduction :
  | # | Titre | Arabe (p.) | Traduction (p.) | État |
  |---|---|---|---|---|
  | I | La famille et le logement | 177 | 178 | complete |
  | II | Mère de famille malade | 179 | 180 | complete |
  | III | La famille et l'école | 181 | 182 | complete |
  | IV | La préformation | 183 | 184 | complete |
  | V | L'alphabétisation | 185 | 186 | complete |
  | VI | La sécurité sociale | 187 | (188, partie 05) | partial |

Les dialogues VII→XV sont attendus en partie 05.

### Décision glossaires
Les deux glossaires étant désormais **complets**, ils sont conservés en **OCR de référence** (2 colonnes `ocr/partie-04-colonnes/` + 4 colonnes `ocr/partie-04-glossaire/` et `ocr/partie-03-glossaire/`) et **non fusionnés** au vocabulaire. Une **passe dédiée** de cross-check/fusion (pluriels, genres, sens, lookup FR→DZ) sera exécutée **après la partie 05**, pour éviter doublons et erreurs d'OCR. Tâches de review dédiées créées.

### Compteurs
| Table | Ajouté p04 | Total |
|---|---|---|
| sources | 1 | 4 |
| pages | 50 | 198 |
| dialogues | 6 | 6 |
| review_tasks | +9 | 1129 |
| (leçons / vocab / règles / exercices / textes) | 0 | 30 / 850 / 86 / 97 / 30 |

Nouvelle table `dialogues` (numéro, titre, provenance arabe + traduction, textes NULL, statut). Idempotence vérifiée.

## 4. Traçabilité
`source_id = tapiero-manuel-partie-04`, `pdf_page`, `printed_page`, `side`. Exports `exports/partie-04/` (dialogues .json/.csv + counts.json).

## 5. Qualité / droits
Tout `needs_review` ; dialogues indexés, jamais transcrits automatiquement. Œuvre sous droit (Klincksieck) : usage interne ; publication = licence ou contenu original.
