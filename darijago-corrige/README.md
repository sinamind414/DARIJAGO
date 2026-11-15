# DARIJAGO — version corrigée

Version corrigée de l’application auditée le 14/11/2026.
L’original audité n’a pas été écrasé.

## Prérequis

- Node.js **22 ou plus récent**
- npm

## Installation

```bash
npm ci
```

## Développement

```bash
npm run dev
```

Ouvrir http://localhost:3000

## Production

```bash
npm run build
npm start
```

`npm run build` construit :
- le client React dans `dist/`
- le serveur Express dans `server.js`

`npm start` lance `node server.js`.

## Clé Gemini optionnelle

Créer `.env.local` ou `.env` :

```env
GEMINI_API_KEY="votre_clé"
```

Sans clé, l’application fonctionne en mode secours :
- audio via navigateur quand disponible ;
- dialogues hors ligne ;
- pas d’appel Gemini réel.

## Tests

```bash
npm run lint
npm test
npm run build
```

## Principaux correctifs

- `index.html` restauré : `type="module"`, Rocket Loader supprimé.
- Dépendances npm réparées : `react-is`, `esbuild` aligné avec Vite, lockfile régénéré.
- `bun.lock` supprimé pour éviter deux gestionnaires de paquets.
- `npm start` fonctionne après build serveur.
- `.env.local` et `.env` chargés explicitement.
- Images des histoires déplacées dans `public/assets/images/` et incluses au build.
- Safe-area iOS ajoutée sur la barre de navigation basse.
- Permission micro déclarée dans `metadata.json`.
- En-têtes sécurité simples ajoutés côté serveur.
- Image publique inutilisée supprimée.

## Limites restantes

Cette correction rend l’application installable, buildable et démarrable.
Elle ne valide pas linguistiquement la darija, ne remplace pas un audit natif,
ne fournit pas encore d’application Android/iOS native, et ne sécurise pas
complètement les API payantes pour une mise en production publique.
