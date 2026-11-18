# Chantier R1 — Bascule d'écriture globale en 1 clic (18/11/2026)

Demande : recommandation R1 de l'audit CLAUDE OPUS 5.5 MAX —
« Bascule d'écriture globale en 1 clic ».

## Livré

### 1. Module partagé — `src/utils/scriptMode.ts`
- Type `ScriptMode` = `arabic | arabizi | latin`
- Persistance `localStorage` (`darijago_script_mode_v1`)
- Helper `pickScript()` qui choisit la bonne écriture

### 2. Sélecteur 3 positions — `src/components/ScriptModeSelector.tsx`
- Dans le **TopBar**, accessible depuis tous les écrans
- 3 boutons : **ع** (arabe) · **3** (arabizi) · **A** (latin)
- `data-testid` : `script-mode-selector`, `script-mode-{mode}`

### 3. Application dans LessonWorkspace
- **Une seule écriture principale** affichée en grand, les autres en second plan
- **Phonétique français masqué par défaut**, bouton pour le révéler
- Mapping des 3 champs réels :
  | Mode | Champ affiché |
  |---|---|
  | Arabe | `darijaArabic` |
  | Arabizi | `darijaLatin` |
  | Latin | `phoneticFrench` |

## Vérification réelle (navigateur)

| Mode | Principal | Secondaire |
|---|---|---|
| Arabe | السلام عليكم، واش راك؟ | Salam alikoum, wach rak? |
| Arabizi | Salam alikoum, wach rak? | السلام عليكم، واش راك؟ |
| Latin | Sa-lam a-li-koum, ouach rak ? | السلام عليكم، واش راك؟ |

- 3 écritures **distinctes** ✅
- Persistance après rechargement : `apresRechargement = script-mode-arabic`, stockage `arabic` ✅
- Phonétique masqué par défaut, révélation au clic ✅
- `npm run lint` ✅

## Limites
- Le sélecteur est appliqué à **LessonWorkspace** (écran principal). Les autres rubriques
  (dictionnaire, dialogues, quiz) affichent encore leurs écritures habituelles — extension possible.
- Libellé du sélecteur en français fixe (« Ecriture darija ») — à traduire en 7 langues si souhaité.

## État des recommandations des audits
| Recommandation | Statut |
|---|---|
| R1 Bascule d'écriture | ✅ fait |
| R2 Charte transcription | ✅ fait |
| R3 Comité natif | ✅ fait (outil prêt) |
| R4 Voix natives | ❌ non fait |
