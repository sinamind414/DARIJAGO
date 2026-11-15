# Enrichissement skill — partie 10

## Couverture

La partie 10 termine le dictionnaire algérien : **VOI → ZOU**, pages imprimées 743 à 751. Elle contient aussi des annexes et un supplément tunisien séparé.

## Apports principaux

### Voir

Historique :

```text
nchouf
cheft
chaf
raa
```

Proposition moderne à valider :

```text
nchouf
cheft
chaf
```

### Voisin

Historique :

```text
jar
jiran
jara
grib
```

Proposition moderne à valider :

```text
jar
jiran
jara
qrib
```

### Voix

Historique :

```text
çaout
açouat
```

Proposition moderne à valider :

```text
sawt
swat
```

### Voler — dérober

Historique :

```text
nesrag
sraqt
srag
```

Proposition moderne à valider :

```text
nsreq
sreqt
sreq
```

### Vouloir

Historique :

```text
neh'abb
nebr'i
h'abbit
br'eit
h'abb
br'a
```

Proposition moderne à valider :

```text
nbghi
bghit
bgha
```

### Voyage

Historique :

```text
sefer
sefra
rah'la
```

Proposition moderne à valider :

```text
sefer
safra
ra7la
```

### Vrai

Historique :

```text
çah'ih'
çouab
h'aqq
```

Proposition moderne à valider :

```text
sa7i7
swab
7aqq
```

### Yeux

Historique :

```text
âïnin
âïoun
```

Proposition moderne à valider :

```text
3inin
3youn
```

### Zéro

Historique :

```text
cefer
asfar
```

Proposition moderne à valider :

```text
sfer
sfar
```

### Y — ici / là

Historique :

```text
hena
themm
fih
```

Proposition moderne à valider :

```text
hna
temma
fih
```

### Zèle

Historique :

```text
h'ars
qerih'a
jehed
```

Proposition moderne à valider :

```text
7ars
jehd
```

## Règles ajoutées au skill

Toutes sont historiques et non validées :

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

## Lot pilote recommandé

Un échantillon JSON de 24 entrées fréquentes est disponible :

```text
exports/partie-10-echantillon-app.json
```

Exemples : Voisin, Voix, Voler, Vouloir, Voyage, Vrai, Yeux, Zéro, Voiture, Volonté, Vomir, Voyager, Voûte, Zizanie, Zinc, Voile, Voir, Votre, Vous, Voulu, Vorace, Volume, Vue, Y.

## Supplément tunisien

Le supplément des pages 757–783 est conservé séparément :

```text
register = tunisien_1910
in_algerian_corpus = 0
```

Ne pas l’utiliser pour répondre en darija algérienne par défaut. Il peut servir à une future variante tunisienne, après validation native spécifique.

## Limites connues

- Certaines vedettes très courtes ou mots-outils ont été récupérées manuellement.
- Les homographes et formes réflexives sont conservés séparés lorsqu’un qualificateur est présent.
- Aucun contenu n’est marqué `app_ready`.
- Les formes modernes sont des propositions à valider par des locuteurs natifs.

## Décision

La partie 10 est intégrée dans la base commune. Le livre est complet côté ingestion. La prochaine phase est la correction/validation native, pas la publication directe.
