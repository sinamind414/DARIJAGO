// Test avec voix de reference NATIVE (extrait 13,7 s de @speakalgerian).
// Cree un profil puis genere UNE phrase. Rien d'autre.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const BASE = 'http://127.0.0.1:3900';
const H = { Authorization: 'Bearer darijago-local-2026' };
const REF = 'C:\\Users\\zakaria\\Documents\\APPLICATION DARIJAGO\\analyse-speak-algerian\\reference-native-darija.wav';
const REF_TEXTE = 'إذا كنت تتحدث مع شخص، يمكنك أن تقول وشخو، وش صحبي، أو وش بل اسمه. إذا كنت تتحدث مع شخص، يمكنك أن تقول وشختي أو وش بل اسمه مجددا.';
const SORTIE = path.join(os.homedir(), 'Desktop', 'test-yasmine-native.wav');

const form = new FormData();
form.append('name', 'YasmineNative');
form.append('kind', 'clone');
form.append('ref_text', REF_TEXTE);
form.append('language', 'Arabic');
form.append('ref_audio', new Blob([await fs.readFile(REF)], { type: 'audio/wav' }), 'reference-native.wav');

const rp = await fetch(`${BASE}/profiles`, { method: 'POST', headers: H, body: form });
const txt = await rp.text();
console.log('profil ->', rp.status, txt.slice(0, 200));
if (!rp.ok) process.exit(1);
const voix = JSON.parse(txt).id;

const body = JSON.stringify({
  model: 'omnivoice',
  input: 'راني عطشان بزاف',
  voice: voix,
  language: 'arq',
  response_format: 'wav',
});
const fsortie = path.resolve('body-test-native.json');
await fs.writeFile(fsortie, body);
console.log('CORPS:', fsortie);
console.log('VOIX:', voix);
