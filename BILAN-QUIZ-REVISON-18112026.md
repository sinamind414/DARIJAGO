# Chantier quiz → révision + étiquetage (18/11/2026)

Demandes : OPUS R9/R10/R14, audit A (« tester le transfert, pas la ressemblance textuelle »),
audit B (« étiqueter Vital / Courant / Avancé »), GPT SOL MAX (« fermer la boucle de pratique orale »).

## Constat
- La boucle était **déjà partiellement fermée** : `handleQuizAnswer` appelle `recordPhraseReview`
  avec `'again'` sur une mauvaise réponse → `easeFactor` baisse → la phrase revient en
  révision prioritaire (`quickReviewLogic` : raison « Difficile »). ✅
- Il manquait : (1) l'étiquetage Vital/Courant/Avancé, (2) un message de correction explicite.

## Livré

### 1. Étiquetage — `src/utils/phrasePriority.ts`
- `classifyPhrasePriority()` : 🔴 Vital / 🟡 Courant / 🟢 Avancé
- Mots-clés vital (salutations, prix, aide, urgence, eau…) + modules avancés (verbes, Ben Sedira)
- Répartition mesurée sur les 42 phrases : **25 Vital · 5 Courant · 12 Avancé**
- Badge affiché sur la carte de leçon (`data-testid="phrase-priority-badge"`)

### 2. Boucle de correction explicite
- Message ajouté au feedback d'erreur de saisie :
  « 🔁 Réécoutez la phrase (▶ ou 0,75×), comparez avec votre saisie, puis réessayez.
  Une variante de votre région peut être valide : signalez-la en relecture native. »

## Vérification réelle
- Badge « 🔴 Vital » affiché sur la première phrase ✅
- Saisie erronée → message de ré-assistance affiché ✅
- `npm run lint` ✅

## Limite
- Le message est en français fixe (à traduire en 7 langues si souhaité).
- `recordQuizResult` ne garde toujours que le score agrégé ; le détail par question n'est pas
  persisté (les réponses ratées le sont déjà via `phraseReviews`, mais sans historique de quiz).
