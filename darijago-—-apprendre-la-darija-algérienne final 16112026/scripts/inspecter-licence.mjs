const h = { Authorization: 'Bearer darijago-local-2026' };
for (const repo of ['k2-fsa/OmniVoice', 'eustlb/higgs-audio-v2-tokenizer']) {
  const r = await fetch('http://127.0.0.1:3900/models/licenses/details/' + repo, { headers: h });
  console.log(repo, JSON.stringify(await r.json(), null, 2).slice(0, 2500));
}