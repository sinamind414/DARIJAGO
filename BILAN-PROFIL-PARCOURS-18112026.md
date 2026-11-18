# Chantier profil → parcours (18/11/2026)

Demande : suite du chantier positionnement (R5 / audits A, B, GPT).
Le profil était stocké mais pas exploité — l'audit A disait « le diagnostic ne positionne pas l'apprenant ».

## Livré

### 1. Logique de parcours — `src/utils/positioningLogic.ts`
- `PROFILE_MODULE_ORDER` : ordre recommandé des modules par profil
  - 🌱 Débutant : salutations → présentation → café → quotidien
  - 🏠 Héritage : salutations → présentation → marché → quotidien → café
  - 🧭 Intermédiaire : marché → quotidien → verbes → Ben Sedira → café
- `PROFILE_HINT` : accroche spécifique par profil

### 2. Intégration
- `App.tsx` passe `learnerProfile` à `LessonWorkspace`
- `LessonWorkspace` affiche une **accroche de parcours** (`data-testid="profile-hint"`)

## Vérification réelle
- Profil stocké `heritage` → accroche affichée :
  « 🏠 Parcours héritage : on valorise ce que vous comprenez déjà et on débloque la parole. » ✅
- `npm run lint` ✅

### 3. Application réelle de l'ordre (après vérification)
- `localizedModules` est **réellement réordonné** selon `PROFILE_MODULE_ORDER`
- `activeModuleId` / `activePhraseId` sont **initialisés depuis le profil** stocké
- Le `onComplete` du positionnement met aussi à jour le module actif immédiatement

## Vérification réelle (complétée)
- Profil `heritage` → accroche « 🏠 Parcours héritage… » ✅
- Profil `intermediaire` → démarrage sur **« Unité 04 · Marché, Prix & Orientation »**
  au lieu de Salutations ✅ (preuve que le parcours est réellement adapté)
- `npm run lint` ✅
