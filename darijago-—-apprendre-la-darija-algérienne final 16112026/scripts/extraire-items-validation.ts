// Extrait les 73 contenus a faire valider par le comite natif (R3).
import fs from 'node:fs/promises';
import { CURRICULUM_MODULES, DIALOGUE_SCENARIOS } from '../src/data/curriculum.ts';
import { BEN_SEDIRA_GRAMMAR_SECTIONS } from '../src/data/benSediraGrammar.ts';

const items: any[] = [];
for (const mod of CURRICULUM_MODULES) {
  for (const p of mod.phrases) {
    items.push({
      id: `phrase-${mod.number}-${p.id}`,
      type: 'phrase',
      source: `Module ${mod.number}`,
      arabic: p.darijaArabic,
      latin: p.darijaLatin,
      french: p.frenchMeaning ?? (p as any).french ?? '',
      note: (p as any).usageNote ?? '',
    });
  }
}
for (const sc of DIALOGUE_SCENARIOS) {
  const d = sc as any;
  const turns = [d.openingTurn, ...(d.starterSuggestions ?? [])].filter(Boolean);
  turns.forEach((t: any, i: number) => items.push({
    id: `dialogue-${d.id}-${i}`,
    type: 'dialogue',
    source: d.title ?? d.id,
    arabic: t.darijaArabic,
    latin: t.darijaLatin,
    french: t.frenchTranslation ?? t.frenchMeaning ?? '',
    note: t.coachingTip ?? '',
  }));
}
for (const s of BEN_SEDIRA_GRAMMAR_SECTIONS) {
  (s.examples ?? []).forEach((e: any, i: number) => items.push({
    id: `grammar-${s.id}-${i}`,
    type: 'grammar',
    source: s.title,
    arabic: e.darijaArabic,
    latin: e.darijaLatin,
    french: e.frenchMeaning ?? '',
    note: e.note ?? '',
  }));
}

await fs.writeFile('../analyse-speak-algerian/comite-natif/items-a-valider.json',
  JSON.stringify({ version: 1, total: items.length, items }, null, 2), 'utf8');
console.log('items extraits:', items.length);
const parType: any = {};
for (const it of items) parType[it.type] = (parType[it.type] ?? 0) + 1;
console.log('par type:', parType);