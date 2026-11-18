# Rebrand Drijago — Nouveau logo & thème terracotta (18/11/2026)

## Demande
Appliquer le nouveau logo « Drijago. » (étoile terracotta à 8 pétales + wordmark)
et le thème couleur joint (terracotta / crème / encre).

## Mon avis professionnel
✅ **Très bon choix.** Le nouveau design est plus éditorial, chaleureux et culturellement
ancré que l'ancien vert « darijaGO ». La palette terracotta sur fond crème évoque
l'Algérie (Alger, la Casbah engravée du modèle) tout en restant lisible.
✅ Le rebrand répond à une recommandation des audits : « Unifier la marque en DRIJAGO,
supprimer les libellés parasites » (OPUS).
⚠️ Réserve : le contraste du terracotta sur blanc doit être vérifié en mode sombre —
j'ai utilisé une variante claire (`#E8A184`) pour le dark mode.

## Livré

### 1. Logo — `public/assets/brand/logo-drijago.png`
- Image source = capture du logo joint (215×70 px, 5 Ko)
- Remplacé dans `TopBar` et `StartupLanguageScreen` (plus de wordmark texte)

### 2. Thème couleur — 642 remplacements dans 31 fichiers
| Ancien (vert) | Nouveau (terracotta) |
|---|---|
| `#5C723C` (258×) | `#B7410E` — accent principal |
| `#4E6231` (195×) | `#8C2F18` — accent foncé |
| `#A5C178` (186×) | `#E8A184` — accent clair (dark) |
| `#008643` / `#DC291E` (8×) | `#B7410E` — ancien logo |

### 3. Nom de marque
- `darijaGO` → `Drijago` dans `src/` (traductions 7 langues) et `index.html`
- Titre de page : « Drijago — Apprendre la darija algérienne »

## Vérification réelle
- `npm run lint` ✅ · `npm run build` ✅
- Navigateur : titre « Drijago — Apprendre la darija algérienne » ✅
- Logo chargé (`logoOk: true`) ✅
- Bouton accent `rgb(183, 65, 14)` = `#B7410E` ✅
- 0 ancienne couleur verte restante ✅

## Limite
Le logo fourni est une capture 215×70 (fond blanc) — pour une version production,
un SVG ou PNG transparant haute résolution serait preferable (couleur + netteté).
