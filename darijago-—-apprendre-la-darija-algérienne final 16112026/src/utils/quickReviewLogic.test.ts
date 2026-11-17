import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM_MODULES } from '../data/curriculum';
import { DEFAULT_PROGRESS, formatLocalDateKey } from './darijaLogic';
import type { UserProgressState } from '../types/darija';
import {
  classifyPhraseForQuickReview,
  computeQuickReviewSessionStats,
  generateQuickReviewList,
  markQuickReviewForReview,
  markQuickReviewMastered,
} from './quickReviewLogic';

const FIXED_TODAY = new Date(2026, 10, 16);

test('generateQuickReviewList creates a unique randomized list even with empty starter progress', () => {
  const listA = generateQuickReviewList(CURRICULUM_MODULES, DEFAULT_PROGRESS, {
    count: 8,
    seed: 101,
    today: FIXED_TODAY,
  });
  const listB = generateQuickReviewList(CURRICULUM_MODULES, DEFAULT_PROGRESS, {
    count: 8,
    seed: 202,
    today: FIXED_TODAY,
  });

  assert.equal(listA.length, 8);
  assert.equal(new Set(listA.map((item) => item.phrase.id)).size, 8);
  assert.notDeepEqual(
    listA.map((item) => item.phrase.id),
    listB.map((item) => item.phrase.id)
  );
});

test('generateQuickReviewList prioritizes difficult and recently learned phrases', () => {
  const todayKey = formatLocalDateKey(FIXED_TODAY);
  const difficultPhraseId = CURRICULUM_MODULES[0].phrases[1].id;
  const recentPhraseId = CURRICULUM_MODULES[1].phrases[0].id;

  const progress: UserProgressState = {
    ...DEFAULT_PROGRESS,
    practicedIds: [difficultPhraseId, recentPhraseId],
    phraseReviews: {
      [difficultPhraseId]: {
        repetitions: 0,
        intervalDays: 0,
        easeFactor: 2.1,
        lastReviewedDate: todayKey,
        nextReviewDate: todayKey,
      },
      [recentPhraseId]: {
        repetitions: 1,
        intervalDays: 3,
        easeFactor: 2.5,
        lastReviewedDate: todayKey,
        nextReviewDate: '2026-11-19',
      },
    },
  };

  const difficultClass = classifyPhraseForQuickReview(
    CURRICULUM_MODULES[0].phrases[1],
    progress,
    FIXED_TODAY
  );
  assert.equal(difficultClass.reason, 'difficult');

  const recentClass = classifyPhraseForQuickReview(
    CURRICULUM_MODULES[1].phrases[0],
    progress,
    FIXED_TODAY
  );
  assert.equal(recentClass.reason, 'recent');

  const mixed = generateQuickReviewList(CURRICULUM_MODULES, progress, {
    count: 6,
    filter: 'mixed',
    seed: 42,
    today: FIXED_TODAY,
  });
  const ids = mixed.map((item) => item.phrase.id);
  assert.equal(ids.includes(difficultPhraseId), true);
  assert.equal(ids.includes(recentPhraseId), true);
});

test('markQuickReviewMastered marks phrase mastered and awards XP once', () => {
  const targetId = CURRICULUM_MODULES[0].phrases[0].id;
  const first = markQuickReviewMastered(DEFAULT_PROGRESS, targetId, FIXED_TODAY);
  assert.equal(first.masteredIds.includes(targetId), true);
  assert.equal(first.practicedIds.includes(targetId), true);
  assert.equal(first.xp, 25);

  const second = markQuickReviewMastered(first, targetId, FIXED_TODAY);
  assert.equal(second.masteredIds.includes(targetId), true);
  assert.equal(second.xp, 25);
});

test('markQuickReviewForReview unmasters phrase and schedules immediate review', () => {
  const targetId = CURRICULUM_MODULES[0].phrases[0].id;
  const masteredState = markQuickReviewMastered(
    DEFAULT_PROGRESS,
    targetId,
    FIXED_TODAY
  );
  assert.equal(masteredState.masteredIds.includes(targetId), true);

  const forReviewState = markQuickReviewForReview(
    masteredState,
    targetId,
    FIXED_TODAY
  );
  assert.equal(forReviewState.masteredIds.includes(targetId), false);
  assert.equal(
    forReviewState.phraseReviews[targetId]?.nextReviewDate,
    formatLocalDateKey(FIXED_TODAY)
  );
  assert.equal(forReviewState.phraseReviews[targetId]?.repetitions, 0);
});

test('computeQuickReviewSessionStats counts mastered and review decisions accurately', () => {
  const items = generateQuickReviewList(CURRICULUM_MODULES, DEFAULT_PROGRESS, {
    count: 4,
    seed: 7,
    today: FIXED_TODAY,
  });
  const stats = computeQuickReviewSessionStats(items, {
    [items[0].phrase.id]: 'mastered',
    [items[1].phrase.id]: 'review',
    [items[2].phrase.id]: 'mastered',
  });

  assert.deepEqual(stats, {
    total: 4,
    decidedCount: 3,
    masteredCount: 2,
    toReviewCount: 1,
    percent: 75,
  });
});
