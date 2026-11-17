import type { BenSediraDictionaryEntry } from '../types/benSedira';

/**
 * Verbe de la lettre Y (You! you! — pousser des you! you!) extrait du « Dictionnaire
 * français-arabe de la langue parlée en Algérie » (Belkassem Ben Sedira, 5e éd., 1910, p. 750).
 */
export const BEN_SEDIRA_VERBS_Y: BenSediraDictionaryEntry[] = [
  {
    id: 'bs-v-y-youyou-pousser',
    volume: 10,
    letter: 'Y',
    sourcePage: 'p. 750',
    frenchHeadword: 'You! you! (pousser des you! you!)',
    category: 'verb',
    verbPattern: 'derived',
    darijaLatin: 'nzer’ret / zer’rett / zer’ret',
    darijaArabic: 'نزغرط / زغرطت / زغرط',
    phonetic: 'nzer-ghet / zer-ghett / zer-ghet',
    conjugation: { present1s: 'nzer’ret', past1s: 'zer’rett', past3ms: 'zer’ret' },
  },
];
