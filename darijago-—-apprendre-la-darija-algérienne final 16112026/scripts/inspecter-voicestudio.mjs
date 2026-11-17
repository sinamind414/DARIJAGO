// Inspecte les endpoints licence et profils de VoiceStudio.
const KEY = 'darijago-local-2026';
const h = { Authorization: `Bearer ${KEY}` };
for (const p of [
  '/api/models/licenses/details/k2-fsa/OmniVoice',
  '/api/models/licenses/acceptance/k2-fsa/OmniVoice',
  '/api/profiles',
  '/profiles',
  '/api/health',
  '/docs',
]) {
  try {
    const r = await fetch('http://127.0.0.1:3900' + p, { headers: h });
    const t = await r.text();
    console.log(`${p} -> ${r.status} : ${t.slice(0, 400)}`);
  } catch (e) { console.log(`${p} -> ERREUR ${e}`); }
}