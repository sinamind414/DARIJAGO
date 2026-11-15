# Manuel Tapiéro — fusion glossaires → vocabulaire

## Ce qui a été fait

Passe de **revue** (aucune publication) :

- Glossaires ré-OCR en 4 colonnes : ar→fr p.129-149, fr→ar p.150-170.
- Tables de staging : `glossary_ar_fr` (727), `glossary_fr_ar` (1490).
- Rapprochements avec les 850 fiches : `vocab_glossary_links` (307 : 240 exacts, 29 variants, 38 fuzzy).
- Propositions de genre/pluriel : 76 (61 genres, 15 pluriels), **non appliquées**.
- Conflits signalés : 26.
- Lookup FR→DZ : `fr_dz_lookup` (2324 entrées : 839 vocabulaire + 1485 glossaire), toutes `needs_review`.

## Règles d’usage pour l’agent

1. **Ne jamais présenter une proposition comme une vérité confirmée.** Dire « le glossaire propose… » / « à valider ».
2. Pour une recherche FR→DZ, utiliser `fr_dz_lookup` mais signaler les variantes et le statut `needs_review`.
3. Ne pas mélanger les registres : Tapiéro 1971/2002 ≠ dictionnaire 1910 ≠ corpus vidéo contemporain.
4. Les 850 fiches de leçon restent la référence curée ; les glossaires sont une source secondaire de cross-check.
5. Avant tout `app_ready` : validation native + contrôle éditorial.

## Fichiers utiles

- `manuel-arabe-algerien/exports/fusion-glossaires/proposals.csv` : propositions à relire.
- `manuel-arabe-algerien/exports/fusion-glossaires/fr_dz_lookup.csv` : index de recherche.
- `manuel-arabe-algerien/exports/fusion-glossaires/vocab_glossary_links.csv` : rapprochements.
- `manuel-arabe-algerien/review/fusion-glossaires-rapport.md` : rapport complet.

## Exemples de propositions

- `bâb` (porte) : genre m, pluriel `bibân` (glossaire p.129).
- `bent` (fille) : pluriel `bnât` (p.130).
- `hayma` (tente) : pluriel `kyém` (p.135).
- `duwâr` (douar) : pluriel `dwäwer` (p.131).

## Conflits typiques

- `weld` : pluriel leçon `ulâd` vs glossaire `wläd`.
- `dêf` : `dyûf` vs `dyäf`.
- `hêt` : homonymes mur/sœur, pluriels différents (`hyôt` / `hwât`).
