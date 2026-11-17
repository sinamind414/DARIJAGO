# 08 — Corrections et résultats de campagnes

Sources : `BILAN-AUDIO-16112026.md`, `analyse-speak-algerian/BILAN-FINAL-SPEAK-ALGERIAN.md`, `audit-darijago/RAPPORT-AUDIT-DARIJAGO.md`.

## Corrections déjà apportées au projet — VALIDÉ

| Correction | Détail |
|---|---|
| Bouton de conjugaison | « Écouter les 8 pers. » (18 cellules/verbe ≈ 165 768 clips ≈ 5 Go) → « Écouter le verbe », triple canonique en un seul clip ; 19 clips générés ; libellé changé en 7 langues |
| Marque | Incohérence « Speak Algeria / darijaGO » à résoudre : **une seule marque** |
| Audio | `speechSynthesis` non appelé dans le parcours conjugaison ; 0 texte manquant |
| Build | lint 0, tests 50/50, audit 0 vulnérabilité |

## Corrections recommandées, non encore appliquées — À VÉRIFIER

| Correction | Source |
|---|---|
| Régionaliser le futur `ghadi` (généralisation abusive) | Bilan concurrentiel §11 phase 2 |
| Retirer toute promesse non tenue (« intégralité du livre », « complet », « natif ») | idem |
| Ajouter les champs `statut`, `région`, `registre`, `source` à chaque entrée | idem |
| Faire valider par un locuteur natif les 42 phrases, 4 dialogues, 3 histoires | idem |
| Paywall côté serveur, jamais côté client ; pas de source maps en production | idem §7–9 |
| Compteurs marketing honnêtes ; entité légale et bandeau de consentement | idem |
| Enregistrer 100 à 300 audios natifs (50 premières leçons + 500 mots fréquents) | idem |

## Campagnes publicitaires

**Aucune campagne lancée. Aucun résultat chiffré.**

Le Bot Analyse ne s'active **qu'après la campagne**, lorsque des chiffres réels sont fournis : rétention au début de la vidéo, temps de visionnage, taux de clics, conversions.

Il ne déduit pas qu'un script va réussir uniquement à partir de sa qualité rédactionnelle. Seuls les tests publicitaires indiquent quelle version fonctionne le mieux.

## Règle de mémoire

Noter ici les erreurs du contrôle indépendant et les corrections approuvées, avec leur source. Un brouillon généré par un bot n'est **jamais** promu en référence approuvée sans validation de l'utilisateur.
