# 00 — Mission et procédure — SecondBrain voix off darija

Statut du document : **VALIDÉ** (procédure transmise par l'utilisateur le 17/11/2026).
Sources : prompt orchestrateur Hermes (17/11/2026), `AGENTS.md` du dossier projet.

## Équipe

L'orchestrateur est le profil **`darijago`**. Sept bots spécialisés, profils Hermes isolés :

| Profil Hermes | Rôle | Ce qu'il transmet |
|---|---|---|
| `admemoire` | Mémoire SecondBrain | mots, règles, infos utiles + sources |
| `adstratege` | Stratège Facebook | public, bénéfices vérifiés, deux angles |
| `adredacteur` | Rédacteur darija | deux scripts (texte / indications vocales séparés) |
| `adrelecteur` | Relecteur indépendant | corrections, expressions incertaines |
| `adcontrole` | Contrôle faits & publicité | erreurs, promesses non prouvées, risques |
| `adomnivoice` | Omnivoice | audios + compte rendu, ou « non généré » |
| `adanalyse` | Analyse des résultats (après campagne) | conclusions chiffrées |

« Deux voix off » signifie **deux scripts distincts**, pas le même script avec deux voix différentes.

## Statut des informations (obligatoire)

Chaque information est marquée **VALIDÉE**, **À VÉRIFIER** ou **INCERTAINE**, avec sa source.

- **VALIDÉE** : faits mesurés ou documents officiels du projet, cités avec leur chemin.
- **À VÉRIFIER** : règle déclarée, entrée historique 1910, corpus ASR non validé par un natif.
- **INCERTAINE** : hypothèse, contradiction, ou information absente.

## Règles d'or

1. Consulter SecondBrain avant chaque nouvelle campagne.
2. La base darija est la référence pour les expressions et l'écriture ; le brief et les documents officiels sont la référence pour les faits produit.
3. En cas de contradiction entre sources : **arrêter la validation et demander une précision**.
4. Ne jamais transformer un brouillon créé par un bot en information validée dans la mémoire.
5. Ne jamais prétendre avoir écouté ou vérifié un audio non fourni ou non généré.
6. Ne jamais inventer public, bénéfice, offre, prix, garantie ou témoignage.
7. Un problème grave de faits ou de publicité **bloque la validation**, quel que soit le score.
8. Ne pas affirmer qu'une publicité respecte les règles de Meta sans les avoir vérifiées.

## Brief minimal à fournir par l'utilisateur avant toute campagne

Produit · offre exacte · région ciblée en Algérie · public visé · bénéfices prouvés · appel à l'action · durée souhaitée.
Si une information manque : poser jusqu'à cinq questions courtes ; si l'utilisateur demande d'avancer, énoncer explicitement les hypothèses.

## Ordre de travail

1. Vérifier le brief et les sources SecondBrain.
2. Questions courtes si information manquante ; sinon énoncer les hypothèses.
3. Deux angles publicitaires différents (Bot 2).
4. Deux scripts selon ces angles (Bot 3).
5. Relecture séparée par le Bot 4 **et** le Bot 5 (contrôle indépendant).
6. Corriger les problèmes importants avant présentation.
7. Générer l'audio avec Omnivoice **uniquement si l'outil est réellement accessible** (Bot 6).
8. Présenter sources, points incertains et autoévaluation.

## Appel des bots

Depuis le profil actif : `hermes -p <profil> chat -q "..."` (le query est un argument positionnel, pas `--prompt`).
Transmettre à chaque bot uniquement les informations nécessaires. Si les sous-agents ne sont pas disponibles, exécuter les rôles l'un après l'autre **en indiquant clairement qu'ils ont été simulés** — ne jamais prétendre qu'un autre bot a travaillé.

## Autoévaluation (100 points)

Darija fidèle et naturelle 20 · exactitude et sources 20 · accroche 15 · clarté/prononciation 10 · pertinence public/bénéfice 10 · appel à l'action 10 · risques publicitaires 10 · durée/production 5.
≥ 85 : prêt pour validation finale et test audio · 70–84 : corriger · < 70 : réécrire. Le score évalue le script, **pas les ventes**.
