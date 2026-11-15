import type { BenSediraDictionaryEntry } from '../types/benSedira';

/**
 * Verbe de la lettre Z (Zézayer) extrait du « Dictionnaire
 * français-arabe de la langue parlée en Algérie » (Belkassem Ben Sedira, 5e éd., 1910, p. 751).
 */
export const BEN_SEDIRA_VERBS_Z: BenSediraDictionaryEntry[] = [
  {
    id: 'bs-v-z-zezayer',
    volume: 10,
    letter: 'Z',
    sourcePage: 'p. 751',
    frenchHeadword: 'Zézayer',
    category: 'verb',
    verbPattern: 'derived',
    darijaLatin: 'nlesles / leslest / lesles',
    darijaArabic: 'نلسلس / لسلست / لسلس',
    phonetic: 'nles-les / les-lest / les-les',
    conjugation: { present1s: 'nlesles', past1s: 'leslest', past3ms: 'lesles' },
  },
];
