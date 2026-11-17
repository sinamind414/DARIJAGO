# 03 — Marque et produits — faits confirmés

Sources : `BILAN-AUDIO-16112026.md` (16/11/2026), `analyse-speak-algerian/BILAN-FINAL-SPEAK-ALGERIAN.md` (15/11/2026), `AGENTS.md`, `audit-darijago/RAPPORT-AUDIT-DARIJAGO.md`.

## DARIJAGO — le produit

| Fait | Statut | Source / précision |
|---|---|---|
| Application d'apprentissage de la darija algérienne | VALIDÉ | Bilan comparatif |
| **Non publiée** ; version corrigée prête à déployer | VALIDÉ | `build` validé : lint 0, tests 50/50, audit 0 vulnérabilité |
| 2 297 entrées (2 121 verbes conjugués + 176 dictionnaire) | VALIDÉ | tableau comparatif |
| 7 langues d'interface | VALIDÉ | tableau comparatif ; traduction du **contenu** encore partielle → À VÉRIFIER |
| 7 modules, 42 phrases, 4 dialogues, 3 histoires | VALIDÉ | tableau comparatif |
| Sources linguistiques citées (Ben Sedira 1910, page + §) | VALIDÉ | différenciateur documenté |
| Validation par un locuteur natif | **NON FAITE** | tableau comparatif, ligne « Validation native » |
| Comptage d'utilisateurs, compte utilisateur, paiement, prix | **AUCUN / NON DÉFINI** | tableau comparatif : traction 0, compte « non », paiement « non » |
| Identité légale à définir | À DÉFINIR | phase 1 du plan d'action |
| Marque incohérente « Speak Algeria / darijaGO » | À CORRIGER | phase 1 : choisir **une seule marque** |

## Audio — état réel (important pour la publicité)

| Fait | Statut | Source |
|---|---|---|
| Voix OmniVoice locale, profil `71dfdfc1` (« Yasmine »), sur RTX 3060 | VALIDÉ | `BILAN-AUDIO-16112026.md` |
| Couverture 14 093 / 14 093 textes, 0 manquant ; 6 706 clips, ~220 Mo | VALIDÉ | idem + script `verifier-audio-app.ts` |
| Fichiers servis statiquement depuis `public/audio/yasmine/`, aucun appel API à l'usage | VALIDÉ | idem |
| **Licence OmniVoice CC-BY-NC : usage éducatif non commercial** | VALIDÉ | registre des licences VoiceStudio, cité dans le bilan |
| Usage dans une **publicité payante** | **INTERDIT sans vérification de droits** | conséquence directe de la licence CC-BY-NC |

## Concurrence — contexte mesuré (ce n'est pas le produit DARIJAGO)

- **VALIDÉ** — DZLingo : généraliste francophone, 6,99 €/mois, 59,99 €/an, 99,99 € à vie, ~2 971 mots annoncés, 3 plateformes, paywall serveur.
- **VALIDÉ** — Speak Algerian : professeure Jamilah, Alger uniquement, produit en anglais, **9,99 £/mois** (~11,95 €), aucun annuel, aucun à vie, aucun essai gratuit, 386 mots mesurés, audio natif 385/386, 33 726 abonnés Instagram.
- **VALIDÉ** — Écarts entre discours et données chez Speak Algerian : « 1000+ mots » vs 386 mesurés, « nouveau vocabulaire chaque semaine » vs aucune entrée depuis le 21/02/2026, « 95 % de réussite » vs 92,6 % mesuré.
- **INCERTAIN** — Aucune de ces données ne constitue une offre DARIJAGO. Ne jamais les présenter comme telles.
