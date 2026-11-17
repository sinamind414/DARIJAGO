import test from 'node:test';
import assert from 'node:assert/strict';
import type { DailyXpPoint } from '../types/darija';
import {
  computeWeeklyXpSummary,
  computeWeeklyYAxisMax,
  enrichWeeklyXpSeries,
  normalizeDailyGoal,
} from './weeklyXpLogic';

const SAMPLE_WEEK: DailyXpPoint[] = [
  { date: '2026-11-10', label: 'Mar 10', fullDate: '10 nov.', xpEarned: 0, cumulativeXp: 100 },
  { date: '2026-11-11', label: 'Mer 11', fullDate: '11 nov.', xpEarned: 35, cumulativeXp: 135 },
  { date: '2026-11-12', label: 'Jeu 12', fullDate: '12 nov.', xpEarned: 60, cumulativeXp: 195 },
  { date: '2026-11-13', label: 'Ven 13', fullDate: '13 nov.', xpEarned: 20, cumulativeXp: 215 },
  { date: '2026-11-14', label: 'Sam 14', fullDate: '14 nov.', xpEarned: 75, cumulativeXp: 290 },
  { date: '2026-11-15', label: 'Dim 15', fullDate: '15 nov.', xpEarned: 50, cumulativeXp: 340 },
  { date: '2026-11-16', label: 'Auj.', fullDate: '16 nov.', xpEarned: 40, cumulativeXp: 380 },
];

test('normalizeDailyGoal falls back to 50 for invalid values', () => {
  assert.equal(normalizeDailyGoal(0), 50);
  assert.equal(normalizeDailyGoal(-10), 50);
  assert.equal(normalizeDailyGoal(Number.NaN), 50);
  assert.equal(normalizeDailyGoal(74.6), 75);
});

test('enrichWeeklyXpSeries annotates goal attainment, percentage, and today marker', () => {
  const enriched = enrichWeeklyXpSeries(SAMPLE_WEEK, 50);
  assert.equal(enriched.length, 7);
  assert.equal(enriched[0].metGoal, false);
  assert.equal(enriched[0].goalPercent, 0);
  assert.equal(enriched[0].isToday, false);

  assert.equal(enriched[2].metGoal, true);
  assert.equal(enriched[2].goalPercent, 120);

  assert.equal(enriched[5].metGoal, true);
  assert.equal(enriched[5].goalPercent, 100);

  assert.equal(enriched[6].isToday, true);
  assert.equal(enriched[6].metGoal, false);
  assert.equal(enriched[6].goalPercent, 80);
});

test('computeWeeklyXpSummary calculates totals, averages, goal hits, and peak day', () => {
  const summary = computeWeeklyXpSummary(SAMPLE_WEEK, 50);
  assert.equal(summary.weeklyTotalXp, 280);
  assert.equal(summary.dailyAverageXp, 40);
  assert.equal(summary.activeDays, 6);
  assert.equal(summary.daysGoalReached, 3);
  assert.equal(summary.totalDays, 7);
  assert.deepEqual(summary.bestDay, {
    date: '2026-11-14',
    label: 'Sam 14',
    fullDate: '14 nov.',
    xpEarned: 75,
  });
});

test('computeWeeklyXpSummary prefers the most recent day on max XP ties and returns null when empty', () => {
  const tiedWeek: DailyXpPoint[] = [
    { date: '2026-11-10', label: 'Mar 10', fullDate: '10 nov.', xpEarned: 50, cumulativeXp: 50 },
    { date: '2026-11-11', label: 'Mer 11', fullDate: '11 nov.', xpEarned: 50, cumulativeXp: 100 },
  ];
  const tiedSummary = computeWeeklyXpSummary(tiedWeek, 50);
  assert.equal(tiedSummary.bestDay?.date, '2026-11-11');

  const zeroWeek = SAMPLE_WEEK.map((d) => ({ ...d, xpEarned: 0, cumulativeXp: 0 }));
  const zeroSummary = computeWeeklyXpSummary(zeroWeek, 50);
  assert.equal(zeroSummary.weeklyTotalXp, 0);
  assert.equal(zeroSummary.dailyAverageXp, 0);
  assert.equal(zeroSummary.activeDays, 0);
  assert.equal(zeroSummary.daysGoalReached, 0);
  assert.equal(zeroSummary.bestDay, null);
});

test('computeWeeklyYAxisMax accommodates daily goal line and cumulative peaks cleanly', () => {
  const zeroWeek = enrichWeeklyXpSeries(
    SAMPLE_WEEK.map((d) => ({ ...d, xpEarned: 0, cumulativeXp: 0 })),
    80
  );
  assert.equal(computeWeeklyYAxisMax(zeroWeek, 'daily', 80), 100);

  const activeWeek = enrichWeeklyXpSeries(SAMPLE_WEEK, 50);
  assert.equal(computeWeeklyYAxisMax(activeWeek, 'daily', 50), 100);
  assert.equal(computeWeeklyYAxisMax(activeWeek, 'cumulative', 50), 400);
});
