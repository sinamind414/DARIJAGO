# Rapport de revue — partie 06

## Résumé

- PDF : `raw/partie-06.pdf`
- SHA-256 : `793dae6a30dcaa779fb8540cc8fa072dc6a931a4258e17c61a51657103c56938`
- Pages PDF : **90**
- Couverture imprimée : **383 → 472**, soit **MEU → PIL**.
- OCR : Tesseract `fra+ara`, PSM 6, OEM 1.
- Segmentation : `lexical-2.1-draft`.
- Candidats détectés : **1 072**.
- Faux positifs OCR/exemples marqués : **70**.
- Entrées actives à revoir : **1 002**.
- Entrées avec caractères arabes détectés : **871**.
- Entrées actives sans arabe détecté : **168**.
- Blocs avec preuve d’entrée faible : **83**.
- Blocs traversant plusieurs pages : **52**.
- Vedettes suspectes signalées : **16**.
- Règles skill ajoutées : **8**, toutes `needs_review`.

## Amélioration du parseur

La segmentation a été corrigée pour reconnaître les ligatures françaises `Œ/œ` et `Æ/æ`. Cela a récupéré 8 vedettes qui étaient auparavant perdues ou bruitées :

- Mœurs
- Nœud
- Œil
- Œillade
- Œillet
- Œsophage
- Œuf
- Œuvre

Version du parseur pour cette partie : `lexical-2.1-draft`. Les parties 01–05 restent en `lexical-2-draft`.

Les numéros de page imprimée ont été normalisés par continuité : page PDF 1 = page livre 383, page PDF 90 = page livre 472.

## Faux positifs marqués

Ces éléments ont été marqués `false_positive` car ils ressemblent à des exemples, des fragments OCR ou des notes grammaticales. Ils restent dans le brut pour audit, mais sont exclus de l’export actif.

Liste :

- Jib li
- Lequel vaut mieux
- Plus ou moins
- A ce moment-là
- Ma montre avance
- Lil estahza
- Lelb mekloub
- Dex bañoud'a
- Tous les moyens sont bons
- Al saila
- Muni d'un certificat
- Ass touta
- Lis meh'taj
- N'est pas
- Ji akh'al
- Cle aâtan
- Hs ouekkel
- Cl egtat
- Annoncer une bonne nouvelle
- Se ddd
- Jr emtethel
- Ms jemil
- Less jemil
- Nom d'act
- Sol aoureth
- Ces An
- I'M
- Rai S tegdima
- A vol d'oiseau
- Se mettre à l'ombre
- Jissl ir'fal
- Xe dd
- Less eddar elli iskoun fina
- By jehra
- Den seb fertettou
- Jertettou
- Lee Ji
- À koull chahar
- Ji metel had' elk'al
- Arms nesba
- Jus kesl
- Dis Cols h'elef bellied'eb
- Jiheti
- Ji koull mekan
- Faire un faux pas
- Pas encore
- Pas un seul
- Cale fuir
- Jogara
- Sr Jferrech
- Laggehk
- Ds jeld
- Rs oies dqouba
- À a
- J'ai perdu mon âne
- Lun ii feqib
- À fil elkhuouf
- Jouher
- Permettez-moi de jouer
- Las bah'eth
- Rhecçara
- Lafid
- Cris eddjaja negbèt
- Jfakhkha
- Fan
- Mettre pied à terre
- Prendre pied
- Café pilé
- Porter aux nues
- Non seulement

## Vedettes suspectes à vérifier

Ces vedettes restent actives mais sont signalées `suspect_headword`, avec une proposition de correction :

| Vedette OCR | Proposition |
|---|---|
| À Miséricordieux | Miséricordieux |
| Modéle | Modèle |
| Muiltiplicande | Multiplicande |
| Muiltiplicateur | Multiplicateur |
| Müre | Mûre |
| Müûrier | Mûrier |
| Naiïiveté | Naïveté |
| Négiigent | Négligent |
| Niéce | Nièce |
| Païtagé | Partagé |
| Passicnnément | Passionnément |
| Paupiére | Paupière |
| Péle-mêle | Pêle-mêle |
| Ouïi-dire | Ouï-dire |
| Percher se | Percher (se) |
| Perdre sel | Perdre (se) |

Ne pas les publier sans vérifier la page source.

## Règles ajoutées au skill

Toutes sont historiques et non validées :

1. Mettre : `neh'ott / h'attit / h'ott`, proposition moderne `n7ott / 7attit / 7att`.
2. Miel : `âcel / chahed`, proposition moderne `3sel`.
3. Mieux : `kheïr`, proposition moderne `khir`.
4. Montre : `saû` (OCR), proposition moderne `magana`.
5. Mot : `kelma`, proposition moderne `kelma / kelma b kelma`.
6. Nuit : `lil / leila`, proposition moderne `lil / lila`.
7. Pain : `khoubz / kesra`, proposition moderne `khobz / kesra`.
8. Père : `bou / baba / bouia`, proposition moderne `baba / bouya`.

## Lot pilote recommandé

Un échantillon JSON de 24 entrées fréquentes est disponible :

```text
exports/partie-06-echantillon-app.json
```

Exemples : Miel, Mieux, Miroir, Mois, Montagne, Montre, Mot, Mouche, Nager, Neige, Nez, Noir, Nom, Nourriture, Nuit, Œil, Œuf, Oignon, Oiseau, Oran, Pain, Père, Parler, Peur.

## Limites connues

- Certaines vedettes très courtes ou mots-outils peuvent être filtrées par le parseur brouillon ; une revue page par page reste nécessaire.
- Les homographes et formes réflexives sont conservés séparés lorsqu’un qualificateur est présent.
- Aucun contenu n’est marqué `app_ready`.
- Les formes modernes sont des propositions à valider par des locuteurs natifs.

## Décision

La partie 06 est intégrée dans la base commune. Elle est prête pour la phase de correction/validation, pas pour publication directe dans l’application.
