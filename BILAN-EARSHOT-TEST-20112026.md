# Test earshot sur les clips Yasmine (20/11/2026)

## Installation ✅
- `earshot 0.4.1` installé via `uv tool install` (isolé, hors de l'app)
- 2 modèles téléchargés : CLAP (laion/larger_clap_general) + AST (MIT audioset)
- Banque : **252 sons**, `doctor` = 0 problème
- Disque : ~3,3 Go → après install ~2,9 Go libres

## Test réel sur un clip Yasmine (`4d1bc101be798e09.mp3`)

### `earshot measure` (sans modèle) — utile ✅
```
1.344 s, peak -2.1 dBFS, -12.0 LUFS, attaque 67 ms,
décroissance 602 ms, brillance 1277 Hz, plancher -52 dBFS, mono
```
→ **Mesures objectives exploitables** pour le contrôle qualité audio.

### `earshot describe` (avec modèles) — ⚠️ LIMITÉ pour notre usage
```
"Sounds most like: a zipper (z +2.4), scissors cutting (+2.3),
 a chat message pop (+2.2)" [weak reading]
AudioSet: Speech 0.85
Hint non validé : "a woman speaking" (z +2.9)
```
→ Le modèle **détecte bien la parole** (Speech 0.85, voix féminine +2.9),
mais **ne comprend pas le darija** : il classe le clip comme « fermeture éclair /
ciseaux » (lecture faible, cosine 0,13). C'est un modèle **AudioSet/CLAP générique**,
pas un modèle darija.

### `earshot match` — Timide mais directionnellement juste
```
'a person greeting in Algerian Arabic' -> weak (z +2.3)
Forced choice: salut arabe 70% | phrase française 29% | claquement de porte 1%
```
→ À 70 % contre 29 %, il **préfère** « salut arabe » à « phrase française ».
Mais le verdict reste « weak » — ce n'est **pas une validation fiable**.

## 🎯 Conclusion professionnelle (important)

**earshot ne résout PAS le problème des audits** (« voix native,validation ») :
- ✅ Il donne des **mesures** (LUFS, pointe, attaque, brillance) → utile pour détecter
  un clip trop court, trop fort, ou une coupure.
- ❌ Il **ne comprend pas la darija** → ne peut pas certifier qu'un clip dit
  « السلام عليكم، واش راك؟ » correctement.
- ⚠️ Ses tags « zipper / scissors » sur de la parole montrent que ses lectures
  sont à prendre avec précaution (le README le dit lui-même : hints only).

**Le vrai "ear" pour la darija reste un locuteur natif** (comité :3920) —
les 8 audits le disent tous. earshot est un **outil de mesure**, pas un juge linguistique.

## Usage recommandé final
| Tâche | Outil |
|---|---|
| Mesurer la qualité technique des 6 706 clips | ✅ `earshot measure` (rapide, sans modèle) |
| Détecter un clip anormal (silence, pointe, durée) | ✅ `earshot measure` en batch |
| Valider la prononciation darija | ❌ **locuteur natif** (:3920) — pas earshot |
| Transcrire les vidéos | ❌ faster-whisper |
| Voix off natives | ❌ Studio :3930 |

## Fichiers
- Evaluation : `BILAN-AUDIO-IA-20112026.md`
- Clone isolé : `analyse-audio-ia/earshot/` (non suivi git, .gitignore)
- Cache modèles : `C:\Users\zakaria\.cache\earshot\hf\` (~1,1 Go, hors du projet)
