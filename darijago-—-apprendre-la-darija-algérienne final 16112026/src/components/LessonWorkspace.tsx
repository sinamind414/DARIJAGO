import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  AudioLines,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Flame,
  PenLine,
  Play,
  Send,
  Sparkles,
  Turtle,
  Volume2,
} from 'lucide-react';
import { ARABIZI_SOUNDS, CURRICULUM_MODULES } from '../data/curriculum';
import type {
  AppLanguage,
  DarijaPhrase,
  LearningModule,
  ReviewRating,
  UserProgressState,
} from '../types/darija';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { pickScript, type ScriptMode } from '../utils/scriptMode';
import { PROFILE_HINT, PROFILE_MODULE_ORDER, type LearnerProfile } from '../utils/positioningLogic';
import { classifyPhrasePriority, PRIORITY_LABEL } from '../utils/phrasePriority';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import { PHONETIC_MODAL_TRANSLATIONS } from '../i18n/phoneticModalTranslations';
import { getLocalizedModule, getLocalizedSound } from '../i18n/curriculumTranslations';
import {
  attachPhraseReviewDates,
  computeModuleProgress,
  computeNextPhraseReview,
  computeOverallProgress,
  getPhraseStatus,
  getPriorityReviewPhrases,
  getRelativeReviewDays,
  isDarijaAnswerMatch,
  isPhraseDueForReview,
  previewReviewIntervals,
} from '../utils/darijaLogic';
import { playDarijaPronunciation, stopAllAudio } from '../utils/audioPlayer';
import {
  OFFLINE_STATUS_UPDATED_EVENT,
  readOfflineLessonsFromIndexedDb,
} from '../utils/offlineIndexedDb';
import { stopWebSpeechPlayback } from '../utils/webSpeechPlayer';
import { OralRepetitionExercise } from './OralRepetitionExercise';
import { PhrasePhoneticModal } from './PhrasePhoneticModal';
import { PhrasePlayButton } from './PhrasePlayButton';
import { QuickReviewPanel } from './QuickReviewPanel';

interface LessonWorkspaceProps {
  language: AppLanguage;
  scriptMode?: ScriptMode;
  learnerProfile?: LearnerProfile | null;
  progress: UserProgressState;
  activeModuleId: string;
  activePhraseId: string;
  onSelectModule: (moduleId: string) => void;
  onSelectPhrase: (phraseId: string) => void;
  onJumpToPhrase: (moduleId: string, phraseId: string) => void;
  onToggleMastery: (phraseId: string) => void;
  onRecordPractice: (phraseId: string) => void;
  onRatePhraseReview: (phraseId: string, rating: ReviewRating) => void;
  onQuickReviewMastered?: (phraseId: string) => void;
  onQuickReviewForReview?: (phraseId: string) => void;
}

export function LessonWorkspace({
  language,
  scriptMode = 'arabizi',
  learnerProfile = null,
  progress,
  activeModuleId,
  activePhraseId,
  onSelectModule,
  onSelectPhrase,
  onJumpToPhrase,
  onToggleMastery,
  onRecordPractice,
  onRatePhraseReview,
  onQuickReviewMastered,
  onQuickReviewForReview,
}: LessonWorkspaceProps) {
  const t = UI_TRANSLATIONS[language].lessons;
  const expT = EXPERIENCE_TRANSLATIONS[language];
  const pt = PHONETIC_MODAL_TRANSLATIONS[language];

  const [offlineModules, setOfflineModules] = useState<LearningModule[] | null>(null);

  useEffect(() => {
    let active = true;
    const loadFromIdb = async () => {
      const cached = await readOfflineLessonsFromIndexedDb(language);
      if (active) setOfflineModules(cached);
    };
    void loadFromIdb();
    const handler = () => {
      void loadFromIdb();
    };
    window.addEventListener(OFFLINE_STATUS_UPDATED_EVENT, handler);
    return () => {
      active = false;
      window.removeEventListener(OFFLINE_STATUS_UPDATED_EVENT, handler);
    };
  }, [language]);

  const baseModules = offlineModules ?? CURRICULUM_MODULES.map((m) => getLocalizedModule(m, language));
  const modulesWithDates = baseModules.map((localized) => ({
    ...localized,
    phrases: attachPhraseReviewDates(localized.phrases, progress),
  }));
  // Ordre recommande selon le profil de positionnement (R5).
  const preferredOrder = learnerProfile ? PROFILE_MODULE_ORDER[learnerProfile] : null;
  const localizedModules = preferredOrder
    ? [...modulesWithDates].sort((a, b) => {
        const ia = preferredOrder.indexOf(a.id);
        const ib = preferredOrder.indexOf(b.id);
        return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
      })
    : modulesWithDates;
  const localizedSounds = ARABIZI_SOUNDS.map((s) =>
    getLocalizedSound(s, language)
  );

  const allLocalizedPhrases = localizedModules.flatMap((m) => m.phrases);
  const overall = computeOverallProgress(allLocalizedPhrases, progress);

  const activeModule =
    localizedModules.find((m) => m.id === activeModuleId) ?? localizedModules[0];
  const phraseIndex = Math.max(
    0,
    activeModule.phrases.findIndex((p) => p.id === activePhraseId)
  );
  const currentPhrase: DarijaPhrase =
    activeModule.phrases[phraseIndex] ?? activeModule.phrases[0];

  const [learnMode, setLearnMode] = useState<'guided' | 'quick-review'>('guided');
  const [playingMode, setPlayingMode] = useState<'normal' | 'slow' | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showPhonetic, setShowPhonetic] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [practiceInput, setPracticeInput] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [phoneticModalPhrase, setPhoneticModalPhrase] =
    useState<DarijaPhrase | null>(null);

  useEffect(() => {
    return () => {
      stopWebSpeechPlayback();
    };
  }, []);

  const isMastered = progress.masteredIds.includes(currentPhrase.id);
  const moduleStats = computeModuleProgress(activeModule, progress);
  const currentReviewState = progress.phraseReviews[currentPhrase.id];
  const intervalPreviews = previewReviewIntervals(currentReviewState);
  const { dueItems, upcomingItems } = getPriorityReviewPhrases(
    localizedModules,
    progress
  );
  const currentIsDue = isPhraseDueForReview(currentPhrase);

  const formatReviewSchedule = (nextReviewDate: string): string => {
    const days = getRelativeReviewDays(nextReviewDate);
    if (days < 0) return t.srsOverdue(Math.abs(days));
    if (days === 0) return t.srsDueToday;
    if (days === 1) return t.srsTomorrow;
    return t.srsInDays(days);
  };

  const formatIntervalPreview = (days: number): string => {
    if (days <= 0) return t.srsIntervalToday;
    return t.srsIntervalDays(days);
  };

  const resetPracticeState = () => {
    setPracticeInput('');
    setPracticeFeedback(null);
    setReviewFeedback(null);
  };

  const handleRateRecall = (rating: ReviewRating) => {
    const projected = computeNextPhraseReview(currentReviewState, rating);
    onRatePhraseReview(currentPhrase.id, rating);
    setReviewFeedback(
      t.srsRatedFeedback(formatReviewSchedule(projected.nextReviewDate), 5)
    );
  };

  const handleNavigatePhrase = (direction: -1 | 1) => {
    const nextIdx = phraseIndex + direction;
    if (nextIdx >= 0 && nextIdx < activeModule.phrases.length) {
      onSelectPhrase(activeModule.phrases[nextIdx].id);
      resetPracticeState();
    }
  };

  const handlePlay = (slow: boolean) => {
    void playDarijaPronunciation({
      textArabic: currentPhrase.darijaArabic,
      textLatin: currentPhrase.darijaLatin,
      phoneticFrench: currentPhrase.phoneticFrench,
      slow,
      language,
      onStart: () => setPlayingMode(slow ? 'slow' : 'normal'),
      onEnd: () => setPlayingMode(null),
    });
  };

  const handlePlayWord = (arabic: string, latin: string) => {
    void playDarijaPronunciation({
      textArabic: arabic,
      textLatin: latin,
      slow: true,
      language,
    });
  };

  const handleCheckTyping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceInput.trim()) {
      setPracticeFeedback({
        type: 'error',
        message: t.emptyInputError(currentPhrase.acceptedAnswers[0]),
      });
      return;
    }

    const matched = isDarijaAnswerMatch(practiceInput, currentPhrase);
    if (matched) {
      onRecordPractice(currentPhrase.id);
      setPracticeFeedback({
        type: 'success',
        message: t.typingSuccess(currentPhrase.darijaLatin),
      });
    } else {
      setPracticeFeedback({
        type: 'error',
        message: t.typingError(
          currentPhrase.darijaLatin,
          currentPhrase.acceptedAnswers[0]
        ),
      });
    }
  };

  return (
    <section
      id="lesson-workspace"
      aria-label={t.sectionAria}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6"
    >
      {/* Accroche de profil (positionnement R5) */}
      {learnerProfile && (
        <div
          data-testid="profile-hint"
          className="rounded-xl border border-[#D7E0C8] dark:border-[#2A352F] bg-[#F0F5E9] dark:bg-[#1D2622] px-4 py-2.5 text-sm text-[#8C2F18] dark:text-[#E8A184]"
        >
          {PROFILE_HINT[learnerProfile]}
        </div>
      )}

      {/* Greeting Header Strip (MyDialect style) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#23201C] dark:text-slate-50 tracking-tight">
            {expT.learn.greeting} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400 tabular-nums mt-0.5">
            {expT.learn.learnedCount(overall.mastered, overall.total)}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] text-xs font-bold text-[#23201C] dark:text-slate-100 tabular-nums shadow-xs">
            <Flame className="w-3.5 h-3.5 text-[#C68335]" aria-hidden="true" />
            <span>{progress.streak}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowUnitPicker((v) => !v)}
            aria-expanded={showUnitPicker}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] text-xs font-semibold text-[#8C2F18] dark:text-[#E8A184] hover:border-[#B7410E] shadow-xs cursor-pointer"
          >
            <span
              aria-hidden="true"
              className="w-4 h-4 rounded-full overflow-hidden border border-[#E4DFD2] dark:border-[#2A352F] inline-flex shrink-0"
            >
              <span className="w-1/2 h-full bg-[#0E7C47]" />
              <span className="w-1/2 h-full bg-white relative flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D92B22] -ml-1" />
              </span>
            </span>
            <span>{expT.dialectBadge}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-75" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mode Switcher: Guided Lesson vs Quick Review */}
      <div
        role="tablist"
        aria-label={t.sectionAria}
        className="inline-flex items-center bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-1 gap-1 shadow-xs"
      >
        <button
          type="button"
          role="tab"
          data-testid="learn-mode-guided"
          aria-selected={learnMode === 'guided'}
          onClick={() => setLearnMode('guided')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            learnMode === 'guided'
              ? 'bg-[#B7410E] dark:bg-[#8C2F18] text-white'
              : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{expT.learn.modeGuided}</span>
        </button>

        <button
          type="button"
          role="tab"
          data-testid="learn-mode-quick-review"
          aria-selected={learnMode === 'quick-review'}
          onClick={() => {
            setShowUnitPicker(false);
            setLearnMode('quick-review');
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            learnMode === 'quick-review'
              ? 'bg-[#9E621E] text-white'
              : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{expT.learn.modeQuickReview}</span>
        </button>
      </div>

      {/* Quick Inline Unit Switcher Drawer (especially helpful on mobile) */}
      {learnMode === 'guided' && showUnitPicker && (
        <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#686259] dark:text-slate-400">
              {t.unitsTitle}
            </p>
            <button
              type="button"
              onClick={() => setShowUnitPicker(false)}
              className="text-xs font-semibold text-[#B7410E] dark:text-[#E8A184] cursor-pointer"
            >
              {expT.learn.hideDetails}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {localizedModules.map((mod) => {
              const stats = computeModuleProgress(mod, progress);
              const isSelected = mod.id === activeModule.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => {
                    onSelectModule(mod.id);
                    resetPracticeState();
                    setShowUnitPicker(false);
                  }}
                  className={`text-left px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#B7410E] dark:bg-[#8C2F18] text-white border-[#B7410E]'
                      : 'bg-[#F5F1E8]/60 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E]'
                  }`}
                >
                  <span className="text-xs font-semibold truncate">
                    {mod.number}. {mod.title}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums shrink-0 opacity-85">
                    {stats.mastered}/{stats.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {learnMode === 'quick-review' ? (
        <QuickReviewPanel
          language={language}
          modules={localizedModules}
          progress={progress}
          onMarkMastered={(phraseId) => {
            if (onQuickReviewMastered) {
              onQuickReviewMastered(phraseId);
            } else if (!progress.masteredIds.includes(phraseId)) {
              onToggleMastery(phraseId);
            }
          }}
          onMarkForReview={(phraseId) => {
            if (onQuickReviewForReview) {
              onQuickReviewForReview(phraseId);
            } else {
              if (progress.masteredIds.includes(phraseId)) {
                onToggleMastery(phraseId);
              }
              onRatePhraseReview(phraseId, 'again');
            }
          }}
          onOpenPhonetic={(phrase) => setPhoneticModalPhrase(phrase)}
          onOpenInLesson={(moduleId, phraseId) => {
            onJumpToPhrase(moduleId, phraseId);
            resetPracticeState();
            setLearnMode('guided');
          }}
          onBeforeAudioPlay={() => {
            stopAllAudio();
            setPlayingMode(null);
          }}
        />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* LEFT / MAIN ZONE: Serene Flashcard + Progressive Details */}
        <div className="lg:col-span-8 space-y-5">
          {/* Session Counter + Prev/Next */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0 flex-1 text-xs text-[#686259] dark:text-slate-400">
              <span className="font-semibold text-[#8C2F18] dark:text-[#E8A184] whitespace-nowrap">
                {t.unitPrefix} {activeModule.number}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[150px] sm:max-w-none">
                {activeModule.title}
              </span>
              {currentPhrase.nextReviewDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span
                    data-testid="phrase-next-review"
                    className={
                      currentIsDue
                        ? 'text-[#C68335] dark:text-amber-400 font-semibold whitespace-nowrap'
                        : 'text-[#8C2F18] dark:text-[#E8A184] font-medium whitespace-nowrap'
                    }
                  >
                    {formatReviewSchedule(currentPhrase.nextReviewDate)}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleNavigatePhrase(-1)}
                disabled={phraseIndex === 0}
                aria-label={t.prev}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] text-[#23201C] dark:text-slate-200 hover:border-[#B7410E] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="text-xs font-semibold text-[#686259] dark:text-slate-400 tabular-nums min-w-[3rem] text-center">
                {expT.learn.sessionCounter(phraseIndex + 1, activeModule.phrases.length)}
              </span>
              <button
                type="button"
                onClick={() => handleNavigatePhrase(1)}
                disabled={phraseIndex === activeModule.phrases.length - 1}
                aria-label={t.next}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] text-[#23201C] dark:text-slate-200 hover:border-[#B7410E] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Centered Serene Flashcard matching Screenshot 1 */}
          <div className="bg-[#F7F9F2] dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-3xl p-6 sm:p-10 shadow-sm space-y-7">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Circular Audio Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handlePlay(false)}
                  aria-label={expT.learn.playCardAria(currentPhrase.darijaLatin)}
                  className={`w-12 h-12 rounded-full inline-flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7410E] ${
                    playingMode === 'normal'
                      ? 'bg-[#B7410E] text-white'
                      : 'bg-[#E5EBD6] dark:bg-[#273322] text-[#8C2F18] dark:text-[#E8A184] hover:bg-[#DAE3C6] dark:hover:bg-[#31412A]'
                  }`}
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => handlePlay(true)}
                  aria-label={expT.learn.playSlowAria(currentPhrase.darijaLatin)}
                  title={t.slow}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${
                    playingMode === 'slow'
                      ? 'bg-[#B7410E] text-white border-[#B7410E]'
                      : 'bg-white/80 dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F] text-[#686259] dark:text-slate-300 hover:border-[#B7410E]'
                  }`}
                >
                  <Turtle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>0,75×</span>
                </button>
              </div>

              <div className="flex justify-center" data-testid="phrase-priority-badge">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#1D2622] text-[#686259] dark:text-slate-400">
                  {PRIORITY_LABEL[classifyPhrasePriority(currentPhrase, activeModule.id)]}
                </span>
              </div>

              {/* Ecriture principale (reglage global R1) + autres au toucher */}
              <div className="space-y-2 max-w-xl" data-testid="lesson-script-display">
                <h2
                  className={`font-display text-3xl sm:text-5xl font-extrabold text-[#23201C] dark:text-slate-50 tracking-tight leading-tight [text-wrap:balance] ${
                    scriptMode === 'arabic' ? 'font-arabic' : ''
                  }`}
                  lang={scriptMode === 'arabic' ? 'ar' : undefined}
                  dir={scriptMode === 'arabic' ? 'rtl' : undefined}
                  data-testid="lesson-primary-script"
                >
                  {pickScript(scriptMode, currentPhrase.darijaArabic, currentPhrase.darijaLatin, currentPhrase.phoneticFrench)}
                </h2>
                <p className="text-sm text-[#8E867B] dark:text-slate-400" dir="auto" data-testid="lesson-secondary-script">
                  {scriptMode === 'arabic'
                    ? currentPhrase.darijaLatin
                    : currentPhrase.darijaArabic}
                </p>
              </div>

              {/* Dialect Subtitle */}
              <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#B7410E] dark:text-[#E8A184]">
                {expT.dialectBadge}
              </p>

              {/* Meaning + Inline Audio Pill */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <p className="text-lg sm:text-xl font-semibold italic text-[#23201C] dark:text-slate-100">
                    “{currentPhrase.frenchMeaning}”
                  </p>
                  <PhrasePlayButton
                    phrase={currentPhrase}
                    language={language}
                    variant="pill"
                    playbackId={`hero-${currentPhrase.id}`}
                    testId="lesson-active-webspeech-play"
                    onBeforePlay={() => {
                      stopAllAudio();
                      setPlayingMode(null);
                    }}
                  />
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {showPhonetic && (
                    <p className="font-mono text-xs sm:text-sm text-[#8C2F18] dark:text-[#E8A184]">
                      [{currentPhrase.phoneticFrench}]
                    </p>
                  )}
                  <button
                    type="button"
                    data-testid="lesson-toggle-phonetic"
                    onClick={() => setShowPhonetic((v) => !v)}
                    aria-pressed={showPhonetic}
                    className="px-2 py-1 rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#1D2622] text-[11px] font-semibold text-[#686259] dark:text-slate-400 cursor-pointer"
                  >
                    {showPhonetic ? 'Masquer phonétique' : 'Phonétique FR'}
                  </button>
                  <button
                    type="button"
                    data-testid="lesson-phonetic-modal-btn"
                    onClick={() => setPhoneticModalPhrase(currentPhrase)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#1D2622] hover:border-[#B7410E] text-xs font-semibold text-[#8C2F18] dark:text-[#E8A184] cursor-pointer"
                  >
                    <AudioLines className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{pt.openButtonLabel}</span>
                  </button>
                </div>

                {currentPhrase.literalMeaning && (
                  <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400">
                    {t.literalLabel} {currentPhrase.literalMeaning}
                  </p>
                )}
              </div>
            </div>

            {/* Spaced Repetition Self-Rating + Mastery Bar */}
            <div
              data-testid="srs-rating-bar"
              className="pt-6 border-t border-[#E4DFD2] dark:border-[#2A352F] space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#23201C] dark:text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-[#B7410E] dark:text-[#E8A184]" aria-hidden="true" />
                  <span>{t.srsTitle}</span>
                  {currentPhrase.nextReviewDate && (
                    <span className="font-mono text-[#686259] dark:text-slate-400 font-normal tabular-nums">
                      · {t.srsNextReviewLabel(currentPhrase.nextReviewDate)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onToggleMastery(currentPhrase.id)}
                  aria-pressed={isMastered}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap shrink-0 cursor-pointer ${
                    isMastered
                      ? 'bg-[#B7410E] dark:bg-[#8C2F18] border-[#B7410E] text-white'
                      : 'bg-white dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-200 hover:border-[#B7410E]'
                  }`}
                >
                  {isMastered ? (
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>
                    {isMastered ? t.masteredBtn : t.markMasteredBtn}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    {
                      rating: 'again' as const,
                      label: t.srsRateAgain,
                      tone: 'border-red-200 dark:border-red-900/70 text-[#B9382C] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40',
                    },
                    {
                      rating: 'hard' as const,
                      label: t.srsRateHard,
                      tone: 'border-amber-200 dark:border-amber-900/70 text-[#A86B22] dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40',
                    },
                    {
                      rating: 'good' as const,
                      label: t.srsRateGood,
                      tone: 'border-[#C7D2B0] dark:border-[#3D4F30] text-[#8C2F18] dark:text-[#E8A184] hover:bg-[#E5EBD6]/50 dark:hover:bg-[#273322]',
                    },
                    {
                      rating: 'easy' as const,
                      label: t.srsRateEasy,
                      tone: 'border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-100 hover:bg-white dark:hover:bg-[#1D2622]',
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.rating}
                    type="button"
                    data-testid={`srs-rate-${item.rating}`}
                    onClick={() => handleRateRecall(item.rating)}
                    className={`px-3 py-2 rounded-xl border bg-white dark:bg-[#1D2622] text-xs font-semibold flex items-center justify-between gap-2 whitespace-nowrap cursor-pointer ${item.tone}`}
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-[11px] opacity-80 tabular-nums">
                      {formatIntervalPreview(intervalPreviews[item.rating])}
                    </span>
                  </button>
                ))}
              </div>

              {reviewFeedback && (
                <p
                  role="status"
                  className="text-xs font-medium text-[#8C2F18] dark:text-[#E8A184]"
                >
                  {reviewFeedback}
                </p>
              )}
            </div>
          </div>

          {/* Web Speech API Oral Repetition & Pronunciation Comparator */}
          <OralRepetitionExercise
            key={currentPhrase.id}
            phrase={currentPhrase}
            language={language}
            onPracticeSuccess={() => onRecordPractice(currentPhrase.id)}
          />

          {/* Collapsible Word Breakdown & Cultural Note */}
          <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              aria-expanded={showDetails}
              className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#F5F1E8]/50 dark:hover:bg-[#1D2622]"
            >
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#23201C] dark:text-slate-100">
                <BookOpen className="w-4 h-4 text-[#B7410E] dark:text-[#E8A184]" aria-hidden="true" />
                <span>{showDetails ? expT.learn.hideDetails : expT.learn.showDetails}</span>
              </span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4 text-[#686259] dark:text-slate-400" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#686259] dark:text-slate-400" aria-hidden="true" />
              )}
            </button>

            {showDetails && (
              <div className="px-5 pb-5 space-y-4 border-t border-[#EFECE4] dark:border-[#2A352F] pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentPhrase.breakdown.map((token, idx) => (
                    <button
                      key={`${token.darija}-${idx}`}
                      type="button"
                      onClick={() => handlePlayWord(token.arabic, token.darija)}
                      aria-label={`${token.darija} — ${token.french}`}
                      className="text-left p-3.5 rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E] cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-[#23201C] dark:text-slate-100 group-hover:text-[#8C2F18] dark:group-hover:text-[#E8A184]">
                          {token.darija}
                        </span>
                        <Volume2
                          className="w-3.5 h-3.5 text-[#686259] dark:text-slate-400 shrink-0"
                          aria-hidden="true"
                        />
                      </div>
                      <p
                        className="font-arabic text-base text-[#686259] dark:text-slate-300 mt-1"
                        lang="ar"
                        dir="rtl"
                      >
                        {token.arabic}
                      </p>
                      <p className="text-xs text-[#686259] dark:text-slate-400 mt-1">
                        {token.french}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-[#F7F9F2] dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F]">
                  <p className="text-xs font-bold text-[#8C2F18] dark:text-[#E8A184]">
                    {t.culturalTitle}
                  </p>
                  <p className="text-sm text-[#23201C] dark:text-slate-300 mt-1 leading-relaxed">
                    {currentPhrase.regionalNote}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Writing Practice */}
          <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPractice((v) => !v)}
              aria-expanded={showPractice}
              className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#F5F1E8]/50 dark:hover:bg-[#1D2622]"
            >
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#23201C] dark:text-slate-100">
                <PenLine className="w-4 h-4 text-[#C68335]" aria-hidden="true" />
                <span>{showPractice ? expT.learn.hidePractice : expT.learn.showPractice}</span>
              </span>
              {showPractice ? (
                <ChevronUp className="w-4 h-4 text-[#686259] dark:text-slate-400" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#686259] dark:text-slate-400" aria-hidden="true" />
              )}
            </button>

            {showPractice && (
              <div className="px-5 pb-5 pt-4 border-t border-[#EFECE4] dark:border-[#2A352F] space-y-4">
                <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400">
                  {t.practiceSubtitle}
                </p>

                <form
                  onSubmit={handleCheckTyping}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="flex-1">
                    <label htmlFor="darija-practice-input" className="sr-only">
                      {t.inputLabel}
                    </label>
                    <input
                      id="darija-practice-input"
                      type="text"
                      value={practiceInput}
                      onChange={(e) => setPracticeInput(e.target.value)}
                      placeholder={t.inputPlaceholder(currentPhrase.acceptedAnswers[0])}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/40 dark:bg-[#0E1311] text-[#23201C] dark:text-slate-100 placeholder:text-[#8E867B] focus:outline-none focus:ring-2 focus:ring-[#B7410E]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#B7410E] hover:bg-[#8C2F18] rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>{t.verify}</span>
                  </button>
                </form>

                {practiceFeedback && (
                  <div
                    role="status"
                    className={`p-3.5 rounded-xl border text-sm font-medium ${
                      practiceFeedback.type === 'success'
                        ? 'bg-[#F7F9F2] dark:bg-[#202B1E] border-[#C7D2B0] dark:border-[#3D4F30] text-[#23201C] dark:text-emerald-100'
                        : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
                    }`}
                  >
                    <span>
                      {practiceFeedback.type === 'success' ? t.validPrefix : t.errorPrefix}
                    </span>
                    <span>{practiceFeedback.message}</span>
                    {practiceFeedback.type === 'error' && (
                      <span className="block mt-2 text-xs font-normal opacity-80">
                        🔁 Réécoutez la phrase (▶ ou 0,75×), comparez avec votre saisie, puis réessayez. Une variante de votre région peut être valide : signalez-la en relecture native.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ZONE: Priority Reviews, Unit Selector, Phrase List & Quick Arabizi */}
        <aside aria-label={t.unitsTitle} className="lg:col-span-4 space-y-5">
          {/* Priority Spaced Repetition Reviews */}
          <div
            data-testid="priority-review-panel"
            className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-base font-bold text-[#23201C] dark:text-slate-100">
                {t.priorityTitle}
              </h3>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums shrink-0 ${
                  dueItems.length > 0
                    ? 'text-[#C68335] dark:text-amber-400'
                    : 'text-[#8C2F18] dark:text-[#E8A184]'
                }`}
              >
                {dueItems.length > 0 ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.priorityDueCount(dueItems.length)}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.priorityCaughtUp}</span>
                  </>
                )}
              </span>
            </div>

            {dueItems.length > 0 ? (
              <div className="space-y-2.5">
                <ul className="space-y-1.5">
                  {dueItems.slice(0, 4).map((item) => {
                    const isActive = item.phrase.id === currentPhrase.id;
                    return (
                      <li key={item.phrase.id} className="flex items-center gap-1.5">
                        <button
                          type="button"
                          data-testid={`priority-item-${item.phrase.id}`}
                          onClick={() => {
                            onJumpToPhrase(item.moduleId, item.phrase.id);
                            resetPracticeState();
                          }}
                          className={`flex-1 min-w-0 text-left px-3 py-2 rounded-xl border cursor-pointer flex items-center justify-between gap-2.5 ${
                            isActive
                              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-[#C68335]'
                              : 'bg-[#F5F1E8]/60 dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#C68335]'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#23201C] dark:text-slate-100 truncate">
                              {item.phrase.darijaLatin}
                            </p>
                            <p className="text-xs text-[#686259] dark:text-slate-400 truncate">
                              {item.moduleNumber} · {item.phrase.frenchMeaning}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-[#C68335] dark:text-amber-400 whitespace-nowrap shrink-0 tabular-nums">
                            {item.phrase.nextReviewDate
                              ? formatReviewSchedule(item.phrase.nextReviewDate)
                              : t.srsDueToday}
                          </span>
                        </button>
                        <PhrasePlayButton
                          phrase={item.phrase}
                          language={language}
                          playbackId={`priority-${item.phrase.id}`}
                          testId={`lesson-priority-play-${item.phrase.id}`}
                          onBeforePlay={() => {
                            stopAllAudio();
                            setPlayingMode(null);
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  data-testid="review-top-priority-btn"
                  onClick={() => {
                    const top = dueItems[0];
                    onJumpToPhrase(top.moduleId, top.phrase.id);
                    resetPracticeState();
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#C68335] hover:bg-[#B2732B] rounded-xl cursor-pointer"
                >
                  <span>{t.priorityReviewNextBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : upcomingItems.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#686259] dark:text-slate-400">
                  {t.priorityUpcomingTitle}
                </p>
                <ul className="space-y-1.5">
                  {upcomingItems.slice(0, 3).map((item) => (
                    <li key={item.phrase.id} className="flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid={`priority-item-${item.phrase.id}`}
                        onClick={() => {
                          onJumpToPhrase(item.moduleId, item.phrase.id);
                          resetPracticeState();
                        }}
                        className="flex-1 min-w-0 text-left px-3 py-2 rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/60 dark:bg-[#1D2622] hover:border-[#B7410E] cursor-pointer flex items-center justify-between gap-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#23201C] dark:text-slate-100 truncate">
                            {item.phrase.darijaLatin}
                          </p>
                          <p className="text-xs text-[#686259] dark:text-slate-400 truncate">
                            {item.moduleNumber} · {item.phrase.frenchMeaning}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-[#8C2F18] dark:text-[#E8A184] whitespace-nowrap shrink-0 tabular-nums">
                          {item.phrase.nextReviewDate
                            ? formatReviewSchedule(item.phrase.nextReviewDate)
                            : ''}
                        </span>
                      </button>
                      <PhrasePlayButton
                        phrase={item.phrase}
                        language={language}
                        playbackId={`priority-${item.phrase.id}`}
                        testId={`lesson-priority-play-${item.phrase.id}`}
                        onBeforePlay={() => {
                          stopAllAudio();
                          setPlayingMode(null);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-1 text-xs text-[#686259] dark:text-slate-400">
                <p className="font-semibold text-[#23201C] dark:text-slate-200">
                  {t.priorityEmptyTitle}
                </p>
                <p className="leading-relaxed">{t.priorityEmptyHint}</p>
              </div>
            )}
          </div>

          {/* Active Module Phrase Checklist */}
          <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <h3 className="font-display font-bold text-[#23201C] dark:text-slate-100">
                  {t.unitPhrasesTitle(activeModule.number)}
                </h3>
                <span className="text-xs font-semibold text-[#8C2F18] dark:text-[#E8A184] tabular-nums">
                  {moduleStats.percent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#EFECE4] dark:bg-[#2A352F] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B7410E] dark:bg-[#E8A184] transition-transform duration-200 origin-left"
                  style={{ width: `${moduleStats.percent}%` }}
                />
              </div>
            </div>

            <ul className="space-y-1.5">
              {activeModule.phrases.map((phrase, idx) => {
                const status = getPhraseStatus(phrase.id, progress);
                const active = phrase.id === currentPhrase.id;
                const due = isPhraseDueForReview(phrase);
                return (
                  <li key={phrase.id}>
                    <div
                      className={`w-full px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                        active
                          ? 'bg-[#F7F9F2] dark:bg-[#1D2622] border-[#B7410E]'
                          : 'bg-white dark:bg-[#171E1B] border-transparent hover:bg-[#F5F1E8]/60 dark:hover:bg-[#1D2622] hover:border-[#E4DFD2] dark:hover:border-[#2A352F]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPhrase(phrase.id);
                          resetPracticeState();
                        }}
                        className="flex-1 min-w-0 text-left cursor-pointer flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#23201C] dark:text-slate-100 truncate">
                            {idx + 1}. {phrase.darijaLatin}
                          </p>
                          <p className="text-xs text-[#686259] dark:text-slate-400 truncate">
                            {phrase.frenchMeaning}
                          </p>
                          {phrase.nextReviewDate && (
                            <p
                              className={`text-[11px] mt-0.5 tabular-nums ${
                                due
                                  ? 'text-[#C68335] dark:text-amber-400 font-semibold'
                                  : 'text-[#8E867B] dark:text-slate-500'
                              }`}
                            >
                              {formatReviewSchedule(phrase.nextReviewDate)}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium shrink-0 mt-0.5 ${
                            status === 'mastered'
                              ? 'text-[#8C2F18] dark:text-[#E8A184]'
                              : status === 'learning'
                                ? 'text-[#C68335] dark:text-amber-400'
                                : 'text-[#8E867B] dark:text-slate-500'
                          }`}
                        >
                          {status === 'mastered'
                            ? t.statusMastered
                            : status === 'learning'
                              ? t.statusLearning
                              : t.statusNew}
                        </span>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <PhrasePlayButton
                          phrase={phrase}
                          language={language}
                          playbackId={`list-${phrase.id}`}
                          testId={`lesson-list-play-${phrase.id}`}
                          onBeforePlay={() => {
                            stopAllAudio();
                            setPlayingMode(null);
                          }}
                        />

                        <button
                          type="button"
                          data-testid={`lesson-list-phonetic-${phrase.id}`}
                          onClick={() => setPhoneticModalPhrase(phrase)}
                          aria-label={pt.openItemAria(phrase.darijaLatin)}
                          title={pt.openButtonShort}
                          className="w-7 h-7 rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/70 dark:bg-[#171E1B] text-[#8C2F18] dark:text-[#E8A184] hover:border-[#B7410E] inline-flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <AudioLines className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Arabizi Key */}
          <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 space-y-3">
            <h3 className="font-display text-sm font-bold text-[#23201C] dark:text-slate-100">
              {t.arabiziQuickTitle}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {localizedSounds.slice(0, 3).map((s) => (
                <div
                  key={s.symbol}
                  className="p-2.5 rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] text-center"
                >
                  <p className="font-mono text-base font-bold text-[#C68335]">
                    {s.symbol}
                  </p>
                  <p className="font-arabic text-base text-[#23201C] dark:text-slate-100" lang="ar">
                    {s.arabicLetter}
                  </p>
                  <p className="text-xs text-[#686259] dark:text-slate-400 truncate">
                    {s.exampleDarija}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      )}

      <PhrasePhoneticModal
        phrase={phoneticModalPhrase}
        language={language}
        onClose={() => setPhoneticModalPhrase(null)}
      />
    </section>
  );
}
