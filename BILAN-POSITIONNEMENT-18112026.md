# Chantier positionnement — Test 5 questions / 3 profils (18/11/2026)

Demande : recommandation R5 (OPUS), audit A (« Démarrer par une tâche adaptée au profil »),
audit B (« test de positionnement en 5 questions + 3 profils »), GPT SOL MAX (« le même départ pour tous »).

## Livré

### 1. Logique — `src/utils/positioningLogic.ts`
- 5 questions couvrant compréhension, production, lecture, objectif et horizon
- 3 profils : **Débutant** 🌱 / **Héritage** 🏠 / **Intermédiaire** 🧭
- Calcul par score majoritaire, persistance `localStorage` (`darijago_learner_profile_v1`)

### 2. Écran — `src/components/PositioningScreen.tsx`
- Une question à la fois, barre de progression, bouton Retour
- Écran de résultat personnalisé avec description du profil
- Bouton « Commencer mon parcours »

### 3. Intégration — `src/App.tsx`
- Le positionnement s'affiche **après** la sélection de langue, **une seule fois**
- Le profil est conservé au rechargement

## Vérification réelle
- 5 questions affichées, navigation ✅
- Réponses majoritaires « Héritage » → résultat **« Héritage »** affiché ✅
- Clic « Commencer » → stockage `heritage` ✅
- Rechargement → positionnement non reréaffiché, app principale chargée ✅
- `npm run lint` ✅

## Limite
Le profil est **stocké mais pas encore exploité** pour modifier le parcours (audit A :
« le diagnostic ne positionne pas l'apprenant »). Prochaine étape : brancher `startMode`
(guided / heritage / immersion) sur le comportement de `LessonWorkspace` — cf. tâche n°3 du bilan.
