// Corpus de recherche importe de projet-darija (sources sous droit, toutes needs_review).
import benSedira from './benSediraCorpus.json';
import tapiero from './tapieroCorpus.json';
import aziri from './aziriCorpus.json';
import tadjer from './tadjerCorpus.json';

export interface CorpusEntry {
  id: string;
  source: string;
  fr: string;
  ar: string;
  lat: string;
  raw: string;
  page: string;
  status: 'needs_review';
  region?: string;
  theme?: string;
}

export const CORPUS: CorpusEntry[] = [
  ...(benSedira as CorpusEntry[]),
  ...(tapiero as CorpusEntry[]),
  ...(aziri as CorpusEntry[]),
  ...(tadjer as CorpusEntry[]),
];

export const CORPUS_SOURCES = [
  { id: 'all', label: 'Toutes les sources' },
  { id: 'ben_sedira_1910', label: 'Ben Sedira 1910' },
  { id: 'tapiero_vocab', label: 'Tapiéro — vocabulaire' },
  { id: 'tapiero_dialogue', label: 'Tapiéro — dialogues' },
  { id: 'tapiero_grammar', label: 'Tapiéro — grammaire' },
  { id: 'tapiero_text', label: 'Tapiéro — textes' },
  { id: 'aziri_2012', label: 'AZIRI 2012' },
  { id: 'tadjer_2010_2012', label: 'Tadjer 2010-2012' },
] as const;

export const CORPUS_TOTAL = CORPUS.length;
