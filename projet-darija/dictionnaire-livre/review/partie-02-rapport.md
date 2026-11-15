# Rapport de revue — partie 02

## Résumé

- 90 pages OCRisées.
- Zone dictionnaire : pages 1 à 90 du PDF.
- Couverture approximative : **ANN → CON**.
- Entrées brutes détectées : **985**.
- Entrées avec caractères arabes détectés : **878**.
- Faux départs évidents marqués : `Faites l'appel`, `Contente-toi de ce que tu as`.
- Toutes les entrées restantes sont `needs_review`.

## Points forts

- La partie 02 est presque entièrement du dictionnaire.
- Le rendement OCR est meilleur que la partie 01.
- Beaucoup d’entrées utiles pour l’application : verbes du quotidien, noms, expressions.

## Points faibles

- L’OCR mélange français, translittération ancienne et arabe.
- Certaines lettres arabes sont mal reconnues.
- Les formes historiques ne sont pas toujours les formes modernes.
- Quelques entrées sont des exemples ou des fragments, pas des mots-headwords.

## Règles ajoutées au skill

1. Possession historique : `mta` / `dial`.
2. Avec + personnes : formes historiques à moderniser en `m3a`.
3. Demander le nom : `kach issemmouk` → proposition moderne `wach ismek`.
4. Bon appétit : formule historique `Allah iqennâak`.
5. Apporter : `nejib / jebt / jab`, impératif `jib`.

## Lot pilote recommandé

Valider d’abord :

- Année
- Âne
- Animal
- Appétit
- Apporter
- Arriver
- Asseoir
- Attendre
- Beaucoup
- Boire

Un échantillon JSON est disponible :

```text
exports/partie-02-echantillon-app.json
```

## Décision

La partie 02 est intégrée dans la base commune. Elle est prête pour la phase de correction/validation, pas encore pour publication directe dans l’application.
