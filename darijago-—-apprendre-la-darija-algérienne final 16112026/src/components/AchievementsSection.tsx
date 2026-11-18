import { useState, useMemo } from 'react';
import { Award, Bell, BellOff, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import type {
  AchievementStatus,
  AppLanguage,
  UserProgressState,
} from '../types/darija';
import type { DesktopNotificationPermission } from '../utils/notifications';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { countUnlockedAchievements } from '../utils/darijaLogic';

interface AchievementsSectionProps {
  language: AppLanguage;
  achievements: AchievementStatus[];
  progress: UserProgressState;
  desktopPermission?: DesktopNotificationPermission;
  onRequestDesktopPermission?: () => void;
  onGoToLessons: () => void;
  onGoToQuiz: () => void;
}

type AchievementFilter = 'all' | 'unlocked' | 'locked';

export function AchievementsSection({
  language,
  achievements,
  progress,
  desktopPermission = 'unsupported',
  onRequestDesktopPermission,
  onGoToLessons,
  onGoToQuiz,
}: AchievementsSectionProps) {
  const t = UI_TRANSLATIONS[language].achievements;
  const notifT = UI_TRANSLATIONS[language].notifications;
  const [filter, setFilter] = useState<AchievementFilter>('all');

  const unlockedCount = useMemo(
    () => countUnlockedAchievements(achievements),
    [achievements]
  );
  const totalCount = achievements.length;
  const overallPercent =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = useMemo(() => {
    if (filter === 'unlocked') return achievements.filter((a) => a.unlocked);
    if (filter === 'locked') return achievements.filter((a) => !a.unlocked);
    return achievements;
  }, [achievements, filter]);

  return (
    <section
      aria-label={t.sectionAria}
      className="space-y-6"
    >
      {/* Header & Summary Card */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-7 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B7410E] dark:text-[#E8A184]">
              <Award className="w-4 h-4" aria-hidden="true" />
              <span>{t.kicker}</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#23201C] dark:text-slate-100 tracking-tight">
              {t.title}
            </h2>
            <p className="text-sm text-[#686259] dark:text-slate-400 max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div>
              <p className="text-xs text-[#686259] dark:text-slate-400">{t.unlockedStat}</p>
              <p className="text-2xl font-extrabold text-[#23201C] dark:text-slate-100 tabular-nums">
                {unlockedCount} / {totalCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#686259] dark:text-slate-400">{t.bestStreakStat}</p>
              <p className="text-2xl font-extrabold text-[#B7410E] dark:text-[#E8A184] tabular-nums">
                {progress.bestQuizStreak}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#686259] dark:text-slate-400">{t.totalXpStat}</p>
              <p className="text-2xl font-extrabold text-[#C68335] tabular-nums">
                {progress.xp} XP
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#686259] dark:text-slate-400">
            <span>{t.globalProgress}</span>
            <span className="tabular-nums font-semibold text-[#8C2F18] dark:text-[#E8A184]">
              {overallPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#EFECE4] dark:bg-[#2A352F] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B7410E] dark:bg-[#E8A184] transition-all duration-200"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label={t.filterAria}
          className="inline-flex items-center gap-1 p-1 bg-[#E9E4D8] dark:bg-[#171E1B] border border-[#DFD9CA] dark:border-[#2A352F] rounded-full self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white font-semibold shadow-xs'
                : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
            }`}
          >
            {t.filterAll(totalCount)}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'unlocked'}
            onClick={() => setFilter('unlocked')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white font-semibold shadow-xs'
                : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
            }`}
          >
            {t.filterUnlocked(unlockedCount)}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'locked'}
            onClick={() => setFilter('locked')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 cursor-pointer ${
              filter === 'locked'
                ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white font-semibold shadow-xs'
                : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
            }`}
          >
            {t.filterLocked(totalCount - unlockedCount)}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {desktopPermission !== 'unsupported' && onRequestDesktopPermission && (
            <button
              type="button"
              data-testid="desktop-notifications-button"
              onClick={onRequestDesktopPermission}
              disabled={desktopPermission === 'granted' || desktopPermission === 'denied'}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border whitespace-nowrap shrink-0 ${
                desktopPermission === 'granted'
                  ? 'bg-[#E5EBD6] dark:bg-[#273322] text-[#8C2F18] dark:text-[#E8A184] border-[#C7D2B0] dark:border-[#3D4F30] cursor-default'
                  : desktopPermission === 'denied'
                    ? 'bg-[#EFECE4] dark:bg-[#1D2622] text-[#8E867B] border-[#E4DFD2] dark:border-[#2A352F] cursor-not-allowed'
                    : 'bg-white dark:bg-[#171E1B] text-[#23201C] dark:text-slate-100 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E] cursor-pointer'
              }`}
            >
              {desktopPermission === 'denied' ? (
                <BellOff className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Bell className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>
                {desktopPermission === 'granted'
                  ? notifT.desktopEnabled
                  : desktopPermission === 'denied'
                    ? notifT.desktopBlocked
                    : notifT.desktopEnable}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onGoToLessons}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#23201C] dark:text-slate-100 bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E] rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{t.continueLessons}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onGoToQuiz}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#C68335] hover:bg-[#B2732B] rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{t.startQuiz}</span>
          </button>
        </div>
      </div>

      {/* Achievements Grid or Empty Filter State */}
      {filteredAchievements.length === 0 ? (
        <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-10 text-center space-y-3">
          <p className="text-base font-semibold text-[#23201C] dark:text-slate-100">
            {filter === 'unlocked'
              ? t.emptyUnlockedTitle
              : t.emptyLockedTitle}
          </p>
          <p className="text-sm text-[#686259] dark:text-slate-400">
            {filter === 'unlocked'
              ? t.emptyUnlockedHint
              : t.emptyLockedHint}
          </p>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#B7410E] rounded-xl hover:bg-[#8C2F18] cursor-pointer"
          >
            {t.showAll}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAchievements.map((item) => (
            <article
              key={item.id}
              data-testid={`achievement-card-${item.id}`}
              data-unlocked={item.unlocked ? 'true' : 'false'}
              className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 ${
                item.unlocked
                  ? 'bg-[#F7F9F2] dark:bg-[#171E1B] border-[#B7410E] dark:border-[#E8A184]'
                  : 'bg-white dark:bg-[#171E1B] border-[#E4DFD2] dark:border-[#2A352F]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-[#686259] dark:text-slate-400">
                    {item.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      item.unlocked ? 'text-[#8C2F18] dark:text-[#E8A184]' : 'text-[#686259] dark:text-slate-400'
                    }`}
                  >
                    {item.unlocked ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t.unlockedBadge}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t.inProgressBadge}</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-base font-bold text-[#23201C] dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#686259] dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#EFECE4] dark:border-[#2A352F]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#686259] dark:text-slate-400">{t.progressionLabel}</span>
                  <span className="font-mono font-semibold text-[#23201C] dark:text-slate-200 tabular-nums">
                    {item.current} / {item.target} {item.unitLabel}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#EFECE4] dark:bg-[#2A352F] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      item.unlocked ? 'bg-[#B7410E] dark:bg-[#E8A184]' : 'bg-[#B5ADA0] dark:bg-slate-600'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
