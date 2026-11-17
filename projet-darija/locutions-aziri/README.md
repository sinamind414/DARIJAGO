# Base « Locutions AZIRI 2012 »

Troisième source linguistique du projet, intégrée le **15 novembre 2026**.

## Source

| Champ | Valeur |
|---|---|
| Titre | Dictionnaire des locutions de l'arabe dialectal algérien |
| Auteur | Mohamed Nazim AZIRI |
| Éditeur | Éditions ANEP (Alger) |
| Année | 2012 (dépôt légal 4629-2012) |
| ISBN | 978-9947-21-578-4 |
| PDF | 492 pages — **texte sélectionnable, pas un scan** |
| SHA-256 | `5f1f792254f47397696ecafee8af5a2702a4c6cec024692140bdeda313799da7` |
| Fichier canonique | `raw/locutions-aziri-2012.pdf` |

**Apport décisif :** c'est la première source du projet qui n'a **pas besoin d'OCR**. Le texte arabe et le texte français sont natifs du PDF, donc aucune erreur de reconnaissance de caractères. Là où les bases Ben Sedira 1910 et Tapiéro sont bruitées par l'OCR, celle-ci est propre à la source.

**Nature du contenu :** des **locutions** (expressions figées), pas des mots isolés. C'est exactement ce qui manquait au projet pour produire des tournures de phrases naturelles. L'auteur les a compilées depuis Beaussier, le supplément de Lentin, et les ouvrages de sa bibliographie (p. 485-487).

## Résultat de l'intégration

| Métrique | Valeur |
|---|---|
| Locutions | **7 123** |
| Racines arabes | **2 248** |
| Pages de dictionnaire traitées | 462 (p. 11 à 484) |
| Avec glose française | **7 073** (99,3 %) |
| Doublons fusionnés | 37 |
| Tâches de revue | 7 126 |
| Dont priorité haute | 110 |
| Statut de toutes les entrées | `needs_review` |
| Taille de la base | 4,6 Mo |

### Répartition par lettre

ع 564 · ق 527 · ح 487 · خ 393 · س 380 · ب 370 · ف 362 · ش 347 · ر 346 · ك 337 · ن 306 · د 299 · ط 276 · ص 253 · غ 243 · و 221 · ز 220 · ج 216 · م 210 · ه 182 · ل 178 · ا 114 · ت 107 · ض 103 · ظ 37 · ث 32 · ذ 25 · ي 25

### Anomalies signalées, jamais corrigées en silence

| Signalement | Nombre | Traitement |
|---|---|---|
| `ligature_lam_alef_a_verifier` | 60 | La ligature lam-alef est mal encodée dans le PDF (`األجل` au lieu de `الأجل`). Forme conservée telle quelle + tâche de revue haute priorité. |
| `glose_absente_ou_trop_courte` | 50 | Glose à compléter depuis la page source. |
| `glose_separee_du_champ_arabe` | 2 | Séparation arabe/français réparée automatiquement, à vérifier. |

Aucune locution ne contient plus de caractères latins parasites. Aucun sens, aucun exemple, aucune translittération n'a été inventé.

## Schéma de la base

`db/locutions.sqlite`

- **`sources`** — un enregistrement, avec SHA-256, ISBN et mention de droits.
- **`roots`** — 2 248 racines arabes, avec lettre-section et nombre de locutions.
- **`locutions`** — 7 123 entrées. Champs clés :
  - `locution_ar` (forme vocalisée d'origine), `locution_ar_nodiac`, `locution_norm` (forme de recherche)
  - `gloss_fr` (sens français)
  - `root_ar`, `letter_section`
  - **`pdf_page` + `printed_page`** — double provenance
  - `extraction_flags`, `parser_version`, `status`
  - `translit_latin`, `region`, `register_modern`, `usage_note` — **vides, à remplir par validation humaine**
- **`locutions_fts`** — index FTS5 sur l'arabe sans diacritiques et le français.
- **`review_tasks`** — file de validation priorisée.
- **`processing_runs`** — historique des ingestions.

## Chaîne de validation

```
needs_review → corrected → native_validated → app_ready
```

**Aucune entrée n'est publiable en l'état.** Le statut `app_ready` ne peut être posé que par un locuteur natif.

## Droits

Œuvre sous droit, Éditions ANEP 2012. Usage interne et recherche. **Toute publication dans une application nécessite une licence**, ou du contenu original/licencié. Cette mention est stockée dans `sources.rights_note`.

## Registre

Locutions **patrimoniales**. L'auteur décrit lui-même son objet comme « l'arabe parlé par nos aïeux ». Beaucoup de tournures sont encore vivantes, d'autres sont vieillies. **Ne pas présenter ce corpus comme de la darija moderne sans validation** — c'est le champ `register_modern`, laissé vide, qui devra trancher entrée par entrée.

## Scripts

```bash
# 1. Extraction depuis le PDF (idempotent)
python3 scripts/extraire_locutions.py

# 2. Ingestion en base (idempotent — relancer ne crée aucun doublon)
python3 scripts/ingerer_locutions.py
```

Vérifié : deux exécutions consécutives → 7 123 / 7 123 entrées, 0 insertion au second passage. `PRAGMA integrity_check` → `ok`.

## Exemples de recherche

```sql
-- Sens français
SELECT l.locution_ar, l.gloss_fr, l.printed_page
FROM locutions_fts f JOIN locutions l ON l.locution_id = f.rowid
WHERE locutions_fts MATCH 'argent';

-- Forme arabe
... WHERE locutions_fts MATCH 'قلب';
```

Résultats réels :

| Locution | Sens | Page |
|---|---|---|
| مَا بَا شِي | il a refusé | 11 |
| بَحَّرْ درَاهْمُه | il a perdu son argent, celui qui jette son argent à la mer | 22 |
| فصَد علَى قَلبْ فالَن | deviner ce que quelqu'un a dans le cœur | 343 |
| قَلبْ سَفِيلهَا علَى عَقِيلهَا | mettre sens dessus dessous | 199 |

## Place dans le projet

| Base | Contenu | Force | Faiblesse |
|---|---|---|---|
| `dictionnaire-livre` (Ben Sedira 1910) | 9 622 entrées FR→DZ | Volume lexical | OCR bruité, forme historique, 0 sens structuré |
| `manuel-arabe-algerien` (Tapiéro 1971/2002) | 850 vocab, 30 leçons, 86 règles | Pédagogie structurée | OCR, 0 forme arabe, sous droit |
| **`locutions-aziri` (2012)** | **7 123 locutions AR→FR** | **Texte natif sans OCR, expressions figées, arabe vocalisé** | **Pas de translittération latine, registre patrimonial, sous droit** |

**Complémentarité :** Ben Sedira donne les mots, Tapiéro donne la grammaire, **AZIRI donne les tournures**. C'est la pièce qui manquait pour que l'agent écrive des phrases idiomatiques plutôt que du mot-à-mot.

**Limite à connaître :** la translittération latine (`translit_latin`) est vide pour les 7 123 entrées. Pour un usage voix off ou pub en darija latine, il faudra la produire et la faire valider — l'arabe vocalisé est présent, ce qui facilite ce travail, mais il ne doit pas être automatisé sans revue.
