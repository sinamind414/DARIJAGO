# Rapport de revue — partie 08

## Résumé

- PDF : `raw/partie-08.pdf`
- SHA-256 : `5a2a5f8fe6f56b89ede78206cffdcc33aa336ed38493f131c33787c01e87f524`
- Pages PDF : **90**
- Couverture imprimée : **563 → 652**, soit **REM → SUB**.
- OCR : Tesseract `fra+ara`, PSM 6, OEM 1.
- Segmentation : `lexical-2.1-draft`.
- Candidats détectés : **1140**.
- Faux positifs OCR/exemples marqués : **99**.
- Entrées actives à revoir : **1041**.
- Entrées avec caractères arabes détectés : **952**.
- Entrées actives sans arabe détecté : **147**.
- Blocs avec preuve d’entrée faible : **57**.
- Blocs traversant plusieurs pages : **39**.
- Vedettes suspectes signalées : **20**.
- Sujets sensibles signalés : **7**.
- Règles skill ajoutées : **8**, toutes `needs_review`.

Les numéros de page imprimée ont été normalisés par continuité : page PDF 1 = page livre 563, page PDF 90 = page livre 652.

## Faux positifs marqués

Ces éléments ont été marqués `false_positive` car ils ressemblent à des exemples, des fragments OCR ou des notes. Ils restent dans le brut pour audit, mais sont exclus de l’export actif.

Liste :

- Aa de khelifa (p. 1)
- En remplacement de (p. 1)
- Yo badalen men (p. 1)
- Rendre service (p. 3)
- Ces tibun (p. 4)
- Se mitorni (p. 4)
- Sr tark (p. 5)
- Là rar (p. 6)
- Leläim (p. 12)
- L'assit chi beszelsela (p. 13)
- En dernier ressort (p. 14)
- Faire ressortir (p. 14)
- Rss netiju (p. 15)
- En résumé (p. 15)
- Rs beliya (p. 21)
- Lai kamel (p. 22)
- FAbLS giama (p. 22)
- Jahennama (p. 23)
- Se d'ah'al (p. 25)
- Éclat de rire (p. 25)
- À ie fetna (p. 26)
- Jr nechnech (p. 27)
- A tour de rôle (p. 27)
- Là Le éllaiy (p. 28)
- Fhechana (p. 32)
- Maison en ruine (p. 33)
- À geddid (p. 38)
- Rule njaça (p. 38)
- Prix du sang (p. 40)
- Sauter aux nues (p. 44)
- Aa boulr'a (p. 45)
- Lane céib (p. 46)
- Jed'il'a (p. 46)
- Faire un scandale (p. 46)
- Kharji (p. 47)
- À necher (p. 47)
- Las nchef (p. 49)
- Ans cadaqa (p. 50)
- Au sein (p. 51)
- Selles dures (p. 52)
- Jiles moumathel (p. 53)
- Dana chabih (p. 53)
- Las cebib (p. 54)
- Lassa (p. 54)
- Reprendre ses sens (p. 54)
- J-i-s do moula äâqel (p. 55)
- Dieu (p. 55)
- He l'anouchu (p. 59)
- À chedd (p. 59)
- Las ouah'dna (p. 61)
- Pas un seul (p. 61)
- Punition sévère (p. 61)
- Etre sevré (p. 62)
- Faire la sieste (p. 63)
- Donner le signalement (p. 64)
- Faire signe de la main (p. 64)
- Faire signe de l'œil (p. 64)
- Sa signification (p. 64)
- Cargo cent (p. 65)
- Ji seman oual'ad (p. 66)
- Salt cefaoua (p. 66)
- Bai essoudous (p. 67)
- Ma sœur de lait (p. 69)
- A part soi (p. 69)
- Ass ma kan Laja (p. 70)
- Soit celui-ci (p. 70)
- L'année solaire (p. 70)
- Sail engeleb (p. 72)
- À end gima (p. 72)
- En somme (p. 72)
- Somme toute (p. 73)
- Au menam (p. 74)
- Tirez la sonnette (p. 74)
- Tirer au sort (p. 75)
- Tirage au sort (p. 75)
- Rss cifa (p. 75)
- En sorte que (p. 75)
- Faire sortir (p. 75)
- Faire un soubresaut (p. 76)
- A souhait (p. 78)
- Rule njaça (p. 78)
- Jarre (p. 79)
- Heu touhma (p. 80)
- Jimen techekk (p. 80)
- Froncer les sourcils (p. 81)
- R'ouajebho (p. 81)
- Lellhafia (p. 82)
- Peas tebsima (p. 82)
- Lou jelida (p. 82)
- En sous-entendant (p. 83)
- Ca ougef (p. 83)
- YJekkernr (p. 84)
- Jalal (p. 87)
- Jr menzel (p. 88)
- Das taqiid (p. 88)
- Sail habet elqalb (p. 89)
- Ba lire (p. 90)
- Lil ah'mag (p. 90)
- L'oumg (p. 90)

## Vedettes suspectes à vérifier

Ces vedettes restent actives mais sont signalées `suspect_headword`, avec une proposition de correction :

| Vedette OCR | Proposition | Page PDF |
|---|---|---:|
| Renaitre | Renaître | 2 |
| Reparaitre | Reparaître | 6 |
| Se repentant | Se repentir | 7 |
| Se replier | Replier (se) | 8 |
| DPpousser | Repousser | 9 |
| Résidant | Résident / Résidant — à vérifier | 11 |
| Se retrancher | Retrancher (se) | 18 |
| Revètir | Revêtir | 21 |
| Réveur | Rêveur | 21 |
| Revision | Révision | 22 |
| Rontteur | Ronfleur | 28 |
| Sanctiflé | Sanctifié | 40 |
| Sanctifler | Sanctifier | 40 |
| Siécle | Siècle | 63 |
| Îles | Île | 63 |
| Sincére | Sincère | 66 |
| Sixièémement | Sixièmement | 67 |
| Bète de somme | Bête de somme | 73 |
| Se soustraire | Soustraire (se) | 83 |
| Soutien supporti | Soutien (support) | 84 |

Ne pas les publier sans vérifier la page source.

## Sujets sensibles

Les entrées suivantes sont signalées `sensitive_topic` et doivent être revues avant tout usage grand public :

- Saloperie
- Sensualité
- Sensuel
- Sexe
- Sexuel
- Sodomie
- Sodomite

## Règles ajoutées au skill

Toutes sont historiques et non validées :

1. `remplir_3ammer` : Remplir: nemla / nâammer / mlit / âmmert / mla / âmer. Proposition moderne: n3ammer / 3ammert / 3ammer; variante nemla. À valider.
2. `rencontrer_tlaqa` : Rencontrer: nlaqi / laqit / laqa / sadeq. Proposition moderne: ntlaqa / tlaqit / tlaqa; variante nlaqi. À valider.
3. `rendre_redd` : Rendre: redd / reddit / redd; aussi tegayyit (vomir). Proposition moderne: nredd / reddit / redd. À valider.
4. `rester_bqa` : Rester: bqa / bqit / bqa / qâad. Proposition moderne: nbqa / bqit / bqa. À valider.
5. `revenir_rja3` : Revenir: narjä / nouelli / rja3t / ouellit / rja3 / ouella. Proposition moderne: nerja3 / rja3t / rja3; variante nwelli. À valider.
6. `rire_dahak` : Rire: nad'h'ak / d'ak'akt / d'ak. Proposition moderne: ndahak / dahakt / dahak. À valider.
7. `savoir_3ref` : Savoir: néref / dreft / âref / âlem. Proposition moderne: n3ref / 3reft / 3ref. À valider.
8. `sortir_khrej` : Sortir: nokhrej / khrejt / kherej. Proposition moderne: nokhrej / khrejt / khrej. À valider.

## Lot pilote recommandé

Un échantillon JSON de 24 entrées fréquentes est disponible :

```text
exports/partie-08-echantillon-app.json
```

Exemples : Remplir, Rencontrer, Rester, Revenir, Rire, Riz, Roi, Rouge, Rue, Sable, Sac, Sage, Salaire, Sale, Salé, Salut, Sang, Santé, Savoir, Savon, Sec, Sel, Semaine, Sortir.

## Limites connues

- Certaines vedettes très courtes ou mots-outils peuvent être filtrées par le parseur brouillon ; une revue page par page reste nécessaire.
- Les homographes et formes réflexives sont conservés séparés lorsqu’un qualificateur est présent.
- Aucun contenu n’est marqué `app_ready`.
- Les formes modernes sont des propositions à valider par des locuteurs natifs.

## Décision

La partie 08 est intégrée dans la base commune. Elle est prête pour la phase de correction/validation, pas pour publication directe dans l’application.
