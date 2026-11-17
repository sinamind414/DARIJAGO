// Genere les voix off "Yasmine" via VoiceStudio LOCAL et les sauvegarde dans l'app.
// Aucun appel API externe : les fichiers restent dans public/audio/yasmine/ et sont
// servis statiquement par l'application.
//
// Usage :
//   VOICESTUDIO_KEY=xxx npx tsx scripts/generer-audio-local.ts [limite]
// Variables :
//   VOICESTUDIO_URL   (defaut http://127.0.0.1:3900)
//   VOICESTUDIO_KEY   (cle API locale, ou PIN)
//   VOICESTUDIO_MODEL (defaut omnivoice)
//   VOICESTUDIO_VOICE (defaut female)
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARABIZI_SOUNDS, CURRICULUM_MODULES } from '../src/data/curriculum';
import { formatBenSediraLatinForSpeech } from '../src/utils/darijaSpeechFormat';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'audio', 'yasmine');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

const URL_BASE = process.env.VOICESTUDIO_URL || 'http://127.0.0.1:3900';
const KEY = process.env.VOICESTUDIO_KEY || '';
const MODEL = process.env.VOICESTUDIO_MODEL || 'omnivoice';
const VOICE = process.env.VOICESTUDIO_VOICE || 'female';
const LIMITE = Number(process.argv[2] || 42);
const DELAI_MS = Number(process.env.VOICESTUDIO_DELAY || 500);

interface Clip { id: string; ar: string; lat: string; speed: 'normal' | 'slow'; file: string; mimeType: string; bytes: number; category: string }

function clipId(ar: string, lat: string, speed: 'normal' | 'slow'): string {
  return crypto.createHash('sha256')
    .update(JSON.stringify({ v: 1, voice: 'Kore', speed, ar: ar.trim(), lat: formatBenSediraLatinForSpeech(lat) }))
    .digest('hex').slice(0, 16);
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const cibles: Array<{ ar: string; lat: string; speed: 'normal' | 'slow'; category: string }> = [];
  const vues = new Set<string>();
  const ajoute = (ar: string, lat: string, category: string) => {
    const a = ar.trim(), l = formatBenSediraLatinForSpeech(lat);
    if (!a && !l) return;
    const id = clipId(a, l, 'normal');
    if (vues.has(id)) return;
    vues.add(id);
    cibles.push({ ar: a, lat: l, speed: 'normal', category });
  };

  for (const mod of CURRICULUM_MODULES) {
    for (const phrase of mod.phrases) ajoute(phrase.darijaArabic, phrase.darijaLatin, 'lesson');
  }
  for (const s of ARABIZI_SOUNDS) ajoute(s.exampleArabic, s.exampleDarija, 'sound');

  const clips: Clip[] = [];
  let generes = 0;
  let ignores = 0;
  const aGenerer = cibles.slice(0, LIMITE);

  for (const c of aGenerer) {
    const id = clipId(c.ar, c.lat, c.speed);
    const nom = `${id}.mp3`;
    const chemin = path.join(OUTPUT_DIR, nom);

    try {
      const stat = await fs.stat(chemin);
      if (stat.size > 0) {
        clips.push({ id, ar: c.ar, lat: c.lat, speed: c.speed, file: `/audio/yasmine/${nom}`, mimeType: 'audio/mpeg', bytes: stat.size, category: c.category });
        ignores++;
        continue;
      }
    } catch { /* fichier absent */ }

    const body: Record<string, unknown> = {
      model: MODEL,
      input: c.ar || c.lat,
      voice: VOICE,
      language: 'arq',
      response_format: 'mp3',
    };

    let reponse: globalThis.Response | null = null;
    for (let tentative = 1; tentative <= 3; tentative++) {
      try {
        reponse = await fetch(`${URL_BASE}/v1/audio/speech`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}),
          },
          body: JSON.stringify(body),
        });
        if (reponse.ok) break;
        console.log(`  retry ${tentative} pour "${c.lat}" : HTTP ${reponse.status}`);
      } catch (e) {
        console.log(`  retry ${tentative} pour "${c.lat}" : ${String(e)}`);
      }
      await new Promise((r) => setTimeout(r, 2000 * tentative));
    }

    if (!reponse?.ok) {
      console.log(`ECHEC "${c.lat}"`);
      continue;
    }

    const buf = Buffer.from(await reponse.arrayBuffer());
    if (buf.length < 1000) {
      console.log(`Audio trop court pour "${c.lat}" (${buf.length} o)`);
      continue;
    }
    await fs.writeFile(chemin, buf);
    clips.push({ id, ar: c.ar, lat: c.lat, speed: c.speed, file: `/audio/yasmine/${nom}`, mimeType: 'audio/mpeg', bytes: buf.length, category: c.category });
    generes++;
    console.log(`OK [${generes}/${aGenerer.length}] ${c.lat} -> ${nom} (${Math.round(buf.length / 1024)} Ko)`);

    // Ecriture incrementale du manifeste : meme interrompu, les clips deja generes restent utilisables.
    await fs.writeFile(MANIFEST_PATH, JSON.stringify({
      version: 1, voice: 'Kore', speakerName: 'Yasmine', city: 'Alger',
      generatedAt: new Date().toISOString(), totalTargets: cibles.length, clips,
    }, null, 2), 'utf8');

    if (DELAI_MS > 0) await new Promise((r) => setTimeout(r, DELAI_MS));
  }

  console.log(`\nTermine : ${generes} generes, ${ignores} deja present, ${clips.length} clips dans le manifeste.`);
  console.log(`Dossier : ${OUTPUT_DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
