# Rapport de revue — partie 03

## Résumé

- PDF : `raw/partie-03.pdf`
- Pages PDF : **90**
- Couverture imprimée approximative : **113 → 202**, soit **CON → ÊTRE**.
- OCR : Tesseract `fra+ara`, PSM 6, OEM 1.
- Segmentation : `lexical-2-draft`.
- Candidats détectés : **1 201**.
- Faux positifs OCR marqués : **6**.
- Entrées actives à revoir : **1 195**.
- Entrées avec caractères arabes détectés : **1 014**.
- Entrées actives sans arabe détecté : **182**.
- Blocs avec preuve d’entrée faible : **46**.
- Blocs traversant plusieurs pages : **57**.
- Vedettes suspectes signalées : **18**.
- Règles skill ajoutées : **5**, toutes `needs_review`.

## Améliorations du pipeline

Pour cette partie, le pipeline a été renforcé :

- détection des vedettes après `||` et en début de ligne ;
- prise en charge des qualificatifs entre parenthèses, ex. `Contrôler (vérifier)` ;
- rejet des départs de phrases évidents, ex. `Ceci me convient`, `Faites l'appel` ;
- rejet des fragments OCR en majuscules, ex. `LS hateb`, `SRI tañädda` ;
- conservation du texte OCR brut et de la page source ;
- ajout de `printed_page_start`, `printed_page_end`, `parser_version`, `extraction_flags`, `entry_uid` ;
- journal `processing_runs` pour tracer l’import ;
- export actif séparé du brut.

## Faux positifs marqués

Ces fragments ont été marqués `false_positive` car ils ressemblent à du bruit OCR, pas à des vedettes :

- `Vs blar'ji`
- `Re r'achech`
- `Ne tijal`
- `Jounm elouuu`
- `Jra`
- `Re fetna`

Ils restent dans le brut pour audit, mais sont exclus de l’export actif.

## Vedettes suspectes à vérifier

Certaines vedettes peuvent être des OCR corrompus ou des exemples mal segmentés. Elles restent `needs_review` avec le flag `suspect_headword`, par exemple :

- `Jtour`
- `Jarma`
- `Lelma`
- `Esvoi`
- `J'ai la crampe`
- `J'entends`
- `Lâcher de l'eau`
- `A l'écart`

Ne pas les publier sans vérifier la page image.

## Règles ajoutées au skill

Toutes sont historiques et non validées :

1. État personnel : `rani / rak / rahi / rana / rakum / rahum`.
2. Futur de être : `nkoun / tkoun`.
3. Possession historique : `nitaâi / mtaâ`, proposition moderne `nta3i / nta3`.
4. Démonstratifs : `hada / hadi`.
5. Interrogatif : `achmen jiha`, proposition moderne `achmen / wach men`.

## Lot pilote recommandé

Valider d’abord des entrées fréquentes :

- Conversation
- Copier
- Corde
- Coton
- Coudre
- Courir
- Créer
- Crier
- Cuire
- Dire
- Eau
- École
- Écrire
- Égal
- Être

Un échantillon JSON est disponible :

```text
exports/partie-03-echantillon-app.json
```

## Décision

La partie 03 est intégrée dans la base commune avec une meilleure traçabilité. Elle est prête pour la phase de correction/validation, pas pour publication directe dans l’application.
