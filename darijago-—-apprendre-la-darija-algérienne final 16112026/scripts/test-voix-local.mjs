// TEST UNIQUE : genere UNE phrase avec VoiceStudio local et la sauvegarde sur le Bureau.
// Aucune generation en masse. Usage :
//   VOICESTUDIO_KEY=xxx node scripts/test-voix-local.mjs "راني عطشان بزاف"
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const URL_BASE = process.env.VOICESTUDIO_URL || 'http://127.0.0.1:3900';
const KEY = process.env.VOICESTUDIO_KEY || '';
const MODEL = process.env.VOICESTUDIO_MODEL || 'omnivoice';
const VOICE = process.env.VOICESTUDIO_VOICE || 'female';
const TEXTE = process.argv[2] || 'راني عطشان بزاف';
const SORTIE = process.argv[3] || path.join(os.homedir(), 'Desktop', 'test-yasmine-local.wav');

const reponse = await fetch(`${URL_BASE}/v1/audio/speech`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}),
  },
  body: JSON.stringify({
    model: MODEL,
    input: TEXTE,
    voice: VOICE,
    language: 'arq',
    response_format: 'wav',
  }),
});

if (!reponse.ok) {
  const txt = await reponse.text();
  console.log(`ERREUR HTTP ${reponse.status} : ${txt.slice(0, 600)}`);
  process.exit(1);
}

const buf = Buffer.from(await reponse.arrayBuffer());
await fs.writeFile(SORTIE, buf);
console.log(`OK -> ${SORTIE} (${Math.round(buf.length / 1024)} Ko)`);
