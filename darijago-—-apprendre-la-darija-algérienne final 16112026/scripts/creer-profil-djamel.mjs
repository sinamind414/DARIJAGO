// Test unique : profil vocal cloné depuis la référence Djamel (12 s) + 1 phrase.
import fs from 'node:fs/promises';

const BASE = 'http://127.0.0.1:3900';
const H = { Authorization: 'Bearer darijago-local-2026' };
const REF = 'C:\\Users\\zakaria\\Documents\\APPLICATION DARIJAGO\\analyse-speak-algerian\\reference-djamel-12s.wav';
const REF_TEXTE = 'هيا بنا نبدأ نبدأ بلميز كاين كاين يمكن أن تقول هناك وعندما لا يوجد شيء نقول مكانش';

const form = new FormData();
form.append('name', 'DjamelVoice');
form.append('kind', 'clone');
form.append('ref_text', REF_TEXTE);
form.append('language', 'Arabic');
form.append('ref_audio', new Blob([await fs.readFile(REF)], { type: 'audio/wav' }), 'reference-djamel.wav');

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
await fs.writeFile('body-test-djamel.json', body);
console.log('VOIX:', voix);
