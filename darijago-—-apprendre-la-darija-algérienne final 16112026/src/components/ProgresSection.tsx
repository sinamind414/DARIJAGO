import { ArrowRight, BookOpenCheck, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { ALL_PHRASES, CURRICULUM_MODULES } from '../data/curriculum';
import type {
  AchievementStatus,
  AppLanguage,
  DailyXpPoint,
  UserProgressState,
} from '../types/darija';
import type { DesktopNotificationPermission } from '../utils/notifications';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import { getPriorityReviewPhrases } from '../utils/darijaLogic';
import type {
  DailyChallenge,
  DailyChallengeActionTarget,
} from '../utils/dailyChallengesLogic';
import { DailyXpGoalRing } from './DailyXpGoalRing';
import { DailyChallengesSection } from './DailyChallengesSection';
import { WeeklyXpChart } from './WeeklyXpChart';
import { AchievementsSection } from './AchievementsSection';

interface ProgresSectionProps {
  language: AppLanguage;
  progress: UserProgressState;
  achievements: AchievementStatus[];
  dailyChallenges: DailyChallenge[];
  todayXp: number;
  dailyXpGoal: number;
  pendingGoalCelebration: boolean;
  xpHistory: DailyXpPoint[];
  isDark: boolean;
  desktopPermission: DesktopNotificationPermission;
  onChangeDailyXpGoal: (goal: number) => void;
  onGoalCelebrationShown: () => void;
  onRequestDesktopPermission: () => void;
  onClaimDailyChallenge: (challengeId: string) => void;
  onNavigateFromChallenge: (target: DailyChallengeActionTarget) => void;
  onGoToLearn: () => void;
  onGoToQuiz: () => void;
}

export function ProgresSection({
  language,
  progress,
  achievements,
  dailyChallenges,
  todayXp,
  dailyXpGoal,
  pendingGoalCelebration,
  xpHistory,
  isDark,
  desktopPermission,
  onChangeDailyXpGoal,
  onGoalCelebrationShown,
  onRequestDesktopPermission,
  onClaimDailyChallenge,
  onNavigateFromChallenge,
  onGoToLearn,
  onGoToQuiz,
}: ProgresSectionProps) {
  const prT = EXPERIENCE_TRANSLATIONS[language].progres;

  const { dueItems, upcomingItems } = getPriorityReviewPhrases(
    CURRICULUM_MODULES,
    progress
  );

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

      {/* Daily Challenges (3 Daily Missions + Bonus XP) */}
      <DailyChallengesSection
        language={language}
        challenges={dailyChallenges}
        onClaimChallenge={onClaimDailyChallenge}
        onActionNavigate={onNavigateFromChallenge}
      />

      {/* 7-Day Weekly XP Progression Chart + SRS Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <WeeklyXpChart
          language={language}
          xpHistory={xpHistory}
          totalXp={progress.xp}
          dailyXpGoal={dailyXpGoal}
          isDark={isDark}
        />

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
