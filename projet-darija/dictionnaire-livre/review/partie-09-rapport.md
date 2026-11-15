# Rapport de revue — partie 09

## Résumé

- PDF : `raw/partie-09.pdf`
- SHA-256 : `c111d8c629a6246febc4e8d49c266f9f3393969e71f6adbf59bd2f08ec2345de`
- Pages PDF : **90**
- Couverture imprimée : **653 → 742**, soit **SUB → VOI**.
- OCR : Tesseract `fra+ara`, PSM 6, OEM 1.
- Segmentation : `lexical-2.1-draft`.
- Candidats détectés : **1201**.
- Faux positifs OCR/exemples marqués : **115**.
- Entrées actives à revoir : **1086**.
- Entrées avec caractères arabes détectés : **975**.
- Entrées actives sans arabe détecté : **181**.
- Blocs avec preuve d’entrée faible : **78**.
- Blocs traversant plusieurs pages : **31**.
- Vedettes suspectes signalées : **18**.
- Sujets sensibles signalés : **12**.
- Règles skill ajoutées : **8**, toutes `needs_review`.

Les numéros de page imprimée ont été normalisés par continuité : page PDF 1 = page livre 653, page PDF 90 = page livre 742.

## Faux positifs marqués

Ces éléments ont été marqués `false_positive` car ils ressemblent à des exemples, des fragments OCR ou des notes. Ils restent dans le brut pour audit, mais sont exclus de l’export actif.

Liste :

- Subir les examens (p. 1)
- En substance (p. 2)
- Las khalef (p. 2)
- Khalifa (p. 2)
- Ji mad'rebhou (p. 3)
- Tout de suite (p. 5)
- Sie linaid'in (p. 5)
- Suivant l'usage (p. 5)
- Ji had' echehan (p. 6)
- Cale faig (p. 7)
- Jakher (p. 7)
- Au (p. 7)
- Jess touassel (p. 8)
- Ji mougaduder (p. 8)
- Supposons que (p. 9)
- Sub D riura (p. 9)
- Ji mal'all laman (p. 10)
- Être sûr (p. 10)
- Laits âtiq (p. 10)
- Eu (p. 10)
- D y mestar'reb (p. 12)
- Ji qefez (p. 12)
- Hhocoucen (p. 12)
- Lorras (p. 13)
- À à d'iga (p. 13)
- Là-le dlleg (p. 14)
- Jik (p. 21)
- Bus khecara (p. 21)
- Tant que tu voudras (p. 21)
- Tantôt en ville (p. 22)
- Petit tapis (p. 22)
- Plus tard (p. 23)
- Der toual'Lachtek (p. 23)
- Taxe des loyers (p. 25)
- Tel que (p. 26)
- Less kif (p. 26)
- Casse fi (p. 27)
- A contre-temps (p. 28)
- Al bregget elqalb (p. 28)
- Ds Jad'd (p. 30)
- Css yo ceräni (p. 31)
- À chedd (p. 33)
- Rs l'uchma (p. 34)
- Tomber goutte à goutte (p. 37)
- Xe eldoud mtaäk (p. 37)
- Jtel (p. 39)
- Ras belkoulliya (p. 40)
- A ke nahla (p. 41)
- Chacun son tour (p. 41)
- Laye goumri (p. 43)
- Tout à l'heure (p. 43)
- À axes gashet erriya (p. 44)
- Laissez-moi tranquille (p. 47)
- Tranquillisez-vous (p. 47)
- Fais ton travail et tais-toi (p. 50)
- Ji had' elleila (p. 51)
- Très bien (p. 52)
- Très malade (p. 52)
- An so tesfia (p. 53)
- Rs bliya (p. 53)
- Los äça (p. 54)
- Ain r'ebina (p. 55)
- Jjeleb (p. 57)
- Ji äqab (p. 58)
- Jebba (p. 59)
- Ji L'ajri (p. 60)
- Jjebbar (p. 60)
- Jmd (p. 62)
- À rai gasriya (p. 63)
- Rétention d'urine (p. 63)
- Selon l'usage établi (p. 63)
- L'asb elâada elmaloufa (p. 63)
- Alam matlouq (p. 64)
- Xi ala (p. 64)
- Rd r'alla (p. 64)
- Aile alla (p. 65)
- J'ai été vacciné (p. 66)
- Terrain vague (p. 67)
- Lys nefs (p. 69)
- Jaouer (p. 70)
- A vendre (p. 73)
- Ne viens pas (p. 74)
- Kat chehili (p. 75)
- Rate mr'itha (p. 75)
- Souhaiter la bienvenue (p. 76)
- Dresser procès-verbal (p. 76)
- Cas kechf (p. 77)
- À ini L'aqiqa (p. 77)
- Mis magammel (p. 78)
- Jjouaih elächiya (p. 79)
- L'eyyer elma (p. 79)
- Las fed'ila (p. 80)
- En vertu de (p. 80)
- Jesd ben adem (p. 81)
- Â ani sqia (p. 81)
- Ds fsad (p. 82)
- Jfath (p. 83)
- Revenir à la vie (p. 83)
- Gagner sa vie (p. 83)
- A vie (p. 83)
- Vin vieux (p. 84)
- Jjehed (p. 85)
- A vil prix (p. 85)
- Aztias fed'ih'a (p. 86)
- Lara ti r'asb (p. 86)
- Age viril (p. 87)
- Membre viril (p. 87)
- Jet'ana (p. 89)
- Ji qaïm laiatou (p. 89)
- Bon vivant (p. 89)
- Axes mäicha (p. 89)
- Ale mâach (p. 89)
- Ass doula (p. 89)
- Particule du vocatif (p. 90)
- Voilà tout (p. 90)

## Vedettes suspectes à vérifier

Ces vedettes restent actives mais sont signalées `suspect_headword`, avec une proposition de correction :

| Vedette OCR | Proposition | Page PDF |
|---|---|---:|
| Suffrage univergel | Suffrage universel | 5 |
| Se tenir | Tenir (se) | 29 |
| Teton | Téton | 32 |
| Théatre | Théâtre | 32 |
| Têt | Têt / Tête — à vérifier | 40 |
| Se toucher | Toucher (se) | 40 |
| Traiînard | Traînard | 45 |
| Trainer | Traîner | 45 |
| Trainer | Traîner | 45 |
| Traïite | Traite | 45 |
| Traitre | Traître | 46 |
| Traitreusement | Traîtreusement | 46 |
| Se tranquilliser | Tranquilliser (se) | 47 |
| Triompbateur | Triomphateur | 54 |
| Se troubler | Troubler (se) | 57 |
| DErersite | Université | 63 |
| Verdtre | Verdâtre | 76 |
| Se vêtir | Vêtir (se) | 81 |

Ne pas les publier sans vérifier la page source.

## Sujets sensibles

Les entrées suivantes sont signalées `sensitive_topic` et doivent être revues avant tout usage grand public :

- Syphilis
- Testicule
- Utérus
- Vagin
- Vénérien
- Verge
- Vérole
- Vesse
- Vesser
- Viol
- Violenter
- Virginité

## Règles ajoutées au skill

Toutes sont historiques et non validées :

1. `subir_qasi` : Subir: h'amel / qasi / iqaçi. Proposition moderne: nqasi. À valider.
2. `sucre_sokkar` : Sucre: soukker. Proposition moderne: sokkar. À valider.
3. `suivre_tba3` : Suivre: ntebbä / tebbât / tebbä. Proposition moderne: ntba3 / tba3t / tba3. À valider.
4. `tomber_tih` : Tomber: netih' / touh't / tal / sqat'. Proposition moderne: ntih / ti7t / ta7 / saqet. À valider.
5. `tourner_dor` : Tourner: ndour / dour't / dar. Proposition moderne: ndor / dort / dar. À valider.
6. `travailler_khdem` : Travailler: nakhdem / khademt / khedem. Proposition moderne: nekhdem / khdemt / khedem. À valider.
7. `trouver_lqa` : Trouver: nrib / coubt / çab / oujed. Proposition moderne: nelqa / lqit / lqa; variante nsib / sibt / sab. À valider.
8. `venir_ja` : Venir: nji / jit / ja / ata. Proposition moderne: nji / jit / ja. À valider.

## Lot pilote recommandé

Un échantillon JSON de 24 entrées fréquentes est disponible :

```text
exports/partie-09-echantillon-app.json
```

Exemples : Sucre, Suivre, Table, Tête, Thé, Tomber, Toucher, Toujours, Tourner, Travail, Travailler, Triste, Trois, Trop, Trouver, Tuer, Utiliser, Vache, Vendre, Venir, Vent, Verre, Vert, Vie.

## Limites connues

- Certaines vedettes très courtes ou mots-outils peuvent être filtrées par le parseur brouillon ; une revue page par page reste nécessaire.
- Les homographes et formes réflexives sont conservés séparés lorsqu’un qualificateur est présent.
- Aucun contenu n’est marqué `app_ready`.
- Les formes modernes sont des propositions à valider par des locuteurs natifs.

## Décision

La partie 09 est intégrée dans la base commune. Elle est prête pour la phase de correction/validation, pas pour publication directe dans l’application.
