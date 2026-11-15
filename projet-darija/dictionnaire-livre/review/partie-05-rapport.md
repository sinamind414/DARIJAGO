# Rapport de revue — partie 05

## Résumé

- PDF : `raw/partie-05.pdf`
- Pages PDF : **90**
- Couverture imprimée approximative : **293 → 382**, soit **IMM → MET**.
- OCR : Tesseract `fra+ara`, PSM 6, OEM 1.
- Segmentation : `lexical-2-draft`.
- Candidats détectés : **1 106**.
- Faux positifs OCR/exemples marqués : **13**.
- Entrées actives à revoir : **1 093**.
- Entrées avec caractères arabes détectés : **910**.
- Entrées actives sans arabe détecté : **191**.
- Blocs avec preuve d’entrée faible : **79**.
- Blocs traversant plusieurs pages : **49**.
- Vedettes suspectes signalées : **7**.
- Règles skill ajoutées : **7**, toutes `needs_review`.

## Faux positifs marqués

Ces éléments ont été marqués `false_positive` car ils ressemblent à des exemples, des fragments OCR ou des doublons corrompus :

- `Vih fih`
- `Joussag`
- `N'ayez point d'inquiétude`
- `À-Lail éndho faïda fi had' elgediya`
- `Lao d'eyyef`
- `Se h'allef`
- `Css`
- `Lis`
- `Gd'l'eb nefkho`
- `Joel`
- `Âas qebd'a`
- `Lis ih'tiqur`
- `Hnprégner`

Ils restent dans le brut pour audit, mais sont exclus de l’export actif.

## Vedettes suspectes à vérifier

Certaines vedettes peuvent être des OCR corrompus ou des entrées secondaires. Elles restent `needs_review` avec le flag `suspect_headword`, par exemple :

- `Iman`
- `Inprécation`
- `Victime`
- `Jean`
- `Dieu`
- `Mème`

Ne pas les publier sans vérifier la page source.

## Règles ajoutées au skill

Toutes sont historiques et non validées :

1. Image : `tecouira`, proposition moderne `tsawira`.
2. Inutile : `bla faida / ma ienfâ ch`, proposition moderne `bla fayda`.
3. Lire : `naqra / grit / gra`, proposition moderne `neqra / qrit / qra`.
4. Lit : `frach / srir`.
5. Main : `yed / iedi`, proposition moderne `yed / yedi`.
6. Mer : `bh’ar`, proposition moderne `b7ar`.
7. Mère : `oumm / iemma`, proposition moderne `omma / yemma`.

## Lot pilote recommandé

Valider d’abord des entrées fréquentes :

- Image
- Important
- Indiquer
- Inutile
- Ivre
- Jeu
- Jour
- Juge
- Lire
- Lit
- Lune
- Main
- Mal
- Mari
- Mer
- Mère
- Message
- Mesure

Un échantillon JSON est disponible :

```text
exports/partie-05-echantillon-app.json
```

## Décision

La partie 05 est intégrée dans la base commune. Elle est prête pour la phase de correction/validation, pas pour publication directe dans l’application.
