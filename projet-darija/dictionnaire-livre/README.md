# Dictionnaire historique → application darija

## Objectif

Transformer les 10 fichiers PDF du dictionnaire en :

1. corpus OCR brut ;
2. entrées structurées ;
3. base SQLite réutilisable ;
4. exports CSV/JSON ;
5. règles pour le skill agent ;
6. contenu d’application après validation native.

## État actuel : livre complet côté ingestion

| Partie | Pages | Brutes algériennes | Actives algériennes | Supplément tunisien | Statut |
|---|---:|---:|---:|---:|---|
| partie-01 | 90 | 232 | 232 | 0 | OCR brut, needs_review |
| partie-02 | 90 | 985 | 983 | 0 | OCR brut, needs_review |
| partie-03 | 90 | 1201 | 1195 | 0 | OCR brut, lexical-2-draft, needs_review |
| partie-04 | 90 | 1076 | 1052 | 0 | OCR brut, lexical-2-draft, needs_review |
| partie-05 | 90 | 1106 | 1093 | 0 | OCR brut, lexical-2-draft, needs_review |
| partie-06 | 90 | 1072 | 1002 | 0 | OCR brut, lexical-2.1-draft, needs_review |
| partie-07 | 90 | 1100 | 1035 | 0 | OCR brut, lexical-2.1-draft, needs_review |
| partie-08 | 90 | 1140 | 1041 | 0 | OCR brut, lexical-2.1-draft, needs_review |
| partie-09 | 90 | 1201 | 1086 | 0 | OCR brut, lexical-2.1-draft, needs_review |
| partie-10 | 54 | 109 | 100 | 400 | OCR + curation, needs_review |
| Total | 864 | 9222 | 8819 | 400 | base commune |

> Important : ce sont des entrées **brutes historiques**, pas encore du contenu app validé.
>
> Le supplément tunisien de la partie 10 est stocké séparément : `register=tunisien_1910`, `in_algerian_corpus=0`. Il ne doit pas être mélangé au corpus darija algérienne grand public.

## Base de données

```text
db/dictionnaire.sqlite
```

Tables principales :

- `sources` : un enregistrement par PDF/partie.
- `pages` : texte OCR par page, section, page imprimée.
- `entries` : entrée française brute + bloc OCR + page + registre.
- `entry_forms` : formes arabes/translittérées/audio, à remplir après validation.
- `senses` : sens, registre, domaine, exemples.
- `skill_rules` : règles pédagogiques/linguistiques issues du livre.
- `review_tasks` : file de validation.
- `processing_runs` : traçabilité des traitements.
- `entries_fts` : recherche plein texte.

Vues :

- `v_entries_review` : entrées à revoir, sans faux positifs évidents.
- `v_entries_algerien` : entrées actives du corpus algérien uniquement.

Champs importants ajoutés pour la partie 10 :

- `register` : `algerien_1910` ou `tunisien_1910`.
- `in_algerian_corpus` : 1 ou 0.
- `parent_headword` : lien sous-entrée → vedette parente.
- `section` : `dictionnaire`, `supplement_tunis`, etc.

## Exports

Exports consolidés conservés :

```text
exports/dictionnaire-master-brut.json
exports/dictionnaire-master-brut.csv
exports/dictionnaire-master-actif.json
exports/dictionnaire-master-actif.csv
exports/dictionnaire-supplement-tunis-actif.json
exports/dictionnaire-supplement-tunis-actif.csv
```

Les exports intermédiaires par partie (`partie-*-entries-brutes`, échantillons, apercus) et les doublons tunisiens bruts ont été supprimés pour libérer le workspace. Les données restent dans la base SQLite et peuvent être régénérées.

Le master actif contient uniquement le corpus algérien actif. Le supplément tunisien a son propre export actif séparé.

## Scripts réutilisables

```text
scripts/ocr_partie.py
scripts/segmenter_partie_v2.py
scripts/ingerer_partie_v2.py
scripts/finaliser_partie_10.py
scripts/consolider_base.py
scripts/nettoyer_fichiers.py
```

> Depuis la partie 06 : segmentation `lexical-2.1-draft`, avec prise en charge des ligatures françaises `Œ/œ`.
>
> La partie 10 utilise en plus `finaliser_partie_10.py` pour la curation ciblée, les sous-entrées, les vedettes absorbées et le supplément tunisien séparé.

## Workflow terminé

Les 10 PDF ont été intégrés :

```bash
# OCR
python scripts/ocr_partie.py --pdf raw/partie-NN.pdf --out ocr/partie-NN

# Segmentation + ingestion
python scripts/ingerer_partie_v2.py \
  --ocr-dir ocr/partie-NN \
  --pdf raw/partie-NN.pdf \
  --part partie-NN \
  --db db/dictionnaire.sqlite \
  --exports exports \
  --dict-start <debut> --dict-end <fin>

# Partie 10 uniquement : curation + supplément tunisien
python scripts/finaliser_partie_10.py

# Consolidation
python scripts/consolider_base.py \
  --db db/dictionnaire.sqlite \
  --exports exports \
  --root .
```

## Règles de qualité

- Ne jamais publier une entrée OCR brute comme contenu définitif.
- Garder la provenance : fichier + page PDF + page imprimée.
- Séparer : forme historique, forme moderne, audio, exemple.
- Marquer les termes vieillis, régionaux, sensibles ou religieux.
- Depuis la partie 07, les sujets sensibles sont signalés par le flag `sensitive_topic`.
- Depuis la partie 10, le supplément tunisien est exclu du corpus algérien via `in_algerian_corpus=0`.
- Ne pas utiliser le livre comme autorité unique : croiser avec corpus vidéo + natifs.
- Prévoir une file de revue : `needs_review → corrected → native_validated → app_ready`.

## Prochaine étape recommandée

1. Valider un petit lot de 20 à 50 entrées fréquentes.
2. Créer le format “fiche mot” pour l’application.
3. Ajouter audio natif.
4. Construire les premiers parcours Android/iOS à partir des entrées validées.
5. Traiter le supplément tunisien seulement si une variante tunisienne est souhaitée.

## Nettoyage

Un nettoyage conservateur peut être lancé avec :

```bash
python /home/user/projet-darija/nettoyer_workspace.py
```

Il supprime uniquement :

- doublons PDF uploadés si une copie canonique vérifiée existe dans `raw/` ;
- images OCR PNG régénérables ;
- dossiers OCR d’échantillon ;
- anciens textes OCR d’échantillon à la racine de `ocr/` ;
- caches Python ;
- exports candidats intermédiaires remplacés par les exports finaux ;
- archives ZIP redondantes avec les dossiers sources ;
- anciens backups remplacés par le backup de sécurité le plus récent ;
- ancien script d’ingestion remplacé par la v2.

Il conserve :

- PDF sources canoniques dans `raw/` ;
- base SQLite ;
- textes OCR par partie ;
- scripts ;
- exports ;
- rapports ;
- backup de sécurité le plus récent.
