# Enrichissement skill — partie 06

## Couverture

La partie 06 couvre **MEU → PIL**, pages imprimées 383 à 472.

## Apports principaux

### Mettre

Historique :

```text
neh'ott
h'attit
h'ott
```

Proposition moderne à valider :

```text
n7ott
7attit
7att
```

### Miel

Historique :

```text
âcel
chahed
```

Proposition moderne :

```text
3sel
```

### Mieux

Historique :

```text
kheïr
```

Proposition moderne :

```text
khir
```

### Montre

Historique OCR :

```text
saû
souaiâ
```

Proposition moderne :

```text
magana
```

### Mot

Historique :

```text
kelma
kelma bekelma
```

Proposition moderne :

```text
kelma
kelma b kelma
```

### Nuit

Historique :

```text
lil
leila
```

Proposition moderne :

```text
lil
lila
```

### Pain

Historique :

```text
khoubz
kesra
```

Proposition moderne :

```text
khobz
kesra
```

### Père

Historique :

```text
bou
baba
bouia
```

Proposition moderne :

```text
baba
bouya
```

## Règles agent

- Ne jamais présenter une forme OCR brute comme forme moderne validée.
- Si une entrée a le flag `suspect_headword`, demander vérification de la page source.
- Si une entrée a `weak_entry_evidence`, ne pas générer de leçon automatique sans revue.
- Pour l’application, n’utiliser que les entrées `app_ready`.
- Les ligatures françaises `Œ/œ` sont désormais reconnues par le parseur `lexical-2.1-draft`.

## Source

Base :

```text
dictionnaire-livre/db/dictionnaire.sqlite
```

Rapport :

```text
dictionnaire-livre/review/partie-06-rapport.md
```
