# Chantier scénarios de vie réelle (18/11/2026)

Demandes : OPUS R19 (« six nouveaux scénarios de vie réelle »), audit A
(« compléter les situations à enjeu réel »), audit B
(« ajouter 6 situations manquantes : belle-famille, repas de fête, urgence médecin, admin, téléphone, condoléances »),
GPT SOL MAX (« enrichir les situations, pas les listes »).

## Livré — `src/data/curriculum.ts`

6 nouveaux scénarios de dialogue, chacun avec 1 réplique d'ouverture + 3 suggestions de réponse
(en darija arabe + latine + traduction française + coaching) :

| Id | Titre | Situation |
|---|---|---|
| `medecin-urgence` | Chez le médecin | Dire où l'on a mal, demander le médicament |
| `police-admin` | Contrôle & Administration | Montrer ses papiers, demander quoi faire |
| `panne-route` | Panne sur la route | Expliquer la panne, demander de l'aide |
| `belle-famille-repas` | Repas chez la belle-famille | Complimenter, refuser poliment |
| `telephone` | Appel téléphonique | Se présenter, fixer un rendez-vous |
| `condoleances` | Condoléances & Soutien | Formules respectueuses |

**Total : 10 scénarios, 40 répliques** (avant : 4 scénarios, 16 répliques).

## Vérification réelle
- `npx tsx` : 10 scénarios, 40 répliques, IDs corrects ✅
- Navigateur → Parcours → Dialogues locaux : les 6 nouveaux titres tous présents ✅
- `npm run lint` ✅

## Limite
Ces contenus sont **à faire valider par le comité natif** (Ils sont en darija rédigée, pas encore
relus par 4 locuteurs). Le lecteur de relecture :3920 ne couvre pour l'instant que les 42 phrases
+ 16 répliques + 15 exemples de grammaire initiaux. À étendre aux 6 nouveaux scénarios.
