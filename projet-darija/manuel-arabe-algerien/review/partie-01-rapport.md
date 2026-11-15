# Rapport — Manuel d’arabe algérien moderne, partie 01/5

## Source

- **Livre** : *Manuel d’arabe algérien moderne*
- **Auteur** : Norbert Tapiéro
- **Éditeur** : Klincksieck, série linguistique n° 7
- **Édition** : 1re éd. 1971 ; 2e éd. 1978 ; © Klincksieck 2002
- **ISBN** : 2-252-03395-9
- **Fichier canonique** : `raw/partie-01.pdf`
- **SHA-256** : `3f69a4799f9ba5a5cd7cbdb98504384de6b5fea54364006e8dc70222e7bfb95a`
- **Pages PDF** : 25
- **Pages imprimées couvertes** : front matter + pages 1 → 39
- **Leçons couvertes** : leçons 1 à 10 complètes ; leçon 11 commence (§54, texte + début impératif)
- **Registre** : `tapiero_1971_2002`, arabe algérien pédagogique « parler moyen »
- **Séparation** : base distincte du dictionnaire 1910 ; ne pas mélanger les registres.

## Problème OCR initial

Le PDF est composé de **doubles pages imprimées** : chaque page PDF contient une page gauche et une page droite. Un OCR pleine page en `--psm 6` entrelignait le français de gauche et l’arabe/transcription de droite. Ce premier OCR a été utilisé uniquement pour repérer la structure, **pas comme vérité linguistique**.

## Méthode corrigée

1. Rendu PDF haute résolution.
2. Découpage de chaque page PDF en deux moitiés :
   - gauche : `fra`, `--psm 6` ;
   - droite : `ara+fra`, `--psm 4` ;
   - front matter : français seul des deux côtés.
3. Sorties séparées : `ocr/partie-01-colonnes/page-NNN-L.txt` et `page-NNN-R.txt`.
4. Métadonnées : `ocr/partie-01-colonnes/ocr-columns.json`.
5. Curation manuelle assistée par OCR pour créer une base structurée de leçons.
6. Aucun export d’OCR brut comme contenu publiable.

## Pagination

À partir de la page PDF 7 :

- page imprimée gauche = `2 × page PDF − 12`
- page imprimée droite = `2 × page PDF − 11`

Exemples :

- PDF 7 → pages imprimées 2–3
- PDF 11 → pages imprimées 10–11
- PDF 25 → pages imprimées 38–39

La page PDF 6 contient les abréviations à gauche et la page imprimée 1 à droite.

## Base créée

Base : `db/manuel.sqlite`  
Schéma : `db/schema.sql`

| Objet | Nombre |
|---|---:|
| sources | 1 |
| pages/moitiés OCR | 50 |
| leçons | 11 |
| entrées vocabulaire | 271 |
| règles grammaticales | 29 |
| exercices | 30 |
| textes d’étude indexés | 11 |
| tâches de review | 352 |
| app_ready | 0 |

Contrôles :

- `PRAGMA integrity_check` : ok
- `PRAGMA foreign_key_check` : vide
- doublons de formes fusionnés, sauf homonyme volontaire `râh` :
  - `râh` = il est (être présent, leçon 4)
  - `râh` = s’en aller, partir (leçon 9)

## Contenu structuré

### Leçons

1. Prononciation et lecture. L’article.
2. Prononciation et lecture (fin). L’article (fin).
3. Récapitulation des sons. Le démonstratif.
4. L’interrogation. Manière de rendre « être » au présent.
5. Les pronoms personnels suffixes. Possession avec `eand-`.
6. Récapitulation. Possession avec `mtâe` / `dyâl`.
7. Le verbe : accompli. Négation.
8. Les pronoms personnels isolés. Nombres 1 à 5.
9. Le verbe : inaccompli. Nombres 6 à 10. Jours.
10. `kân / ikûn`. Les participes.
11. Début : récit + impératif, à compléter avec la partie 02.

### Apports grammaticaux principaux

- article `el`, variantes `le-`, `la-`, assimilation ;
- annexion et féminin `-a → -at/-et` ;
- démonstratifs `hâda/hâdi/hâdu`, `hâdak/hâdik/hâduk`, `hâd-el-` ;
- interrogation : `wâš`, `škûn`, `kéf`, `wén`, `weqtaš`, `šhâl`, `elaš`, `mnayn` ;
- être présent : proposition sans verbe ou `râni/râk/râh/râha/râna/râkum/râhum` ;
- possession : `eand-i`, `eand-ek`, etc. ; `mtâe`, `dyâl` ;
- pronoms suffixes : `-i`, `-k`, `-o`, `-ha`, `-na`, `-kum`, `-hum` ;
- négation : `ma … -ši/-š`, `ma-ši` sans verbe ;
- accompli : suffixes, ressaut vocalique ;
- inaccompli : préfixes `n-`, `t-`, `y-/i-`, formes longues ;
- `kân / ikûn` : imparfait/futur de l’état ;
- participes actifs/passifs ;
- nombres 1–10, état isolé/construit, jours de la semaine.

## Qualité et limites

- Toutes les entrées sont **`needs_review`**.
- Aucune entrée n’est `native_validated` ni `app_ready`.
- Les formes latines suivent la transcription du manuel ; elles ne sont pas automatiquement converties en phonétique moderne `3/7/ch`.
- L’arabe en caractères arabes n’a pas été ingéré comme vérité : l’OCR droite reste bruité.
- Les textes d’étude sont indexés mais non publiés ; transcription/validation nécessaire.
- Certains mots OCR partiels sont signalés en note : `et-temrin`, `ujed`, `drâhem`, etc.
- Le livre est sous droit Klincksieck. Usage interne/recherche ; publication dans l’app nécessite licence ou contenu original/licencié.

## Exports

Dossier : `exports/partie-01/`

- `lessons.json` / `.csv`
- `vocabulary.json` / `.csv`
- `grammar_rules.json` / `.csv`
- `exercises.json` / `.csv`
- `study_texts_index.json` / `.csv`
- `counts.json`

Les exports sont structurés mais restent marqués `needs_review`.

## Nettoyage

- doublon d’upload supprimé après vérification SHA ;
- PNG OCR régénérables supprimés ;
- ancien OCR pleine page entreligné supprimé au profit de l’OCR colonnes ;
- script OCR pleine page obsolète supprimé ;
- base compactée ;
- un backup conservé : `backups/manuel-apres-partie-01.sqlite`.

## Prochaine étape

Envoyer **partie 02/5**. Elle sera traitée dans la même base séparée, avec :

1. vérification SHA ;
2. OCR colonnes ;
3. continuation des leçons 11+ ;
4. enrichissement du skill ;
5. rapport + nettoyage + archive.
