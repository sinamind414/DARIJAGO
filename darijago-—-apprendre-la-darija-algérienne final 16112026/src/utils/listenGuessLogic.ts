import type { AppLanguage, DarijaPhrase } from '../types/darija';
import { getLocalizedPhrase } from '../i18n/curriculumTranslations';
import { normalizeDarijaInput } from './darijaLogic';

export type ListenGuessMode = 'mixed' | 'words' | 'phrases';
export type ListenGuessItemKind = 'word' | 'phrase';

export interface ListenGuessEntry {
  id: string;
  kind: ListenGuessItemKind;
  moduleId: string;
  phraseId: string;
  darijaLatin: string;
  darijaArabic: string;
  phoneticFrench: string;
  meaning: string;
}

export interface ListenGuessOption {
  id: string;
  kind: ListenGuessItemKind;
  darijaLatin: string;
  darijaArabic: string;
  phoneticFrench: string;
  meaning: string;
  isCorrect: boolean;
}

export interface ListenGuessRound {
  index: number;
  target: ListenGuessEntry;
  options: ListenGuessOption[];
}

export interface ListenGuessChoiceEvaluation {
  isCorrect: boolean;
  selectedOption: ListenGuessOption | null;
  correctOption: ListenGuessOption;
}

export interface BuildListenGuessDeckOptions {
  mode?: ListenGuessMode;
  moduleFilter?: string;
  seed?: number;
  language?: AppLanguage;
  roundCount?: number;
  optionCount?: number;
}

function createSeededRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffleWithRng<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function normalizeMeaningKey(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function extractEntries(
  phrases: DarijaPhrase[],
  language: AppLanguage
): {
  phraseEntries: ListenGuessEntry[];
  wordEntries: ListenGuessEntry[];
} {
  const phraseEntries: ListenGuessEntry[] = [];
  const wordEntries: ListenGuessEntry[] = [];
  const seenWords = new Set<string>();

  for (const rawPhrase of phrases) {
    const localized = getLocalizedPhrase(rawPhrase, language);
    phraseEntries.push({
      id: `phrase:${localized.id}`,
      kind: 'phrase',
      moduleId: localized.moduleId,
      phraseId: localized.id,
      darijaLatin: localized.darijaLatin,
      darijaArabic: localized.darijaArabic,
      phoneticFrench: localized.phoneticFrench,
      meaning: localized.frenchMeaning,
    });

    for (let idx = 0; idx < localized.breakdown.length; idx++) {
      const token = localized.breakdown[idx];
      const normWord = normalizeDarijaInput(token.darija);
      const normMeaning = normalizeMeaningKey(token.french);
      if (!normWord || !normMeaning) continue;
      if (seenWords.has(normWord)) continue;
      seenWords.add(normWord);

      wordEntries.push({
        id: `word:${localized.id}:${idx}`,
        kind: 'word',
        moduleId: localized.moduleId,
        phraseId: localized.id,
        darijaLatin: token.darija,
        darijaArabic: token.arabic,
        phoneticFrench: token.darija,
        meaning: token.french,
      });
    }
  }

  return { phraseEntries, wordEntries };
}

export function buildListenGuessPool(
  phrases: DarijaPhrase[],
  moduleFilter: string = 'all',
  mode: ListenGuessMode = 'mixed',
  language: AppLanguage = 'fr'
): ListenGuessEntry[] {
  const scopedPhrases =
    moduleFilter === 'all'
      ? phrases
      : phrases.filter((p) => p.moduleId === moduleFilter);

  const effectivePhrases = scopedPhrases.length > 0 ? scopedPhrases : phrases;
  const { phraseEntries, wordEntries } = extractEntries(
    effectivePhrases,
    language
  );

  if (mode === 'words') {
    return wordEntries.length >= 4 ? wordEntries : [...wordEntries, ...phraseEntries];
  }
  if (mode === 'phrases') {
    return phraseEntries;
  }
  return [...wordEntries, ...phraseEntries];
}

export function buildListenGuessDeck(
  phrases: DarijaPhrase[],
  options: BuildListenGuessDeckOptions = {}
): ListenGuessRound[] {
  const {
    mode = 'mixed',
    moduleFilter = 'all',
    seed = 1,
    language = 'fr',
    roundCount = 8,
    optionCount = 4,
  } = options;

  if (phrases.length === 0) return [];

  const allExtracted = extractEntries(phrases, language);
  const globalPool = [...allExtracted.wordEntries, ...allExtracted.phraseEntries];
  const scopedPool = buildListenGuessPool(phrases, moduleFilter, mode, language);

  const rng = createSeededRng(seed * 193 + 37);

  let selectedTargets: ListenGuessEntry[] = [];
  if (mode === 'mixed') {
    const scopedWords = shuffleWithRng(
      scopedPool.filter((e) => e.kind === 'word'),
      rng
    );
    const scopedPhrases = shuffleWithRng(
      scopedPool.filter((e) => e.kind === 'phrase'),
      rng
    );

    const half = Math.ceil(roundCount / 2);
    const pickedWords = scopedWords.slice(0, half);
    const pickedPhrases = scopedPhrases.slice(0, roundCount - pickedWords.length);

    // Interleave words and phrases cleanly
    const maxLen = Math.max(pickedWords.length, pickedPhrases.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < pickedWords.length) selectedTargets.push(pickedWords[i]);
      if (i < pickedPhrases.length) selectedTargets.push(pickedPhrases[i]);
    }
  } else {
    selectedTargets = shuffleWithRng(scopedPool, rng).slice(0, roundCount);
  }

  // Top up from global pool if a single module had fewer items than roundCount
  if (selectedTargets.length < roundCount) {
    const usedIds = new Set(selectedTargets.map((t) => t.id));
    const fallbackCandidates = shuffleWithRng(
      globalPool.filter((e) =>
        mode === 'words'
          ? e.kind === 'word'
          : mode === 'phrases'
            ? e.kind === 'phrase'
            : true
      ),
      rng
    );
    for (const cand of fallbackCandidates) {
      if (selectedTargets.length >= roundCount) break;
      if (!usedIds.has(cand.id)) {
        usedIds.add(cand.id);
        selectedTargets.push(cand);
      }
    }
  }

  selectedTargets = selectedTargets.slice(0, Math.min(roundCount, globalPool.length));

  return selectedTargets.map((target, index) => {
    const usedLatin = new Set([normalizeDarijaInput(target.darijaLatin)]);
    const usedMeanings = new Set([normalizeMeaningKey(target.meaning)]);

    const sameKindScoped = shuffleWithRng(
      scopedPool.filter((e) => e.id !== target.id && e.kind === target.kind),
      rng
    );
    const sameKindGlobal = shuffleWithRng(
      globalPool.filter((e) => e.id !== target.id && e.kind === target.kind),
      rng
    );
    const anyGlobal = shuffleWithRng(
      globalPool.filter((e) => e.id !== target.id),
      rng
    );

    const distractors: ListenGuessEntry[] = [];
    for (const candidate of [...sameKindScoped, ...sameKindGlobal, ...anyGlobal]) {
      if (distractors.length >= optionCount - 1) break;
      const latinKey = normalizeDarijaInput(candidate.darijaLatin);
      const meaningKey = normalizeMeaningKey(candidate.meaning);
      if (!latinKey || !meaningKey) continue;
      if (usedLatin.has(latinKey) || usedMeanings.has(meaningKey)) continue;

      usedLatin.add(latinKey);
      usedMeanings.add(meaningKey);
      distractors.push(candidate);
    }

    const rawOptions: ListenGuessOption[] = [
      {
        id: target.id,
        kind: target.kind,
        darijaLatin: target.darijaLatin,
        darijaArabic: target.darijaArabic,
        phoneticFrench: target.phoneticFrench,
        meaning: target.meaning,
        isCorrect: true,
      },
      ...distractors.map((d) => ({
        id: d.id,
        kind: d.kind,
        darijaLatin: d.darijaLatin,
        darijaArabic: d.darijaArabic,
        phoneticFrench: d.phoneticFrench,
        meaning: d.meaning,
        isCorrect: false,
      })),
    ];

    const roundRng = createSeededRng(seed * 313 + index * 43 + 7);
    return {
      index,
      target,
      options: shuffleWithRng(rawOptions, roundRng),
    };
  });
}

export function evaluateListenGuessChoice(
  round: ListenGuessRound,
  selectedOptionId: string
): ListenGuessChoiceEvaluation {
  const correctOption =
    round.options.find((opt) => opt.isCorrect) ?? round.options[0];
  const selectedOption =
    round.options.find((opt) => opt.id === selectedOptionId) ?? null;

  return {
    isCorrect: Boolean(selectedOption && selectedOption.id === correctOption.id),
    selectedOption,
    correctOption,
  };
}

export function computeListenGuessAccuracy(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.max(0, score) / total) * 100);
}
