# Rapport de revue — partie 01

## Résumé

- 90 pages OCRisées.
- 232 entrées brutes détectées.
- 201 entrées contiennent des caractères arabes détectés par OCR.
- Toutes les entrées sont marquées `needs_review`.

## Problèmes principaux

### 1. OCR des tableaux

Les pages 21 à 60 contiennent des tableaux de grammaire/nombres/pronoms. L’OCR y est très bruité. Ces pages ne doivent pas être transformées automatiquement en contenu app.

Action : revue manuelle ou OCR spécialisé + validation.

### 2. Arabe ancien/translittération historique

Le livre utilise une translittération ancienne et parfois coloniale. Elle ne doit pas être présentée comme phonétique moderne sans adaptation.

Action : créer deux champs :

```text
translit_historical
translit_modern
```

### 3. Entrées manquantes ou faux départs

Le parseur détecte les entrées par motif de majuscule + ponctuation. Certaines entrées peuvent être manquées, et certains blocs OCR peuvent être mal segmentés.

Action : revue par page, surtout 69–90.

### 4. Termes sensibles/vieillis

Certains termes historiques peuvent être datés, religieux, administratifs ou sensibles.

Action : ajouter `register`, `domain`, `sensitive`, `modern_usage`.

## Lot pilote recommandé

Valider d’abord 20 entrées fréquentes :

- A
- Abandonner
- Accepter
- Acheter
- Ami
- Amie
- Amour
- An
- Abeille
- Abricot
- Absent
- Accoucher
- Accompagner
- Accord
- Argent
- Attendre
- Avancer
- Aider
- Aimer
- Année

> Si certaines ne sont pas dans cette partie, les remplacer par les entrées disponibles les plus utiles.

## Format cible pour une fiche app

```json
{
  "id": "fr-acheter",
  "fr": "acheter",
  "arq_ar": "يشري",
  "arq_lat": "yechri",
  "forms": {
    "present_1sg": "nechri",
    "past_1sg": "chrit",
    "past_3sg_m": "chra"
  },
  "example_fr": "J’achète du pain.",
  "example_arq_lat": "nechri khobz",
  "audio": null,
  "source": {
    "book": "Dictionnaire français-arabe de la langue parlée en Algérie",
    "part": "partie-01",
    "page": 75
  },
  "status": "needs_native_review"
}
```

## Décision

La partie 01 est prête comme **corpus brut traçable**. Elle n’est pas encore prête comme contenu public de l’application.
