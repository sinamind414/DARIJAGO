# Manuel d'arabe algérien moderne — partie 02/5

**Source** : Norbert Tapiéro, *Manuel d'arabe algérien moderne*, Klincksieck, série linguistique 7 — 1re éd. 1971, 2e éd. 1978, © Klincksieck 2002, ISBN 2-252-03395-9.
**Provenance** : dossier Google Drive `DEUXIEME LIVRE DARIJA` (dossier `1wds9v7GwsIpDwMFSR3-m_oXm6BJ1LHR8`).
**Statut** : ingérée, curée, `needs_review` — **aucune donnée publiée dans l'application** (`app_ready = 0`).

---

## 1. Fichiers reçus et vérifiés

La partie 02 est déposée en **3 segments PDF**, contrairement aux autres parties.

| Fichier local | Fichier Drive | Pages PDF | Octets | MD5 (identique Drive/local) |
|---|---|---|---|---|
| `raw/partie-02-1.pdf` | `Manuel-arab-algerien-2-1.pdf` | 10 | 5 084 523 | `570ceaac0409ea0c5bf14f55e8b41420` |
| `raw/partie-02-2.pdf` | `Manuel-arab-algerien-2-2.pdf` | 10 | 6 273 197 | `94d718634780f8a66f6c0c70b30c60be` |
| `raw/partie-02-3.pdf` | `Manuel-arab-algerien-2-3.pdf` | 5 | 3 134 296 | `c4b7d0907557bf3243be2564be387aa0` |
| **Total** | | **25** | **14 491 016** | |

SHA256 :
- `partie-02-1.pdf` : `74afa9cb8701a077aadd5844adbc71531ea084c9b6000013860ac7a647147a8b`
- `partie-02-2.pdf` : `448c2a1e0b8c62f1e2429587316f4d2de34e3916604b372d1bd76ed1500cb995`
- `partie-02-3.pdf` : `1b2a5e1c90901a95021558ff6b5cbd1892fadae4e0a1db88820ad1bf0b503cf4`
- Empreinte combinée (concaténation ordonnée des 3 segments, clé `sources.sha256`) : voir `manifest.json`.

**Doublon détecté et non réimporté** : `Manuel-arab-algerien-1.pdf` du dossier Drive a le MD5 `575356481c506b7561c3adfe8aa7593e`, identique à la partie 01 déjà intégrée. Aucun retraitement.

**Restent à traiter** : `Manuel-arab-algerien-3.pdf` (12 202 072 o), `-4.pdf` (10 900 199 o), `-5.pdf` (5 776 806 o).

---

## 2. Pagination

Les pages PDF sont des **doubles pages imprimées** (747 × 558 pt), comme en partie 01.
Numérotation continue sur les 3 segments, PDF 1 → 25 :

```
page imprimée gauche = 2 × n + 38
page imprimée droite = 2 × n + 39      (n = 1 … 25)
```

Couverture : **pages imprimées 40 à 89**. Contrôle : PDF 1 gauche = 40 (imprimé visible), PDF 2 droite = 43 (imprimé visible), PDF 25 droite = 89.

| Segment | Pages PDF (globales) | Pages imprimées |
|---|---|---|
| `partie-02-1.pdf` | 1 – 10 | 40 – 59 |
| `partie-02-2.pdf` | 11 – 20 | 60 – 79 |
| `partie-02-3.pdf` | 21 – 25 | 80 – 89 |

---

## 3. OCR

Méthode : découpage en deux moitiés, puis Tesseract 5.5.0.

- moitié gauche : `-l fra --psm 6`
- moitié droite : `-l ara+fra --psm 4`
- rendu PyMuPDF à l'échelle 4 (2 990 × 2 232 px), boîtes `LEFT (40,20,1475,2212)` / `RIGHT (1505,20,2970,2212)`
- pas de front matter dans cette partie (`--front-matter-max 0`)

Sorties : `ocr/partie-02-colonnes/` → **50 fichiers** `page-NNN-L.txt` / `page-NNN-R.txt` + 3 métadonnées `ocr-columns-seg{1,2,3}.json`.
Le script `scripts/ocr_colonnes.py` a été généralisé (options `--page-offset`, `--printed-left-first`, `--meta-name`) sans changer le comportement par défaut utilisé pour la partie 01.

**Limite connue** : l'OCR arabe reste mauvais → `form_ar = NULL` partout, `ar_text = NULL`.
**Limite rencontrée sur cette partie** : la 1re colonne des tableaux de vocabulaire (italique phonétique) est mal reconnue. Elle a été **relue visuellement sur le scan** pour les pages 40, 57, 62, 67, 77, 82, 87. Les formes encore douteuses portent une note explicite.

---

## 4. Contenu structuré

| Objet | Partie 02 | Total base (parties 01 + 02) |
|---|---|---|
| Sources | 1 | 2 |
| Pages (demi-pages OCR) | 50 | 100 |
| Leçons nouvelles | 11 (L12 → L22) | 22 |
| Sections | 12 | 24 |
| Vocabulaire | **410** | **681** |
| Règles de grammaire | **36** | **65** |
| Exercices | **37** | **67** |
| Textes indexés | **11** | **22** |
| Tâches de relecture | — | 868 |

`PRAGMA integrity_check` = `ok` · `PRAGMA foreign_key_check` = `[]` · taille base = 495 616 o.

### Leçons couvertes

| Leçon | Titre | PDF | Imprimé | État |
|---|---|---|---|---|
| 11 | Récapitulation. L'impératif. | 1 | 40 – 41 | **achevée** (commencée en partie 01) |
| 12 | Le nom : le genre. La numération de 11 à 19. | 2 – 3 | 42 – 45 | complète |
| 13 | Quelques catégories de substantifs. | 4 – 5 | 46 – 49 | complète |
| 14 | Quelques catégories d'adjectifs. Emploi de l'adjectif. | 6 – 8 | 50 – 54 | complète |
| 15 | L'heure. Le nombre : duel, pluriel externe. | 8 – 10 | 54 – 59 | complète |
| 16 | Le nombre (fin) : pluriel interne, collectif. | 11 – 13 | 60 – 65 | complète |
| 17 | Récapitulation. La numération de 20 à 99. | 14 – 15 | 66 – 69 | complète |
| 18 | Comparatif et superlatif. Numération 100+. Ordinaux. | 16 – 18 | 70 – 74 | complète |
| 19 | Le pronom relatif. La proposition relative. | 18 – 20 | 74 – 79 | complète |
| 20 | Les indéfinis. | 21 – 23 | 80 – 84 | complète |
| 21 | L'exclamation. La négation (fin). | 23 – 25 | 85 – 88 | complète |
| 22 | La construction. Les particules. | 25 | 89 | **partielle** (§108) — suite en partie 03 |

La leçon 11 reste rattachée à la source `partie-01` (créée là) ; ses données de continuation sont rattachées à la source `partie-02`, avec `completeness = complete` et une note de provenance.

### Vocabulaire par leçon

L11 = 19 · L12 = 39 · L13 = 37 · L14 = 41 · L15 = 29 · L16 = 39 · L17 = 38 · L18 = 56 · L19 = 44 · L20 = 31 · L21 = 37.

### Règles de grammaire (§)

56, 56bis · 59, 59bis, 61 · 64, 64bis · 69, 69bis, 71, 71bis · 74, 76, 77, 77bis · 79, 79bis, 79ter, 81 · 85, 85bis · 88, 88bis, 90, 90bis, 91 · 94, 94bis, 96, 96bis · 99, 99bis, 101, 101bis · 104, 106.

Points saillants : impératif et impératif négatif `lâ-…-š` ; féminin et catégories de féminins ; nombres 11-19, 20-99, 100+ et ordinaux ; duel `-în` / `-ayn` ; pluriel externe (`-în`, `-a`, `-ât`) et interne (5 schémas) ; collectif ; comparatif `aCCaC + men` et superlatif ; relatif `elli` / `ma` et pronom de rappel ; indéfinis `kull`, `wâhed`, `bâed` ; exclamation et formules religieuses ; négation complète.

### Textes (§)

58 `es-sana w-el-fasl w-eš-šhar` · 63 `el-hobz` · 68 `f-ez-zenqa` · 73 `es-sâɛa` · 78 `ɛammi Milûd` · 83 `ɛand-et-tbêb` · 87 `Mohammed u-hôto` · 93 `el-eâmel el-jazâiri` · 98 `mdînat-el-jazâir` · 103 `el-fellâh el-jazâiri` · 108 `kêfâš ibniw dâr` (partiel).

Les textes sont **indexés seulement** : `latin_text`, `ar_text`, `fr_translation` restent `NULL`. Aucune transcription n'est publiée avant validation native.

---

## 5. Doublons et reprises

- **9 doublons internes fusionnés** (même forme reprise dans une leçon ultérieure) : `hânût`, `jiha`, `byad`, `qbal-`, `mhayyar`, `b-ez-zâf`, `staejab`, `tkellem`, `ki-`. Une seule fiche est conservée ; les autres leçons sont tracées dans `notes`.
- **2 homonymes conservés séparément** : `dres` (battre le grain / étudier) et `sâb` (tomber en parlant de la pluie / trouver). Même principe que `râh` en partie 01.
- **11 reprises inter-parties signalées** (forme déjà présente en partie 01) : une tâche de relecture « fusionner les fiches avant publication » est créée pour chacune.

---

## 6. Réserves de qualité (à valider par un locuteur natif)

Formes ou paragraphes partiellement illisibles, marquées dans `notes` :

- nombres `tnâš` (12) et `tlâtaš` (13) — OCR partiel / illisible ;
- `karrôsa` (voiture, emprunt entre crochets) ;
- `tbêb` : pluriel `tebbâ` à confirmer ;
- `sannat` (ausculter) et `zâd` (augmenter) — verbes de la leçon 17 ;
- `hallâ` (laisser) — leçon 20 ;
- `u-` (voici tant de temps que) et `illa` — leçon 15 ;
- §85bis : exemple d'heure partiellement illisible ;
- §101 / §101bis : exemple et synonyme de « rien » (noté `wâlu`) à confirmer ;
- leçon 22 : titre partiellement illisible ;
- une ligne de verbe de la page 71 (leçon 18) n'a pas été retenue, faute de lecture fiable.

Transcription : conventions de la partie 01 reconduites — `â û î` longues, `e` neutre, `š` = ch, `ɛ` → `e`, `ġ` → `g`, `ḥ` → `h`, `ṣ` → `s`, `ṭ` → `t`. **Pas de conversion automatique vers 3 / 7 / ch.** Les emprunts signalés entre crochets par le livre sont marqués en note.

---

## 7. Traçabilité et corrections techniques

- Chaque objet porte `source_id`, `pdf_page`, `printed_page`, `side`, `paragraph_ref`.
- Nouvelle colonne `pages.pdf_file` : indique le segment PDF d'origine (indispensable ici, 3 fichiers pour une partie).
- Nouvelle colonne `lessons.notes` : provenance des leçons à cheval sur deux parties.
- **Correctif** : la purge de `scripts/ingerer_manuel.py` (partie 01) supprimait toutes les `review_tasks` sans filtre. Elle est désormais limitée aux objets de la partie 01. Le script de la partie 02 applique la même règle.
- Scripts idempotents : réexécutables sans créer de doublons.

---

## 8. Droits

Œuvre sous droit (Klincksieck). Usage interne et recherche uniquement. Toute publication dans l'application nécessite une licence ou du contenu original / licencié. Les PDF sources restent dans le Drive de l'utilisateur.

---

## 9. Reproduire

```bash
cd /home/user/projet-darija/manuel-arabe-algerien
bash scripts/ocr_partie02.sh            # OCR des 3 segments (≈ 4 min)
python scripts/ingerer_manuel_partie02.py   # ingestion + exports + contrôles
```

Exports : `exports/partie-02/` → `lessons`, `vocabulary`, `grammar_rules`, `exercises`, `study_texts_index` (`.json` + `.csv`) et `counts.json`.

## 10. Prochaine étape

Partie 03/5 (`Manuel-arab-algerien-3.pdf`, déjà sur Drive) : achever la leçon 22 et poursuivre. Même pipeline, vérification SHA/MD5 avant tout traitement.
