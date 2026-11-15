# Audit de l’application DARIJAGO

**Cible :** dossier Drive `darijago-—-apprendre-la-darija-algérienne (1)`  
**Date :** 14 novembre 2026  
**Mode :** lecture seule sur l’application Drive. Les essais ont été faits sur une copie locale isolée (`audit-darijago/build-test`). Aucun fichier de l’app sur Drive n’a été modifié.  
**Limite importante :** aucune clé `GEMINI_API_KEY` n’a été utilisée. Les fonctions IA/TTS ont été vérifiées en mode secours, pas en production réelle.

---

## 1. Verdict rapide

**L’application n’est pas publiable en l’état.** C’est un prototype riche et déjà bien structuré côté interface, mais il contient des blocages de démarrage/build, des dépendances incohérentes, des assets cassés en production, et des données linguistiques non validées nativement.

**Ce qui est bon :**
- Interface React complète : leçons, parcours, quiz, dictée, dictionnaire, conjugaison, dialogues, profil, progrès.
- 7 langues d’interface, progression locale, mode sombre, objectifs XP, révisions espacées.
- 50 tests unitaires passent.
- Pas de secret codé en dur, pas de `eval`, pas de `dangerouslySetInnerHTML`.
- `npm audit --omit=dev` : 0 vulnérabilité connue au moment de l’audit.

**Ce qui bloque :**
1. `index.html` est corrompu par Cloudflare Rocket Loader → page blanche.
2. Installation non reproductible : lockfile désynchronisé, conflit `esbuild`/Vite, `react-is` manquant.
3. `npm start` ne démarre pas le serveur ; pas de build serveur ; Node ≥ 22 requis mais non déclaré.
4. Le README dit `.env.local`, mais le serveur charge `.env` via `dotenv/config`.
5. Les images des histoires ne sont pas copiées dans le build de production.

---

## 2. Méthode et preuves

Fichiers examinés : racine, `server.ts`, `src/App.tsx`, 22 composants, 27 fichiers de données, 7 fichiers i18n, 20 utilitaires, types, configs, assets publics via métadonnées Drive.

Essais réalisés sur copie isolée :
- `npm ci`, `npm ci --legacy-peer-deps`, `npm install --legacy-peer-deps`
- `npm run lint` = `tsc --noEmit`
- `npm run build`
- `npm start`
- tests unitaires : `npx tsx --test src/utils/*.test.ts`
- navigateur headless Chromium : page originale, page corrigée en diagnostic, navigation, mobile, langue, dialogue sans IA, oral sans micro
- axe-core : accessibilité
- API sans clé : `/api/health`, `/api/tts`, `/api/tts/clip`, `/api/dialogue`, `/api/pronunciation-check`
- comparaison indicative avec la base locale Ben Sedira OCR (`dictionnaire.sqlite`) en lecture seule

Preuves conservées dans `audit-darijago/tests/` : logs, JSON, captures d’écran.

---

## 3. Résultats des tests

| Vérification | Résultat |
|---|---|
| `npm ci` | Échec : conflit `esbuild@0.25.12` avec Vite 8 qui attend `^0.27.0 || ^0.28.0` |
| `npm ci --legacy-peer-deps` | Échec : `package-lock.json` ne contient pas `recharts` et ses dépendances |
| `npm install --legacy-peer-deps` | Passe, mais avertissement Node : `@google/genai` demande Node ≥ 22 ; test fait avec Node 20 |
| `npm run lint` | Passe, mais `tsconfig` n’est pas strict |
| `npm run build` original | « Succès » trompeur : seulement 2 modules transformés, `dist/index.html` vide de bundle JS |
| Navigateur original | Page blanche : `root` vide, script `type="1fb22c8f...-module"` invalide, Rocket Loader 404 |
| Build après correctif diagnostic de `index.html` | Échec : `react-is` manquant pour `recharts` |
| Build après ajout diagnostic de `react-is` | Passe : 2100 modules, JS minifié ≈ 2,12 Mo, gzip ≈ 539 Ko |
| `npm start` | Échec Node 20 : `ERR_UNKNOWN_FILE_EXTENSION .ts` |
| Tests unitaires | 50/50 passent, 9 fichiers `*.test.ts` |
| Navigateur corrigé | L’app se charge ; navigation, dictionnaire, conjugaison, dictée, profil, reset, changement EN, dialogue secours, oral secours OK |
| Mobile 390×844 | Pas de débordement horizontal ; barre basse visible ; `padding-bottom: 0px` → pas de safe-area |
| axe-core | 12 nœuds contraste insuffisant + 1 alt redondant, desktop et mobile |
| API sans clé | TTS renvoie fallback, dialogue 503, pronunciation-check 400 si vide |
| `npm audit --omit=dev` | 0 vulnérabilité |

---

## 4. Blocages P0 — à corriger avant tout essai sérieux

### P0-1. `index.html` corrompu → page blanche
Le fichier contient :
```html
<script type="1fb22c8f7a64eae797eb384c-module" src="/src/main.tsx"></script>
<script src="/cdn-cgi/scripts/.../rocket-loader.min.js" ...></script>
```
Conséquence : le navigateur ne charge pas le module React, Vite ne bundle pas l’app, la page reste blanche.  
Preuve : `tests/smoke-original.json`, `tests/build.log`.

**Correctif attendu :** restaurer `<script type="module" src="/src/main.tsx"></script>` et supprimer le script Rocket Loader.

### P0-2. Installation non reproductible
Constats :
- `package-lock.json` est désynchronisé de `package.json` : `recharts` absent du lock npm.
- `bun.lock` contient `recharts`, mais les deux lockfiles coexistent.
- Vite 8 attend `esbuild ^0.27 || ^0.28`, le projet déclare `esbuild ^0.25`.
- `recharts` a un peer dependency `react-is`, absent de `package.json` ; avec `--legacy-peer-deps`, le build casse.

**Correctif attendu :** un seul gestionnaire de paquets, un seul lockfile régénéré, aligner `esbuild`, déclarer `react-is` si nécessaire, tester `npm ci` propre.

### P0-3. Démarrage production cassé
`package.json` :
```json
"start": "node server.ts"
```
Problèmes :
- Node 20 ne lance pas directement `.ts`.
- `@google/genai@3.3.0` exige Node ≥ 22.
- Aucun script ne compile `server.ts` en JS serveur.
- `clean` supprime `server.js`, mais aucun build ne le produit.

**Correctif attendu :** déclarer `engines.node >=22`, compiler le serveur ou utiliser `tsx` en production maîtrisée, ajouter `build:server` et un `start` fiable.

### P0-4. `.env.local` ne correspond pas au chargement serveur
Le README demande de mettre la clé dans `.env.local`.  
Or `server.ts` fait `import 'dotenv/config'`, qui charge `.env` par défaut, pas `.env.local`.

**Risque :** l’utilisateur suit le README, mais le serveur ne voit pas `GEMINI_API_KEY`.  
**Correctif attendu :** charger explicitement le bon fichier, ou documenter `.env`, ou utiliser une config serveur cohérente.

### P0-5. Images des histoires absentes du build
`src/data/stories.ts` utilise :
```ts
imageUrl: '/src/assets/images/story_couscous_algeria_...jpg'
```
Ces images sont dans `src/assets/images`, mais ne sont pas importées comme modules. En build Vite, elles ne sont pas copiées dans `dist`.  
Preuve : `find dist -iname '*story*'` ne retourne rien.

**Correctif attendu :** importer les images, les déplacer dans `public/`, ou utiliser des URLs générées par Vite.

---

## 5. Problèmes majeurs P1

### 5.1 Sécurité API et coût Gemini
Le serveur garde bien la clé côté backend, mais :
- aucun rate limiting ;
- aucune authentification ;
- aucune limite de longueur sur les textes TTS/dialogue ;
- aucune durée max d’enregistrement audio ;
- aucun timeout/retry/backoff Gemini ;
- aucun budget/quota par utilisateur ;
- `/api/tts/clip` est un GET public pouvant générer du audio payant ;
- cache disque `.audio-cache` sans éviction ;
- `/api/tts/preload` continue après détection 429/quota ;
- pas de CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, etc. ;
- `X-Powered-By: Express` actif ;
- `/api/health` expose `aiConfigured`.

**Risque :** abus de quota, coûts imprévus, déni de service léger, hotlinking.

### 5.2 Audio / TTS non validé en réel
Les modèles cités existent et sont récents : `gemini-3.8-flash-lite-tts`, `gemini-3.5-transcribe`, `gemini-4-hydrogen` sont documentés par Google [3](https://ai.google.dev/gemini-api/docs/speech-generation) [2](https://ai.google.dev/gemini-api/docs/changelog) [2](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/get-started-with-gemini-4). Mais :
- aucun test avec clé réelle pendant cet audit ;
- la darija algérienne n’est pas garantie par une voix Gemini générique ;
- les profils « Yasmine Alger / Karim Oran / Amine Constantine » sont décoratifs, pas des accents certifiés ;
- le mode lent repose surtout sur une instruction de style, pas sur un `playbackRate` fiable ;
- le fallback `speechSynthesis` lit de l’arabe standard ou du phonétique français, pas de la darija ;
- le code ne valide pas le RIFF/WAV avant cache/lecture ;
- l’endpoint `/api/pronunciation-check` existe mais n’est pas appelé par le front.

**À faire :** test réel avec clé, écoute native, validation du format audio, disclaimer voix, fallback clair, contrôle coût.

### 5.3 Données darija non prêtes pour publication
Contenu mesuré :
- 7 modules, 42 phrases, 4 dialogues, 3 histoires, 6 sons arabizi ;
- 2297 entrées dictionnaire, dont 2121 verbes ;
- 5 sections grammaire ;
- 0 doublon d’ID, 0 verbe sans conjugaison ;
- 33 entrées sans `sourcePage` ;
- 34 entrées avec `sourcePage` multi-pages ;
- une valeur `sourcePage` aberrante détectée : `743744`, à nettoyer ;
- 1 entrée à cheval sur le volume déclaré : `bs-v-e-etre`, pp. 202–203, volume 3 annoncé 113–202 ;
- 1867 entrées sans exemple ;
- 39 entrées avec `usageNote`.

Problèmes :
- l’UI annonce « Intégralité du livre intégrée », alors que l’app contient 2297 entrées sélectionnées, pas les 9622 candidats de la base OCR locale ;
- les conjugaisons 8 personnes sont générées algorithmiquement à partir de 3 formes ;
- les tests vérifient surtout la structure, pas l’exactitude native ;
- le futur `ghadi + aorist` est généralisé à tous les verbes ; il doit être régionalisé et validé par des locuteurs natifs, pas présenté comme uniformément algérien ;
- les dialogues annoncent Alger/Oran/Constantine, mais les entrées ne portent pas de région/registre exploitable ;
- aucun champ `status`, `native_validated`, `app_ready`, `register`, `region`, `confidence`, `license` ;
- aucune chaîne `needs_review → corrected → native_validated → app_ready` ;
- comparaison indicative avec la base OCR locale : 1985/2297 vedettes app retrouvées, mais la base OCR est bruitée et ne vaut pas validation.

**Verdict données :** utilisables pour prototype, pas pour une app grand public sans relecture native.

### 5.4 i18n partielle
Points bons :
- 7 langues : fr, en, es, de, it, nl, zh ;
- 218 clés UI par langue ;
- les 42 phrases et 4 dialogues ont des traductions ;
- changement de langue testé OK.

Limites :
- le dictionnaire Ben Sedira garde des vedettes françaises ;
- la grammaire Ben Sedira reste en français ;
- pour un apprenant non francophone, le dictionnaire FR→darija est moins utile.

### 5.5 Offline partiel
L’app met en cache des clips audio via Cache API, mais :
- pas de service worker ;
- pas de manifest PWA ;
- pas d’app shell offline ;
- polices Google Fonts externes ;
- pas de pack audio pré-généré ;
- le commentaire « 100% offline playback » est exagéré : seuls les clips déjà cachés sont réutilisables.

### 5.6 Oral / micro dépendants du navigateur
- `getUserMedia` + `MediaRecorder` + Web Speech API ne sont pas garantis dans une WebView iOS/Android.
- En cas d’échec, l’app propose une saisie manuelle.
- Cette saisie manuelle peut donner des XP : ce n’est pas une validation acoustique.
- `metadata.json` a `requestFramePermissions: []`, alors que le micro est utilisé.

### 5.7 Architecture front perfectible
- Pas de routeur : pas de deep links, pas de gestion propre du bouton retour.
- Pas d’error boundary React.
- Pas de code splitting : tout le dictionnaire/i18n/recharts charge au démarrage.
- Bundle JS ≈ 2,12 Mo minifié, ≈ 539 Ko gzip.
- `public/assets/aistudio` contient 10 PDF Ben Sedira ≈ 30,5 Mio + images inutiles/captures.
- `Gemini_Generated_Image...jpg` et captures PNG semblent inutilisés par le code.
- `motion`, `autoprefixer`, `APP_URL` semblent inutilisés.
- Branding incohérent : `Speak Algeria`, `darijaGO`, `react-example`.

### 5.8 Confidentialité / légal
- Pas de politique de confidentialité.
- Pas de consentement explicite pour micro/audio.
- Texte/audio peuvent être envoyés à Gemini.
- Web Speech API peut envoyer l’audio au service du navigateur.
- Pas de durée de conservation, suppression, export des données.
- Progression uniquement locale, pas de sauvegarde cloud.
- Pas de fichier LICENSE.
- Ben Sedira 1910 est probablement domaine public, mais il faut vérifier édition/scans/images.
- Les images générées IA doivent être tracées/licenciées.

---

## 6. Problèmes mineurs P2

- Contraste insuffisant : 12 nœuds axe-core, dont boutons orange/blanc et libellés de révision.
- Alt redondant : logo `alt="Speak Algeria"` à côté du texte identique.
- Safe-area iOS absente : barre basse `padding-bottom: 0px`, pas de `viewport-fit=cover`.
- `tsconfig` non strict, pas d’ESLint, pas de Prettier, pas de script `test`.
- Pas de CI, pas de tests E2E, pas de tests composants.
- README boilerplate AI Studio, pas de doc projet/déploiement/API.
- `package.json` version `0.0.0`, nom `react-example`, pas de description/auteur/licence.
- `vite.config.ts` utilise `__dirname`, avertissement Vite native config loader.
- Alias `@/*` pointe vers la racine, mais les imports sont relatifs.
- `index.html` dépend de Google Fonts externes.
- Favicon PNG ≈ 756 Ko, images histoires ≈ 1,3 Mo, pas d’optimisation WebP/AVIF.
- Pas de skip-link, pas de gestion complète des tabs au clavier.
- Pas de monitoring, crash reporting, analytics, feature flags.

---

## 7. Préparation Android / iOS

**État actuel :** application web React/Vite/Express. Aucun projet natif, aucun Capacitor/Cordova, aucun manifest Android, aucun Info.plist iOS, aucune icône/splash store.

Pour un MVP Android+iOS, il faut au minimum :
1. Corriger les P0 web.
2. Ajouter un routeur + error boundary + code splitting.
3. Ajouter safe-area, viewport-fit, cibles tactiles, contraste.
4. Choisir l’emballage : Capacitor est le plus direct depuis React.
5. Déclarer permissions micro, Internet, notifications si utilisées.
6. Remplacer ou compléter Web Speech API par des plugins natifs TTS/STT fiables.
7. Pré-générer ou cacher un pack audio validé, plutôt que tout générer à la demande.
8. Ajouter privacy policy, consentement micro, suppression/export des données locales.
9. Préparer icônes, splash, screenshots, description, catégorie, âge, support.
10. Signer, builder, tester TestFlight / Play Internal Testing.

---

## 8. Plan d’action recommandé

### Phase 0 — Débloquer le web (priorité absolue)
- Restaurer `index.html`.
- Choisir npm ou bun, régénérer un seul lockfile.
- Aligner Vite/esbuild, ajouter `react-is` si nécessaire.
- Déclarer Node ≥ 22.
- Compiler le serveur ou fournir un `start` fiable.
- Corriger le chargement `.env` / `.env.local`.
- Corriger les images des histoires en production.
- Ajouter un script `test` et relancer `npm ci && npm run lint && npm run build && npm test`.

### Phase 1 — Sécuriser et stabiliser
- Rate limit, auth ou quota, limites de taille/durée.
- Timeout/retry/backoff Gemini, éviction cache, arrêt sur quota.
- Headers sécurité, CSP, désactiver `X-Powered-By`.
- Error boundary, routeur, code splitting.
- Supprimer PDFs/captures/assets inutilisés du bundle public.
- Optimiser images/favicon, polices locales.
- Unifier la marque.
- Privacy policy + consentement micro + mentions IA.

### Phase 2 — Valider le contenu
- Relire nativement les 42 phrases, 4 dialogues, 3 histoires.
- Valider les 2121 verbes/conjugaisons par échantillon + exceptions.
- Ajouter `status`, `region`, `register`, `sourcePage`, `confidence`, `license`.
- Corriger la promesse « intégralité du livre ».
- Séparer historique 1910 et usage moderne.
- Geler une version `app_ready` uniquement après validation.
- Pré-générer un pack audio validé.

### Phase 3 — Mobile et stores
- Capacitor Android/iOS.
- Permissions, safe-area, plugins audio natifs.
- Tests sur vrais appareils.
- Bêta TestFlight / Play Internal.
- Assets store, privacy, support, signing.

---

## 9. Fichiers de preuve

- Copie source auditée : `audit-darijago/source/`
- Copie de diagnostic : `audit-darijago/build-test/`
- Logs : `audit-darijago/tests/*.log`
- Résultats JSON : `audit-darijago/tests/*.json`
- Captures : `audit-darijago/tests/smoke-*.png`, `flow-*.png`
- Rapport : `audit-darijago/RAPPORT-AUDIT-DARIJAGO.md`

---

## 10. Conclusion

DARIJAGO a une bonne base fonctionnelle et un volume de contenu intéressant. Mais **la priorité n’est pas d’ajouter des fonctions** : il faut d’abord rendre l’installation/build/démarrage fiables, corriger les assets cassés, sécuriser les API payantes, puis faire valider la darija par un locuteur natif. Ensuite seulement, emballer pour Android/iOS.

**Décision recommandée :** ne pas publier, ne pas soumettre aux stores, ne pas annoncer « complet/authentique/offline » tant que les P0 et la validation native ne sont pas clos.
