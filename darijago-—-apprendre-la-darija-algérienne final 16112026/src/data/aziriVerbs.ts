import type { BenSediraDictionaryEntry } from '../types/benSedira';
import { AZIRI_VERBS_PART_1 } from './aziriVerbsPart1';
import { AZIRI_VERBS_PART_2 } from './aziriVerbsPart2';
import { AZIRI_VERBS_PART_3 } from './aziriVerbsPart3';
import { AZIRI_VERBS_PART_4 } from './aziriVerbsPart4';

/**
 * Totalité des verbes et locutions verbales du Dictionnaire des locutions de l’arabe dialectal algérien (Mohamed Nazim Aziri, 2012).
 */
export const AZIRI_VERBS: BenSediraDictionaryEntry[] = [
  ...AZIRI_VERBS_PART_1,
  ...AZIRI_VERBS_PART_2,
  ...AZIRI_VERBS_PART_3,
  ...AZIRI_VERBS_PART_4,
];
