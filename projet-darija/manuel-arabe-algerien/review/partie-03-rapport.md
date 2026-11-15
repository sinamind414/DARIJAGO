# Manuel d'arabe algérien moderne — partie 03/5

**Source** : Norbert Tapiéro, *Manuel d'arabe algérien moderne*, Klincksieck, série linguistique 7 — 1re éd. 1971, 2e éd. 1978, © Klincksieck 2002, ISBN 2-252-03395-9.
**Provenance** : dossier Google Drive `DEUXIEME LIVRE DARIJA` (`1wds9v7GwsIpDwMFSR3-m_oXm6BJ1LHR8`), fichier `Manuel-arab-algerien-3.pdf` (`1imJWKWtplzeUmvIJeScL-D9Z2-P--NQM`).
**Statut** : ingérée, curée, `needs_review` — **aucune donnée publiée dans l'application** (`app_ready = 0`).

---

## 1. Fichier reçu et vérifié

| Fichier local | Fichier Drive | Pages PDF | Octets | MD5 (identique Drive/local) |
|---|---|---|---|---|
| `raw/partie-03.pdf` | `Manuel-arab-algerien-3.pdf` | 25 | 12 202 072 | `1782058a1a1bcb949fb8b8023474a052` |

SHA256 : `812ac206299794f5aad60f0f9325fe3b6813875238016cab67a1fa5988b892f8`.
SHA256 absent de la base avant traitement → pas de réimport.

**Restent à traiter** : `-4.pdf` (10 900 199 o, md5 `8fb8903dfde56ce0eeb4408417ee0a01`), `-5.pdf` (5 776 806 o, md5 `0f3f89466afca1e4330aec2426811da5`).

---

## 2. Pagination et anomalie de scan

Doubles pages imprimées (747 × 558 pt). **Anomalie** : le spread imprimé **104/105 est scanné deux fois** (pages PDF 8 et 9, similarité OCR ≈ 0,7). La page PDF 9 est marquée `duplicate_of = 8` dans `ocr/partie-03-colonnes/ocr-columns.json` et **n'est pas ingérée**.

```
pdf 1..8   : gauche = 2n + 88 ; droite = 2n + 89
pdf 9      : DOUBLON de pdf 8 (imprimé 104/105) — ignoré
pdf 10..25 : gauche = 2n + 86 ; droite = 2n + 87
```

Plage imprimée unique : **90 → 137** (48 demi-pages ingérées sur 50).

---

## 3. Contenu ingéré

- **Leçon 22** (commencée en partie 02, §108 p.89) **achevée** ici (p.90-92, §108-111) : fin du texte 108, vocabulaire, version, exercice, particules (§110), thème (§111). Fiche leçon + texte 108 mises à jour (`complete`).
- **Leçons 23 → 30 complètes** :
  - L23 (p.93-97) : le verbe, expression de temps, temps composés (§112-116). Texte : *mnin tlaqt fi-fransâ*.
  - L24 (p.98-102) : verbes à conjugaison particulière, verbe concave (§117-121). Texte : *el-bîe u-š-šrâ*.
  - L25 (p.103-107) : verbe défectueux et verbe sourd (§122-126). Texte : *er-rahhâla w-el-ḥdar*.
  - L26 (p.108-112) : verbes dérivés, formes actives (§127-131). Texte : *Bû-Tâleb sbah mrêd*.
  - L27 (p.113-118) : formes réfléchies et passives (§132-136bis). Texte : *korat-el-qadam w-el-mšâjara*.
  - L28 (p.119-121) : manières de traduire l'infinitif (§137-140). Texte : *el-hammâm*.
  - L29 (p.122-125) : le passif, traduction de « on » (§141-144). Texte : *râyhin nsâfru*.
  - L30 (p.126-128) : récapitulation (§145-150). Texte : *eid-el-fitr u-eid-el-adha*.
- **Glossaire alphabétique** commencé p.129 (intro) / p.130-137 (entrées A→K). Conservé en **OCR de référence 4 colonnes** (`ocr/partie-03-glossaire/`), **non fusionné** au vocabulaire : il ne se complète qu'en partie 05 et dupliquerait les fiches leçons. Tâche de review dédiée (cross-check pluriels/genres + fusion après partie 05).

### Compteurs partie 03
| Table | Ajouté p03 | Total base |
|---|---|---|
| sources | 1 | 3 |
| pages | 48 | 148 |
| lessons | 8 (+ L22 complétée) | 30 |
| vocabulary | 169 | 850 |
| grammar_rules | 21 | 86 |
| exercises | 30 | 97 |
| study_texts | 8 (+ texte 108 complété) | 30 |
| review_tasks | +252 | 1120 |

Dédup interne p03 : 0 doublon strict (les reprises pédagogiques sont tracées en notes). **15 reprises inter-parties** (formes déjà en p01/p02) signalées en `review_tasks` « fusionner avant publication ». Homonymes conservés séparés : `dres`, `lhaq`, `dfae`.

---

## 4. Traçabilité

Chaque entrée porte `source_id = tapiero-manuel-partie-03`, `pdf_page` (n° de spread), `printed_page`, `side` (L/R), `paragraph_ref` (§). Exports : `exports/partie-03/` (lessons, vocabulary, grammar_rules, exercises, study_texts_index en .json + .csv, counts.json).

## 5. Qualité / réserves

- Tout est `needs_review` ; `form_ar` et textes latin/arabe restent NULL (OCR arabe non fiable) → transcription + validation native avant publication.
- Formes douteuses notées « à confirmer » : `sbâbṭi` (cordonnier, OCR ṣbâbṭê), `nûe` (sorte), `sûma`, `šâhina`.
- Le spread dupliqué (pdf 9) est exclu ; les références de la leçon 25 pointent le spread conservé (pdf 8).
- Idempotence vérifiée : deux exécutions consécutives → compteurs identiques.

## 6. Droits

Œuvre sous droit (Klincksieck). Usage interne/recherche uniquement. Publication dans l'app = licence ou contenu original/licencié.
