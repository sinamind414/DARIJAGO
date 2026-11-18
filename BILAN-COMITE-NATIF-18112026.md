# Chantier R3 — Comité de relecture native (18/11/2026)

Demande : recommandation R3 de l'audit CLAUDE OPUS 5.5 MAX —
« Comité de relecture native avant tout lancement ».

## Livré

### 1. Extraction des 73 contenus à valider
`scripts/extraire-items-validation.ts` → `comite-natif/items-a-valider.json`
- 42 phrases de leçon · 16 répliques de dialogues · 15 exemples de grammaire

### 2. Base du comité — `comite-natif/comite.db`
- Table `reviewers` : 4 régions (Alger, Oran, Constantine, Sud)
- Table `items` : 73 contenus, statut `needs_review` par défaut
- Table `votes` : verdict par (item, relecteur), avec correction arabe et note régionale

### 3. Règle de double validation
> Un contenu passe `app_ready` dès que **2 relecteurs de régions différentes**
> ont voté `valide` ou `valide_avec_correction`.

### 4. Serveur & interface — `comite-natif/serveur.py` + `index.html`
Sur **http://127.0.0.1:3920/**
- Choix du relecteur (région), filtres par type et par statut
- Affichage arabe / latin / français + note d'usage
- 4 verdicts : Valide · Corrigé · À revoir · Rejette
- Correction arabe et note régionale enregistrées
- Compteurs en direct

## Vérification réelle
- 73 items chargés, 4 relecteurs ✅
- Test sur `dialogue-cafe-alger-0` :
  - 1 vote (Alger) → `needs_review` (1 région)
  - 2e vote (Oran) → `app_ready` (2 régions) ✅
  - Annulation des 2 votes → retour `needs_review` ✅
- Interface vérifiée dans le navigateur ✅

## Limites
- Les 4 relecteurs sont des **placeholders** (« Relecteur Alger », etc.) :
  remplacer par de vraies personnes avant lancement.
- Aucun contenu n'est affiché aux apprenants sans `app_ready`
  (le panneau Corpus de l'app indique déjà `needs_review`).
- Règle identique à celle exigée par les audits : **double validation, régions distinctes**.

## Prochain
Remplir les vrais noms de relecteurs, puis lancer la campagne de validation.
