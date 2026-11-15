import type { AppLanguage, DarijaPhrase } from '../types/darija';
import { getLocalizedPhrase } from '../i18n/curriculumTranslations';
import { normalizeDarijaInput } from './darijaLogic';
import { normalizeArabicScript } from './pronunciationLogic';

export interface DictationItem {
  index: number;
  phrase: DarijaPhrase;
}

export interface DictationWordFeedback {
  expected: string;
  typed: string | null;
  status: 'match' | 'close' | 'wrong' | 'missing';
}

export interface DictationEvaluation {
  isCorrect: boolean;
  isArabicMatch: boolean;
  accuracyPercent: number;
  normalizedUser: string;
  normalizedExpected: string;
  wordFeedback: DictationWordFeedback[];
}

function createSeededRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Normalizes Latin/Arabizi dictation input tolerantly so equivalent Algerian
 * spellings (e.g. `wach`/`wash`, `7`/`h`, `3`/`a`, `9`/`q`/`k`, `5`/`kh`,
 * `ou`/`u`, doubled vowels) compare fairly.
 */
export function normalizeDictationLatin(input: string): string {
  return normalizeDarijaInput(input)
    .replace(/\bsh/g, 'ch')
    .replace(/sh\b/g, 'ch')
    .replace(/sh/g, 'ch')
    .replace(/ou/g, 'u')
    .replace(/([aeiouy])\1+/g, '$1')
    .replace(/q/g, 'k')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j <= b.length; j++) {
      prev[j] = curr[j];
    }
  }
  return prev[b.length];
}

export function buildDictationDeck(
  phrases: DarijaPhrase[],
  moduleFilter: string,
  seed: number = 1,
  language: AppLanguage = 'fr',
  count: number = 8
): DictationItem[] {
  const pool =
    moduleFilter === 'all'
      ? phrases
      : phrases.filter((p) => p.moduleId === moduleFilter);

  const source = pool.length > 0 ? pool : phrases;
  const rng = createSeededRng(seed * 97 + 13);

  const shuffled = [...source].sort(() => rng() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((phrase, index) => ({
    index,
    phrase: getLocalizedPhrase(phrase, language),
  }));
}

export function computeDictationHintMask(darijaLatin: string): string {
  return darijaLatin
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const match = /^([A-Za-z0-9À-ÖØ-öø-ÿ’']+)([^A-Za-z0-9À-ÖØ-öø-ÿ’']*)$/.exec(
        word
      );
      if (!match) return word;
      const core = match[1];
      const trailing = match[2] ?? '';
      if (core.length <= 1) return `${core}${trailing}`;
      return `${core[0]}${'_'.repeat(core.length - 1)}${trailing}`;
    })
    .join(' ');
}

export function evaluateDictationAttempt(
  userInput: string,
  phrase: Pick<DarijaPhrase, 'darijaLatin' | 'darijaArabic' | 'acceptedAnswers'>
): DictationEvaluation {
  const trimmed = userInput.trim();
  const normalizedUser = normalizeDictationLatin(trimmed);
  const normalizedExpected = normalizeDictationLatin(phrase.darijaLatin);

  const rawExpectedWords = phrase.darijaLatin.split(/\s+/).filter(Boolean);
  const rawUserWords = trimmed.split(/\s+/).filter(Boolean);

  if (!trimmed || (!normalizedUser && !normalizeArabicScript(trimmed))) {
    return {
      isCorrect: false,
      isArabicMatch: false,
      accuracyPercent: 0,
      normalizedUser: '',
      normalizedExpected,
      wordFeedback: rawExpectedWords.map((expected) => ({
        expected,
        typed: null,
        status: 'missing',
      })),
    };
  }

  // Check Arabic script transcription match
  const normArabicUser = normalizeArabicScript(trimmed);
  const normArabicExpected = normalizeArabicScript(phrase.darijaArabic);
  if (normArabicUser && normArabicExpected && normArabicUser === normArabicExpected) {
    return {
      isCorrect: true,
      isArabicMatch: true,
      accuracyPercent: 100,
      normalizedUser: normArabicUser,
      normalizedExpected: normArabicExpected,
      wordFeedback: rawExpectedWords.map((expected) => ({
        expected,
        typed: expected,
        status: 'match',
      })),
    };
  }

  const candidateNorms = [phrase.darijaLatin, ...phrase.acceptedAnswers]
    .map(normalizeDictationLatin)
    .filter(Boolean);

  const exactCandidateMatch =
    Boolean(normalizedUser) &&
    candidateNorms.some((cand) => cand === normalizedUser);

  const normExpectedWords = rawExpectedWords.map(normalizeDictationLatin);
  const normUserWords = rawUserWords.map(normalizeDictationLatin);

  let matchedWeight = 0;
  const wordFeedback: DictationWordFeedback[] = rawExpectedWords.map(
    (expectedWord, idx) => {
      const expNorm = normExpectedWords[idx];
      const typedRaw = rawUserWords[idx] ?? null;
      const typedNorm = normUserWords[idx] ?? '';

      if (!typedRaw) {
        return {
          expected: expectedWord,
          typed: null,
          status: exactCandidateMatch ? 'match' : 'missing',
        };
      }

      if (exactCandidateMatch || typedNorm === expNorm) {
        matchedWeight += 1;
        return {
          expected: expectedWord,
          typed: typedRaw,
          status: 'match',
        };
      }

      // Check if word appears shifted by 1 position (e.g. extra/dropped article)
      const neighborMatch =
        (idx > 0 && normUserWords[idx - 1] === expNorm) ||
        normUserWords[idx + 1] === expNorm;
      if (neighborMatch) {
        matchedWeight += 0.8;
        return {
          expected: expectedWord,
          typed: typedRaw,
          status: 'close',
        };
      }

      const dist = levenshtein(expNorm, typedNorm);
      if (dist <= 1 || (expNorm.length >= 5 && dist <= 2)) {
        matchedWeight += 0.7;
        return {
          expected: expectedWord,
          typed: typedRaw,
          status: 'close',
        };
      }

      return {
        expected: expectedWord,
        typed: typedRaw,
        status: 'wrong',
      };
    }
  );

  const allWordsMatch = wordFeedback.every((w) => w.status === 'match');
  const isCorrect = exactCandidateMatch || allWordsMatch;
  const accuracyPercent = isCorrect
    ? 100
    : rawExpectedWords.length > 0
      ? Math.min(
          99,
          Math.round((matchedWeight / rawExpectedWords.length) * 100)
        )
      : 0;

  return {
    isCorrect,
    isArabicMatch: false,
    accuracyPercent,
    normalizedUser,
    normalizedExpected,
    wordFeedback,
  };
}
