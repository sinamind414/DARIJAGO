# Bilan final — dictionnaire 1910 → base application darija

## Résultat global

Les **10 PDF** du livre ont été intégrés dans une base commune.

| Indicateur | Valeur |
|---|---:|
| Sources PDF canoniques | 10 |
| Pages OCR conservées | 864 |
| Entrées brutes totales | 9622 |
| Entrées algériennes brutes | 9222 |
| Entrées algériennes actives | 8819 |
| Supplément tunisien séparé | 400 |
| Règles skill | 72 |
| Entrées `app_ready` | 0 |
| Formes/audio validés nativement | 0 |
| Intégrité SQLite | ok |

## Couverture du livre

| Partie | Couverture | Pages |
|---|---|---:|
| 01 | Front matter + A → AMU | 90 |
| 02 | ANN → CON | 90 |
| 03 | CON → Être | 90 |
| 04 | ETR → ILO | 90 |
| 05 | IMM → MET | 90 |
| 06 | MEU → PIL | 90 |
| 07 | PIO → REM | 90 |
| 08 | REM → SUB | 90 |
| 09 | SUB → VOI | 90 |
| 10 | VOI → ZOU + annexes + supplément tunisien | 54 |

Le dictionnaire principal est couvert de **A à ZOU**. Les annexes de la partie 10 sont documentées : chiffres, villes d’Algérie, supplément tunisien, monnaies tunisiennes, villes de Tunisie, table des matières, pages blanches et paratexte de bibliothèque.

## Partie 10 — dernier fichier

- 54 pages PDF.
- 9 pages lexicales algériennes : pages imprimées 743–751.
- 109 entrées algériennes après curation.
- 100 entrées algériennes actives.
- 9 fragments OCR / faux positifs exclus.
- 7 sous-entrées restaurées.
- 16 vedettes principales ajoutées ou réparées.
- 14 règles skill ajoutées.
- 24 entrées dans l’échantillon app.
- Supplément tunisien : 400 entrées, `register=tunisien_1910`, exclu du corpus algérien.

## Ce qui est prêt

- Base SQLite structurée avec provenance.
- OCR brut conservé par page.
- Exports JSON/CSV par partie et master.
- Export actif algérien séparé du supplément tunisien.
- Recherche plein texte FTS.
- File de revue `review_tasks`.
- Règles skill historiques non validées.
- Rapports de curation par partie.
- Référence agent pour les parties 02 à 10.
- Skill darija algérienne mis à jour.
- Archive projet consolidée.

## Ce qui n’est pas encore prêt

- Publication directe dans l’application.
- Formes modernes validées par des natifs.
- Audio natif.
- Leçons/quiz définitifs.
- Supplément tunisien exploitable comme variante tunisienne.

## Workflow qualité restant

```text
needs_review → corrected → native_validated → app_ready
```

Priorité recommandée :

1. Choisir 20 à 50 mots très fréquents.
2. Corriger l’OCR et la translittération historique.
3. Faire valider par des locuteurs natifs algériens.
4. Ajouter audio natif ou voix synthétique clairement signalée.
5. Créer les fiches mot, puis les premiers parcours mobiles.

## Décision

Le livre est transformé en base de travail exploitable. La prochaine étape n’est plus l’ingestion PDF, mais la **validation native** et la construction du contenu application.
