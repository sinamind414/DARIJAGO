# Rapport de revue — partie 07

## Résumé

- PDF : `raw/partie-07.pdf`
- SHA-256 : `bff9c7ec95fbf1bdd6aa1b0421333e584037277b1e588f45593cf73e400a43a1`
- Pages PDF : **90**
- Couverture imprimée : **473 → 562**, soit **PIO → REM**.
- OCR : Tesseract `fra+ara`, PSM 6, OEM 1.
- Segmentation : `lexical-2.1-draft`.
- Candidats détectés : **1 100**.
- Faux positifs OCR/exemples marqués : **65**.
- Entrées actives à revoir : **1 035**.
- Entrées avec caractères arabes détectés : **891**.
- Entrées actives sans arabe détecté : **184**.
- Blocs avec preuve d’entrée faible : **64**.
- Blocs traversant plusieurs pages : **52**.
- Vedettes suspectes signalées : **24**.
- Sujets sensibles signalés : **5**.
- Règles skill ajoutées : **8**, toutes `needs_review`.

Les numéros de page imprimée ont été normalisés par continuité : page PDF 1 = page livre 473, page PDF 90 = page livre 562.

## Faux positifs marqués

Ces éléments ont été marqués `false_positive` car ils ressemblent à des exemples, des fragments OCR ou des notes. Ils restent dans le brut pour audit, mais sont exclus de l’export actif.

Liste :

- À is do chufaga
- Faites-moi ce plaisir
- Plait à Dieu
- En plein jour
- Pluie battante
- À choucha
- El akter men
- Plus tard
- Plus tôt
- Ji tegel
- Fa moulem
- Coup de poignard
- Au point que
- Jihat
- Point du tout
- J'elfel akh'al
- AmlisS hiaça
- Jales
- Poulet rôti
- Pal Lx moutaleba
- L'uouez
- Us tegeddem
- Lois lagqeg
- Va sn Mmerbour
- Aie tesjia
- En sa présence
- Prêter l'oreille
- D sejen
- Ras qima
- Rheçcaim
- Gagner son procès
- Perdre son procès
- Cl ati
- À es
- Vains propos
- Aeuwlis menasba
- Maison de prostitution
- Cris mebeyyen
- Lie berqouq
- En public
- AAe älaniyr
- Ales méaqha
- Jus fsed
- Hz Al ma nârf ach nämel
- Gal tqabed'
- Cea-i is benogran
- Re abs khatfu
- Raul mnasba
- En conformité
- À b tobba
- Lx mcher
- Ravir le cœur
- Lslas nfaq
- Jess geboul
- Ale
- J'ai recours à vous
- Cas jleh
- Khatt elied
- Caine cennef
- Aller en référé
- St Lereb
- En regard
- She lLoukm
- L'akem
- Like

## Vedettes suspectes à vérifier

Ces vedettes restent actives mais sont signalées `suspect_headword`, avec une proposition de correction :

| Vedette OCR | Proposition |
|---|---|
| Piéiades | Pléiades |
| Poële | Poêle |
| Poëte | Poète |
| Po ueriture | Pourriture |
| Pouyrvoyeur | Pourvoyeur |
| Précipiter ijeter | Précipiter (jeter) |
| Prècher | Prêcher |
| Premiérement | Premièrement |
| Préter | Prêter |
| Procës | Procès |
| Quèêter | Quêter |
| Qu''en-dira-t-on | Qu'en-dira-t-on |
| Raiïller | Railler |
| Raïisonnablement | Raisonnablement |
| Rafraichissant | Rafraîchissant |
| Rafraîichissements | Rafraîchissements |
| Rawvin | Ravin |
| Réchaufter | Réchauffer |
| Reméde | Remède |
| Remerciments | Remerciements |
| Se remarier | Remarier (se) |
| Las | Las — vérifier si vedette réelle ou fragment OCR |
| Ravilir | Ravilir / Ravir — à vérifier |

Ne pas les publier sans vérifier la page source.

## Sujets sensibles

Les entrées suivantes sont signalées `sensitive_topic` et doivent être revues avant tout usage grand public :

- Rapports sexuels
- Prostituée
- Prostitution
- Pucelle
- Prépuce

## Règles ajoutées au skill

Toutes sont historiques et non validées :

1. Pleurer : `nebki / bkit / bka`, proposition moderne `nebki / bkit / bka`.
2. Pluie : `chetu / nuou / mel'er`, proposition moderne `chta`.
3. Porte : `bab / biban / abouab`, proposition moderne `bab / biban`.
4. Possible : `moumken / ouaqila`, proposition moderne `momken / ymken`.
5. Pouvoir : `neqder / nenjem / qdert / nejemt`, proposition moderne `neqder / qdert / qder`, variante `nnejjem`.
6. Prendre : `nakhoud / nechedd / khed'it / cheddit`, proposition moderne `nakhoud / nchedd / khedit / cheddit / khda / chedd`.
7. Punir : `nägeb / dgebt / âqeb`, proposition moderne `n3aqeb / 3aqebt / 3aqeb`.
8. Regarder : `nend'or / nedert / ned'er / chouf / nakhzor`, proposition moderne `nchouf / chouft / chaf`, variante `nkhazor`.

## Lot pilote recommandé

Un échantillon JSON de 24 entrées fréquentes est disponible :

```text
exports/partie-07-echantillon-app.json
```

Exemples : Pleurer, Pluie, Poche, Poisson, Poitrine, Pomme, Porte, Possible, Poussière, Pouvoir, Prendre, Près, Printemps, Prison, Problème, Proche, Promesse, Propre, Quarante, Raisin, Ramadan, Regarder, Remercier, Remettre.

## Limites connues

- Certaines vedettes très courtes ou mots-outils peuvent être filtrées par le parseur brouillon ; une revue page par page reste nécessaire.
- Les homographes et formes réflexives sont conservés séparés lorsqu’un qualificateur est présent.
- Aucun contenu n’est marqué `app_ready`.
- Les formes modernes sont des propositions à valider par des locuteurs natifs.

## Décision

La partie 07 est intégrée dans la base commune. Elle est prête pour la phase de correction/validation, pas pour publication directe dans l’application.
