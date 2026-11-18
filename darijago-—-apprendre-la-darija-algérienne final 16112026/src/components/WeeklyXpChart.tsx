import { useMemo, useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AppLanguage, DailyXpPoint } from '../types/darija';
import { UI_TRANSLATIONS, type UiTranslations } from '../i18n/translations';
import {
  EXPERIENCE_TRANSLATIONS,
  type ExperienceTranslations,
} from '../i18n/experienceTranslations';
import {
  computeWeeklyXpSummary,
  computeWeeklyYAxisMax,
  enrichWeeklyXpSeries,
  type WeeklyChartViewMode,
  type WeeklyXpChartPoint,
} from '../utils/weeklyXpLogic';

interface WeeklyXpChartProps {
  language: AppLanguage;
  xpHistory: DailyXpPoint[];
  totalXp: number;
  dailyXpGoal: number;
  isDark: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: WeeklyXpChartPoint }>;
  heroT: UiTranslations['hero'];
  prT: ExperienceTranslations['progres'];
}

function WeeklyXpTooltip({ active, payload, heroT, prT }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) {
    return null;
  }
  const point = payload[0].payload;

  return (
    <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-xl px-3.5 py-2.5 shadow-md text-xs space-y-1">
      <p className="font-semibold text-[#23201C] dark:text-slate-100">
        {point.isToday ? heroT.tooltipToday(point.fullDate) : point.fullDate}
      </p>
      <p className="text-[#8C2F18] dark:text-[#E8A184] font-bold tabular-nums">
        {heroT.tooltipDaily(point.xpEarned)}
      </p>
      <p className="text-[#686259] dark:text-slate-300 tabular-nums">
        {heroT.tooltipTotal(point.cumulativeXp)}
      </p>
      <p className="text-[#C68335] dark:text-[#E5A95C] font-medium tabular-nums pt-0.5 border-t border-[#E4DFD2]/80 dark:border-[#2A352F]">
        {prT.tooltipGoalProgress(point.goalPercent)}
      </p>
    </div>
  );
}

export function WeeklyXpChart({
  language,
  xpHistory,
  totalXp,
  dailyXpGoal,
  isDark,
}: WeeklyXpChartProps) {
  const [viewMode, setViewMode] = useState<WeeklyChartViewMode>('daily');
  const heroT = UI_TRANSLATIONS[language].hero;
  const prT = EXPERIENCE_TRANSLATIONS[language].progres;

  const enrichedPoints = useMemo(
    () => enrichWeeklyXpSeries(xpHistory, dailyXpGoal),
    [xpHistory, dailyXpGoal]
  );

  const summary = useMemo(
    () => computeWeeklyXpSummary(xpHistory, dailyXpGoal),
    [xpHistory, dailyXpGoal]
  );

  const yAxisMax = useMemo(
    () => computeWeeklyYAxisMax(enrichedPoints, viewMode, dailyXpGoal),
    [enrichedPoints, viewMode, dailyXpGoal]
  );

  const gridColor = isDark ? '#2A352F' : '#E4DFD2';
  const axisTextColor = isDark ? '#94A3B8' : '#686259';
  const lineColor = isDark ? '#E8A184' : '#8C2F18';
  const dotFillColor = isDark ? '#171E1B' : '#FFFFFF';
  const goalLineColor = isDark ? '#E5A95C' : '#C68335';
  const cursorFill = isDark ? 'rgba(165, 193, 120, 0.08)' : 'rgba(92, 114, 60, 0.08)';

  const getBarFill = (pt: WeeklyXpChartPoint): string => {
    if (pt.xpEarned <= 0) {
      return isDark ? '#26312B' : '#EAE5D9';
    }
    if (pt.metGoal) {
      return isDark ? '#E8A184' : '#8C2F18';
    }
    if (pt.isToday) {
      return isDark ? '#E5A95C' : '#C68335';
    }
    return isDark ? '#6D8847' : '#8BA363';
  };

  return (
    <div
      data-testid="xp-chart-container"
      data-chart-mode={viewMode}
      role="region"
      aria-label={prT.weeklyChartTitle}
      className="lg:col-span-8 bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between"
    >
      {/* Header + Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#23201C] dark:text-slate-100">
              {prT.weeklyChartTitle}
            </h2>
            <span className="text-xs font-semibold text-[#686259] dark:text-slate-400 tabular-nums">
              {heroT.chartTotal(totalXp)}
            </span>
          </div>
          <p className="text-xs text-[#686259] dark:text-slate-400">
            {prT.weeklyChartSubtitle}
          </p>
        </div>

        <div
          role="group"
          aria-label={prT.weeklyModeGroupAria}
          className="inline-flex items-center self-start bg-[#F5F1E8] dark:bg-[#111714] border border-[#E4DFD2] dark:border-[#2A352F] rounded-xl p-1 gap-1 shrink-0"
        >
          <button
            type="button"
            data-testid="weekly-chart-mode-daily"
            aria-pressed={viewMode === 'daily'}
            onClick={() => setViewMode('daily')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-[#1E2723] text-[#8C2F18] dark:text-[#E8A184] shadow-xs border border-[#E4DFD2]/80 dark:border-[#2A352F]'
                : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{prT.weeklyModeDaily}</span>
          </button>
          <button
            type="button"
            data-testid="weekly-chart-mode-cumulative"
            aria-pressed={viewMode === 'cumulative'}
            onClick={() => setViewMode('cumulative')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              viewMode === 'cumulative'
                ? 'bg-white dark:bg-[#1E2723] text-[#8C2F18] dark:text-[#E8A184] shadow-xs border border-[#E4DFD2]/80 dark:border-[#2A352F]'
                : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{prT.weeklyModeCumulative}</span>
          </button>
        </div>
      </div>

      {/* 4 Weekly Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#FAF8F3] dark:bg-[#121815] border border-[#E4DFD2]/80 dark:border-[#2A352F] rounded-xl px-3 py-2.5">
          <p className="text-[11px] font-medium text-[#686259] dark:text-slate-400">
            {prT.weeklyStatTotal}
          </p>
          <p
            data-testid="weekly-total-xp"
            className="font-display text-base sm:text-lg font-extrabold text-[#8C2F18] dark:text-[#E8A184] tabular-nums mt-0.5"
          >
            +{summary.weeklyTotalXp} XP
          </p>
        </div>

        <div className="bg-[#FAF8F3] dark:bg-[#121815] border border-[#E4DFD2]/80 dark:border-[#2A352F] rounded-xl px-3 py-2.5">
          <p className="text-[11px] font-medium text-[#686259] dark:text-slate-400">
            {prT.weeklyStatAverage}
          </p>
          <p
            data-testid="weekly-average-xp"
            className="font-display text-base sm:text-lg font-extrabold text-[#23201C] dark:text-slate-100 tabular-nums mt-0.5"
          >
            {summary.dailyAverageXp} XP
          </p>
        </div>

        <div className="bg-[#FAF8F3] dark:bg-[#121815] border border-[#E4DFD2]/80 dark:border-[#2A352F] rounded-xl px-3 py-2.5">
          <p className="text-[11px] font-medium text-[#686259] dark:text-slate-400">
            {prT.weeklyStatBestDay}
          </p>
          <p
            data-testid="weekly-best-day"
            className="font-display text-sm sm:text-base font-extrabold text-[#23201C] dark:text-slate-100 tabular-nums mt-0.5 truncate"
          >
            {summary.bestDay
              ? `${summary.bestDay.label} · ${summary.bestDay.xpEarned} XP`
              : prT.weeklyNoBestDay}
          </p>
        </div>

        <div className="bg-[#FAF8F3] dark:bg-[#121815] border border-[#E4DFD2]/80 dark:border-[#2A352F] rounded-xl px-3 py-2.5">
          <p className="text-[11px] font-medium text-[#686259] dark:text-slate-400">
            {prT.weeklyStatGoalDays}
          </p>
          <p
            data-testid="weekly-goals-hit"
            className="font-display text-base sm:text-lg font-extrabold text-[#C68335] dark:text-[#E5A95C] tabular-nums mt-0.5"
          >
            {summary.daysGoalReached} / {summary.totalDays}
          </p>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="w-full h-56 sm:h-60 min-w-0">
        <ResponsiveContainer width="100%" height={224} minWidth={0}>
          {viewMode === 'daily' ? (
            <BarChart
              data={enrichedPoints}
              margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridColor}
              />
              <XAxis
                dataKey="label"
                interval={0}
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisTextColor, fontSize: 11 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, yAxisMax]}
                tick={{ fill: axisTextColor, fontSize: 11 }}
              />
              <Tooltip
                content={<WeeklyXpTooltip heroT={heroT} prT={prT} />}
                cursor={{ fill: cursorFill }}
              />
              <ReferenceLine
                y={summary.dailyGoal}
                stroke={goalLineColor}
                strokeDasharray="4 4"
                strokeWidth={1.75}
              />
              <Bar
                dataKey="xpEarned"
                name="XP"
                radius={[8, 8, 2, 2]}
                maxBarSize={42}
                isAnimationActive={false}
              >
                {enrichedPoints.map((pt) => (
                  <Cell key={pt.date} fill={getBarFill(pt)} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart
              data={enrichedPoints}
              margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weeklyXpAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={lineColor} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridColor}
              />
              <XAxis
                dataKey="label"
                interval={0}
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisTextColor, fontSize: 11 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, yAxisMax]}
                tick={{ fill: axisTextColor, fontSize: 11 }}
              />
              <Tooltip
                content={<WeeklyXpTooltip heroT={heroT} prT={prT} />}
                cursor={{ stroke: gridColor, strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeXp"
                name="XP"
                stroke={lineColor}
                strokeWidth={2.5}
                fill="url(#weeklyXpAreaFill)"
                dot={{
                  r: 4,
                  fill: dotFillColor,
                  stroke: lineColor,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: '#C68335',
                  stroke: dotFillColor,
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend / Empty State Hint */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#686259] dark:text-slate-400">
        {viewMode === 'daily' ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#8C2F18] dark:bg-[#E8A184]" aria-hidden="true" />
              <span>{prT.weeklyLegendGoalMet}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#8BA363] dark:bg-[#6D8847]" aria-hidden="true" />
              <span>{prT.weeklyLegendActive}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#C68335] dark:bg-[#E5A95C]" aria-hidden="true" />
              <span>{prT.weeklyLegendToday}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-[#C68335] dark:text-[#E5A95C]">
              <span className="w-4 border-t-2 border-dashed border-[#C68335] dark:border-[#E5A95C]" aria-hidden="true" />
              <span>{prT.weeklyGoalLineLabel(summary.dailyGoal)}</span>
            </span>
          </div>
        ) : (
          <span className="font-medium text-[#8C2F18] dark:text-[#E8A184]">
            {heroT.chartWeeklyGain(summary.weeklyTotalXp)}
          </span>
        )}

        {summary.weeklyTotalXp === 0 && (
          <p className="text-[11px] text-[#686259] dark:text-slate-400 italic">
            {prT.weeklyEmptyHint}
          </p>
        )}
      </div>
    </div>
  );
}
