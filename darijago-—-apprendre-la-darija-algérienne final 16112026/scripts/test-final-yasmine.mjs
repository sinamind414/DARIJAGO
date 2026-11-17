// Accepte les licencesrequises puis cree le profil Yasmine et genere UN clip test.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const BASE = 'http://127.0.0.1:3900';
const KEY = 'darijago-local-2026';
const h = { Authorization: `Bearer ${KEY}` };
const REF = process.env.REF_WAV || 'C:\\Users\\zakaria\\Documents\\APPLICATION DARIJAGO\\analyse-speak-algerian\\verif-propre.wav';
const SORTIE = path.join(os.homedir(), 'Desktop', 'test-yasmine-local.wav');

// 1) Licences
const repos = ['k2-fsa/OmniVoice', 'eustlb/higgs-audio-v2-tokenizer'];
for (const repo of repos) {
  const r = await fetch(`${BASE}/models/licenses/details/${repo}`, { headers: h });
  const d = await r.json();
  const acc = d.acceptance ?? {};
  const fp = acc.fingerprint;
  console.log(`${repo}: ${r.status} accepted=${acc.accepted} fingerprint=${fp}`);
  if (fp && !acc.accepted) {
    const a = await fetch(`${BASE}/models/licenses/accept`, {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_id: repo, fingerprint: fp, accepted: true }),
    });
    console.log('  accept ->', a.status, (await a.text()).slice(0, 200));
  }
}

// 2) Profil Yasmine depuis le clip propre
const form = new FormData();
form.append('name', 'Yasmine');
form.append('kind', 'clone');
form.append('ref_text', 'راني عطشان بزاف');
form.append('language', 'Arabic');
form.append('ref_audio', new Blob([await fs.readFile(REF)], { type: 'audio/wav' }), 'yasmine.wav');
const rp = await fetch(`${BASE}/profiles`, { method: 'POST', headers: h, body: form });
const txt = await rp.text();
console.log('profil ->', rp.status, txt.slice(0, 200));
const profil = JSON.parse(txt);
const voix = profil.id || '24a8764b';

// 3) Un seul clip test
const rt = await fetch(`${BASE}/v1/audio/speech`, {
  method: 'POST',
  headers: { ...h, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'omnivoice', input: 'راني عطشان بزاف', voice: voix, language: 'arq', response_format: 'wav' }),
});
if (!rt.ok) {
  console.log('TTS ->', rt.status, (await rt.text()).slice(0, 600));
  process.exit(1);
}
const buf = Buffer.from(await rt.arrayBuffer());
await fs.writeFile(SORTIE, buf);
console.log(`OK -> ${SORTIE} (${Math.round(buf.length / 1024)} Ko)`);