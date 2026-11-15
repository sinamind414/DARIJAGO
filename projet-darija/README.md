# Projet Darija — analyse et prototype original

## Contenu

- `analyse-app/analyse-fonctionnelle.md` : analyse de l’application Google Play de référence.
- `analyse-app/screenshots/` : captures publiques téléchargées pour analyse.
- `prototype/index.html` : prototype mobile cliquable, original, inspiré des mécaniques génériques.

## Important

Ce projet n’est pas une copie de l’application existante. Il reprend des mécaniques pédagogiques courantes :

- théorie courte ;
- flashcards avec audio ;
- traduction masquée ;
- dialogue ;
- quiz ;
- progression ;
- premium.

Les textes, audio, images, noms et designs doivent être originaux ou correctement licenciés.

## Ouvrir le prototype

Ouvrir `prototype/index.html` dans un navigateur.

## Prochaine étape recommandée

Valider le parcours avec le prototype, puis créer l’application mobile Android + iOS avec Flutter ou React Native Expo.

## Livre 2 — Manuel d’arabe algérien moderne (Tapiéro)

Chantier séparé du dictionnaire 1910 :

- dossier : `manuel-arabe-algerien/`
- parties 01 à 05/5 : reçues, OCR colonnes, ingestion structurée, nettoyées — **livre complet**
- base : `manuel-arabe-algerien/db/manuel.sqlite`
- rapports : `manuel-arabe-algerien/review/partie-0{1,2,3,4,5}-rapport.md`
- archive : aucune archive ZIP conservée (workspace allégé)
- skill : `skills/darija-algerienne/SKILL.md` v1.7.0 + `agent-darija/references/manuel-partie-0{1,2,3,4,5}.md` + `manuel-fusion-glossaires.md`

Statut : `needs_review`, aucune entrée `app_ready`. Livre complet. **Fusion glossaires→vocabulaire exécutée en mode revue** : glossaires indexés (727 ar→fr, 1490 fr→ar), 307 rapprochements, 76 propositions, 26 conflits, lookup FR→DZ 2324 entrées. Aucune fiche curée modifiée. Rapport : `manuel-arabe-algerien/review/fusion-glossaires-rapport.md`. Prochaine étape : validation native.
## Sauvegarde Google Drive

Dossier Drive : [APPLICATION DARIJAGO](https://drive.google.com/drive/folders/1BF81sQbz5icVl2nOFyJ2shsTo9C3J1JH)

- `LIVRE ARABE DARIJA ALGERIENNE` : 10 PDF sources du dictionnaire 1910 (dossier d'origine).
- `DEUXIEME LIVRE DARIJA` : 7 PDF sources du manuel Tapiéro (parties 1, 2 en 3 segments, 3, 4, 5).
- `01 - Bases de données` : `dictionnaire.sqlite`, `manuel.sqlite` (à jour).
- `02 - Livrables et rapports` : archive compacte des livrables.
- `LISEZ-MOI.md` : mode d'emploi et état d'avancement.

Manifeste local : `drive-manifest.json`. Détails : `DRIVE.md`.

## Manuel Tapiéro — avancement

| Partie | État | Leçons |
|---|---|---|
| 01 | intégrée | 1 → 10, début 11 |
| 02 | intégrée | fin 11, 12 → 21, début 22 |
| 03 | intégrée | fin 22, 23 → 30 ; glossaire p.129+ |
| 04 | intégrée | glossaires complets, index, dialogues I-VI |
| 05 | intégrée | dialogues VII-XV + table des matières |

Base : 30 leçons, 850 vocabulaire, 86 règles, 97 exercices, 30 textes, 15 dialogues. Tout `needs_review`, `app_ready = 0`.
Rapport : `manuel-arabe-algerien/review/partie-05-rapport.md`.
