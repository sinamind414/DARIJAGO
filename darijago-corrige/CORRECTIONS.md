# Correctifs appliqués — DARIJAGO

Date : 14/11/2026
Base : copie de `audit-darijago/source/`
Cible : `darijago-corrige/`

## P0 corrigés

1. Page blanche
   - `index.html` : `type="module"` restauré.
   - Script Cloudflare Rocket Loader supprimé.

2. Installation / build
   - `package-lock.json` régénéré.
   - `bun.lock` supprimé.
   - `react-is` ajouté.
   - `esbuild` aligné sur `^0.28.0`.
   - `npm ci` vérifié.

3. Démarrage production
   - `build:server` ajouté avec esbuild.
   - `start` lance `node server.js` et sert `dist/` par défaut.
   - `engines.node >=22` déclaré.

4. Environnement
   - `server.ts` charge `.env.local` puis `.env`.
   - README mis à jour.

5. Images histoires
   - Images déplacées vers `public/assets/images/`.
   - URLs corrigées dans `src/data/stories.ts`.
   - Images présentes dans `dist/` après build.

## P1 / qualité corrigés partiellement

- Safe-area iOS sur `BottomNav`.
- `viewport-fit=cover`.
- `metadata.json` : permission `microphone`.
- `X-Powered-By` désactivé.
- `X-Content-Type-Options` et `Referrer-Policy` ajoutés.
- Image publique inutilisée supprimée.
- `.env.example` simplifié.
- `.gitignore` couvre `server.js` et les fichiers `.env`.
- Nom/version du package nettoyés.

## Vérifications

- `npm ci` : OK
- `npm run lint` : OK
- `npm test` : 50/50 OK
- `npm run build` : OK, 2100 modules client + serveur compilé
- Images histoires présentes dans `dist/`

## Non inclus

- Validation native de la darija.
- Refonte complète sécurité API / quotas / auth.
- PWA / service worker / offline complet.
- Capacitor / Android / iOS.
- Code splitting / optimisation bundle.
