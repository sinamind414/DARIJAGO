# Chantier n°2 ASTRA — Score oral honnête (18/11/2026)

Demande : audit GPT 6.2 ASTRA MAX (score 72/100) — « renommer le score Correspondance de transcription, car la proximité d'une transcription ne mesure pas la prononciation ni l'intelligibilité ».

## Livré — `src/i18n/oralTranslations.ts` (7 langues)

| Ancien | Nouveau |
|---|---|
| `Proximité : X %` (FR) | `Correspondance de transcription : X %` |
| `Match: X%` (EN) | `Transcript match: X%` |
| `Similitud`, `Trefferquote`, `Precisione`, `Gelijkenis`, 相似度 | `... transcription / Transkript / trascrizione / transcript / 转录...` |
| `3. Comparaison & Prononciation` | `3. Comparaison des transcriptions` |
| `Très proche du modèle natif !` | `Transcription très proche du modèle !` |

### Nouvelle clé `scoreCaveat` (7 langues)
> « Mesure la similarité des mots reconnus, pas la prononciation ni l'intelligibilité. »

Affichée en petit sous le score dans `OralRepetitionExercise.tsx`.

### Sous-titre FR corrigé
« comparez votre prononciation mot par mot » → « comparez les transcriptions mot par mot (cela ne mesure pas l'accent) ».

## Vérification
- `npm run lint` ✅ · `npm run build` ✅
- 19 libellés modifiés + 7 caveats insérés

## Limite
L'audit demandait aussi 3 tâches inédites (commander, demander un trajet, remercier un hôte)
et l'évaluation par 2 juges natifs — lié au volet humain (relecteurs à nommer).
