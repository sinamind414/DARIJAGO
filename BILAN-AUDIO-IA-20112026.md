# Outils audio IA — Bilan d'évaluation (20/11/2026)

## Demande
Utiliser Openverse, real-sfx et earshot pour améliorer darijaGO.

## Vérification des dépôts officiels (faite, sans installation pour real-sfx)

| Outil | Dépôt | Licence | Verdict |
|---|---|---|---|
| **Openverse** | API WordPress publique | CC0 (par son) | ✅ Intégré |
| **earshot** | Leonxlnx/earshot (5 298 ⭐) | **MIT** + modèles Apache/BSD | ✅ Installation en cours (isolée) |
| **real-sfx** | Clipwing/skills (155 ⭐) | ❌ **Aucune licence déclarée** | ⚠️ Non intégré |

### Pourquoi real-sfx est écarté
Le dépôt Clipwing/skills n'a **aucun fichier LICENSE à la racine** et l'API GitHub
renvoie `license: null`. Seul le pack `uisfx` vendored est MIT/CC0.
Même si le README parle de pack CC0, je n'intègre pas ce code dans un projet
sans clarification légale. Les besoins couverts (sons UI) le sont déjà par Openverse en CC0 propre.

## 1. Openverse — INTÉGRÉ ✅

8 sons CC0 téléchargés dans `public/assets/sfx/` (1,4 Mo) :

| Son | Usage | Créateur |
|---|---|---|
| `ui_click` | Clic UI | Jummit |
| `ui_success` | Succès | Jofae |
| `ui_correct` | Bonne réponse | Beetlemuse |
| `ui_wrong` | Mauvaise réponse | -Andreas |
| `ui_notification` | Notification | (API) |
| `amb_souk` | Ambiance marché | (API) |
| `amb_cafe` | Ambiance café | Talitha5 |
| `amb_tea` | Thé qui coule | mdayalan |

- Manifeste avec attributions：`public/assets/sfx/manifest.json`
- Script reproductible : `scripts/telecharger-sfx-openverse.py`
- Lecteur : `src/utils/sfxPlayer.ts` (activable, volume réglable)
- Branché sur **QuizArena** : son correct / wrong / fin de quiz
- Vérifié : MP3 servi en `audio/mpeg` (HTTP 200), manifeste 8 sons ✅
- `npm run lint` ✅

## 2. earshot — EN COURS (isolement total)
- Clone dans `analyse-audio-ia/earshot/` (10 Mo, hors de l'app)
- Installation via `uv tool install "earshot[mcp] @ git+..."` (tâche de fond)
- Prévu : `earshot describe/match` pour **auditer les 6 706 clips Yasmine**
  (donner des mesures là où les audits disent « on ne peut pas entendre »)
- Modèles ~1,1 Go à télécharger — disque suivi (3,8 Go libres)

## 3. Ce que ces outils NE font PAS (important)
Ils ne transcrivent pas la darija et ne préparent pas les voix off :
- **Transcription** → faster-whisper (déjà dans le workspace)
- **Voix off natives** → Studio :3930 + VoiceStudio (déjà prêts)
- **SFX vidéo** → real-sfx / earshot (outils évalués ici)

## Limite
Le son UI est actif par défaut dans le quiz. Prévoir un réglage utilisateur
(`setSfxEnabled`) dans le profil si souhaité.
