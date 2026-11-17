import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PROGRESS,
  markPhrasePracticed,
  markStoryRead,
  parseProgressState,
  recordDialogueTurn,
  recordQuizAnswerStreak,
  recordQuizResult,
  togglePhraseMastery,
} from './darijaLogic';
import {
  claimDailyChallengeReward,
  computeDailyChallengesSummary,
  formatChallengeDateKey,
  generateDailyChallenges,
  getTodayActivity,
  recordDailyVerbStudy,
} from './dailyChallengesLogic';

const TODAY_NOV_16 = new Date(2026, 10, 16); // 2026-11-16
const TOMORROW_NOV_17 = new Date(2026, 10, 17); // 2026-11-17
const YESTERDAY_NOV_15 = new Date(2026, 10, 15); // 2026-11-15

test('generateDailyChallenges always produces 3 distinct deterministic missions per day and rotates across dates', () => {
  const nov16 = generateDailyChallenges(DEFAULT_PROGRESS, 'fr', TODAY_NOV_16);
  assert.equal(nov16.length, 3);
  assert.equal(new Set(nov16.map((c) => c.kind)).size, 3);
  assert.deepEqual(
    nov16.map((c) => c.kind),
    ['learn-verbs', 'complete-quiz', 'earn-xp']
  );
  assert.equal(nov16[0].target, 5);
  assert.equal(nov16[0].bonusXp, 35);
  assert.equal(nov16[1].target, 1);
  assert.equal(nov16[1].bonusXp, 30);

  const nov17 = generateDailyChallenges(DEFAULT_PROGRESS, 'fr', TOMORROW_NOV_17);
  assert.equal(nov17.length, 3);
  assert.equal(new Set(nov17.map((c) => c.kind)).size, 3);
  assert.notDeepEqual(
    nov16.map((c) => c.kind),
    nov17.map((c) => c.kind)
  );
});

test('recordDailyVerbStudy deduplicates verbs per day, awards XP, and completes learn-verbs mission at 5 verbs', () => {
  let state = DEFAULT_PROGRESS;
  state = recordDailyVerbStudy(state, 'verb-ktb', 5, TODAY_NOV_16);
  state = recordDailyVerbStudy(state, 'verb-ktb', 5, TODAY_NOV_16); // duplicate verbId shouldn't double count verbsLearned
  assert.equal(getTodayActivity(state, TODAY_NOV_16).verbsLearned, 1);

  state = recordDailyVerbStudy(state, 'verb-chrb', 5, TODAY_NOV_16);
  state = recordDailyVerbStudy(state, 'verb-ql', 5, TODAY_NOV_16);
  state = recordDailyVerbStudy(state, 'verb-khd', 5, TODAY_NOV_16);

  let challenges = generateDailyChallenges(state, 'fr', TODAY_NOV_16);
  assert.equal(challenges[0].current, 4);
  assert.equal(challenges[0].completed, false);

  state = recordDailyVerbStudy(state, 'verb-rh', 5, TODAY_NOV_16);
  challenges = generateDailyChallenges(state, 'fr', TODAY_NOV_16);
  assert.equal(challenges[0].current, 5);
  assert.equal(challenges[0].percent, 100);
  assert.equal(challenges[0].completed, true);
  assert.equal(challenges[0].claimed, false);
});

test('completing a quiz updates complete-quiz mission and claimDailyChallengeReward awards bonus XP once', () => {
  let state = DEFAULT_PROGRESS;

  // Cannot claim before completion
  const uncompletedChallenges = generateDailyChallenges(state, 'fr', TODAY_NOV_16);
  const premature = claimDailyChallengeReward(
    state,
    uncompletedChallenges[1].id,
    TODAY_NOV_16
  );
  assert.equal(premature.claimedChallenge, null);
  assert.equal(premature.progress.xp, 0);

  // Answer 3 questions correctly and finish 1 quiz
  state = recordQuizAnswerStreak(state, true, TODAY_NOV_16);
  state = recordQuizAnswerStreak(state, true, TODAY_NOV_16);
  state = recordQuizAnswerStreak(state, true, TODAY_NOV_16);
  state = recordQuizResult(state, 3, 5, TODAY_NOV_16); // +60 XP

  const readyChallenges = generateDailyChallenges(state, 'fr', TODAY_NOV_16);
  assert.equal(readyChallenges[1].kind, 'complete-quiz');
  assert.equal(readyChallenges[1].completed, true);
  assert.equal(readyChallenges[2].kind, 'earn-xp');
  assert.equal(readyChallenges[2].completed, true); // 60 >= 60 XP

  const summaryBefore = computeDailyChallengesSummary(readyChallenges);
  assert.equal(summaryBefore.completedCount, 2);
  assert.equal(summaryBefore.claimableCount, 2);

  // Claim quiz bonus (+30 XP)
  const firstClaim = claimDailyChallengeReward(
    state,
    readyChallenges[1].id,
    TODAY_NOV_16
  );
  assert.ok(firstClaim.claimedChallenge);
  assert.equal(firstClaim.claimedChallenge?.bonusXp, 30);
  assert.equal(firstClaim.progress.xp, 90);
  assert.equal(
    firstClaim.progress.xpByDate[formatChallengeDateKey(TODAY_NOV_16)],
    90
  );

  // Claiming same challenge again is idempotent
  const secondClaim = claimDailyChallengeReward(
    firstClaim.progress,
    readyChallenges[1].id,
    TODAY_NOV_16
  );
  assert.equal(secondClaim.claimedChallenge, null);
  assert.equal(secondClaim.progress.xp, 90);

  // Restores cleanly through parseProgressState
  const restored = parseProgressState(
    JSON.stringify(firstClaim.progress),
    TODAY_NOV_16
  );
  const restoredChallenges = generateDailyChallenges(restored, 'fr', TODAY_NOV_16);
  assert.equal(restoredChallenges[1].claimed, true);
  assert.equal(restoredChallenges[2].completed, true);
});

test('daily challenge activity is strictly isolated by date and tracks phrases, dialogues, and stories', () => {
  let state = DEFAULT_PROGRESS;
  state = togglePhraseMastery(state, 'sal-1', YESTERDAY_NOV_15);
  state = recordQuizResult(state, 5, 5, YESTERDAY_NOV_15);
  state = recordDialogueTurn(state, 15, TOMORROW_NOV_17);
  state = markPhrasePracticed(state, 'sal-2', 10, TOMORROW_NOV_17);
  state = markStoryRead(state, 'story-couscous', 10, new Date(2026, 10, 18));

  // Yesterday's quiz does not complete today's (Nov 16) quiz mission
  const nov16 = generateDailyChallenges(state, 'fr', TODAY_NOV_16);
  assert.equal(nov16[1].current, 0);
  assert.equal(nov16[1].completed, false);

  // Tomorrow (Nov 17) tracks phrase practice & dialogue turns
  const nov17 = generateDailyChallenges(state, 'fr', TOMORROW_NOV_17);
  assert.equal(nov17[0].kind, 'practice-phrases');
  assert.equal(nov17[0].current, 1);
  assert.equal(nov17[2].kind, 'dialogue-turns');
  assert.equal(nov17[2].current, 1);
});
