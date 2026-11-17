# Projet Darija — analyse et prototype original

## Espace de travail

Le workspace a été réduit de **235 Mo à 58 Mo**. Les 14 PDF sources (53,9 Mo) ont
été retirés **après vérification MD5 un par un contre Google Drive** (14/14 identiques).
Ils sont récupérables : voir **[RESTAURER-PDF.md](RESTAURER-PDF.md)**.

Les 4 bases SQLite, les textes extraits, les 25 scripts et les rapports sont intacts.
On peut donc continuer à travailler sur les données sans les PDF ; ils ne servent
qu'à relancer une extraction ou vérifier une page à l'œil.

## Les quatre bases de données

| Base | Source | Apport | Entrées | Statut |
|---|---|---|---|---|
| `dictionnaire-livre/db/dictionnaire.sqlite` | Ben Sedira, 1910 | **les mots** | 9 622 | `needs_review` |
| `manuel-arabe-algerien/db/manuel.sqlite` | Tapiéro, 1971/1978/2002 | **la grammaire** + textes | 850 vocab., 30 leçons, 15 dialogues, 98 candidats de texte | `needs_review` |
| `locutions-aziri/db/locutions.sqlite` | AZIRI, ANEP 2012 | **les tournures** | 7 123 locutions | `needs_review` |
| `lexiques-tadjer/db/lexiques.sqlite` | Tadjer, 2010-2012 | **le vocabulaire moderne + latin** | 1 707 entrées, 2 230 variantes | `needs_review` |

**Aucune entrée `app_ready` dans aucune des quatre bases.** Toutes les sources sont
sous droit : usage interne/recherche, publication app soumise à licence.

Ordre de consultation : **Tadjer** pour un mot moderne (avec son latin), **AZIRI** pour une
tournure idiomatique, **Tapiéro** pour la grammaire, **Ben Sedira** en dernier (historique).

### Lexiques Tadjer — ajouté le 15/11/2026

Compilation de 25 lexiques thématiques de Saïd Tadjer Jr. (blog, 2010-2012), 44 pages.
Seule source du projet en **darija moderne** avec **translittération latine fournie**.
Texte natif du PDF, sans OCR. Rapport : `lexiques-tadjer/INTEGRATION.md`.
Attention : l'arabe du calque texte est incomplet (lettres perdues) → 1 356 formes
signalées `arabe_source_a_verifier`. Le latin, lui, est fiable.

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
- skill : `skills/darija-algerienne/SKILL.md` **v1.9.0** + `agent-darija/references/manuel-partie-0{1,2,3,4,5}.md` + `manuel-fusion-glossaires.md`

### Scan complet 1978 — ajouté le 15/11/2026

Le fichier `778940692-FR00064.pdf` reçu est **le même manuel**, mais en scan complet
227 pages simples (au lieu des 5 PDF en doubles-pages), **avec les pages arabes et
les 15 dialogues du supplément** qui manquaient. Pas de doublon de livre créé :
une nouvelle **source** a été ajoutée.

- dossier : `manuel-arabe-algerien/scan-complet-2023/`
- rapport : `manuel-arabe-algerien/scan-complet-2023/INTEGRATION.md`
- ajout : 227 pages OCR (`scan_pages`) + **98 candidats de texte** (`ocr_candidates`)
  couvrant **15/15 dialogues** (latin + arabe + français) et **30/30 textes d'étude**
- méthode : OCR **par zone** (colonne latine / colonne arabe / bloc traduction),
  car les pages de dialogue sont bilingues sur deux colonnes
- **aucun champ de référence écrasé** : tout est `needs_review`, l'OCR arabe est
  `low` et doit être repris à la main avant tout usage
- sauvegarde avant écriture : `manuel-arabe-algerien/db/backups/`
- idempotence vérifiée sur 3 exécutions

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
