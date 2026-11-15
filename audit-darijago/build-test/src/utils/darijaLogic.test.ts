import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_PHRASES, CURRICULUM_MODULES } from '../data/curriculum';
import {
  DEFAULT_DAILY_XP_GOAL,
  DEFAULT_PROGRESS,
  attachPhraseReviewDates,
  buildLast7DaysXpSeries,
  computeDailyGoalStatus,
  computeModuleProgress,
  computeNextPhraseReview,
  computeOverallProgress,
  countUnlockedAchievements,
  evaluateAchievements,
  filterLexicon,
  formatLocalDateKey,
  generateQuizDeck,
  getPriorityReviewPhrases,
  getTodayXp,
  isDarijaAnswerMatch,
  isPhraseDueForReview,
  markPhrasePracticed,
  markStoryRead,
  normalizeDarijaInput,
  parseProgressState,
  previewReviewIntervals,
  recordDialogueTurn,
  recordPhraseReview,
  recordQuizAnswerStreak,
  recordQuizResult,
  sanitizeDailyXpGoal,
  setDailyXpGoal,
  togglePhraseMastery,
} from './darijaLogic';

test('normalizeDarijaInput converts Arabizi numbers and strips accents/punctuation', () => {
  assert.equal(normalizeDarijaInput('Sba7 el khir!'), 'sbah el khir');
  assert.equal(normalizeDarijaInput('Ya3tik essa7a?'), 'yaatik essaha');
  assert.equal(normalizeDarijaInput('Labès, hamdoullah.'), 'labes hamdoullah');
  assert.equal(normalizeDarijaInput('3andek el 7a9'), 'aandek el haq');
});

test('isDarijaAnswerMatch accepts exact and equivalent Arabizi spellings', () => {
  const sal1 = ALL_PHRASES.find((p) => p.id === 'sal-1')!;
  assert.equal(isDarijaAnswerMatch('Salam alikoum, wach rak?', sal1), true);
  assert.equal(isDarijaAnswerMatch('wach rak', sal1), true);
  assert.equal(isDarijaAnswerMatch('ki rak', sal1), true);
  assert.equal(isDarijaAnswerMatch('   ', sal1), false);
  assert.equal(isDarijaAnswerMatch('beslama', sal1), false);
});

test('togglePhraseMastery awards XP once and toggles masteredIds cleanly', () => {
  const afterAdd = togglePhraseMastery(DEFAULT_PROGRESS, 'sal-1');
  assert.deepEqual(afterAdd.masteredIds, ['sal-1']);
  assert.deepEqual(afterAdd.practicedIds, ['sal-1']);
  assert.equal(afterAdd.xp, 25);

  const afterRemove = togglePhraseMastery(afterAdd, 'sal-1');
  assert.deepEqual(afterRemove.masteredIds, []);
  assert.equal(afterRemove.xp, 25);
});

test('markPhrasePracticed and recordQuizResult update XP and best accuracy', () => {
  const practiced = markPhrasePracticed(DEFAULT_PROGRESS, 'cafe-1', 15);
  assert.equal(practiced.xp, 15);
  assert.deepEqual(practiced.practicedIds, ['cafe-1']);

  const afterQuiz = recordQuizResult(practiced, 5, 6);
  assert.equal(afterQuiz.quizzesCompleted, 1);
  assert.equal(afterQuiz.bestQuizAccuracy, 83);
  assert.equal(afterQuiz.xp, 115);

  const afterLowerQuiz = recordQuizResult(afterQuiz, 3, 6);
  assert.equal(afterLowerQuiz.quizzesCompleted, 2);
  assert.equal(afterLowerQuiz.bestQuizAccuracy, 83);
});

test('computeModuleProgress and computeOverallProgress calculate accurate percentages', () => {
  const mod1 = CURRICULUM_MODULES[0];
  let state = DEFAULT_PROGRESS;
  state = togglePhraseMastery(state, mod1.phrases[0].id);
  state = togglePhraseMastery(state, mod1.phrases[1].id);
  state = togglePhraseMastery(state, mod1.phrases[2].id);

  const modProg = computeModuleProgress(mod1, state);
  assert.equal(modProg.mastered, 3);
  assert.equal(modProg.total, 6);
  assert.equal(modProg.percent, 50);

  const overall = computeOverallProgress(ALL_PHRASES, state);
  assert.equal(overall.mastered, 3);
  assert.equal(overall.total, ALL_PHRASES.length);
});

test('filterLexicon filters by query in French, Arabizi, or Arabic and by module', () => {
  const qahwaResults = filterLexicon(ALL_PHRASES, 'qahwa', 'all');
  assert.equal(qahwaResults.length >= 1, true);
  assert.equal(qahwaResults[0].moduleId, 'cafe');

  const arabizi7 = filterLexicon(ALL_PHRASES, 'sbah', 'salutations');
  assert.equal(arabizi7.length >= 1, true);

  const empty = filterLexicon(ALL_PHRASES, 'zzzzinexistant', 'all');
  assert.equal(empty.length, 0);
});

test('generateQuizDeck produces deterministic questions including sentence-builder', () => {
  const deck = generateQuizDeck(ALL_PHRASES, 'salutations', 42);
  assert.equal(deck.length, 6);
  const builderQuestions = deck.filter((q) => q.type === 'sentence-builder');
  assert.equal(builderQuestions.length >= 1, true);
  for (const q of deck) {
    assert.ok(q.prompt.length > 0);
    assert.ok(q.correctAnswer.length > 0);
  }
});

test('parseProgressState safely handles invalid JSON and older saved schemas', () => {
  const fixedToday = new Date(2026, 10, 14);
  assert.deepEqual(parseProgressState(null), DEFAULT_PROGRESS);
  assert.deepEqual(parseProgressState('{invalid'), DEFAULT_PROGRESS);
  const valid = parseProgressState(
    JSON.stringify({ xp: 80, streak: 3, masteredIds: ['sal-1'] }),
    fixedToday
  );
  assert.equal(valid.xp, 80);
  assert.equal(valid.streak, 3);
  assert.deepEqual(valid.masteredIds, ['sal-1']);
  assert.equal(valid.quizStreak, 0);
  assert.equal(valid.bestQuizStreak, 0);
  assert.equal(valid.dialogueTurnsCount, 0);
  assert.deepEqual(valid.xpByDate, { [formatLocalDateKey(fixedToday)]: 80 });
});

test('recordQuizAnswerStreak tracks consecutive quiz answers and best streak', () => {
  let state = DEFAULT_PROGRESS;
  state = recordQuizAnswerStreak(state, true);
  state = recordQuizAnswerStreak(state, true);
  state = recordQuizAnswerStreak(state, true);
  assert.equal(state.quizStreak, 3);
  assert.equal(state.bestQuizStreak, 3);

  state = recordQuizAnswerStreak(state, false);
  assert.equal(state.quizStreak, 0);
  assert.equal(state.bestQuizStreak, 3);
});

test('evaluateAchievements unlocks First 100 XP, 5 Lessons Completed, Quiz Streak, and Dialogue milestones', () => {
  let state = DEFAULT_PROGRESS;
  const initial = evaluateAchievements(state, CURRICULUM_MODULES);
  assert.equal(countUnlockedAchievements(initial), 0);

  // Master 5 phrases -> unlocks 'first-phrase', 'five-lessons', and awards 125 XP -> unlocks 'first-100-xp'
  for (const phrase of CURRICULUM_MODULES[0].phrases.slice(0, 5)) {
    state = togglePhraseMastery(state, phrase.id);
  }
  state = recordQuizAnswerStreak(state, true);
  state = recordQuizAnswerStreak(state, true);
  state = recordQuizAnswerStreak(state, true);
  state = recordDialogueTurn(state);
  state = recordDialogueTurn(state);
  state = recordDialogueTurn(state);

  const evaluated = evaluateAchievements(state, CURRICULUM_MODULES);
  const byId = new Map(evaluated.map((a) => [a.id, a]));

  assert.equal(byId.get('first-phrase')?.unlocked, true);
  assert.equal(byId.get('five-lessons')?.unlocked, true);
  assert.equal(byId.get('first-100-xp')?.unlocked, true);
  assert.equal(byId.get('quiz-streak-3')?.unlocked, true);
  assert.equal(byId.get('dialogue-turns-3')?.unlocked, true);
  assert.equal(byId.get('unit-complete')?.unlocked, false);
  assert.equal(countUnlockedAchievements(evaluated), 5);
});

test('buildLast7DaysXpSeries builds a 7-day cumulative XP progression ending at current XP', () => {
  const day0 = new Date(2026, 10, 14); // 2026-11-14
  const dayMinus3 = new Date(2026, 10, 11);
  const dayMinus1 = new Date(2026, 10, 13);

  let state = DEFAULT_PROGRESS;
  state = togglePhraseMastery(state, 'sal-1', dayMinus3); // +25
  state = markPhrasePracticed(state, 'sal-2', 10, dayMinus1); // +10
  state = recordDialogueTurn(state, 15, day0); // +15

  const series = buildLast7DaysXpSeries(state, day0);
  assert.equal(series.length, 7);
  assert.equal(series[0].date, '2026-11-08');
  assert.equal(series[6].date, '2026-11-14');
  assert.equal(series[6].label, 'Auj.');

  assert.deepEqual(
    series.map((p) => p.xpEarned),
    [0, 0, 0, 25, 0, 10, 15]
  );
  assert.deepEqual(
    series.map((p) => p.cumulativeXp),
    [0, 0, 0, 25, 25, 35, 50]
  );
  assert.equal(series[6].cumulativeXp, state.xp);
});

import { parseAppLanguage } from '../i18n/translations';

test('parseAppLanguage recognizes the 7 supported startup languages and rejects invalid values', () => {
  assert.equal(parseAppLanguage('fr'), 'fr');
  assert.equal(parseAppLanguage(' EN '), 'en');
  assert.equal(parseAppLanguage('es'), 'es');
  assert.equal(parseAppLanguage('de'), 'de');
  assert.equal(parseAppLanguage('it'), 'it');
  assert.equal(parseAppLanguage('nl'), 'nl');
  assert.equal(parseAppLanguage('zh'), 'zh');
  assert.equal(parseAppLanguage('pt'), null);
  assert.equal(parseAppLanguage(null), null);
});

test('buildLast7DaysXpSeries, evaluateAchievements, filterLexicon, and generateQuizDeck localize cleanly', () => {
  const day0 = new Date(2026, 10, 14);
  const seriesEn = buildLast7DaysXpSeries(DEFAULT_PROGRESS, day0, 'en');
  assert.equal(seriesEn[6].label, 'Today');

  const seriesZh = buildLast7DaysXpSeries(DEFAULT_PROGRESS, day0, 'zh');
  assert.equal(seriesZh[6].label, '今天');

  const achEn = evaluateAchievements(DEFAULT_PROGRESS, CURRICULUM_MODULES, 'en');
  assert.equal(achEn.find((a) => a.id === 'first-100-xp')?.title, 'First 100 XP');

  const enCoffeeSearch = filterLexicon(ALL_PHRASES, 'coffee', 'all', 'en');
  assert.equal(enCoffeeSearch.length >= 1, true);
  assert.equal(enCoffeeSearch[0].moduleId, 'cafe');

  const zhCoffeeSearch = filterLexicon(ALL_PHRASES, '咖啡', 'all', 'zh');
  assert.equal(zhCoffeeSearch.length >= 1, true);

  const quizEs = generateQuizDeck(ALL_PHRASES, 'salutations', 7, 'es');
  assert.equal(quizEs.length, 6);
  assert.ok(quizEs[0].prompt.includes('¿Cómo se dice'));
});

test('sanitizeDailyXpGoal clamps values and defaults invalid inputs', () => {
  assert.equal(sanitizeDailyXpGoal(undefined), DEFAULT_DAILY_XP_GOAL);
  assert.equal(sanitizeDailyXpGoal(NaN), DEFAULT_DAILY_XP_GOAL);
  assert.equal(sanitizeDailyXpGoal(3), 10);
  assert.equal(sanitizeDailyXpGoal(5000), 1000);
  assert.equal(sanitizeDailyXpGoal(75.4), 75);
});

test('computeDailyGoalStatus tracks daily progress, completion threshold, and goal updates', () => {
  const day0 = new Date(2026, 10, 14);
  const dayMinus1 = new Date(2026, 10, 13);

  let state = DEFAULT_PROGRESS;
  assert.equal(getTodayXp(state, day0), 0);

  let status = computeDailyGoalStatus(state, day0);
  assert.deepEqual(status, {
    todayXp: 0,
    goal: 50,
    percent: 0,
    remainingXp: 50,
    reached: false,
  });

  // Yesterday's XP does not count toward today's daily goal
  state = togglePhraseMastery(state, 'sal-1', dayMinus1); // +25 yesterday
  assert.equal(getTodayXp(state, day0), 0);

  // Today's XP counts toward today's daily goal
  state = markPhrasePracticed(state, 'sal-1', 25, day0); // +25 today -> 50%
  status = computeDailyGoalStatus(state, day0);
  assert.deepEqual(status, {
    todayXp: 25,
    goal: 50,
    percent: 50,
    remainingXp: 25,
    reached: false,
  });

  // Reaching or exceeding goal triggers reached: true and clamps ring percent at 100
  state = markPhrasePracticed(state, 'sal-2', 35, day0); // 60 today
  status = computeDailyGoalStatus(state, day0);
  assert.deepEqual(status, {
    todayXp: 60,
    goal: 50,
    percent: 100,
    remainingXp: 0,
    reached: true,
  });

  // Raising goal above todayXp resets reached back to false
  state = setDailyXpGoal(state, 100);
  status = computeDailyGoalStatus(state, day0);
  assert.deepEqual(status, {
    todayXp: 60,
    goal: 100,
    percent: 60,
    remainingXp: 40,
    reached: false,
  });

  // Persisted dailyXpGoal restores cleanly
  const restored = parseProgressState(JSON.stringify(state), day0);
  assert.equal(restored.dailyXpGoal, 100);
});

test('computeNextPhraseReview schedules intervals across ratings and resets on again', () => {
  const day0 = new Date(2026, 10, 14); // 2026-11-14

  const firstGood = computeNextPhraseReview(undefined, 'good', day0);
  assert.equal(firstGood.repetitions, 1);
  assert.equal(firstGood.intervalDays, 1);
  assert.equal(firstGood.nextReviewDate, '2026-11-15');

  const secondGood = computeNextPhraseReview(firstGood, 'good', day0);
  assert.equal(secondGood.repetitions, 2);
  assert.equal(secondGood.intervalDays, 3);
  assert.equal(secondGood.nextReviewDate, '2026-11-17');

  const thirdEasy = computeNextPhraseReview(secondGood, 'easy', day0);
  assert.equal(thirdEasy.repetitions, 3);
  assert.equal(thirdEasy.intervalDays, 8);
  assert.equal(thirdEasy.nextReviewDate, '2026-11-22');
  assert.equal(thirdEasy.easeFactor, 2.65);

  const resetAgain = computeNextPhraseReview(thirdEasy, 'again', day0);
  assert.equal(resetAgain.repetitions, 0);
  assert.equal(resetAgain.intervalDays, 0);
  assert.equal(resetAgain.nextReviewDate, '2026-11-14');
  assert.equal(resetAgain.easeFactor, 2.45);
});

test('recordPhraseReview, attachPhraseReviewDates, and getPriorityReviewPhrases prioritize overdue and due-today phrases', () => {
  const day0 = new Date(2026, 10, 14); // 2026-11-14
  const dayMinus4 = new Date(2026, 10, 10); // 2026-11-10

  let state = DEFAULT_PROGRESS;
  // Practiced 4 days ago -> nextReviewDate = 2026-11-11 (3 days overdue on 2026-11-14)
  state = recordPhraseReview(state, 'sal-2', 'good', 5, dayMinus4);
  // Rated 'again' today -> nextReviewDate = 2026-11-14 (due today)
  state = recordPhraseReview(state, 'sal-1', 'again', 5, day0);
  // Rated 'easy' today -> nextReviewDate = 2026-11-18 (upcoming)
  state = recordPhraseReview(state, 'sal-3', 'easy', 5, day0);

  assert.equal(state.xp, 15);
  assert.equal(state.phraseReviews['sal-2']?.nextReviewDate, '2026-11-11');
  assert.equal(state.phraseReviews['sal-1']?.nextReviewDate, '2026-11-14');
  assert.equal(state.phraseReviews['sal-3']?.nextReviewDate, '2026-11-18');

  const enriched = attachPhraseReviewDates(CURRICULUM_MODULES[0].phrases, state);
  assert.equal(enriched[0].nextReviewDate, '2026-11-14');
  assert.equal(enriched[1].nextReviewDate, '2026-11-11');
  assert.equal(enriched[2].nextReviewDate, '2026-11-18');
  assert.equal(enriched[3].nextReviewDate, undefined);

  assert.equal(isPhraseDueForReview(enriched[0], day0), true);
  assert.equal(isPhraseDueForReview(enriched[1], day0), true);
  assert.equal(isPhraseDueForReview(enriched[2], day0), false);
  assert.equal(isPhraseDueForReview(enriched[3], day0), false);

  const { dueItems, upcomingItems } = getPriorityReviewPhrases(
    CURRICULUM_MODULES,
    state,
    day0
  );
  assert.deepEqual(
    dueItems.map((i) => i.phrase.id),
    ['sal-2', 'sal-1']
  );
  assert.equal(dueItems[0].priorityReason, 'overdue');
  assert.equal(dueItems[0].daysUntilDue, -3);
  assert.equal(dueItems[1].priorityReason, 'due-today');
  assert.equal(dueItems[1].daysUntilDue, 0);

  assert.deepEqual(
    upcomingItems.map((i) => i.phrase.id),
    ['sal-3']
  );
  assert.equal(upcomingItems[0].priorityReason, 'upcoming');
  assert.equal(upcomingItems[0].daysUntilDue, 4);

  const previews = previewReviewIntervals(state.phraseReviews['sal-3'], day0);
  assert.equal(previews.again, 0);
  assert.equal(previews.good, 3);
  assert.equal(previews.easy, 7);

  // Persists and sanitizes phraseReviews through parseProgressState
  const restored = parseProgressState(JSON.stringify(state), day0);
  assert.deepEqual(restored.phraseReviews, state.phraseReviews);
});

test('markStoryRead awards XP once per story and restores cleanly via parseProgressState', () => {
  const day0 = new Date(2026, 10, 14);
  const firstRead = markStoryRead(DEFAULT_PROGRESS, 'story-couscous', 10, day0);
  assert.equal(firstRead.xp, 10);
  assert.deepEqual(firstRead.readStoryIds, ['story-couscous']);
  assert.equal(firstRead.xpByDate['2026-11-14'], 10);

  // Reading the same story again is idempotent
  const secondRead = markStoryRead(firstRead, 'story-couscous', 10, day0);
  assert.equal(secondRead.xp, 10);
  assert.deepEqual(secondRead.readStoryIds, ['story-couscous']);

  // Persists through parseProgressState
  const restored = parseProgressState(JSON.stringify(secondRead), day0);
  assert.deepEqual(restored.readStoryIds, ['story-couscous']);
  assert.equal(restored.xp, 10);
});




