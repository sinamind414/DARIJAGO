import type {
  BenSediraDictionaryEntry,
  FullVerbConjugationRow,
} from '../types/benSedira';
import type { VerbConjugationIndexItem } from './conjugationLogic';
import { normalizeDictionarySearch } from './dictionaryLogic';

export type FlashcardTense = 'past' | 'present' | 'future';
export type FlashcardTenseMode = 'mixed' | FlashcardTense;
export type FlashcardPersonScope = 'core' | 'all8';

export interface VerbFlashcard {
  id: string;
  entry: BenSediraDictionaryEntry;
  arabicRoot: string;
  latinRoot: string;
  tense: FlashcardTense;
  personKey: FullVerbConjugationRow['personKey'];
  pronoun: string;
  answerLatin: string;
  answerArabic: string;
  allForms: {
    present: string;
    past: string;
    future: string;
    negativePresent: string;
  };
  allArabicForms: {
    present: string;
    past: string;
    future: string;
    negativePresent: string;
  };
}

export interface FlashcardDeckOptions {
  tenseMode?: FlashcardTenseMode;
  personScope?: FlashcardPersonScope;
  deckSize?: number;
  seed?: number;
}

export interface FlashcardSessionStats {
  total: number;
  answered: number;
  known: number;
  review: number;
  remaining: number;
  percent: number;
}

const CORE_PERSON_KEYS: Array<FullVerbConjugationRow['personKey']> = [
  '1s',
  '3ms',
  '1p',
  '2ms',
];

const MIXED_TENSE_CYCLE: FlashcardTense[] = ['past', 'present', 'future'];

function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  let s = Math.abs(seed) + 1;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Derives an explicit Algerian Darija future form from an 8-person conjugation row.
 * Uses `ghadi + aorist` for standard verbs (and `ikoun ând-` / `nkoun` for avoir & être).
 */
export function deriveFutureForm(
  row: FullVerbConjugationRow,
  entry: BenSediraDictionaryEntry
): string {
  if (entry.id === 'bs-v-a-avoir') {
    const cleanPresent = row.present.trim();
    return `ikoun ${cleanPresent}`;
  }

  if (entry.id === 'bs-v-e-etre') {
    const parenMatch = row.present.match(/\(([^)]+)\)/);
    if (parenMatch) {
      return parenMatch[1].trim();
    }
    return `ghadi ${row.present}`;
  }

  return `ghadi ${row.present}`;
}

export function buildVerbFlashcardDeck(
  items: VerbConjugationIndexItem[],
  {
    tenseMode = 'mixed',
    personScope = 'core',
    deckSize = 12,
    seed = 29,
  }: FlashcardDeckOptions = {}
): VerbFlashcard[] {
  const validItems = items.filter((item) => item.tableRows.length > 0);
  if (validItems.length === 0 || deckSize <= 0) return [];

  const shuffledVerbs = deterministicShuffle(validItems, seed);
  const deck: VerbFlashcard[] = [];

  for (let i = 0; i < deckSize; i++) {
    const item = shuffledVerbs[i % shuffledVerbs.length];
    const candidateRows =
      personScope === 'core'
        ? item.tableRows.filter((r) => CORE_PERSON_KEYS.includes(r.personKey))
        : item.tableRows;
    const rowsPool = candidateRows.length > 0 ? candidateRows : item.tableRows;

    const personIdx = Math.abs(seed + i * 7) % rowsPool.length;
    const row = rowsPool[personIdx];

    const tense: FlashcardTense =
      tenseMode === 'mixed'
        ? MIXED_TENSE_CYCLE[i % MIXED_TENSE_CYCLE.length]
        : tenseMode;

    const futureForm = deriveFutureForm(row, item.entry);
    const answerLatin =
      tense === 'past'
        ? row.past
        : tense === 'present'
          ? row.present
          : futureForm;

    const arabicRow = item.arabicRows[row.personKey];
    const answerArabic =
      tense === 'past'
        ? arabicRow.pastArabic
        : tense === 'present'
          ? arabicRow.presentArabic
          : arabicRow.futureArabic;

    deck.push({
      id: `fc-${item.entry.id}-${row.personKey}-${tense}-${i}`,
      entry: item.entry,
      arabicRoot: item.arabicRoot,
      latinRoot: item.latinRoot,
      tense,
      personKey: row.personKey,
      pronoun: row.pronoun,
      answerLatin,
      answerArabic,
      allForms: {
        present: row.present,
        past: row.past,
        future: futureForm,
        negativePresent: row.negativePresent,
      },
      allArabicForms: {
        present: arabicRow.presentArabic,
        past: arabicRow.pastArabic,
        future: arabicRow.futureArabic,
        negativePresent: arabicRow.negativePresentArabic,
      },
    });
  }

  return deck;
}

export function evaluateFlashcardTyping(
  userInput: string,
  expectedForm: string
): boolean {
  const normalizedUser = normalizeDictionarySearch(userInput);
  if (!normalizedUser) return false;

  const normalizedExpected = normalizeDictionarySearch(expectedForm);
  if (normalizedUser === normalizedExpected) return true;

  // Accept primary form before parentheses (e.g. "rani (nkoun)" -> "rani")
  const primaryOnly = normalizeDictionarySearch(
    expectedForm.replace(/\(.*?\)/g, ' ')
  );
  if (primaryOnly && normalizedUser === primaryOnly) return true;

  // Accept slash variants (e.g. "rah / raho (ikoun)")
  const slashParts = expectedForm
    .replace(/\(.*?\)/g, ' ')
    .split('/')
    .map((p) => normalizeDictionarySearch(p))
    .filter(Boolean);

  return slashParts.includes(normalizedUser);
}

export function computeFlashcardSessionStats(
  deck: VerbFlashcard[],
  results: Record<string, 'known' | 'review'>
): FlashcardSessionStats {
  const total = deck.length;
  let known = 0;
  let review = 0;

  for (const card of deck) {
    const rating = results[card.id];
    if (rating === 'known') known += 1;
    else if (rating === 'review') review += 1;
  }

  const answered = known + review;
  const remaining = Math.max(0, total - answered);
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;

  return { total, answered, known, review, remaining, percent };
}
