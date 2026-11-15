import { CURRICULUM_MODULES, ALL_PHRASES, DIALOGUE_SCENARIOS, ARABIZI_SOUNDS } from './source/src/data/curriculum';
import { BEN_SEDIRA_DICTIONARY, BEN_SEDIRA_VOLUMES } from './source/src/data/benSediraDictionary';
import { BEN_SEDIRA_GRAMMAR_SECTIONS } from './source/src/data/benSediraGrammar';
import { getCulturalStories } from './source/src/data/stories';
import { deriveFullConjugationTable } from './source/src/utils/dictionaryLogic';
import { deriveArabicConjugationRows, deriveArabicImperative } from './source/src/utils/darijaSpeechFormat';
import { extractArabicVerbRoot } from './source/src/utils/conjugationLogic';
import { writeFileSync } from 'node:fs';

function dup<T>(arr:T[], key:(x:T)=>string){ const m=new Map<string,number>(); for(const x of arr){const k=key(x);m.set(k,(m.get(k)||0)+1);} return [...m].filter(([,n])=>n>1).map(([k,n])=>({key:k,count:n})); }
const dict=BEN_SEDIRA_DICTIONARY;
const verbs=dict.filter(e=>e.category==='verb');
const byVol=Object.fromEntries(BEN_SEDIRA_VOLUMES.map(v=>[v.volume,{declared:v.pagesCovered,entries:dict.filter(e=>e.volume===v.volume).length,verbs:verbs.filter(e=>e.volume===v.volume).length,missingSourcePage:dict.filter(e=>e.volume===v.volume&&!e.sourcePage).length}]));
const pageNumbers=dict.map(e=>e.sourcePage?parseInt(e.sourcePage.replace(/[^0-9]/g,''),10):NaN).filter(n=>!isNaN(n));
const missingConj=verbs.filter(e=>!e.conjugation||!e.conjugation.present1s||!e.conjugation.past1s||!e.conjugation.past3ms);
const noExample=dict.filter(e=>!e.exampleDarija);
const suspicious=dict.filter(e=>/skéb|sk[ée]b|TODO|FIXME|\?\?\?|lorem/i.test(JSON.stringify(e)));
const regionalMoroccan=dict.filter(e=>/\b(bghit|bghiti|ghadi|daba|bezaf|wakha|fin)\b/i.test(e.darijaLatin+' '+(e.usageNote||'')));
const samples=['bs-v-a-abaisser','bs-v-a-abandonner','bs-v-e-etre','bs-v-a-avoir','bs-v-f-faire','bs-v-k-kteb','bs-v-c-chra','bs-v-d-dar'].map(id=>{const e=dict.find(x=>x.id===id); if(!e)return {id,missing:true}; return {id,head:e.frenchHeadword,sourcePage:e.sourcePage,latin:e.darijaLatin,arabic:e.darijaArabic,latinTable:deriveFullConjugationTable(e),arabicRows:deriveArabicConjugationRows(e),imperative:deriveArabicImperative(e),root:extractArabicVerbRoot(e.darijaArabic,e.verbPattern)};});
const phraseDup=dup(ALL_PHRASES,p=>p.darijaLatin.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim());
const dictDup=dup(dict,e=>(e.frenchHeadword+'|'+e.darijaLatin).toLowerCase());
const out={
 curriculum:{modules:CURRICULUM_MODULES.length,phrases:ALL_PHRASES.length,perModule:CURRICULUM_MODULES.map(m=>({id:m.id,title:m.title,phrases:m.phrases.length})),dialogues:DIALOGUE_SCENARIOS.length,arabiziSounds:ARABIZI_SOUNDS.length,duplicatePhraseIds:dup(ALL_PHRASES,p=>p.id),duplicatePhraseLatin:phraseDup,missingRegionalNote:ALL_PHRASES.filter(p=>!p.regionalNote).length,missingBreakdown:ALL_PHRASES.filter(p=>!p.breakdown?.length).length},
 dictionary:{entries:dict.length,verbs:verbs.length,other:dict.length-verbs.length,categories:Object.fromEntries([...new Set(dict.map(e=>e.category))].map(c=>[c,dict.filter(e=>e.category===c).length])),volumes:byVol,missingSourcePage:dict.filter(e=>!e.sourcePage).length,sourcePageMin:Math.min(...pageNumbers),sourcePageMax:Math.max(...pageNumbers),duplicateIds:dup(dict,e=>e.id),duplicateHeadwordLatin:dictDup,verbsMissingConjugation:missingConj.length,entriesWithoutExample:noExample.length,entriesWithUsageNote:dict.filter(e=>e.usageNote).length,suspicious:suspicious.slice(0,20),moroccanMarkers:regionalMoroccan.slice(0,20).map(e=>({id:e.id,head:e.frenchHeadword,latin:e.darijaLatin})),moroccanMarkerCount:regionalMoroccan.length},
 grammar:{sections:BEN_SEDIRA_GRAMMAR_SECTIONS.length,sourcePages:BEN_SEDIRA_GRAMMAR_SECTIONS.map(s=>s.sourcePages)},
 stories:{count:getCulturalStories('fr').length,ids:getCulturalStories('fr').map(s=>s.id)},
 conjugationSamples:samples,
};
writeFileSync('../tests/donnees.json',JSON.stringify(out,null,2));
console.log(JSON.stringify({curriculum:out.curriculum.modules,phrases:out.curriculum.phrases,dict:out.dictionary.entries,verbs:out.dictionary.verbs,missingSourcePage:out.dictionary.missingSourcePage,missingConj:out.dictionary.verbsMissingConjugation,dupIds:out.dictionary.duplicateIds.length,dupPhraseLatin:out.curriculum.duplicatePhraseLatin.length,moroccanMarkers:out.dictionary.moroccanMarkerCount},null,2));
