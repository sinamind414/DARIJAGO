# Vérification — DARIJAGO corrigé

Date : 14/11/2026

## Commandes

```bash
npm ci
npm run lint
npm test
npm run build
npm start
```

## Résultats

- `npm ci` : OK
- `npm run lint` : OK, 0 erreur TypeScript
- `npm test` : 50/50 tests passent
- `npm run build` : OK
  - client Vite : 2100 modules
  - serveur Express compilé : `server.js`
- `npm start` : OK, serveur démarré
- `/` : HTTP 200, script `type="module"`
- `/api/health` : HTTP 200, `{"ok":true,"aiConfigured":false}` sans clé
- Images histoires : HTTP 200 dans `dist/`
- Bundle JS : HTTP 200
- `npm audit --omit=dev --audit-level=high` : 0 vulnérabilité

## Note environnement

La cible déclarée est Node.js >= 22.
Le sandbox de test utilisait Node 20 : avertissements `EBADENGINE`,
mais installation, lint, tests, build et démarrage ont réussi.
