import { ArrowRight, BookOpenCheck, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ALL_PHRASES, CURRICULUM_MODULES } from '../data/curriculum';
import type {
  AchievementStatus,
  AppLanguage,
  DailyXpPoint,
  UserProgressState,
} from '../types/darija';
import type { DesktopNotificationPermission } from '../utils/notifications';
import { UI_TRANSLATIONS, type UiTranslations } from '../i18n/translations';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import { getPriorityReviewPhrases } from '../utils/darijaLogic';
import { DailyXpGoalRing } from './DailyXpGoalRing';
import { AchievementsSection } from './AchievementsSection';

interface ProgresSectionProps {
  language: AppLanguage;
  progress: UserProgressState;
  achievements: AchievementStatus[];
  todayXp: number;
  dailyXpGoal: number;
  pendingGoalCelebration: boolean;
  xpHistory: DailyXpPoint[];
  isDark: boolean;
  desktopPermission: DesktopNotificationPermission;
  onChangeDailyXpGoal: (goal: number) => void;
  onGoalCelebrationShown: () => void;
  onRequestDesktopPermission: () => void;
  onGoToLearn: () => void;
  onGoToQuiz: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: DailyXpPoint }>;
  heroT: UiTranslations['hero'];
}

function XpChartTooltip({ active, payload, heroT }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) {
    return null;
  }
  const point = payload[0].payload;
  return (
    <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-xl px-3 py-2 shadow-sm text-xs">
      <p className="font-semibold text-[#23201C] dark:text-slate-100">
        {point.label === heroT.todayLabel
          ? heroT.tooltipToday(point.fullDate)
          : point.fullDate}
      </p>
      <p className="text-[#4E6231] dark:text-[#A5C178] font-semibold tabular-nums mt-0.5">
        {heroT.tooltipTotal(point.cumulativeXp)}
      </p>
      <p className="text-[#686259] dark:text-slate-400 tabular-nums">
        {heroT.tooltipDaily(point.xpEarned)}
      </p>
    </div>
  );
}

export function ProgresSection({
  language,
  progress,
  achievements,
  todayXp,
  dailyXpGoal,
  pendingGoalCelebration,
  xpHistory,
  isDark,
  desktopPermission,
  onChangeDailyXpGoal,
  onGoalCelebrationShown,
  onRequestDesktopPermission,
  onGoToLearn,
  onGoToQuiz,
}: ProgresSectionProps) {
  const heroT = UI_TRANSLATIONS[language].hero;
  const prT = EXPERIENCE_TRANSLATIONS[language].progres;

  const { dueItems, upcomingItems } = getPriorityReviewPhrases(
    CURRICULUM_MODULES,
    progress
  );
  const weeklyXpGain = xpHistory.reduce((sum, pt) => sum + pt.xpEarned, 0);

  const gridColor = isDark ? '#2A352F' : '#E4DFD2';
  const axisTextColor = isDark ? '#94A3B8' : '#686259';
  const lineColor = isDark ? '#A5C178' : '#5C723C';
  const dotFillColor = isDark ? '#171E1B' : '#FFFFFF';

  return (
    <section
      aria-label={prT.pageTitle}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6"
    >
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#23201C] dark:text-slate-50 tracking-tight">
          {prT.pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400 max-w-2xl">
          {prT.pageSubtitle}
        </p>
      </div>

      {/* 4 Key Progress Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#686259] dark:text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#5C723C] dark:text-[#A5C178]" aria-hidden="true" />
            <span>{prT.statMastered}</span>
          </div>
          <p className="font-display text-2xl font-extrabold text-[#23201C] dark:text-slate-100 tabular-nums">
            {progress.masteredIds.length} / {ALL_PHRASES.length}
          </p>
        </div>

        <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#686259] dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-[#C68335]" aria-hidden="true" />
            <span>{prT.statDueToday}</span>
          </div>
          <p className="font-display text-2xl font-extrabold text-[#C68335] tabular-nums">
            {dueItems.length}
          </p>
        </div>

        <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#686259] dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-[#5C723C] dark:text-[#A5C178]" aria-hidden="true" />
            <span>{prT.statScheduled}</span>
          </div>
          <p className="font-display text-2xl font-extrabold text-[#23201C] dark:text-slate-100 tabular-nums">
            {dueItems.length + upcomingItems.length}
          </p>
        </div>

        <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#686259] dark:text-slate-400">
            <BookOpenCheck className="w-3.5 h-3.5 text-[#C68335]" aria-hidden="true" />
            <span>{prT.statStoriesRead}</span>
          </div>
          <p className="font-display text-2xl font-extrabold text-[#23201C] dark:text-slate-100 tabular-nums">
            {progress.readStoryIds.length} / 3
          </p>
        </div>
      </div>

      {/* Daily XP Goal Ring + Celebration */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6">
        <DailyXpGoalRing
          language={language}
          todayXp={todayXp}
          dailyGoal={dailyXpGoal}
          pendingCelebration={pendingGoalCelebration}
          onChangeDailyGoal={onChangeDailyXpGoal}
          onCelebrationShown={onGoalCelebrationShown}
        />
      </div>

      {/* 7-Day XP Line Chart + SRS Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div
          data-testid="xp-chart-container"
          role="region"
          aria-label={heroT.chartAria}
          className="lg:col-span-8 bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-[#23201C] dark:text-slate-100">
                {heroT.chartTitle}
              </h2>
              <p className="text-xs text-[#686259] dark:text-slate-400">
                {heroT.chartSubtitle}
              </p>
            </div>
            <div className="flex items-baseline gap-3 text-xs sm:text-sm tabular-nums shrink-0">
              <span className="font-semibold text-[#4E6231] dark:text-[#A5C178]">
                {heroT.chartWeeklyGain(weeklyXpGain)}
              </span>
              <span aria-hidden="true" className="text-[#E4DFD2] dark:text-[#2A352F]">·</span>
              <span className="font-bold text-[#23201C] dark:text-slate-100">
                {heroT.chartTotal(progress.xp)}
              </span>
            </div>
          </div>

          <div className="w-full h-48 min-w-0">
            <ResponsiveContainer width="100%" height={192} minWidth={0}>
              <LineChart
                data={xpHistory}
                margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={gridColor}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: axisTextColor, fontSize: 12 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  domain={[
                    0,
                    (dataMax: number) =>
                      Math.max(100, Math.ceil((dataMax + 20) / 25) * 25),
                  ]}
                  tick={{ fill: axisTextColor, fontSize: 12 }}
                />
                <Tooltip
                  content={<XpChartTooltip heroT={heroT} />}
                  cursor={{ stroke: gridColor, strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeXp"
                  name="XP"
                  stroke={lineColor}
                  strokeWidth={2.5}
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
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#F7F9F2] dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4E6231] dark:text-[#A5C178]">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>{prT.srsCardTitle}</span>
            </div>
            <p className="font-display text-2xl font-extrabold text-[#23201C] dark:text-slate-100 tabular-nums">
              {dueItems.length} · {prT.statDueToday}
            </p>
            <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400 leading-relaxed">
              {prT.srsCardSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onGoToLearn}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5C723C] hover:bg-[#4E6231] text-white text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <span>{prT.srsReviewNow}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Achievements Section (with nested container stripped cleanly) */}
      <AchievementsSection
        language={language}
        achievements={achievements}
        progress={progress}
        desktopPermission={desktopPermission}
        onRequestDesktopPermission={onRequestDesktopPermission}
        onGoToLessons={onGoToLearn}
        onGoToQuiz={onGoToQuiz}
      />
    </section>
  );
}
