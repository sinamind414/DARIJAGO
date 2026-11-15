import { UI_TRANSLATIONS } from '../source/src/i18n/translations';
import { getLocalizedPhrase, getLocalizedModule, getLocalizedScenario } from '../source/src/i18n/curriculumTranslations';
import { CURRICULUM_MODULES, ALL_PHRASES, DIALOGUE_SCENARIOS } from '../source/src/data/curriculum';
import { writeFileSync } from 'node:fs';
const langs=['fr','en','es','de','it','nl','zh'] as const;
function keys(o:any,p=''):string[]{return Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'&&!Array.isArray(v)?keys(v,p+k+'.'):[p+k]);}
const out:any={languages:langs,ui:{},unchangedPhraseMeaning:[],unchangedModuleTitle:[],unchangedScenarioTitle:[],breakdownMismatch:[]};
for(const l of langs){out.ui[l]=keys(UI_TRANSLATIONS[l]).length;}
for(const p of ALL_PHRASES){for(const l of langs){if(l==='fr')continue; const lp=getLocalizedPhrase(p,l); if(lp.frenchMeaning===p.frenchMeaning) out.unchangedPhraseMeaning.push({id:p.id,lang:l}); if(lp.breakdown.length!==p.breakdown.length) out.breakdownMismatch.push({id:p.id,lang:l});}}
for(const m of CURRICULUM_MODULES){for(const l of langs){if(l==='fr')continue; const lm=getLocalizedModule(m,l); if(lm.title===m.title) out.unchangedModuleTitle.push({id:m.id,lang:l});}}
for(const s of DIALOGUE_SCENARIOS){for(const l of langs){if(l==='fr')continue; const ls=getLocalizedScenario(s,l); if(ls.title===s.title) out.unchangedScenarioTitle.push({id:s.id,lang:l});}}
writeFileSync('../tests/i18n-check.json',JSON.stringify(out,null,2));
console.log(JSON.stringify({ui:out.ui,unchangedPhraseMeaning:out.unchangedPhraseMeaning.length,unchangedModuleTitle:out.unchangedModuleTitle.length,unchangedScenarioTitle:out.unchangedScenarioTitle.length,breakdownMismatch:out.breakdownMismatch.length},null,2));
