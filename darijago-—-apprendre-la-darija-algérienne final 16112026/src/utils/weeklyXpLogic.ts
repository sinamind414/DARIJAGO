import type { DailyXpPoint } from '../types/darija';

export type WeeklyChartViewMode = 'daily' | 'cumulative';

export interface WeeklyXpChartPoint extends DailyXpPoint {
  goalTarget: number;
  metGoal: boolean;
  isToday: boolean;
  goalPercent: number;
}

export interface WeeklyBestDay {
  date: string;
  label: string;
  fullDate: string;
  xpEarned: number;
}

export interface WeeklyXpSummary {
  weeklyTotalXp: number;
  dailyAverageXp: number;
  activeDays: number;
  daysGoalReached: number;
  totalDays: number;
  bestDay: WeeklyBestDay | null;
  dailyGoal: number;
}

export function normalizeDailyGoal(dailyGoal: number): number {
  if (!Number.isFinite(dailyGoal) || dailyGoal <= 0) return 50;
  return Math.max(1, Math.round(dailyGoal));
}

export function enrichWeeklyXpSeries(
  series: DailyXpPoint[],
  dailyGoal: number
): WeeklyXpChartPoint[] {
  const safeGoal = normalizeDailyGoal(dailyGoal);
  const lastIndex = series.length - 1;

  return series.map((point, index) => {
    const safeEarned = Math.max(0, Math.round(point.xpEarned));
    const safeCumulative = Math.max(0, Math.round(point.cumulativeXp));
    return {
      ...point,
      xpEarned: safeEarned,
      cumulativeXp: safeCumulative,
      goalTarget: safeGoal,
      metGoal: safeEarned >= safeGoal,
      isToday: index === lastIndex,
      goalPercent: Math.round((safeEarned / safeGoal) * 100),
    };
  });
}

export function computeWeeklyXpSummary(
  series: DailyXpPoint[],
  dailyGoal: number
): WeeklyXpSummary {
  const safeGoal = normalizeDailyGoal(dailyGoal);
  const enriched = enrichWeeklyXpSeries(series, safeGoal);

  let weeklyTotalXp = 0;
  let activeDays = 0;
  let daysGoalReached = 0;
  let bestDay: WeeklyBestDay | null = null;

  for (const point of enriched) {
    weeklyTotalXp += point.xpEarned;
    if (point.xpEarned > 0) {
      activeDays += 1;
    }
    if (point.metGoal) {
      daysGoalReached += 1;
    }
    if (point.xpEarned > 0 && (!bestDay || point.xpEarned >= bestDay.xpEarned)) {
      bestDay = {
        date: point.date,
        label: point.label,
        fullDate: point.fullDate,
        xpEarned: point.xpEarned,
      };
    }
  }

  const dailyAverageXp =
    enriched.length > 0 ? Math.round(weeklyTotalXp / enriched.length) : 0;

  return {
    weeklyTotalXp,
    dailyAverageXp,
    activeDays,
    daysGoalReached,
    totalDays: enriched.length,
    bestDay,
    dailyGoal: safeGoal,
  };
}

export function computeWeeklyYAxisMax(
  points: WeeklyXpChartPoint[],
  mode: WeeklyChartViewMode,
  dailyGoal: number
): number {
  const safeGoal = normalizeDailyGoal(dailyGoal);
  if (mode === 'cumulative') {
    const maxCum = points.reduce(
      (max, pt) => Math.max(max, pt.cumulativeXp),
      0
    );
    return Math.max(100, Math.ceil((maxCum + 20) / 25) * 25);
  }

  const maxDaily = points.reduce((max, pt) => Math.max(max, pt.xpEarned), 0);
  const baseline = Math.max(safeGoal + 15, maxDaily + 15);
  return Math.max(50, Math.ceil(baseline / 25) * 25);
}
