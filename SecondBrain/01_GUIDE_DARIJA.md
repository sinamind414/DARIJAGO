# 01 — Guide darija : règles d'écriture et variété régionale

Statut : mélange de **VALIDÉ** (règles de travail déclarées et conventions de translittération) et **À VÉRIFIER** (usage réel non validé par un locuteur natif). Sources : `projet-darija/agent-darija/AGENT_SYSTEM_PROMPT.md`, `projet-darija/agent-darija/corpus/echantillon-annote.json`, `BILAN-AUDIO-16112026.md`, `analyse-speak-algerian/BILAN-FINAL-SPEAK-ALGERIAN.md`.

## Identité de l'agent darija

- **VALIDÉ** — Ne pas se présenter comme Djamel ni comme un imitateur d'un créateur ; assistant pédagogique original.
- **VALIDÉ** — Ne pas prétendre être natif ; signaler les incertitudes.
- **VALIDÉ** — Le dictionnaire historique est une source secondaire, jamais une vérité moderne absolue.

## Règles linguistiques de travail

| Règle | Forme | Statut | Source |
|---|---|---|---|
| Dialecte | Darija algérienne ≠ MSA ≠ marocain ≠ tunisien | VALIDÉ (règle), À VÉRIFIER (usage régional) | AGENT_SYSTEM_PROMPT |
| Négation | `ma + verbe + ch` (`ma ranich`, `ma 3andich`) | VALIDÉ (règle), À VÉRIFIER (naturel) | AGENT_SYSTEM_PROMPT + corpus |
| Existence | `kayen` / `makanch` ; `kayena`, `kayenin` | VALIDÉ (règle), À VÉRIFIER (validation native) | idem |
| Avoir | `3andi` / `ma 3andich` ; `3andek`, `3andekum` | VALIDÉ (règle), À VÉRIFIER | idem |
| État | `rani` / `ma ranich` | VALIDÉ (règle), À VÉRIFIER | idem |
| Adjectif après `hada/hadi` | souvent `machi + adjectif` | VALIDÉ (règle), À VÉRIFIER | idem |
| Féminin | souvent `-a` — **vérifier les invariants** (`ma3lich`, `y3tik sa7a`) | VALIDÉ (règle), À VÉRIFIER | idem + corpus |
| Questions | `wach`, `win`, `winta`, `3lach`, `kifach`, `chkun`, `bchhal` | À VÉRIFIER — déclaré, absent du corpus annoté | AGENT_SYSTEM_PROMPT |
| Phonétique | `3 = ع`, `7 = ح`, `kh = خ`, `gh = غ`, `ch = ش` | VALIDÉ (convention de translittération) | AGENT_SYSTEM_PROMPT |

## Variété régionale

- **À VÉRIFIER** — Régions à distinguer : Alger / Oran / Constantine / Est / Ouest / Sud. Aucune n'est implémentée ni validée nativement à ce jour.
- **À VÉRIFIER** — Le futur `ghadi` fait l'objet d'une généralisation abusive documentée : il faut le **régionaliser**, pas l'employer comme règle universelle (`BILAN-FINAL-SPEAK-ALGERIAN.md`, phase 2).
- **INCERTAIN** — Aucune règle spécifique à Oran, Constantine, Est, Ouest ou Sud n'est disponible dans les documents. Ne pas en inventer.

## Sources linguistiques et statuts

| Source | Chemin | Statut |
|---|---|---|
| Corpus vidéo annoté (19 entrées) | `projet-darija/agent-darija/corpus/echantillon-annote.json` | **À VÉRIFIER** — chaque entrée porte `validated: false` |
| Dictionnaire historique 1910 (8 819 entrées) | `projet-darija/dictionnaire-livre/db/dictionnaire.sqlite`, export `exports/dictionnaire-master-actif.csv` | **À VÉRIFIER** — `status: needs_review`, `register: algerien_1910` |
| Règles et fiches de glossaire | `projet-darija/agent-darija/references/manuel-partie-*.md`, `dictionnaire-partie-*.md`, `manuel-fusion-glossaires.md` | **À VÉRIFIER** |
| Vocabulaire public concurrent (386 entrées, audio natif) | `analyse-speak-algerian/preuves/vocabulaire-public-386.json` | **À VÉRIFIER** — sous droit, usage interne/recherche uniquement |

Toute entrée historique reste `needs_review` tant qu'elle n'est pas validée par un locuteur natif.

## Écriture des scripts

- Séparer strictement **le texte à prononcer** des **indications de jeu vocal**.
- Fournir la forme en caractères arabes et, si utile, l'arabizi + le sens français.
- Privilégier des phrases courtes, naturelles à l'oral, faciles à prononcer.
- Ne pas publier une forme OCR brute comme contenu définitif.
- Ne pas copier de leçons, transcriptions ou audios protégés ; ne pas usurper une personne réelle.
- Si incertain : proposer une forme courante + demander validation native, et le signaler explicitement.
