import type {
  BenSediraDictionaryEntry,
  FullVerbConjugationRow,
  VerbPattern,
} from '../types/benSedira';
import {
  deriveFullConjugationTable,
  normalizeDictionarySearch,
} from './dictionaryLogic';
import {
  deriveArabicConjugationRows,
  deriveArabicImperative,
  splitArabicVerbTriple,
  type ArabicConjugatedRow,
  type ArabicVerbTriple,
} from './darijaSpeechFormat';

export type ConjugationTenseFilter =
  | 'all'
  | 'present'
  | 'past'
  | 'negation'
  | 'imperative';

export type ConjugationSearchScope = 'all' | 'root' | 'tense';

export type ConjugationDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface VerbConjugationIndexItem {
  entry: BenSediraDictionaryEntry;
  difficulty: ConjugationDifficulty;
  arabicRoot: string;
  arabicRootCompact: string;
  latinRoot: string;
  latinRootCompact: string;
  tableRows: FullVerbConjugationRow[];
  arabicRows: Record<FullVerbConjugationRow['personKey'], ArabicConjugatedRow>;
  arabicTriple: ArabicVerbTriple;
  arabicImperative: string;
  presentFormsText: string;
  pastFormsText: string;
  negationFormsText: string;
  imperativeText: string;
  allTensesText: string;
  generalSearchText: string;
}

const ARABIC_DIACRITICS_RE = /[\u064B-\u065F\u0670\u0640]/g;
const SHADDA = '\u0651';

function normalizeArabicChars(raw: string): string {
  return raw
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ا');
}

function extractArabicStemToken(darijaArabic: string): string {
  const parts = darijaArabic.split('/').map((p) => p.trim()).filter(Boolean);
  const candidate = parts.length >= 3 ? parts[2] : parts[parts.length - 1] ?? darijaArabic;
  const cleaned = candidate.replace(/\(.*?\)/g, ' ').trim();
  const match = cleaned.match(/[\u0600-\u06FF]+/);
  return match ? match[0] : cleaned;
}

/**
 * Extracts a clean Arabic consonantal root (e.g. "ك-ت-ب", "ح-ل-ل", "ق-ا-ل")
 * from a Ben Sedira verb's 3rd-person masculine past stem.
 */
export function extractArabicVerbRoot(
  darijaArabic: string,
  verbPattern?: VerbPattern
): { display: string; compact: string } {
  const token = extractArabicStemToken(darijaArabic);
  if (!token) {
    return { display: '—', compact: '' };
  }

  const hasShadda = token.includes(SHADDA);
  const stripped = normalizeArabicChars(token.replace(ARABIC_DIACRITICS_RE, ''));
  const chars = Array.from(stripped);

  let rootLetters: string[] = chars;

  if (chars.length === 2) {
    // Doubled verb with shadda (e.g. حلّ -> ح-ل-ل, ردّ -> ر-د-د)
    rootLetters = hasShadda ? [chars[0], chars[1], chars[1]] : chars;
  } else if (chars.length === 6 && stripped.startsWith('است')) {
    rootLetters = chars.slice(3);
  } else if (chars.length === 5 && stripped.startsWith('است')) {
    rootLetters = [chars[3], chars[4], chars[4]];
  } else if (chars.length === 5 && chars[0] === 'ت' && chars[2] === 'ا') {
    // Form VI (تعارك -> ع-ر-ك)
    rootLetters = [chars[1], chars[3], chars[4]];
  } else if (chars.length === 5 && stripped.startsWith('ان')) {
    // Form VII (انكسر -> ك-س-ر)
    rootLetters = chars.slice(2);
  } else if (chars.length === 5 && chars[0] === 'ا' && chars[2] === 'ت') {
    // Form VIII (اجتمع -> ج-م-ع, اشتكى -> ش-ك-ا)
    rootLetters = [chars[1], chars[3], chars[4]];
  } else if (chars.length === 4 && chars[0] === 'ت') {
    // Form V / t-reflexive (تعلّم -> ع-ل-م)
    rootLetters = chars.slice(1);
  } else if (chars.length === 4 && chars[1] === 'ا') {
    // Form III (عاقب -> ع-ق-ب, ساعد -> س-ع-د)
    rootLetters = [chars[0], chars[2], chars[3]];
  } else if (
    chars.length === 4 &&
    (token.startsWith('أ') || (verbPattern === 'derived' && chars[0] === 'ا'))
  ) {
    // Form IV (أعلم -> ع-ل-م)
    rootLetters = chars.slice(1);
  }

  const compact = rootLetters.join('');
  return {
    display: rootLetters.join('-'),
    compact,
  };
}

const LATIN_DIGRAPHS = ['ch', 'kh', 'gh', 'th', 'dh', 'ou'];

function tokenizeLatinConsonants(rawPast3ms: string, verbPattern?: VerbPattern): string[] {
  const token = rawPast3ms.trim().split(' ')[0] ?? '';
  let normalized = normalizeDictionarySearch(token)
    .replace(/ç/g, 's')
    .replace(/\s+/g, '');

  if (verbPattern === 'derived') {
    if (normalized.startsWith('est') && normalized.length > 5) {
      normalized = normalized.slice(3);
    } else if (normalized.startsWith('te') && normalized.length > 4) {
      normalized = normalized.slice(2);
    } else if (normalized.startsWith('t') && normalized.length > 4) {
      normalized = normalized.slice(1);
    } else if (normalized.startsWith('en') && normalized.length > 4) {
      normalized = normalized.slice(2);
    }
  }

  const units: string[] = [];
  let i = 0;
  while (i < normalized.length) {
    const two = normalized.slice(i, i + 2);
    if (two === 'ou') {
      const nextChar = normalized[i + 2] ?? '';
      if (i === 0 || 'aeiouy'.includes(nextChar)) {
        if (units[units.length - 1] !== 'w') {
          units.push('w');
        }
        i += 2;
        continue;
      }
      i += 2;
      continue;
    }
    if (LATIN_DIGRAPHS.includes(two)) {
      units.push(two);
      i += 2;
      continue;
    }
    const ch = normalized[i];
    if (!'aeiouy'.includes(ch)) {
      if (units[units.length - 1] !== ch) {
        units.push(ch);
      }
    }
    i += 1;
  }

  if (units.length === 0 && normalized.length > 0) {
    return Array.from(normalized).slice(0, 3);
  }
  return units.slice(0, 4);
}

/**
 * Extracts a searchable Latin consonantal root skeleton (e.g. "k-t-b", "ch-r-b")
 * from a Ben Sedira verb entry.
 */
export function extractLatinVerbRoot(
  past3ms: string,
  verbPattern?: VerbPattern
): { display: string; compact: string } {
  const units = tokenizeLatinConsonants(past3ms, verbPattern);
  if (units.length === 0) {
    return { display: '—', compact: '' };
  }
  return {
    display: units.join('-'),
    compact: units.join(''),
  };
}

const BEGINNER_CORE_HEADWORDS = new Set([
  'etre',
  'avoir',
  'faire',
  'dire',
  'aller',
  'venir',
  'prendre',
  'donner',
  'voir',
  'vouloir',
  'pouvoir',
  'savoir',
  'manger',
  'boire',
  'dormir',
  'parler',
  'ecrire',
  'lire',
  'acheter',
  'vendre',
  'ouvrir',
  'fermer',
  'entrer',
  'sortir',
  'aimer',
  'comprendre',
  'chercher',
  'trouver',
  'travailler',
  'attendre',
  'partir',
  'rester',
  'demander',
  'repondre',
  'connaitre',
  'penser',
  'apprendre',
  'payer',
  'porter',
  'mettre',
  'garder',
  'laisser',
  'monter',
  'descendre',
  'arriver',
  'commencer',
  'finir',
  'rire',
  'pleurer',
  'aider',
  'marcher',
  'courir',
  'laver',
  'preparer',
  'ecouter',
  'regarder',
  'vivre',
  'compter',
  'envoyer',
  'recevoir',
  'devoir',
  'falloir',
  'choisir',
  'suivre',
  'tenir',
  'servir',
  'oublier',
  'montrer',
  'essayer',
  'changer',
  'passer',
  'rentrer',
  'revenir',
  'voyager',
  'chanter',
  'jouer',
]);

/**
 * Classifies any Ben Sedira verb into beginner, intermediate, or advanced
 * based on everyday frequency, stem regularity, and morphological complexity.
 */
export function classifyVerbDifficulty(
  entry: BenSediraDictionaryEntry
): ConjugationDifficulty {
  if (entry.id === 'bs-v-e-etre' || entry.id === 'bs-v-a-avoir') {
    return 'beginner';
  }

  const normalizedHeadword = entry.frenchHeadword
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const isReflexive =
    /\(\s*(?:s['’]?|se)\s*\)/.test(normalizedHeadword) ||
    /^(?:s['’]|se\s)/.test(normalizedHeadword);

  const headwordWithoutParens = normalizedHeadword
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const synonymParts = headwordWithoutParens
    .split(/[,/]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const isCausativeGloss = /\(\s*faire\s*\)/.test(normalizedHeadword);
  const isCoreHeadword =
    !isCausativeGloss &&
    synonymParts.some((part) => BEGINNER_CORE_HEADWORDS.has(part));
  const isFrenchMultiWordPhrase =
    synonymParts.length > 0 &&
    synonymParts.every((part) => part.split(/[\s'’]+/).length >= 3);

  const firstArabic = (entry.darijaArabic.split('/')[0] ?? '').trim();
  const firstLatin = (entry.darijaLatin.split('/')[0] ?? '').trim();
  const isMultiWord =
    firstArabic.includes(' ') ||
    firstLatin.includes(' ') ||
    isFrenchMultiWordPhrase;

  if (isCoreHeadword && !isReflexive && !isMultiWord) {
    return 'beginner';
  }

  const pattern = entry.verbPattern ?? 'regular';
  if (
    pattern === 'regular' &&
    !entry.preposition &&
    !isReflexive &&
    !isMultiWord
  ) {
    return 'beginner';
  }

  if (pattern === 'hollow' || pattern === 'doubled' || pattern === 'defective') {
    return isReflexive || isMultiWord ? 'advanced' : 'intermediate';
  }

  if (pattern === 'regular') {
    return isMultiWord ? 'advanced' : 'intermediate';
  }

  // Derived verbs: Forms II & III stay intermediate; Forms V–X, reflexives, quadriliterals & idioms are advanced
  const past3msArabic = (entry.darijaArabic.split('/')[2] ?? '')
    .replace(ARABIC_DIACRITICS_RE, '')
    .trim();
  const past3msChars = Array.from(normalizeArabicChars(past3msArabic));

  const isComplexDerived =
    isReflexive ||
    isMultiWord ||
    past3msArabic.startsWith('ت') ||
    past3msArabic.startsWith('ان') ||
    past3msArabic.startsWith('است') ||
    (past3msChars.length >= 5 && past3msChars[0] === 'ا') ||
    (past3msChars.length >= 4 &&
      !entry.darijaArabic.split('/')[2]?.includes(SHADDA) &&
      past3msChars[1] !== 'ا');

  return isComplexDerived ? 'advanced' : 'intermediate';
}

/**
 * Builds an indexed conjugation table dataset across all verbs in the dictionary
 * for instant filtering by root, tense, difficulty, verb pattern, or alphabet letter.
 */
export function buildVerbConjugationIndex(
  entries: BenSediraDictionaryEntry[]
): VerbConjugationIndexItem[] {
  const verbs = entries.filter(
    (entry) => entry.category === 'verb' && Boolean(entry.conjugation)
  );

  return verbs.map((entry) => {
    const difficulty = classifyVerbDifficulty(entry);
    const tableRows = deriveFullConjugationTable(entry);
    const arabicRows = deriveArabicConjugationRows(entry);
    const arabicTriple = splitArabicVerbTriple(entry.darijaArabic);
    const arabicImperative = deriveArabicImperative(entry);
    const arabicRoot = extractArabicVerbRoot(entry.darijaArabic, entry.verbPattern);
    const latinRoot = extractLatinVerbRoot(
      entry.conjugation!.past3ms,
      entry.verbPattern
    );

    const presentFormsText = tableRows
      .map((r) => normalizeDictionarySearch(r.present))
      .join(' ');
    const pastFormsText = tableRows
      .map((r) => normalizeDictionarySearch(r.past))
      .join(' ');
    const negationFormsText = tableRows
      .map((r) => normalizeDictionarySearch(r.negativePresent))
      .join(' ');
    const imperativeText = normalizeDictionarySearch(
      entry.conjugation?.imperative ?? ''
    );
    const allTensesText = [
      presentFormsText,
      pastFormsText,
      negationFormsText,
      imperativeText,
    ]
      .filter(Boolean)
      .join(' ');

    const generalSearchText = [
      entry.frenchHeadword,
      entry.darijaLatin,
      entry.phonetic,
      entry.conjugation!.present1s,
      entry.conjugation!.past1s,
      entry.conjugation!.past3ms,
      entry.conjugation!.imperative ?? '',
      ...(entry.alternativeForms ?? []),
      latinRoot.display,
      latinRoot.compact,
    ]
      .map(normalizeDictionarySearch)
      .join(' ');

    return {
      entry,
      difficulty,
      arabicRoot: arabicRoot.display,
      arabicRootCompact: arabicRoot.compact,
      latinRoot: latinRoot.display,
      latinRootCompact: latinRoot.compact,
      tableRows,
      arabicRows,
      arabicTriple,
      arabicImperative,
      presentFormsText,
      pastFormsText,
      negationFormsText,
      imperativeText,
      allTensesText,
      generalSearchText,
    };
  });
}

export interface VerbConjugationFilterOptions {
  query?: string;
  searchScope?: ConjugationSearchScope;
  tense?: ConjugationTenseFilter;
  difficulty?: ConjugationDifficulty | 'all';
  verbPattern?: VerbPattern | 'all';
  letter?: string | 'all';
}

export function normalizeRootQuery(input: string): {
  latinCompact: string;
  arabicCompact: string;
  normalizedText: string;
  rawArabic: string;
} {
  const normalizedText = normalizeDictionarySearch(input);
  const latinCompact = normalizedText.replace(/\s+/g, '');
  const rawArabic = input.trim();
  const arabicCompact = normalizeArabicChars(
    rawArabic.replace(ARABIC_DIACRITICS_RE, '')
  ).replace(/[\s\-/]+/g, '');

  return { latinCompact, arabicCompact, normalizedText, rawArabic };
}

export function filterVerbConjugationIndex(
  index: VerbConjugationIndexItem[],
  {
    query = '',
    searchScope = 'all',
    tense = 'all',
    difficulty = 'all',
    verbPattern = 'all',
    letter = 'all',
  }: VerbConjugationFilterOptions = {}
): VerbConjugationIndexItem[] {
  const { latinCompact, arabicCompact, normalizedText, rawArabic } =
    normalizeRootQuery(query);

  return index.filter((item) => {
    if (letter !== 'all' && item.entry.letter.toUpperCase() !== letter.toUpperCase()) {
      return false;
    }
    if (difficulty !== 'all' && item.difficulty !== difficulty) {
      return false;
    }
    if (verbPattern !== 'all' && item.entry.verbPattern !== verbPattern) {
      return false;
    }
    if (tense === 'imperative' && !item.entry.conjugation?.imperative) {
      return false;
    }

    if (!normalizedText && !rawArabic) {
      return true;
    }

    const rootMatch =
      (latinCompact.length > 0 &&
        (item.latinRootCompact.includes(latinCompact) ||
          normalizeDictionarySearch(item.latinRoot).includes(normalizedText))) ||
      (arabicCompact.length > 0 &&
        (item.arabicRootCompact.includes(arabicCompact) ||
          item.arabicRoot.includes(rawArabic)));

    const activeTensePool =
      tense === 'present'
        ? item.presentFormsText
        : tense === 'past'
          ? item.pastFormsText
          : tense === 'negation'
            ? item.negationFormsText
            : tense === 'imperative'
              ? item.imperativeText
              : item.allTensesText;

    const tenseMatch =
      normalizedText.length > 0 && activeTensePool.includes(normalizedText);

    if (searchScope === 'root') {
      return rootMatch;
    }

    if (searchScope === 'tense') {
      return tenseMatch;
    }

    const headwordOrArabicMatch =
      (normalizedText.length > 0 &&
        item.generalSearchText.includes(normalizedText)) ||
      (rawArabic.length > 0 &&
        (item.entry.darijaArabic.includes(rawArabic) ||
          normalizeArabicChars(
            item.entry.darijaArabic.replace(ARABIC_DIACRITICS_RE, '')
          ).includes(arabicCompact)));

    return rootMatch || tenseMatch || headwordOrArabicMatch;
  });
}

export function computeConjugationPatternCounts(
  index: VerbConjugationIndexItem[]
): Record<VerbPattern | 'all', number> {
  const counts: Record<VerbPattern | 'all', number> = {
    all: index.length,
    regular: 0,
    doubled: 0,
    hollow: 0,
    defective: 0,
    derived: 0,
  };
  for (const item of index) {
    const p = item.entry.verbPattern;
    if (p) counts[p] += 1;
  }
  return counts;
}

export function computeConjugationDifficultyCounts(
  index: VerbConjugationIndexItem[]
): Record<ConjugationDifficulty | 'all', number> {
  const counts: Record<ConjugationDifficulty | 'all', number> = {
    all: index.length,
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  };
  for (const item of index) {
    counts[item.difficulty] += 1;
  }
  return counts;
}
