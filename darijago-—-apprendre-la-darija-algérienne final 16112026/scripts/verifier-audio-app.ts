// Verification finale de la couverture audio, toutes rubriques confondues.
// Usage: npx tsx scripts/verifier-audio-app.ts
import fs from 'node:fs/promises';
import { ARABIZI_SOUNDS, CURRICULUM_MODULES, DIALOGUE_SCENARIOS } from '../src/data/curriculum.ts';
import { BEN_SEDIRA_DICTIONARY } from '../src/data/benSediraDictionary.ts';
import { BEN_SEDIRA_GRAMMAR_SECTIONS } from '../src/data/benSediraGrammar.ts';
import { getCulturalStories } from '../src/data/stories.ts';
import { buildVerbConjugationIndex } from '../src/utils/conjugationLogic.ts';
import { findStaticYasmineClip } from '../src/utils/yasmineStaticManifest.ts';

const manifest = JSON.parse(await fs.readFile('public/audio/yasmine/manifest.json', 'utf8'));
const couvert = (ar: string, lat: string) =>
  !!findStaticYasmineClip(manifest, { textArabic: ar, textLatin: lat });

const phrases = CURRICULUM_MODULES.flatMap((m) => m.phrases);
const breakdowns = phrases.flatMap((p) => p.breakdown);
const stories = getCulturalStories('fr');
const dialogues = DIALOGUE_SCENARIOS.flatMap((s: any) => [
  s.openingTurn,
  ...(s.starterSuggestions ?? []),
]).filter(Boolean);
const grammaire = BEN_SEDIRA_GRAMMAR_SECTIONS.flatMap((s) => s.examples ?? []);
const conjugaison = buildVerbConjugationIndex(BEN_SEDIRA_DICTIONARY)
  .map((i: any) => i.arabicTriple?.spokenTripleArabic)
  .filter(Boolean) as string[];

const lignes: Array<[string, number, number]> = [
  ['Phrases leçon', phrases.length, phrases.filter((p) => couvert(p.darijaArabic, p.darijaLatin)).length],
  ['Mots décomposition', breakdowns.length, breakdowns.filter((b) => couvert(b.arabic, b.darija)).length],
  ['Sons arabizi', ARABIZI_SOUNDS.length, ARABIZI_SOUNDS.filter((s) => couvert(s.exampleArabic, s.exampleDarija)).length],
  ['Mots-clés histoires', stories.length, stories.filter((s: any) => couvert(s.focusWord?.darijaArabic, s.focusWord?.darijaLatin)).length],
  ['Répliques dialogues', dialogues.length, dialogues.filter((d: any) => couvert(d.darijaArabic, d.darijaLatin)).length],
  ['Exemples grammaire', grammaire.length, grammaire.filter((e: any) => couvert(e.darijaArabic, e.darijaLatin)).length],
  ['Dictionnaire', BEN_SEDIRA_DICTIONARY.length, BEN_SEDIRA_DICTIONARY.filter((e) => couvert(e.darijaArabic, e.darijaLatin)).length],
  ['Conjugaison (triple)', conjugaison.length, conjugaison.filter((t) => couvert(t, '')).length],
];

console.log(`Clips dans le manifeste : ${manifest.clips.length}\n`);
console.log('Rubrique'.padEnd(24) + 'Total'.padStart(8) + 'Couvert'.padStart(9) + 'Manquant'.padStart(10));
let manquants = 0;
for (const [nom, total, ok] of lignes) {
  manquants += total - ok;
  console.log(nom.padEnd(24) + String(total).padStart(8) + String(ok).padStart(9) + String(total - ok).padStart(10));
}
console.log(`\nTOTAL MANQUANT : ${manquants}`);
