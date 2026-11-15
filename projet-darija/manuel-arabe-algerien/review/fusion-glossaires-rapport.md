# Fusion glossaires → vocabulaire — Manuel Tapiéro

**Statut : passe de revue exécutée, aucune donnée publiée.**
Le livre est complet (30 leçons + 15 dialogues + glossaires). Cette passe ne modifie pas les 850 fiches de vocabulaire curées : elle produit des **propositions** et un **index de recherche FR → DZ**, tous `needs_review`.

## Méthode

1. **Ré-OCR 4 colonnes** des glossaires (`scripts/ocr_glossaire_4col.py`) :
   - arabe → français : p.129-149 (parties 03+04) ;
   - français → arabe : p.150-170 (partie 04).
   Chaque colonne est découpée séparément pour éviter l'entrelacement des colonnes et la troncature du bord droit. Les fichiers `ocr/glossaire-4col/` sont une référence interne, jamais publiée brute.
2. **Indexation** dans `glossary_ar_fr` et `glossary_fr_ar` (provenance : page imprimée, page PDF, côté, colonne, texte brut).
3. **Rapprochements** avec les 850 fiches (`vocab_glossary_links`) :
   - `exact` : forme normalisée identique ;
   - `variant` : même forme sans article (el-/l-/es-/et-…) ;
   - `fuzzy` : préfixe commun + mot de glose française commun.
4. **Propositions** de genre / pluriel uniquement si le champ est NULL dans la fiche, le rapprochement est `exact`, le sens est compatible et la forme est plausible. Elles sont stockées dans `proposals.json/csv` + `review_tasks`, **pas appliquées**.
5. **Conflits** (genre/pluriel divergents entre leçon et glossaire) signalés en `review_tasks` priorité 1/2.
6. **Lookup FR → DZ** (`fr_dz_lookup`) : union du vocabulaire des leçons et du glossaire français-arabe, avec provenance et statut `needs_review`.

## Chiffres

| Élément | Nombre |
|---|---:|
| Entrées glossaire ar→fr indexées | 727 |
| Entrées glossaire fr→ar indexées | 1490 |
| Liens vocabulaire ↔ glossaire | 307 |
| — exacts | 240 |
| — variants (article) | 29 |
| — fuzzy | 38 |
| Propositions de remplissage | 76 |
| — genres | 61 |
| — pluriels | 15 |
| Conflits signalés | 26 |
| Entrées lookup FR → DZ | 2324 |
| — depuis vocabulaire des leçons | 839 |
| — depuis glossaire fr→ar | 1485 |
| Fiches vocabulaire inchangées | 850 |
| Entrées `app_ready` | 0 |

## Exemples de propositions

- `bent` → pluriel `bnât` (glossaire p.130) ;
- `bâb` → genre `m`, pluriel `bibân` (p.129) ;
- `râjel` → genre `m` (p.142) ;
- `hayma` → pluriel `kyém` (p.135) ;
- `duwâr` → pluriel `dwäwer` (p.131).

## Exemples de conflits à trancher

- `weld` : pluriel leçon `ulâd` vs glossaire `wläd` (p.147) ;
- `dêf` : `dyûf` vs `dyäf` (p.132) ;
- `yôm` : `ayyâm` vs `ayyêm ou iyyäm` (p.148) ;
- `hêt` : `hyôt` vs `hwât` (p.136, homonymes mur/sœur à distinguer).

## Lookup FR → DZ

Exemples (tous `needs_review`) :

| Français | Darija | Source |
|---|---|---|
| livre | ktâb | vocabulaire leçon 1, p.3 |
| maison | dâr | vocabulaire leçon 4, p.12 + glossaire p.161 |
| eau | mâ | vocabulaire leçon 5, p.16 + glossaire p.156 |
| bonjour | sbâh el-hér / sbâh-el-hér | vocabulaire p.22 + glossaire p.152 |

## Limites

- L'OCR des vedettes italiques reste imparfait ; les rapprochements `fuzzy` et une partie des `variant` exigent une relecture visuelle.
- Les propositions de pluriel sont filtrées (anti-bruit OCR) mais doivent être confirmées par un locuteur natif.
- Le lookup FR → DZ contient des variantes orthographiques et des entrées multi-mots ; il n'est pas encore un dictionnaire de publication.

## Prochaine étape obligatoire

**Validation par un locuteur natif** :
1. Relire les 76 propositions (`exports/fusion-glossaires/proposals.csv`).
2. Trancher les 26 conflits (`review_tasks` tag `[fusion-glossaires]`).
3. Échantillonner le lookup FR → DZ (en priorité les 839 entrées issues des leçons).
4. Passer les entrées validées en `native_validated`, puis seulement après contrôle éditorial en `app_ready`.

## Fichiers

- `db/manuel.sqlite` (tables `glossary_ar_fr`, `glossary_fr_ar`, `vocab_glossary_links`, `fr_dz_lookup`)
- `exports/fusion-glossaires/*.csv|json`
- `scripts/ocr_glossaire_4col.py`, `scripts/fusionner_glossaires.py`
- `backups/manuel-apres-fusion-glossaires.sqlite`
