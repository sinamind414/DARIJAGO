// Genere les voix off manquantes par rubrique avec la voix retenue (OmniVoice local).
// Relancable : saute les clips deja presents, complete le manifeste de facon atomique.
// Usage: npx tsx scripts/generer-audio-rubriques.ts [limite] [categorie]
// Categories: breakdown | sound | story | dialogue | grammar | lesson | dictionary | conjugation | all
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARABIZI_SOUNDS, CURRICULUM_MODULES, DIALOGUE_SCENARIOS } from '../src/data/curriculum.ts';
import { BEN_SEDIRA_DICTIONARY } from '../src/data/benSediraDictionary.ts';
import { BEN_SEDIRA_GRAMMAR_SECTIONS } from '../src/data/benSediraGrammar.ts';
import { getCulturalStories } from '../src/data/stories.ts';
import { buildVerbConjugationIndex } from '../src/utils/conjugationLogic.ts';
import { formatBenSediraLatinForSpeech } from '../src/utils/darijaSpeechFormat.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'public', 'audio', 'yasmine');
const MANIFEST = path.join(OUT, 'manifest.json');
const LIMITE = Number(process.argv[2] || 200);
const CATEGORIE = process.argv[3] || 'all';
const DELAI = Number(process.env.VOICESTUDIO_DELAY || 150);
const KEY = process.env.VOICESTUDIO_KEY || 'darijago-local-2026';
const VOICE = process.env.VOICESTUDIO_VOICE || '71dfdfc1';
const MODEL = process.env.VOICESTUDIO_MODEL || 'omnivoice';

// Ecriture atomique avec retries : evite les erreurs de verrouillage sur Windows.
async function ecrireManifeste(): Promise<void> {
  const tmp = `${MANIFEST}.tmp-${process.pid}`;
  const contenu = JSON.stringify(manifest, null, 2);
  for (let t = 0; t < 6; t++) {
    try {
      await fs.writeFile(tmp, contenu, 'utf8');
      await fs.rename(tmp, MANIFEST);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 250 * (t + 1)));
    }
  }
  try { await fs.unlink(tmp); } catch { /* ignore */ }
  console.log('ATTENTION: ecriture manifeste differee');
}

const clipId = (ar: string, lat: string, speed = 'normal') => crypto.createHash('sha256')
  .update(JSON.stringify({ v: 1, voice: 'Kore', speed, ar: ar.trim(), lat: formatBenSediraLatinForSpeech(lat) }))
  .digest('hex').slice(0, 16);

const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));
const connus = new Set<string>(manifest.clips.map((c: any) => `${c.ar}|${c.lat}`));
// Meme normalisation que findStaticYasmineClip dans l'app : le manifeste stocke
// les triples avec " / " alors que le bouton les passe avec "، ".
const normAr = (raw: string) => (raw ?? '')
  .replace(/\s*\/\s*/g, '، ')
  .replace(/\(.*?\)/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const connusAr = new Set<string>(manifest.clips.map((c: any) => normAr(c.ar)));
const cibles: Array<{ ar: string; lat: string; categorie: string; manifestCategory: string }> = [];
const ajoute = (ar: any, lat: any, categorie: string, manifestCategory: string) => {
  const a = (ar || '').trim(), l = formatBenSediraLatinForSpeech(lat || '');
  if (!a && !l) return;
  const cle = `${a}|${l}`;
  if (connus.has(cle) || (a && connusAr.has(normAr(a)))) return;
  connus.add(cle);
  if (a) connusAr.add(normAr(a));
  cibles.push({ ar: a, lat: l, categorie, manifestCategory });
};

for (const mod of CURRICULUM_MODULES) {
  for (const p of mod.phrases) {
    ajoute(p.darijaArabic, p.darijaLatin, 'lesson', 'lesson');
    for (const b of p.breakdown) ajoute(b.arabic, b.darija, 'breakdown', 'dictionary');
  }
}
for (const s of ARABIZI_SOUNDS) ajoute(s.exampleArabic, s.exampleDarija, 'sound', 'sound');
for (const s of getCulturalStories('fr')) ajoute((s as any).focusWord?.darijaArabic, (s as any).focusWord?.darijaLatin, 'story', 'dictionary');
for (const sc of DIALOGUE_SCENARIOS) {
  const d = sc as any;
  ajoute(d.openingTurn?.darijaArabic, d.openingTurn?.darijaLatin, 'dialogue', 'lesson');
  for (const t of d.starterSuggestions ?? []) ajoute(t.darijaArabic, t.darijaLatin, 'dialogue', 'lesson');
}
for (const s of BEN_SEDIRA_GRAMMAR_SECTIONS)
  for (const e of s.examples ?? []) ajoute(e.darijaArabic, e.darijaLatin, 'grammar', 'dictionary');
for (const e of BEN_SEDIRA_DICTIONARY) ajoute(e.darijaArabic, e.darijaLatin, 'dictionary', 'dictionary');
// Conjugaison : UN seul clip par verbe = le triple canonique deja present dans les donnees.
for (const item of buildVerbConjugationIndex(BEN_SEDIRA_DICTIONARY)) {
  const triple = (item as any).arabicTriple?.spokenTripleArabic;
  if (triple) ajoute(triple, '', 'conjugation', 'conjugation');
}

const selection = cibles.filter((c) => CATEGORIE === 'all' || c.categorie === CATEGORIE);
console.log(`Cibles: ${selection.length} (limite ${LIMITE}, categorie ${CATEGORIE})`);
let generes = 0, ignores = 0;
for (const c of selection.slice(0, LIMITE)) {
  const id = clipId(c.ar, c.lat), nom = `${id}.mp3`, chemin = path.join(OUT, nom);
  try {
    const st = await fs.stat(chemin);
    if (st.size > 0) {
      manifest.clips.push({ id, ar: c.ar, lat: c.lat, speed: 'normal', file: `/audio/yasmine/${nom}`, mimeType: 'audio/mpeg', bytes: st.size, category: c.manifestCategory });
      ignores++;
      continue;
    }
  } catch { /* absent */ }

  let rep = null;
  for (let t = 1; t <= 3; t++) {
    try {
      rep = await fetch('http://127.0.0.1:3900/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: MODEL, input: c.ar || c.lat, voice: VOICE, language: 'arq', response_format: 'mp3' }),
      });
      if (rep.ok) break;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 1500 * t));
  }
  if (!rep?.ok) { console.log(`ECHEC ${c.lat || c.ar}`); continue; }
  const buf = Buffer.from(await rep.arrayBuffer());
  if (buf.length < 1000) { console.log(`Trop court ${c.lat || c.ar}`); continue; }
  await fs.writeFile(chemin, buf);
  manifest.clips.push({ id, ar: c.ar, lat: c.lat, speed: 'normal', file: `/audio/yasmine/${nom}`, mimeType: 'audio/mpeg', bytes: buf.length, category: c.manifestCategory });
  generes++;
  if (generes % 25 === 0) {
    manifest.totalTargets = manifest.clips.length;
    await ecrireManifeste();
    console.log(`  ${generes}/${LIMITE} generes... (${manifest.clips.length} clips)`);
  }
  if (DELAI > 0) await new Promise((r) => setTimeout(r, DELAI));
}
manifest.totalTargets = manifest.clips.length;
await ecrireManifeste();
console.log(`Termine: ${generes} generes, ${ignores} deja presents, ${manifest.clips.length} clips au total.`);
