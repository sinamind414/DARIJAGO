# Rapport partie 10 — fin du dictionnaire + annexes

## Source

- Fichier uploadé : `Dictionnaire_français-arabe_de_la_langue_parlée_en_Algérie_(1910)-10.pdf`
- Copie canonique : `raw/partie-10.pdf`
- SHA256 : `eb5609bc3e0d2b4aa72a13ba95e7663789e86c0f678cc6b86f963976500efa1e`
- Taille : 1 616 278 octets
- Pages PDF : **54** (et non 90)
- Livre : *Dictionnaire français-arabe de la langue parlée en Algérie*, Belkassem Ben Sedira, 1910.
- Statut : `needs_review` / `unverified`. Aucune entrée `app_ready`.

## Cartographie du PDF

| Pages PDF | Pages imprimées | Section | Traitement |
|---:|---:|---|---|
| 1–9 | 743–751 | Fin du dictionnaire algérien : VOI → ZOU | OCR + segmentation + ingestion + curation |
| 10 | 752 | CHIFFRES | Page OCR conservée, non lexicale |
| 11–14 | 753–756 | Principales villes de l’Algérie | Gazetteer brut conservé dans `pages`, non intégré au corpus lexical |
| 15–41 | 757–783 | Supplément : Expressions employées dans la Régence de Tunis | Corpus séparé `tunisien_1910`, exclu du corpus algérien |
| 42 | — | Page blanche | Documentée |
| 43 | 785 | Monnaies tunisiennes | Page OCR conservée, non lexicale |
| 44 | — | Page blanche | Documentée |
| 45–46 | 787–788 | Principales villes de la Tunisie | Gazetteer brut conservé dans `pages` |
| 47–48 | 789–790 | Table des matières | Paratexte conservé |
| 49–52 | — | Pages blanches | Documentées |
| 53–54 | — | Fiche bibliothèque / 4e de couverture | Paratexte conservé |

Offset imprimé appliqué aux pages lexicales et annexes non blanches : **+742**.

## Pipeline exécuté

1. Vérification SHA256 : aucun doublon avec les 9 sources précédentes.
2. Backup : `backups/dictionnaire-avant-partie-10.sqlite`.
3. OCR Tesseract `fra+ara`, PSM 6 : 54 pages.
4. Segmentation lexicale uniquement sur `--dict-start 1 --dict-end 9`.
5. Ingestion initiale : 93 candidats.
6. Curation manuelle ciblée : sous-entrées restaurées, vedettes absorbées ajoutées, blocs fusionnés nettoyés.
7. Supplément tunisien ingéré séparément : 400 candidats, `register=tunisien_1910`, `in_algerian_corpus=0`.
8. Consolidation : index, FTS, vues, exports, manifest.
9. Règles skill, échantillon app, aperçu, rapport, référence agent.

## Résultat corpus algérien — partie 10

| Indicateur | Valeur |
|---|---:|
| Candidats initiaux | 93 |
| Entrées après curation | 109 |
| Entrées actives | 100 |
| Faux positifs / fragments OCR exclus | 9 |
| Sous-entrées restaurées | 7 |
| Vedettes principales ajoutées | 16 |
| Entrées avec arabe détecté | 92 |
| Entrées actives sans arabe détecté | 14 |
| Blocs faibles | 7 |
| Blocs cross-page | 4 |
| Sujets sensibles signalés | 5 |
| Règles skill ajoutées | 14 |
| Échantillon app | 24 |
| Aperçu | 60 entrées |

### Faux positifs / fragments exclus

- `Jet bh'ar` p.1 : fragment OCR de la suite de Voie.
- `ALAz khiana` p.2 : fragment OCR dans Vol.
- `Jrag` p.3 : fragment OCR du pluriel de Volée.
- `A ekhtas` p.5 : fragment OCR dans Voter.
- `Fes br'a` p.5 : fragment OCR dans Vouloir.
- `É ir` p.5 : fragment OCR de Vouloir (subst.) / Voulu / Vous.
- `Lei mqabbeb` p.6 : fragment OCR dans Voûté.
- `Lis L'aggen` p.6 : fragment OCR dans Vraiment.
- `Jourja` p.7 : fragment OCR dans Vue / Vulgaire.

### Sous-entrées restaurées

- Voie droite → parent Voie
- Bateau à voiles → parent Voile
- Se voir → parent Voir
- Faire voir → parent Voir
- A vol d'oiseau → parent Vol
- Marchand de volaille → parent Volaille
- Faire voler → parent Voler

Autres liens parent/enfant : Vouer (se), Vouloir (subst.), Zébré → Zébrure.

### Vedettes principales ajoutées / réparées

Voir, Volontiers, Volume, Vorace, Votre, Vouer (se), Vouloir (subst.), Voulu, Vous, Vue, Vulgaire, Y, You! you!, Zèle, Zélé, Zouïdja.

Corrections de vedettes : `Voüté` → `Voûté`, `Votation` qualifié `vote`, `Yatagan (sabre-poignard)`, `Zaouïa (établissement religieux)`.

### Sujets sensibles

Signalés `sensitive_topic`, à valider avant usage grand public :

- Volupté
- Voluptueusement
- Voluptueux
- Vulve
- Zaouïa

## Supplément tunisien — séparé

- Pages PDF 15–41, imprimées 757–783.
- 400 entrées brutes.
- 265 avec arabe détecté.
- 135 sans arabe détecté.
- 53 blocs faibles.
- 24 blocs cross-page.
- Register : `tunisien_1910`.
- `in_algerian_corpus = 0`.
- Export dédié : `exports/dictionnaire-supplement-tunis-brut.{json,csv}` et `exports/dictionnaire-supplement-tunis-actif.{json,csv}`.

Décision : ce supplément est conservé pour recherche historique, mais **ne doit pas être mélangé** au corpus darija algérienne grand public sans validation native tunisienne et activation explicite d’un registre tunisien.

## Règles skill ajoutées

Toutes `needs_review`, formes historiques/OCR + propositions modernes à valider :

1. `voisin_jar`
2. `voix_sawt`
3. `voler_sraq`
4. `vouloir_bgha`
5. `voyage_sefer`
6. `vrai_sa7i7`
7. `yeux_3inin`
8. `zero_sfer`
9. `voir_chouf`
10. `y_hena`
11. `voie_tri`
12. `voile_setter`
13. `volonte_irada`
14. `zele_hars`

## Limites connues

- OCR historique bruité : certaines formes arabes/translittérées restent fautives.
- Les blocs fusionnés ont été nettoyés manuellement, mais une relecture page par page reste nécessaire.
- Les formes modernes sont des propositions, pas des validations natives.
- Le supplément tunisien est brut et séparé ; il n’est pas prêt pour publication.
- Les annexes villes/chiffres/monnaies sont conservées comme pages OCR, pas comme fiches app.

## Décision

La partie 10 est intégrée. Le livre est complet côté ingestion : **10 PDF, 864 pages, A → ZOU + annexes**. La base est prête pour la phase de correction/validation native, pas pour publication directe.
