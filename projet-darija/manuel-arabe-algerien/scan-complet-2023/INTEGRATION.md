# Intégration du scan complet Tapiéro (1978) dans `manuel.sqlite`

**Date :** 15 novembre 2026
**Fichier reçu :** `778940692-FR00064.pdf`
**Copie canonique :** `scan-complet-2023/raw/tapiero-manuel-complet-1978.pdf`
**SHA-256 :** `5196ec28a5315d2e7506aeb9ba3af98ec77f6f25a4fa2c32e28f5e3d8507c7ce`
**Taille :** 7 125 821 octets — 227 pages

---

## 1. Ce que c'est — et ce que ce n'est pas

**C'est le même livre que celui déjà en base.** Couverture : *Manuel d'arabe
algérien moderne*, Norbert Tapiéro, 2ᵉ édition, Presses Universitaires de Lyon /
Klincksieck, **1978**, avec le *supplément de 15 dialogues entre Maghrébins sur la
vie des immigrés, avec traduction*.

La base contenait déjà cet ouvrage, découpé en **5 PDF de doubles-pages**
(113 pages gauche + 113 droite). Le nouveau fichier est un **scan différent,
complet, en 227 pages simples**, et il contient ce qui manquait : **les pages
arabes et les 15 dialogues du supplément**.

**Décision : pas de doublon de livre.** On ajoute une *source*, pas un ouvrage.
Les 850 fiches de vocabulaire, 30 leçons, 86 règles de grammaire, 97 exercices,
727 + 1 490 entrées de glossaire restent **strictement inchangées**.

### Écart d'ISBN — documenté, pas écrasé

| | ISBN |
|---|---|
| Scan reçu (4ᵉ de couverture, 1978) | `2-252-02062-8` |
| Base existante (réimpression 2002) | `2-252-03395-9` |

Les deux sont conservés côte à côte dans la table `sources`. C'est une variante
d'édition, pas une erreur à corriger.

---

## 2. Le vrai apport : les textes qui étaient vides

Avant cette passe, la base avait la **structure** mais pas les **textes** :

| Champ | Rempli avant |
|---|---|
| `dialogues.ar_text` / `latin_text` / `fr_translation` | **0 / 15** |
| `study_texts.latin_text` / `ar_text` / `fr_translation` | **0 / 30** |
| `vocabulary.form_ar` | **0 / 850** |

Ce scan fournit la matière pour les combler.

---

## 3. Méthode

### 3.1 Cartographie vérifiée

**Page imprimée = page PDF − 10.** Contrôlé sur 6 pages témoins
(PDF 11→1, 50→40, 110→100, 191→181, 226→216).

### 3.2 Le piège des langues mélangées

Le scan est **100 % image** (0 caractère de texte natif, producteur
*Adobe Acrobat Image Conversion Plug-in*, numérisé le 29/09/2023). Il a fallu
OCRiser avec Tesseract 5.5.0.

Un OCR pleine page échoue sur ce livre, pour une raison structurelle :

- **Les pages de dialogue sont bilingues sur deux colonnes** : transcription
  latine à gauche, texte arabe à droite. Un OCR global entrelace les deux.
- **Les pages de traduction commencent par la fin du texte bilingue**, puis le
  titre « N. Traduction », puis le français. Un OCR global mélange les trois.
- Passer `-l fra+ara` récupère le latin mais **corrompt l'arabe** ; `-l ara` seul
  donne un arabe exploitable mais **détruit la translittération**.

### 3.3 La solution : OCR par zone

| Zone | Langue | Résolution | Mode |
|---|---|---|---|
| Colonne gauche (latin) | `fra` | 260 dpi | psm 3 |
| Colonne droite (arabe) | `ara` | **400 dpi** | psm 6 |
| Bloc traduction française | `fra` | 220 dpi | psm 3 |
| Pages du corps | `fra` + `ara` | 220 dpi | psm 3 |

La séparation traduction / fin de dialogue n'est pas approximative : la position
du mot « Traduction » est lue dans le **TSV de Tesseract** (coordonnées en
pixels), convertie en points PDF, et sert de ligne de coupe. 10 des 16 pages de
traduction ont été découpées ainsi.

Résultat mesuré : **0 traduction sur 15 ne contient de latin parasite en tête.**

### 3.4 Détection des vrais blocs arabes

L'OCR `ara` produit du charabia sur une page française. Compter les caractères
arabes ne suffit donc pas. Le critère retenu est le **nombre de mots-outils
arabes reconnus** (`من، في، على، ما، لا، هذا، كان…`), seuil ≥ 12.

**31 pages** contiennent un vrai bloc arabe, dont 21 pages de lecture du corps
et les pages de dialogue.

---

## 4. Résultat de l'ingestion

```
Source ajoutée            tapiero-manuel-scan-complet-1978
Pages OCR stockées        227  (table scan_pages)
Pages avec bloc arabe     31
Candidats de texte        98   (table ocr_candidates)
Tâches de revue créées    98   (review_tasks, object_type='ocr_candidate')
Integrity check           ok
```

### Couverture

| Type | Champ | Candidats |
|---|---|---|
| dialogue | `latin_text` | **15 / 15** |
| dialogue | `ar_text` | **15 / 15** |
| dialogue | `fr_translation` | **15 / 15** |
| study_text | `latin_text` | **30 / 30** |
| study_text | `ar_text` | **23 / 30** |

Les 7 textes sans version arabe correspondent aux leçons du début : le manuel
n'introduit l'écriture arabe qu'à partir de la leçon 7. Ce n'est pas un manque
d'extraction, c'est le contenu réel du livre.

### Volume par dialogue (caractères OCR)

| Dialogue | Titre | Latin | Arabe | Français |
|---|---|---|---|---|
| I | La famille et le logement | 932 | 442 | 1 332 |
| II | Mère de famille malade | 959 | 212 | 1 247 |
| III | La famille et l'école | 1 126 | 353 | 1 686 |
| IV | La préformation | 1 253 | 504 | 1 658 |
| V | L'alphabétisation | 1 385 | 392 | 1 759 |
| VI | La sécurité sociale | 1 347 | 516 | 1 826 |
| VII | L'hôpital | 1 491 | 429 | 2 092 |
| VIII | Au supermarché | 1 445 | 571 | 1 895 |
| IX | Le travail en usine | 1 639 | 742 | 2 005 |
| X | Le chômage et la vie chère | 1 777 | 713 | 2 432 |
| XI | Le retour | 1 933 | 760 | 2 589 |
| XII | Les papiers officiels | 2 620 | 1 616 | 791 |
| XIII | L'automobile | 2 802 | 1 598 | 1 059 |
| XIV | Les loisirs | 2 875 | 1 641 | 1 118 |
| XV | Les vacances | 2 612 | 1 377 | 1 350 |

Total : **122 897 caractères** de candidats + **843 652 caractères** d'OCR page.

---

## 5. Règle de sécurité respectée : l'OCR n'est pas publié

**Aucun champ de référence n'a été écrasé.** Vérifié après ingestion :

| | Toujours vide |
|---|---|
| `dialogues.ar_text` | 15 / 15 |
| `study_texts.latin_text` | 30 / 30 |
| `vocabulary.form_ar` | 850 / 850 |

Tout est déposé dans `ocr_candidates` avec :
- le texte OCR brut,
- la **provenance** : pages PDF **et** pages imprimées, zone exacte,
- un **niveau de confiance** (`high` 15, `medium` 45, `low` 38),
- le statut **`needs_review`**,
- une tâche de revue associée.

### Pourquoi cette prudence

L'OCR arabe de ce scan est **médiocre**, même à 400 dpi. Exemple, dialogue VIII,
ligne réelle du livre : *خيرة — آه ! يا فاطمة واش حالكم ؟*
OCR obtenu : *خيرة- أن !يا فاطمة واثرحالكم!*

C'est **utilisable comme aide à la saisie**, pas comme contenu publiable. Le
français est bon (`high`), le latin est correct avec des erreurs de
diacritiques (`medium`), l'arabe doit être **repris à la main** (`low`).

`vocabulary.form_ar` reste vide à dessein : le lexique du livre est en
transcription latine, il ne donne pas la forme arabe des 850 vedettes.
L'inventer serait une faute.

---

## 6. Traçabilité et reproductibilité

### Sauvegarde

`db/backups/manuel-avant-scan-complet-20261115-212205.sqlite`
MD5 `539144e105d250bcf0cb0874548b6abf` — état exact avant écriture.

Base après intégration : 3 149 824 octets,
MD5 `d23140b51496f774f15e627837baa349`.

### Idempotence

Trois exécutions consécutives :
- run 1 : 227 pages, 96 candidats
- run 2 : **0 nouveauté**
- run 3 (après amélioration du découpage) : 34 mises à jour, puis **0**

Le script utilise `INSERT … ON CONFLICT … DO UPDATE … WHERE value <> excluded.value` :
il ne réécrit que si l'extraction s'est réellement améliorée, et remet alors le
candidat en `needs_review`.

### Scripts

| Fichier | Rôle |
|---|---|
| `scan-complet-2023/scripts/ocriser_scan.py` | OCR des 227 pages |
| `scan-complet-2023/scripts/ocriser_zones.py` | OCR par colonne des dialogues |
| `scan-complet-2023/scripts/ocr_arabe_dialogues.py` | colonne arabe en 400 dpi |
| `scan-complet-2023/scripts/decouper_traductions.py` | coupe au titre « Traduction » via TSV |
| `scripts/integrer_scan_complet.py` | ingestion idempotente |

---

## 7. Droits

Œuvre **sous droit** (Klincksieck). Usage interne et recherche uniquement.
Toute publication dans l'application DARIJAGO nécessite une **licence** ou du
**contenu original**. Cette contrainte est inscrite dans `sources.rights_note`.

---

## 8. Prochaine étape utile

Les 15 dialogues du supplément sont le meilleur gisement du livre pour
l'application : ce sont des **conversations complètes, situationnelles, avec
traduction française vérifiable** — exactement le format d'une leçon.

Chaîne de validation proposée :

```
needs_review → corrected → native_validated → app_ready
```

Priorité : reprendre l'**arabe** des dialogues I à V (les plus courts, 212 à
504 caractères) en regardant l'image de la page, puis faire valider le latin
et l'arabe par un locuteur natif. Le français, lui, est déjà quasi exploitable.

**Tant que ce n'est pas fait, aucun de ces textes ne doit apparaître dans
l'application.**
