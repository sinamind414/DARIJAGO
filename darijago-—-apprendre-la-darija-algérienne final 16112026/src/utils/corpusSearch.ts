// Recherche dans le corpus importe (19 433 entrees, sources sous droit).
import { CORPUS, type CorpusEntry } from '../data/corpus';

function normalise(v: string): string {
  return (v || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function searchCorpus(
  query: string,
  source: string = 'all',
  limite: number = 30
): CorpusEntry[] {
  const q = normalise(query);
  if (!q) return [];
  const resultats: CorpusEntry[] = [];
  for (const entree of CORPUS) {
    if (source !== 'all' && entree.source !== source) continue;
    if (
      normalise(entree.fr).includes(q) ||
      normalise(entree.lat).includes(q) ||
      normalise(entree.ar).includes(q)
    ) {
      resultats.push(entree);
      if (resultats.length >= limite) break;
    }
  }
  return resultats;
}
