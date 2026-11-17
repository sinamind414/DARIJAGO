# 09 — Conventions TTS (V2)

Statut global : **À VÉRIFIER**. Aucune convention ci-dessous n'a été testée sur un script de campagne réel. Elles décrivent ce que le Préparateur TTS doit appliquer **lorsque le test aura été fait**, pas une garantie.

## Règles à appliquer

1. `transcription_tts` de `02_LEXIQUE_DARIJA.csv` : l'utiliser quand la colonne est renseignée. Actuellement vide pour les 19 entrées du corpus initial — ne pas inventer de transcription.
2. Mots français empruntés (livraison, gratuit, garantie, promotion…) : écriture à définir ici après test réel dans Omnivoice. **Non testé.**
3. Chiffres et prix en DA : écrire en toutes lettres, comme prononcés. **Non testé en synthèse.**
4. Pauses : virgules et points uniquement. Toute autre syntaxe doit être documentée ici après test. Actuellement **aucune autre syntaxe documentée**.
5. Voix `71dfdfc1` (« Yasmine », `arq`) : configuration historiquement utilisée, licence **CC-BY-NC** — usage publicitaire payant bloqué sans vérification de droits (voir `07_OMNIVOICE_TESTS.md`).
6. Vérification : le bot ne peut pas écouter l'audio. Si une transcription automatique (STT) est réellement disponible, comparer au script et lister les écarts. Sinon écrire **ÉCOUTE HUMAINE REQUISE**. Ne jamais affirmer que la prononciation est correcte.
7. Statuts audio : `GENERATED` / `TECH_OK` / `CONTENT_UNVERIFIED` / `HUMAN_VALIDATED`. Le passage à `HUMAN_VALIDATED` exige une écoute humaine ou un STT comparé au script.

## Ce qui reste à tester

- [ ] Écriture TTS des mots français en darija.
- [ ] Prix en toutes lettres (DA) rendus par la synthèse.
- [ ] Ponctuation = pauses réelles.
- [ ] Comparaison STT vs script sur un clip généré.
- [ ] Validation par un locuteur algérien (non faite à ce jour).
