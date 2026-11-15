# Source complémentaire : dictionnaire historique 1910

## Rôle

Le dictionnaire `Dictionnaire français-arabe de la langue parlée en Algérie` peut enrichir le skill agent, mais comme **source historique**, pas comme norme moderne unique.

## Utilisation autorisée dans le skill

- rechercher une entrée historique ;
- comparer forme ancienne et forme moderne ;
- générer des fiches de vocabulaire avec provenance ;
- créer des exercices “ancien / moderne” ;
- signaler les termes vieillis ou régionaux.

## Règles agent

1. Toujours distinguer :
   - `historical_form`
   - `modern_form`
   - `validated_modern_form`
2. Ne jamais dire qu’une forme du livre est “la” darija actuelle sans validation.
3. Si l’OCR est douteux, répondre :
   ```text
   Forme historique incertaine, à vérifier avec la page source et un locuteur natif.
   ```
4. Pour l’application, n’afficher que les entrées `app_ready`.
5. Garder la source : fichier + page.

## Champs recommandés

```json
{
  "headword_fr": "acheter",
  "historical": {
    "translit": "nechri / chrit / chra",
    "ar_script": null,
    "source_page": 75
  },
  "modern": {
    "lat": "nechri",
    "ar": "نشري",
    "validated": false
  },
  "status": "needs_review"
}
```

## Enrichissement pédagogique

Le livre peut aider à créer :

- cartes français → darija ;
- cartes darija → français ;
- conjugaisons historiques ;
- noms de nombres ;
- questions ;
- expressions administratives anciennes ;
- comparaison registre ancien / moderne.

## Garde-fous

- Ne pas reproduire des passages entiers comme contenu principal.
- Ne pas reprendre des termes offensants sans contexte.
- Ne pas confondre arabe dialectal historique et MSA.
- Ne pas publier sans validation native.
