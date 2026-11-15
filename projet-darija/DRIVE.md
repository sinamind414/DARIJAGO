# APPLICATION DARIJAGO — dossier Drive

Ce dossier sert de **source des PDFs** et de **sauvegarde des livrables** du projet.

## Structure

- `LIVRE ARABE DARIJA ALGERIENNE` (votre dossier) : les **10 PDF** du *Dictionnaire français-arabe de la langue parlée en Algérie*, Belkassem Ben Sedira, 1910. Livre complet, traité.
- `DEUXIEME LIVRE DARIJA` (votre dossier) : les **7 PDF** du *Manuel d'arabe algérien moderne*, Norbert Tapiéro — partie 1, partie 2 en 3 segments (`-2-1`, `-2-2`, `-2-3`), parties 3, 4, 5.
- `01 - Bases de données` : `dictionnaire.sqlite` et `manuel.sqlite`, à jour.
- `02 - Livrables et rapports` : archive compacte des exports, OCR texte, scripts, rapports, skill et analyses.

Les copies de PDF que j'avais créées dans d'anciens sous-dossiers ont été mises à la corbeille : vos dossiers d'origine sont désormais la seule source, sans doublon.

## État d'avancement

| Source | État |
|---|---|
| Dictionnaire 1910 | **Terminé** : 9 622 entrées, 8 819 actives algériennes, supplément tunisien séparé (400). |
| Manuel Tapiéro — partie 01 | **Intégrée** : leçons 1 à 10, début 11. |
| Manuel Tapiéro — partie 02 | **Intégrée** : fin 11, leçons 12 à 21, début 22. |
| Manuel Tapiéro — partie 03 | **Intégrée** : fin 22, leçons 23 à 30 ; glossaire commencé (p.129, référence). |
| Manuel Tapiéro — partie 04 | **Intégrée** : glossaires complets (référence), index grammatical, dialogues I-VI. |
| Manuel Tapiéro — partie 05 | **Intégrée** : dialogues VII-XV + table des matières. **Livre complet.** |

Base du manuel : **30 leçons**, **850 fiches de vocabulaire**, **86 règles de grammaire**, **97 exercices**, **30 textes indexés**, **15 dialogues**. **Livre complet.**

**Fusion glossaires → vocabulaire (passe de revue)** : glossaires ré-OCR en 4 colonnes et indexés (727 entrées ar→fr, 1490 fr→ar) ; 307 rapprochements avec les fiches ; **76 propositions** de genre/pluriel et **26 conflits** à relire ; **lookup FR→DZ de 2324 entrées**. Aucune fiche curée modifiée, tout reste `needs_review`, `app_ready = 0`. Rapport : `review/fusion-glossaires-rapport.md` dans l'archive livrables.

**Anomalie partie 03** : le spread imprimé 104/105 est scanné deux fois (pages PDF 8 et 9) ; la page 9 est un doublon ignoré. Plage imprimée unique 90–137.

## Règles de travail

- Ne pas réimporter un PDF déjà intégré : vérification MD5/SHA256 avant tout traitement.
- Le dictionnaire 1910 est clos : ne pas relancer son pipeline sauf demande explicite.
- Aucun contenu OCR brut n'est publié tel quel : validation par un locuteur natif requise.
- État qualité : tout est `needs_review`, `app_ready = 0`.
- Les textes des leçons sont indexés (titre + page), jamais transcrits automatiquement.
- Les glossaires sont complets (p.129-170), indexés et rapprochés du vocabulaire ; les propositions/conflits sont en attente de validation native avant publication.
- Droits : les livres restent sous droit (Klincksieck pour Tapiéro). Usage interne uniquement ; publication dans l'application nécessite une licence ou du contenu original.

## Vérification

Les empreintes MD5 des fichiers envoyés ont été comparées aux fichiers locaux : identiques.
Le manifeste détaillé (identifiants Drive + SHA256) est conservé dans le workspace : `projet-darija/drive-manifest.json`.
