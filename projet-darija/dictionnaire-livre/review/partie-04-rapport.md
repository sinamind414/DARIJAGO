# Rapport de revue — partie 04

## Résumé

- PDF : `raw/partie-04.pdf`
- Pages PDF : **90**
- Couverture imprimée approximative : **203 → 292**, soit **ETR → ILO**.
- OCR : Tesseract `fra+ara`, PSM 6, OEM 1.
- Segmentation : `lexical-2-draft`.
- Candidats détectés : **1 076**.
- Faux positifs OCR/exemples marqués : **24**.
- Entrées actives à revoir : **1 052**.
- Entrées avec caractères arabes détectés : **910**.
- Entrées actives sans arabe détecté : **156**.
- Blocs avec preuve d’entrée faible : **54**.
- Blocs traversant plusieurs pages : **50**.
- Vedettes suspectes signalées : **17**.
- Règles skill ajoutées : **6**, toutes `needs_review`.

## Faux positifs marqués

Ces éléments ont été marqués `false_positive` car ils ressemblent à des exemples conjugués, des pluriels isolés ou du bruit OCR, pas à des vedettes principales :

- `Sois`, `Étant`
- `Lis houma`, `L'ouadeth`
- `J'examine votre affaire`, `Ji rah'bet essouq`
- `Faire l'exercice`, `Jehhemni felged'iya`
- `J'ai fermé`, `J'ignore`
- `Lord`, `Cia`, `Jos`, `Fab l'ofia`
- `J-LLs bar'el`, `Jorb`, `Bis L ia k'afid`
- `Jouq`, `Lis`, `Li As k'ormetna bagia àlina`, `Ris`
- `Johhal`, `Jezair`, `Rebabel`

Ils restent dans le brut pour audit, mais sont exclus de l’export actif.

## Vedettes suspectes à vérifier

Certaines vedettes peuvent être des OCR corrompus ou des entrées secondaires. Elles restent `needs_review` avec le flag `suspect_headword`, par exemple :

- `Êve`
- `Etroit`, `Etude`, `Etudiant`
- `Evénement`, `Eventail`, `Eventer`
- `Evidemment`, `Evidence`
- `Face 'à face`
- `A l'extrême`
- `Enfant illégitime`
- `Habitation d'hiver`
- `Gousse d'ail`
- `Fieuve`

Ne pas les publier sans vérifier la page image ou le PDF source.

## Règles ajoutées au skill

Toutes sont historiques et non validées :

1. Conjugaison historique de être : `kount / kan / kanet / kounna / kountou / kanou`.
2. Adjectif facile : `sahel / sahla`.
3. Fils : `ouled / ben / beni`.
4. Gens : `nass`.
5. Hier : `elbarah / ams`, proposition moderne `lbare7`.
6. Ici : `hena / lhaoun`, proposition moderne `hna`.

## Lot pilote recommandé

Valider d’abord des entrées fréquentes :

- Étudier
- Évident
- Éviter
- Facile
- Faim
- Fer
- Fête
- Feu
- Fils
- Foi
- Foie
- Fort
- Fou
- Fuir
- Gens
- Hier
- Ici
- Idée
- Île

Un échantillon JSON est disponible :

```text
exports/partie-04-echantillon-app.json
```

## Décision

La partie 04 est intégrée dans la base commune. Elle est prête pour la phase de correction/validation, pas pour publication directe dans l’application.
