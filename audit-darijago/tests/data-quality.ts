import { BEN_SEDIRA_DICTIONARY, BEN_SEDIRA_VOLUMES } from '../source/src/data/benSediraDictionary';
import { writeFileSync } from 'node:fs';
const dict=BEN_SEDIRA_DICTIONARY;
function pagesOf(s?:string){ if(!s)return []; return (s.match(/\d+/g)||[]).map(Number); }
const outOfVolume:any[]=[]; const multiPage:any[]=[]; const missing:any[]=[];
for(const e of dict){ const v=BEN_SEDIRA_VOLUMES.find(x=>x.volume===e.volume); const range=pagesOf(v?.pagesCovered); const nums=pagesOf(e.sourcePage); if(!e.sourcePage){missing.push({id:e.id,head:e.frenchHeadword,volume:e.volume}); continue;} if(nums.length>1)multiPage.push({id:e.id,page:e.sourcePage}); if(range.length>=2 && nums.some(n=>n<range[0]||n>range[1])) outOfVolume.push({id:e.id,head:e.frenchHeadword,volume:e.volume,page:e.sourcePage,declared:v?.pagesCovered}); }
const byLetter=Object.fromEntries([...new Set(dict.map(e=>e.letter))].sort().map(l=>[l,dict.filter(e=>e.letter===l).length]));
const verbs=dict.filter(e=>e.category==='verb');
const patternCounts=Object.fromEntries([...new Set(verbs.map(e=>e.verbPattern))].map(p=>[p,verbs.filter(e=>e.verbPattern===p).length]));
const out={total:dict.length,byLetter,patternCounts,missingSourcePage:missing,outOfVolume:outOfVolume.slice(0,50),outOfVolumeCount:outOfVolume.length,multiPageSource:multiPage.slice(0,20),multiPageCount:multiPage.length};
writeFileSync('../tests/data-quality.json',JSON.stringify(out,null,2));
console.log(JSON.stringify({total:out.total,byLetter:out.byLetter,patternCounts:out.patternCounts,missing:missing.length,outOfVolume:outOfVolume.length,multiPage:multiPage.length},null,2));
