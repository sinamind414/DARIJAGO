const r = await fetch('https://huggingface.co/api/models/k2-fsa/OmniVoice?blobs=true');
const d = await r.json();
console.log('siblings:', d.siblings?.length);
for (const s of (d.siblings ?? []).sort((a,b)=>(b.size??0)-(a.size??0)).slice(0,8)) {
  console.log(`${((s.size??0)/1e6).toFixed(1)} Mo  ${s.rfilename}`);
}