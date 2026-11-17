// Genere un clip Yasmine et le sauvegarde sur le Bureau pour ecoute immediate.
// Usage : node scripts/test-voix-yasmine.mjs "texte arabe" "latin"
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ar = process.argv[2] || 'راني عطشان بزاف';
const lat = process.argv[3] || 'rani atchan bezzaf';
const fichierOut = process.argv[4] || path.join(os.homedir(), 'Desktop', 'test-yasmine.wav');

const resp = await fetch('http://localhost:3000/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ textArabic: ar, textLatin: lat, slow: false, language: 'fr', voiceName: 'Kore' }),
});
const data = await resp.json();

if (!data.audioBase64) {
  console.log('ECHEC :', JSON.stringify(data));
  process.exit(1);
}

const buf = Buffer.from(data.audioBase64, 'base64');
await fs.mkdir(path.dirname(fichierOut), { recursive: true });
await fs.writeFile(fichierOut, buf);

console.log('Clip genere :', fichierOut, '|', Math.round(buf.length / 1024), 'Ko | cache:', data.cached);
await execFileAsync(fichierOut, [], { windowsHide: true }).catch(() => {});
console.log('Ouverture du fichier audio...');