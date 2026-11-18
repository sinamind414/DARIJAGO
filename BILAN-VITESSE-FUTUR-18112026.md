# Chantier vitesse + futur régional (18/11/2026)

Demandes : OPUS R7 (« vitesse réelle par défaut et choix de vitesse »),
audits B / OPUS / GEMINI (« ne pas généraliser ghadi à toute la darija »).

## Livré

### 1. Choix de vitesse utilisateur — `src/utils/playbackSpeed.ts`
- 3 paliers : **0,7×** (Lent, défaut) · **0,85×** (Normal) · **1×** (Rapide)
- Persistance `localStorage` (`darijago_playback_speed_v1`)
- `setNativeAudioRateFactor()` applique le choix **à chaud** dans `audioPlayer` et `webSpeechPlayer`

### 2. Sélecteur dans le TopBar — `src/components/SpeedSelector.tsx`
- `data-testid="speed-selector"` et `speed-{valeur}`
- Présent sur tous les écrans, à côté de la bascule d'écriture

### 3. Futur régional — `src/i18n/benSediraTranslations.ts`
- Le `futureHint` précise maintenant les variantes :
  **Alger « ra7 » / Oran « ghadi » / Est « bache » + aoriste**
- « ghadi » est présenté comme **variante régionale**, plus comme règle universelle
- Mis à jour en français, anglais, espagnol, italien (les autres mentionnaient déjà « ra- »)
- La génération `ghadi + aoriste` inchangée dans le code (les tests unitaires s'y attendent)

## Vérification réelle
- Sélecteur présent, défaut `speed-0.7` ✅
- Clic `1×` → stockage `1` et **playbackRate mesuré = 1,0** sur un vrai clic audio ✅
- `npm run lint` ✅

## Limite
Le libellé du sélecteur est en français fixe. Les 4 langues restantes (de, nl, zh, ar) gardent
l'ancien `futureHint` qui mentionne déjà « ra- » comme alternative — correction partielle assumée.
