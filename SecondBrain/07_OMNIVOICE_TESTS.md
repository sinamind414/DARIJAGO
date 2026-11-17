# 07 — Omnivoice : tests réellement effectués

Sources : `BILAN-AUDIO-16112026.md` (16/11/2026), `analyse-voicestudio/Bilan-VoiceStudio-Darija.md` (14/11/2026). Méthode du bilan VoiceStudio : lecture de code et de documentation, **sans installation ni synthèse** — la qualité de l'accent algérien reste à valider à l'écoute.

## Configuration réellement utilisée — VALIDÉ

| Élément | Valeur | Statut |
|---|---|---|
| Outil | VoiceStudio / OmniVoice **local** | VALIDÉ |
| Profil de voix | `71dfdfc1` — « Yasmine » | VALIDÉ |
| Langue | `arq` (Algerian Arabic) | VALIDÉ |
| Matériel | RTX 3060 | VALIDÉ |
| Livraison | 6 706 clips, ~220 Mo, `public/audio/yasmine/`, statique, aucun appel API à l'usage | VALIDÉ |
| Couverture | 14 093 / 14 093 textes, 0 manquant | VALIDÉ |
| Conjugaison | triple canonique (`نوطّي، وطّيت، وطّى`) en un clip ; 19 clips générés pour compléter 6 888 déjà couverts | VALIDÉ |

## Vérifications réellement exécutées — VALIDÉ

- `npm run lint` (tsc --noEmit) → OK.
- `npm run build` (Vite) → OK.
- `npx tsx scripts/verifier-audio-app.ts` → **TOTAL MANQUANT : 0**.
- Navigateur `localhost:3000` → bouton « Écouter le verbe » présent, clic → lecture d'un fichier audio, `speechSynthesis` **jamais appelé** (0 voix navigateur).
- Contrôle Whisper sur 7 clips : arabe bien prononcé ; Whisper approxime les lettres à chadda (`نهدّ` → « ندهد »), mais l'audio est bien la voix Yasmine.

## Non vérifié / bloquant

- **À VÉRIFIER** — Aucun locuteur algérien n'a jugé la voix naturelle : critique de réussite non remplie.
- **VALIDÉ** — Licence OmniVoice **CC-BY-NC** (usage éducatif non commercial) ; `commercial_inference: restricted`, `commercial_outputs: unknown`.
- **BLOQUANT** — Publicité payante avec cette voix : interdit sans vérification de droits ou alternative commerciale vérifiée.
- **INCERTAIN / NON TESTÉ** — Alternatives évoquées : Natiq (API, FAQ autorisant les créations commerciales), VoxCPM2 (fiche amont Apache-2.0, audit des composants incomplet dans le dépôt), ZONOS3-Mini (Apache 2.0, à tester en WebGPU). Aucune n'a été testée ici.
- **INCERTAIN** — Qualité de l'accent algérien d'OmniVoice : `arq` n'a que 9,64 h d'entraînement déclarées, contre 1 483,53 h pour l'arabe standard.

## Règles du Bot Omnivoice

1. Ne générer l'audio **que si** l'outil est réellement accessible ; sinon fournir le texte prêt à copier et indiquer que l'audio n'a pas été généré.
2. Ne jamais inventer de nom de voix, réglage, paramètre ou fonction Omnivoice.
3. Si l'audio est généré : vérifier durée, prononciation, rythme, coupures et correspondance avec le script.
4. Ne jamais prétendre avoir écouté ou vérifié un audio non fourni ou non généré.

## Texte de test non commercial (existant, sans prix ni promesse inventée)

> سلام عليكم، واش راكم؟ اليوم نحكيو على منتوج جديد. حابين تعرفو السعر والتفاصيل؟ ابعثولنا رسالة، ورانا هنا نجاوبوكم. مرحبا بكم!
