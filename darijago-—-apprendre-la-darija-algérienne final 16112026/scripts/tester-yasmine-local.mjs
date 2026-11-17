// TEST LOCAL : cree le profil "Yasmine" depuis le clip Gemini propre, puis genere
// UNE SEULE phrase. Ne touche pas aux 42 phrases de l'app.
//
// Usage : node scripts/tester-yasmine-local.mjs
// Env : VOICESTUDIO_URL, VOICESTUDIO_KEY, REF_WAV
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const URL_BASE = process.env.VOICESTUDIO_URL || 'http://127.0.0.1:3900';
const KEY = process.env.VOICESTUDIO_KEY || 'darijago-local-2026';
const REF_WAV = process.env.REF_WAV || path.join('C:\\Users\\zakaria\\Documents\\APPLICATION DARIJAGO', 'darijago-—-apprendre-la-darija-algérienne final 16112026', 'verif-propre.wav');
const SORTIE = path.join(os.homedir(), 'Desktop', 'test-yasmine-local.wav');
const TEXTE_TEST = 'راني عطشان بزاف';
const REF_TEXTE = 'راني عطشان بزاف';

const headers = { Authorization: `Bearer ${KEY}` };

// 1) Creer (ou retrouver) le profil vocal Yasmine.
const form = new FormData();
form.append('name', 'Yasmine');
form.append('kind', 'clone');
form.append('ref_text', REF_TEXTE);
form.append('language', 'Arabic');
form.append('ref_audio', new Blob([await fs.readFile(REF_WAV)], { type: 'audio/wav' }), 'yasmine-ref.wav');

const rep = await fetch(`${URL_BASE}/api/profiles`, { method: 'POST', headers, body: form });
let profil = null;
if (rep.ok) {
  profil = await rep.json();
  console.log('Profil Yasmine cree :', profil.id ?? profil.profile_id ?? profil.name ?? JSON.stringify(profil).slice(0, 200));
} else {
  const txt = await rep.text();
  console.log('Creation profil :', rep.status, txt.slice(0, 300), '-> on utilise le profil existant "Yasmine" si present.');
}

// 2) Une seule phrase de test.
const voix = profil?.id ?? profil?.profile_id ?? 'Yasmine';
const rep2 = await fetch(`${URL_BASE}/v1/audio/speech`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'omnivoice',
    input: TEXTE_TEST,
    voice: voix,
    language: 'arq',
    response_format: 'wav',
  }),
});

if (!rep2.ok) {
  console.log(`ERREUR TTS ${rep2.status} : ${(await rep2.text()).slice(0, 600)}`);
  process.exit(1);
}

const buf = Buffer.from(await rep2.arrayBuffer());
await fs.writeFile(SORTIE, buf);
console.log(`OK -> ${SORTIE} (${Math.round(buf.length / 1024)} Ko) | voix=${voix}`);
