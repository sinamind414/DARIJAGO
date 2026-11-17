import type {
  DarijaPhrase,
  LearningModule,
  UserProgressState,
} from '../types/darija';
import {
  formatLocalDateKey,
  recordPhraseReview,
  togglePhraseMastery,
} from './darijaLogic';
import { recordDailyPhraseActivity } from './dailyChallengesLogic';

export type QuickReviewReason = 'difficult' | 'due' | 'recent' | 'discovery';
export type QuickReviewFilter = 'mixed' | 'difficult' | 'recent';
export type QuickReviewDecision = 'mastered' | 'review';

export interface QuickReviewItem {
  phrase: DarijaPhrase;
  moduleId: string;
  moduleNumber: string;
  moduleTitle: string;
  reason: QuickReviewReason;
  priorityScore: number;
  isMastered: boolean;
  lastReviewedDate?: string;
}

export interface QuickReviewOptions {
  count?: number;
  filter?: QuickReviewFilter;
  seed?: number;
  today?: Date;
}

export interface QuickReviewSessionStats {
  total: number;
  decidedCount: number;
  masteredCount: number;
  toReviewCount: number;
  percent: number;
}

function createPrng(seed: number): () => number {
  let state = (Math.floor(seed) >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithPrng<T>(items: T[], rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function classifyPhraseForQuickReview(
  phrase: DarijaPhrase,
  progress: UserProgressState,
  today: Date = new Date()
): { reason: QuickReviewReason; priorityScore: number; isMastered: boolean; lastReviewedDate?: string } {
  const todayKey = formatLocalDateKey(today);
  const reviewState = progress.phraseReviews[phrase.id];
  const isMastered = progress.masteredIds.includes(phrase.id);
  const isPracticed = progress.practicedIds.includes(phrase.id);

  const isLowEase = Boolean(reviewState && reviewState.easeFactor < 2.45);
  const isReset = Boolean(reviewState && reviewState.repetitions === 0);
  const isDue = Boolean(reviewState && reviewState.nextReviewDate <= todayKey);
  const isHardDifficulty = phrase.difficulty === 'Intermédiaire' && !isMastered;

  let reason: QuickReviewReason = 'discovery';
  if (isLowEase || isReset || (isPracticed && isHardDifficulty)) {
    reason = 'difficult';
  } else if (isDue) {
    reason = 'due';
  } else if (isPracticed || isMastered || Boolean(reviewState)) {
    reason = 'recent';
  } else if (phrase.difficulty === 'Intermédiaire') {
    reason = 'difficult';
  }

  let priorityScore = 10;
  if (isLowEase || isReset) {
    priorityScore += 50;
  }
  if (isDue) {
    priorityScore += 40;
  }
  if (isPracticed && !isMastered) {
    priorityScore += 30;
  } else if (isPracticed || isMastered || reviewState) {
    priorityScore += 18;
  }
  if (phrase.difficulty === 'Intermédiaire') {
    priorityScore += 15;
  }
  if (reviewState?.lastReviewedDate === todayKey) {
    priorityScore += 12;
  }

  return {
    reason,
    priorityScore,
    isMastered,
    lastReviewedDate: reviewState?.lastReviewedDate,
  };
}

export function generateQuickReviewList(
  modules: LearningModule[],
  progress: UserProgressState,
  options: QuickReviewOptions = {}
): QuickReviewItem[] {
  const count = Math.max(1, options.count ?? 8);
  const filter = options.filter ?? 'mixed';
  const today = options.today ?? new Date();
  const seed = options.seed ?? Date.now();
  const rand = createPrng(seed);

  const candidates: QuickReviewItem[] = modules.flatMap((mod) =>
    mod.phrases.map((phrase) => {
      const classification = classifyPhraseForQuickReview(phrase, progress, today);
      return {
        phrase,
        moduleId: mod.id,
        moduleNumber: mod.number,
        moduleTitle: mod.title,
        ...classification,
      };
    })
  );

  if (candidates.length === 0) return [];

  const matchesFilter = (item: QuickReviewItem): boolean => {
    if (filter === 'difficult') {
      return (
        item.reason === 'difficult' ||
        item.reason === 'due' ||
        item.phrase.difficulty === 'Intermédiaire'
      );
    }
    if (filter === 'recent') {
      return (
        item.reason === 'recent' ||
        progress.practicedIds.includes(item.phrase.id) ||
        progress.masteredIds.includes(item.phrase.id) ||
        Boolean(progress.phraseReviews[item.phrase.id])
      );
    }
    return true;
  };

  const primaryPool = candidates.filter(matchesFilter);
  const fallbackPool = candidates.filter((item) => !matchesFilter(item));

  const pickRandomizedFromPool = (pool: QuickReviewItem[]): QuickReviewItem[] => {
    const highPriority = shuffleWithPrng(
      pool.filter((item) => item.priorityScore >= 40),
      rand
    );
    const mediumPriority = shuffleWithPrng(
      pool.filter((item) => item.priorityScore >= 20 && item.priorityScore < 40),
      rand
    );
    const basePriority = shuffleWithPrng(
      pool.filter((item) => item.priorityScore < 20),
      rand
    );
    return [...highPriority, ...mediumPriority, ...basePriority];
  };

  const ordered = [
    ...pickRandomizedFromPool(primaryPool),
    ...pickRandomizedFromPool(fallbackPool),
  ];

  const seen = new Set<string>();
  const result: QuickReviewItem[] = [];
  for (const item of ordered) {
    if (seen.has(item.phrase.id)) continue;
    seen.add(item.phrase.id);
    result.push(item);
    if (result.length >= count) break;
  }

  return result;
}

export function markQuickReviewMastered(
  progress: UserProgressState,
  phraseId: string,
  today: Date = new Date()
): UserProgressState {
  if (progress.masteredIds.includes(phraseId)) {
    const reviewed = recordPhraseReview(progress, phraseId, 'good', 0, today);
    return recordDailyPhraseActivity(reviewed, phraseId, today);
  }
  return togglePhraseMastery(progress, phraseId, today);
}

export function markQuickReviewForReview(
  progress: UserProgressState,
  phraseId: string,
  today: Date = new Date()
): UserProgressState {
  const withoutMastered: UserProgressState = {
    ...progress,
    masteredIds: progress.masteredIds.filter((id) => id !== phraseId),
  };
  return recordPhraseReview(withoutMastered, phraseId, 'again', 5, today);
}

export function computeQuickReviewSessionStats(
  items: QuickReviewItem[],
  decisions: Record<string, QuickReviewDecision>
): QuickReviewSessionStats {
  const total = items.length;
  let decidedCount = 0;
  let masteredCount = 0;
  let toReviewCount = 0;

  for (const item of items) {
    const decision = decisions[item.phrase.id];
    if (!decision) continue;
    decidedCount += 1;
    if (decision === 'mastered') {
      masteredCount += 1;
    } else {
      toReviewCount += 1;
    }
  }

  const percent = total > 0 ? Math.round((decidedCount / total) * 100) : 0;

  return {
    total,
    decidedCount,
    masteredCount,
    toReviewCount,
    percent,
  };
}
