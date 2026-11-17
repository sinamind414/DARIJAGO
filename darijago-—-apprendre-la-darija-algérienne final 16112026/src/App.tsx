import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CURRICULUM_MODULES } from './data/curriculum';
import type {
  AppLanguage,
  ReviewRating,
  UserProgressState,
  WorkspaceTab,
} from './types/darija';
import {
  LANGUAGE_STORAGE_KEY,
  UI_TRANSLATIONS,
  parseAppLanguage,
} from './i18n/translations';
import { EXPERIENCE_TRANSLATIONS } from './i18n/experienceTranslations';
import {
  PROGRESS_STORAGE_KEY,
  buildLast7DaysXpSeries,
  computeDailyGoalStatus,
  evaluateAchievements,
  markPhrasePracticed,
  markStoryRead,
  parseProgressState,
  recordBonusXp,
  recordDialogueTurn,
  recordPhraseReview,
  recordQuizAnswerStreak,
  recordQuizResult,
  setDailyXpGoal,
  togglePhraseMastery,
} from './utils/darijaLogic';
import {
  claimDailyChallengeReward,
  generateDailyChallenges,
  recordDailyVerbStudy,
  type DailyChallengeActionTarget,
} from './utils/dailyChallengesLogic';
import {
  markQuickReviewForReview,
  markQuickReviewMastered,
} from './utils/quickReviewLogic';
import {
  dismissToast,
  enqueueToast,
  getDesktopNotificationPermission,
  requestDesktopNotificationPermission,
  triggerDesktopNotification,
  type AppToast,
  type DesktopNotificationPermission,
} from './utils/notifications';
import { StartupLanguageScreen } from './components/StartupLanguageScreen';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { LessonWorkspace } from './components/LessonWorkspace';
import { ParcoursSection, type ParcoursSubTab } from './components/ParcoursSection';
import { DictionnaireSection } from './components/DictionnaireSection';
import { QuizHubSection } from './components/QuizHubSection';
import { ProgresSection } from './components/ProgresSection';
import { ProfilSection } from './components/ProfilSection';
import { ToastContainer } from './components/ToastContainer';

const THEME_STORAGE_KEY = 'darijago_theme_v1';

function isAutostartEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('autostart') === '1';
}

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function getStoredLanguage(): AppLanguage | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseAppLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);
  const [language, setLanguage] = useState<AppLanguage>(
    () => getStoredLanguage() ?? 'fr'
  );
  const [hasConfirmedLanguage, setHasConfirmedLanguage] = useState<boolean>(
    () => Boolean(getStoredLanguage()) || isAutostartEnabled()
  );
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('apprendre');
  const [activeModuleId, setActiveModuleId] = useState<string>(
    CURRICULUM_MODULES[0].id
  );
  const [activePhraseId, setActivePhraseId] = useState<string>(
    CURRICULUM_MODULES[0].phrases[0].id
  );
  const [progress, setProgress] = useState<UserProgressState>(() => {
    if (typeof window === 'undefined') return parseProgressState(null);
    return parseProgressState(window.localStorage.getItem(PROGRESS_STORAGE_KEY));
  });
  const [toasts, setToasts] = useState<AppToast[]>([]);
  const [desktopPermission, setDesktopPermission] =
    useState<DesktopNotificationPermission>(getDesktopNotificationPermission);
  const [pendingGoalCelebration, setPendingGoalCelebration] =
    useState<boolean>(false);
  const [parcoursTargetSubTab, setParcoursTargetSubTab] = useState<{
    tab: ParcoursSubTab;
    nonce: number;
  } | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore storage quota errors
    }
  }, [isDark]);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hans' : language;
    document.title = UI_TRANSLATIONS[language].pageTitle;
  }, [language]);

  const achievements = useMemo(
    () => evaluateAchievements(progress, CURRICULUM_MODULES, language),
    [progress, language]
  );

  const prevUnlockedIdsRef = useRef<Set<string>>(
    new Set(achievements.filter((a) => a.unlocked).map((a) => a.id))
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify(progress)
      );
    } catch {
      // ignore storage quota errors
    }
  }, [progress]);

  useEffect(() => {
    const currentUnlocked = achievements.filter((a) => a.unlocked);
    const newlyUnlockedItems = currentUnlocked.filter(
      (a) => !prevUnlockedIdsRef.current.has(a.id)
    );
    prevUnlockedIdsRef.current = new Set(currentUnlocked.map((a) => a.id));

    if (newlyUnlockedItems.length > 0) {
      const notifT = UI_TRANSLATIONS[language].notifications;
      setToasts((prev) => {
        let next = prev;
        for (const item of newlyUnlockedItems) {
          next = enqueueToast(next, {
            id: `ach-${item.id}`,
            kind: 'achievement',
            title: notifT.achievementTitle(item.title),
            description: item.description,
            actionLabel: notifT.achievementAction,
          });
        }
        return next;
      });
      for (const item of newlyUnlockedItems) {
        triggerDesktopNotification(
          notifT.achievementTitle(item.title),
          item.description,
          `darijago-ach-${item.id}`
        );
      }
    }
  }, [achievements, language]);

  const hasStarted = progress.xp > 0 || progress.masteredIds.length > 0;
  const xpHistory = useMemo(
    () => buildLast7DaysXpSeries(progress, new Date(), language),
    [progress, language]
  );
  const dailyGoalStatus = useMemo(
    () => computeDailyGoalStatus(progress),
    [progress]
  );
  const dailyChallenges = useMemo(
    () => generateDailyChallenges(progress, language),
    [progress, language]
  );

  const prevDailyGoalReachedRef = useRef<boolean>(dailyGoalStatus.reached);
  useEffect(() => {
    if (!prevDailyGoalReachedRef.current && dailyGoalStatus.reached) {
      setPendingGoalCelebration(true);
      const notifT = UI_TRANSLATIONS[language].notifications;
      const body = notifT.dailyGoalBody(
        dailyGoalStatus.todayXp,
        dailyGoalStatus.goal
      );
      setToasts((prev) =>
        enqueueToast(prev, {
          id: 'daily-goal-reached',
          kind: 'daily-goal',
          title: notifT.dailyGoalTitle,
          description: body,
          actionLabel: notifT.dailyGoalAction,
        })
      );
      triggerDesktopNotification(
        notifT.dailyGoalTitle,
        body,
        'darijago-daily-goal'
      );
    }
    prevDailyGoalReachedRef.current = dailyGoalStatus.reached;
  }, [
    dailyGoalStatus.reached,
    dailyGoalStatus.todayXp,
    dailyGoalStatus.goal,
    language,
  ]);

  const handleSelectModule = (moduleId: string) => {
    setActiveModuleId(moduleId);
    const mod = CURRICULUM_MODULES.find((m) => m.id === moduleId);
    if (mod && mod.phrases.length > 0) {
      setActivePhraseId(mod.phrases[0].id);
    }
  };

  const handleSelectUnitForLearn = (moduleId: string) => {
    handleSelectModule(moduleId);
    setActiveTab('apprendre');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToPhrase = (moduleId: string, phraseId: string) => {
    setActiveModuleId(moduleId);
    setActivePhraseId(phraseId);
  };

  const handleToggleMastery = (phraseId: string) => {
    setProgress((prev) => togglePhraseMastery(prev, phraseId));
  };

  const handleRecordPractice = (phraseId: string) => {
    setProgress((prev) => markPhrasePracticed(prev, phraseId, 10));
  };

  const handleRatePhraseReview = (phraseId: string, rating: ReviewRating) => {
    setProgress((prev) => recordPhraseReview(prev, phraseId, rating, 5));
  };

  const handleQuickReviewMastered = (phraseId: string) => {
    setProgress((prev) => markQuickReviewMastered(prev, phraseId));
  };

  const handleQuickReviewForReview = (phraseId: string) => {
    setProgress((prev) => markQuickReviewForReview(prev, phraseId));
  };

  const handleMarkStoryRead = (storyId: string, xpReward: number) => {
    setProgress((prev) => markStoryRead(prev, storyId, xpReward));
  };

  const handleDialogueTurn = (amount: number) => {
    setProgress((prev) => recordDialogueTurn(prev, amount));
  };

  const handleStudyVerb = useCallback((verbId: string) => {
    setProgress((prev) => recordDailyVerbStudy(prev, verbId, 0));
  }, []);

  const handleConjugationXp = useCallback((amount: number, verbId?: string) => {
    setProgress((prev) =>
      verbId
        ? recordDailyVerbStudy(prev, verbId, amount)
        : recordBonusXp(prev, amount)
    );
  }, []);

  const handleClaimDailyChallenge = (challengeId: string) => {
    const { progress: nextProgress, claimedChallenge } =
      claimDailyChallengeReward(progress, challengeId);
    if (!claimedChallenge) return;
    setProgress(nextProgress);
    const localized =
      dailyChallenges.find((c) => c.id === challengeId) ?? claimedChallenge;
    const dcT = EXPERIENCE_TRANSLATIONS[language].dailyChallenges;
    setToasts((prev) =>
      enqueueToast(prev, {
        id: `dc-${challengeId}`,
        kind: 'daily-challenge',
        title: dcT.toastTitle(localized.title),
        description: dcT.toastBody(localized.bonusXp),
        actionLabel: dcT.toastAction,
      })
    );
  };

  const handleChallengeActionNavigate = (target: DailyChallengeActionTarget) => {
    if (target === 'apprendre') {
      setActiveTab('apprendre');
    } else if (target === 'quiz') {
      setActiveTab('quiz');
    } else if (target === 'dictionnaire-verbs') {
      setActiveTab('dictionnaire');
    } else {
      const subMap: Record<
        'parcours-conjugation' | 'parcours-dialogues' | 'parcours-stories',
        ParcoursSubTab
      > = {
        'parcours-conjugation': 'conjugation',
        'parcours-dialogues': 'dialogues',
        'parcours-stories': 'stories',
      };
      setParcoursTargetSubTab({
        tab: subMap[target],
        nonce: Date.now(),
      });
      setActiveTab('parcours');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizAnswer = (isCorrect: boolean, phraseId?: string) => {
    setProgress((prev) => {
      const withStreak = recordQuizAnswerStreak(prev, isCorrect);
      if (!phraseId) return withStreak;
      return recordPhraseReview(
        withStreak,
        phraseId,
        isCorrect ? 'good' : 'again',
        0
      );
    });
  };

  const handleQuizComplete = (correctCount: number, totalCount: number) => {
    setProgress((prev) => recordQuizResult(prev, correctCount, totalCount));
  };

  const handleStartLessons = () => {
    setActiveTab('apprendre');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetProgress = () => {
    const empty = parseProgressState(null);
    prevUnlockedIdsRef.current = new Set();
    prevDailyGoalReachedRef.current = false;
    setToasts([]);
    setPendingGoalCelebration(false);
    setProgress(empty);
  };

  const handleChangeDailyXpGoal = (goal: number) => {
    setProgress((prev) => setDailyXpGoal(prev, goal));
  };

  const handleGoalCelebrationShown = useCallback(() => {
    setPendingGoalCelebration(false);
  }, []);

  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => dismissToast(prev, id));
  }, []);

  const handleToastAction = useCallback((toast: AppToast) => {
    setToasts((prev) => dismissToast(prev, toast.id));
    if (
      toast.kind === 'achievement' ||
      toast.kind === 'daily-goal' ||
      toast.kind === 'daily-challenge'
    ) {
      setActiveTab('progres');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleRequestDesktopPermission = async () => {
    const perm = await requestDesktopNotificationPermission();
    setDesktopPermission(perm);
    if (perm === 'granted') {
      const notifT = UI_TRANSLATIONS[language].notifications;
      triggerDesktopNotification(
        notifT.desktopTestTitle,
        notifT.desktopTestBody,
        'darijago-enabled'
      );
    }
  };

  const persistLanguage = (nextLang: AppLanguage) => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
    } catch {
      // ignore storage quota errors
    }
  };

  const handleConfirmStartupLanguage = () => {
    persistLanguage(language);
    setHasConfirmedLanguage(true);
  };

  const handleChangeLanguage = (nextLang: AppLanguage) => {
    setLanguage(nextLang);
    persistLanguage(nextLang);
  };

  if (!hasConfirmedLanguage) {
    return (
      <StartupLanguageScreen
        language={language}
        isDark={isDark}
        onSelectLanguage={setLanguage}
        onConfirmStart={handleConfirmStartupLanguage}
        onToggleTheme={() => setIsDark((prev) => !prev)}
      />
    );
  }

  const t = UI_TRANSLATIONS[language];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] dark:bg-[#0E1311] text-[#23201C] dark:text-slate-100">
      <TopBar
        language={language}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onPrimaryAction={handleStartLessons}
        hasStarted={hasStarted}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        xp={progress.xp}
      />

      <main className="flex-1 pb-20 md:pb-8">
        {activeTab === 'apprendre' && (
          <LessonWorkspace
            language={language}
            progress={progress}
            activeModuleId={activeModuleId}
            activePhraseId={activePhraseId}
            onSelectModule={handleSelectModule}
            onSelectPhrase={setActivePhraseId}
            onJumpToPhrase={handleJumpToPhrase}
            onToggleMastery={handleToggleMastery}
            onRecordPractice={handleRecordPractice}
            onRatePhraseReview={handleRatePhraseReview}
            onQuickReviewMastered={handleQuickReviewMastered}
            onQuickReviewForReview={handleQuickReviewForReview}
          />
        )}

        {activeTab === 'parcours' && (
          <ParcoursSection
            language={language}
            progress={progress}
            requestedSubTab={parcoursTargetSubTab}
            onSelectUnitForLearn={handleSelectUnitForLearn}
            onMarkStoryRead={handleMarkStoryRead}
            onDialogueTurn={handleDialogueTurn}
            onConjugationXp={handleConjugationXp}
            onStudyVerb={handleStudyVerb}
          />
        )}

        {activeTab === 'dictionnaire' && (
          <DictionnaireSection
            language={language}
            onVerbStudied={handleStudyVerb}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizHubSection
            language={language}
            onQuizComplete={handleQuizComplete}
            onAnswerEvaluated={handleQuizAnswer}
            onGoToLearn={handleStartLessons}
          />
        )}

        {activeTab === 'progres' && (
          <ProgresSection
            language={language}
            progress={progress}
            achievements={achievements}
            dailyChallenges={dailyChallenges}
            todayXp={dailyGoalStatus.todayXp}
            dailyXpGoal={dailyGoalStatus.goal}
            pendingGoalCelebration={pendingGoalCelebration}
            xpHistory={xpHistory}
            isDark={isDark}
            desktopPermission={desktopPermission}
            onChangeDailyXpGoal={handleChangeDailyXpGoal}
            onGoalCelebrationShown={handleGoalCelebrationShown}
            onRequestDesktopPermission={handleRequestDesktopPermission}
            onClaimDailyChallenge={handleClaimDailyChallenge}
            onNavigateFromChallenge={handleChallengeActionNavigate}
            onGoToLearn={handleStartLessons}
            onGoToQuiz={() => setActiveTab('quiz')}
          />
        )}

        {activeTab === 'profil' && (
          <ProfilSection
            language={language}
            isDark={isDark}
            dailyXpGoal={dailyGoalStatus.goal}
            desktopPermission={desktopPermission}
            onChangeLanguage={handleChangeLanguage}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            onRequestDesktopPermission={handleRequestDesktopPermission}
            onOpenProgress={() => {
              setActiveTab('progres');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>

      <footer className="hidden md:block bg-white dark:bg-[#171E1B] border-t border-[#E4DFD2] dark:border-[#2A352F] mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#686259] dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 font-display font-bold text-sm text-[#23201C] dark:text-slate-100">
              <img
                src="/assets/aistudio/Capture_d__cran_2026-11-16_113740_50d7c1bc.png"
                alt=""
                aria-hidden="true"
                className="h-7 w-13 rounded-md object-contain border border-[#E4DFD2] dark:border-[#2A352F] bg-white p-0.5 shrink-0"
              />
              <span>
                <span className="text-[#008643] dark:text-[#6EE7B7]">darija</span>
                <span className="text-[#DC291E] dark:text-[#FCA5A5] italic">GO</span>
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{t.footer.tagline}</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {(
              [
                ['apprendre', t.nav.apprendre],
                ['parcours', t.nav.parcours],
                ['dictionnaire', t.nav.dictionnaire],
                ['quiz', t.nav.quiz],
                ['progres', t.nav.progres],
                ['profil', t.nav.profil],
              ] as Array<[WorkspaceTab, string]>
            ).map(([tabId, label]) => (
              <button
                key={tabId}
                type="button"
                onClick={() => {
                  setActiveTab(tabId);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#23201C] dark:hover:text-slate-100 cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </footer>

      <BottomNav
        language={language}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <ToastContainer
        language={language}
        toasts={toasts}
        onDismiss={handleDismissToast}
        onAction={handleToastAction}
      />
    </div>
  );
}
