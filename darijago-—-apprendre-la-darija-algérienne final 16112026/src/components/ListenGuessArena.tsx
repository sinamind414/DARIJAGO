import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Ear,
  RotateCcw,
  Square,
  Turtle,
  Volume2,
  XCircle,
} from 'lucide-react';
import { ALL_PHRASES, CURRICULUM_MODULES } from '../data/curriculum';
import type { AppLanguage } from '../types/darija';
import { getLocalizedModule } from '../i18n/curriculumTranslations';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import {
  buildListenGuessDeck,
  computeListenGuessAccuracy,
  evaluateListenGuessChoice,
  type ListenGuessChoiceEvaluation,
  type ListenGuessEntry,
  type ListenGuessMode,
} from '../utils/listenGuessLogic';
import {
  getWebSpeechPlaybackSnapshot,
  startPhraseWebSpeechPlayback,
  stopWebSpeechPlayback,
  subscribeWebSpeechPlayback,
} from '../utils/webSpeechPlayer';

export type ListenGuessDisplayMode = 'both' | 'darija' | 'meaning';

interface ListenGuessArenaProps {
  language: AppLanguage;
  onSessionComplete: (correctCount: number, totalCount: number) => void;
  onAnswerEvaluated?: (isCorrect: boolean, phraseId: string) => void;
  onGoToLessons: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export function ListenGuessArena({
  language,
  onSessionComplete,
  onAnswerEvaluated,
  onGoToLessons,
}: ListenGuessArenaProps) {
  const t = EXPERIENCE_TRANSLATIONS[language].listenGuess;
  const localizedModules = useMemo(
    () => CURRICULUM_MODULES.map((m) => getLocalizedModule(m, language)),
    [language]
  );

  const [mode, setMode] = useState<ListenGuessMode>('mixed');
  const [displayMode, setDisplayMode] = useState<ListenGuessDisplayMode>('both');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [seed, setSeed] = useState<number>(1);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<ListenGuessChoiceEvaluation | null>(
    null
  );
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [playCount, setPlayCount] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);

  const playbackState = useSyncExternalStore(
    subscribeWebSpeechPlayback,
    getWebSpeechPlaybackSnapshot,
    getWebSpeechPlaybackSnapshot
  );

  useEffect(() => {
    return () => {
      stopWebSpeechPlayback();
    };
  }, []);

  const deck = useMemo(
    () =>
      buildListenGuessDeck(ALL_PHRASES, {
        mode,
        moduleFilter,
        seed,
        language,
        roundCount: 8,
        optionCount: 4,
      }),
    [mode, moduleFilter, seed, language]
  );

  const currentRound = deck[currentIdx] ?? deck[0];
  const target = currentRound?.target;

  const normalPlaybackId = target
    ? `listen-guess-normal-${seed}-${currentIdx}-${target.id}`
    : '';
  const slowPlaybackId = target
    ? `listen-guess-slow-${seed}-${currentIdx}-${target.id}`
    : '';

  const isPlayingNormal =
    Boolean(normalPlaybackId) && playbackState.activeId === normalPlaybackId;
  const isPlayingSlow =
    Boolean(slowPlaybackId) && playbackState.activeId === slowPlaybackId;
  const isPlayingAny = isPlayingNormal || isPlayingSlow;
  const activeProgress = isPlayingAny ? playbackState.progress : 0;

  const triggerSpeak = (item: ListenGuessEntry, playbackId: string, slow: boolean) => {
    setPlayCount((c) => c + 1);
    startPhraseWebSpeechPlayback({
      playbackId,
      darijaArabic: item.darijaArabic,
      darijaLatin: item.darijaLatin,
      phoneticFrench: item.phoneticFrench,
      slow,
      language,
    });
  };

  const resetSession = (
    nextMode: ListenGuessMode,
    nextModule: string,
    nextSeed: number,
    autoSpeakFirst = false
  ) => {
    stopWebSpeechPlayback();
    setMode(nextMode);
    setModuleFilter(nextModule);
    setSeed(nextSeed);
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setEvaluation(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setPlayCount(0);
    setFinished(false);

    if (autoSpeakFirst) {
      const nextDeck = buildListenGuessDeck(ALL_PHRASES, {
        mode: nextMode,
        moduleFilter: nextModule,
        seed: nextSeed,
        language,
        roundCount: 8,
        optionCount: 4,
      });
      const firstTarget = nextDeck[0]?.target;
      if (firstTarget) {
        triggerSpeak(
          firstTarget,
          `listen-guess-normal-${nextSeed}-0-${firstTarget.id}`,
          false
        );
      }
    }
  };

  const handleTogglePlay = (slow: boolean) => {
    if (!target) return;
    const targetPlaybackId = slow ? slowPlaybackId : normalPlaybackId;
    if (playbackState.activeId === targetPlaybackId) {
      stopWebSpeechPlayback();
      return;
    }
    triggerSpeak(target, targetPlaybackId, slow);
  };

  const handleSelectOption = (optionId: string) => {
    if (!currentRound || evaluation) return;
    const result = evaluateListenGuessChoice(currentRound, optionId);
    setSelectedOptionId(optionId);
    setEvaluation(result);
    onAnswerEvaluated?.(result.isCorrect, currentRound.target.phraseId);

    if (result.isCorrect) {
      setScore((s) => s + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (!currentRound) return;
    stopWebSpeechPlayback();

    if (currentIdx + 1 >= deck.length) {
      setFinished(true);
      onSessionComplete(score, deck.length);
      return;
    }

    const nextIdx = currentIdx + 1;
    const nextRound = deck[nextIdx];
    setCurrentIdx(nextIdx);
    setSelectedOptionId(null);
    setEvaluation(null);
    setPlayCount(0);

    if (nextRound?.target) {
      triggerSpeak(
        nextRound.target,
        `listen-guess-normal-${seed}-${nextIdx}-${nextRound.target.id}`,
        false
      );
    }
  };

  if (!currentRound || !target) return null;

  return (
    <section
      aria-label={t.sectionAria}
      data-testid="listen-guess-arena"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Setup & Mode Controls Card */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-[#23201C] dark:text-slate-100 flex items-center gap-2">
              <Ear className="w-5 h-5 text-[#5C723C] dark:text-[#A5C178]" aria-hidden="true" />
              <span>{t.title}</span>
            </h2>
            <p className="text-sm text-[#686259] dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto min-w-0 shrink-0">
            <label
              htmlFor="listen-guess-unit-select"
              className="text-xs font-semibold text-[#686259] dark:text-slate-300 whitespace-nowrap shrink-0"
            >
              {t.unitLabel}
            </label>
            <select
              id="listen-guess-unit-select"
              data-testid="listen-guess-unit-select"
              value={moduleFilter}
              onChange={(e) => resetSession(mode, e.target.value, seed + 1)}
              className="flex-1 md:flex-initial min-w-0 max-w-full px-3 py-2 text-sm rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/60 dark:bg-[#0E1311] text-[#23201C] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5C723C]"
            >
              <option value="all">{t.allUnits}</option>
              {localizedModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.number}. {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode & Card Display Toggles */}
        <div className="pt-3 border-t border-[#EFECE4] dark:border-[#2A352F] flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label={t.modeGroupAria}
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#F5F1E8] dark:bg-[#0E1311] border border-[#E4DFD2] dark:border-[#2A352F]"
          >
            {(
              [
                ['mixed', t.modeMixed],
                ['words', t.modeWords],
                ['phrases', t.modePhrases],
              ] as Array<[ListenGuessMode, string]>
            ).map(([modeKey, label]) => {
              const active = mode === modeKey;
              return (
                <button
                  key={modeKey}
                  type="button"
                  data-testid={`listen-guess-mode-${modeKey}`}
                  aria-pressed={active}
                  onClick={() => resetSession(modeKey, moduleFilter, seed + 1)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                      : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label={t.displayGroupAria}
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#F5F1E8] dark:bg-[#0E1311] border border-[#E4DFD2] dark:border-[#2A352F]"
          >
            {(
              [
                ['both', t.displayBoth],
                ['darija', t.displayDarija],
                ['meaning', t.displayMeaning],
              ] as Array<[ListenGuessDisplayMode, string]>
            ).map(([dispKey, label]) => {
              const active = displayMode === dispKey;
              return (
                <button
                  key={dispKey}
                  type="button"
                  data-testid={`listen-guess-display-${dispKey}`}
                  aria-pressed={active}
                  onClick={() => setDisplayMode(dispKey)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                      : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* End Summary Screen */}
      {finished ? (
        <div
          data-testid="listen-guess-summary"
          className="bg-[#F7F9F2] dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-3xl p-8 text-center space-y-6"
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#4E6231] dark:text-[#A5C178]">
              {t.sessionDone}
            </p>
            <h3 className="font-display text-3xl font-extrabold text-[#23201C] dark:text-slate-100 tabular-nums">
              {t.correctCount(score, deck.length)}
            </h3>
            <p className="text-base text-[#686259] dark:text-slate-300 tabular-nums">
              {t.accuracySummary(
                computeListenGuessAccuracy(score, deck.length),
                score * 20,
                bestStreak
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              data-testid="listen-guess-restart-btn"
              onClick={() => resetSession(mode, moduleFilter, seed + 7, true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C68335] hover:bg-[#B2732B] rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{t.playAgainBtn}</span>
            </button>

            <button
              type="button"
              onClick={onGoToLessons}
              className="px-5 py-2.5 text-sm font-semibold text-[#23201C] dark:text-slate-100 bg-white dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C] rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.reviewLessons}
            </button>
          </div>
        </div>
      ) : (
        /* Active Listening Round Card */
        <div className="bg-[#F7F9F2] dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-3xl p-6 sm:p-8 space-y-6">
          {/* Round HUD */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E4DFD2] dark:border-[#2A352F]">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#686259] dark:text-slate-400 tabular-nums">
              <span data-testid="listen-guess-counter" className="font-semibold text-[#23201C] dark:text-slate-200">
                {t.roundCounter(currentIdx + 1, deck.length)}
              </span>
              <span aria-hidden="true">·</span>
              <span data-testid="listen-guess-kind">
                {target.kind === 'word' ? t.kindWord : t.kindPhrase}
              </span>
              <span aria-hidden="true">·</span>
              <span>{t.webSpeechBadge}</span>
            </div>

            <div className="flex items-center gap-3 text-sm font-bold tabular-nums">
              {streak > 0 && (
                <span
                  data-testid="listen-guess-streak"
                  className="text-xs font-semibold text-[#C68335]"
                >
                  {t.streakLabel(streak)}
                </span>
              )}
              <span
                data-testid="listen-guess-score"
                className="text-[#4E6231] dark:text-[#A5C178]"
              >
                {t.scoreLabel(score)}
              </span>
            </div>
          </div>

          {/* Web Speech Stage */}
          <div className="rounded-2xl bg-white dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#23201C] dark:text-slate-100 [text-wrap:balance]">
              {t.listenPrompt}
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                data-testid="listen-guess-play-btn"
                data-playback-state={isPlayingNormal ? 'playing' : 'idle'}
                aria-pressed={isPlayingNormal}
                onClick={() => handleTogglePlay(false)}
                className={`relative overflow-hidden inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isPlayingNormal
                    ? 'bg-[#4E6231] text-white border-[#4E6231]'
                    : 'bg-[#5C723C] hover:bg-[#4E6231] text-white border-[#5C723C]'
                }`}
              >
                {isPlayingNormal ? (
                  <Square className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
                ) : (
                  <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                )}
                <span>{isPlayingNormal ? t.playingBtn : t.playBtn}</span>
                {isPlayingNormal && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 bottom-0 h-1 bg-[#DAE3C6] transition-all duration-75"
                    style={{ width: `${activeProgress}%` }}
                  />
                )}
              </button>

              <button
                type="button"
                data-testid="listen-guess-slow-btn"
                data-playback-state={isPlayingSlow ? 'playing' : 'idle'}
                aria-pressed={isPlayingSlow}
                onClick={() => handleTogglePlay(true)}
                className={`relative overflow-hidden inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold rounded-xl border whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isPlayingSlow
                    ? 'bg-[#C68335] text-white border-[#C68335]'
                    : 'bg-[#F5F1E8]/70 dark:bg-[#171E1B] text-[#8E5B1E] dark:text-[#E5A95E] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#C68335]'
                }`}
              >
                {isPlayingSlow ? (
                  <Square className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true" />
                ) : (
                  <Turtle className="w-4 h-4 shrink-0" aria-hidden="true" />
                )}
                <span>{isPlayingSlow ? t.stopBtn : t.slowBtn}</span>
                {isPlayingSlow && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 bottom-0 h-1 bg-white/70 transition-all duration-75"
                    style={{ width: `${activeProgress}%` }}
                  />
                )}
              </button>

              {playCount > 0 && (
                <span
                  data-testid="listen-guess-play-count"
                  className="text-xs font-mono text-[#686259] dark:text-slate-400 tabular-nums"
                >
                  {t.listenCountLabel(playCount)}
                </span>
              )}
            </div>
          </div>

          {/* 4 Answer Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentRound.options.map((option, idx) => {
              const isSelected = selectedOptionId === option.id;
              const isAnswered = Boolean(evaluation);
              const isRight = option.isCorrect;
              const letter = OPTION_LETTERS[idx] ?? String(idx + 1);

              let cardClasses =
                'bg-white dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-100 hover:border-[#5C723C]';
              if (isAnswered) {
                if (isRight) {
                  cardClasses =
                    'bg-[#E5EBD6] dark:bg-[#233020] border-[#5C723C] text-[#23201C] dark:text-emerald-100';
                } else if (isSelected) {
                  cardClasses =
                    'bg-red-50 dark:bg-red-950/60 border-[#B9382C] dark:border-red-500 text-red-950 dark:text-red-100';
                } else {
                  cardClasses =
                    'bg-[#F5F1E8]/60 dark:bg-[#141A17] border-[#E4DFD2] dark:border-[#2A352F] text-[#8E867B] dark:text-slate-500';
                }
              }

              const showDarija =
                isAnswered || displayMode === 'both' || displayMode === 'darija';
              const showMeaning =
                isAnswered || displayMode === 'both' || displayMode === 'meaning';

              return (
                <button
                  key={option.id}
                  type="button"
                  data-testid={`listen-guess-option-${idx}`}
                  data-correct={option.isCorrect ? 'true' : 'false'}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(option.id)}
                  className={`text-left p-4 min-h-[72px] rounded-2xl border flex items-start gap-3 transition-colors cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C723C] ${cardClasses}`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-7 h-7 rounded-lg text-xs font-bold inline-flex items-center justify-center shrink-0 mt-0.5 ${
                      isAnswered && isRight
                        ? 'bg-[#5C723C] text-white'
                        : isAnswered && isSelected
                          ? 'bg-[#B9382C] text-white'
                          : 'bg-[#F5F1E8] dark:bg-[#141A17] text-[#686259] dark:text-slate-300'
                    }`}
                  >
                    {letter}
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    {showDarija && (
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                        <span className="text-sm sm:text-base font-bold">
                          {option.darijaLatin}
                        </span>
                        <span
                          className="font-arabic text-base opacity-90"
                          lang="ar"
                        >
                          <bdi dir="rtl">{option.darijaArabic}</bdi>
                        </span>
                      </div>
                    )}

                    {showMeaning && (
                      <p
                        className={
                          showDarija
                            ? 'text-xs sm:text-sm opacity-85'
                            : 'text-sm sm:text-base font-semibold'
                        }
                      >
                        {option.meaning}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Immediate Validation Banner */}
          {evaluation && (
            <div
              role="status"
              data-testid="listen-guess-feedback"
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                evaluation.isCorrect
                  ? 'bg-[#E5EBD6]/75 dark:bg-[#202B1E] border-[#5C723C] text-[#23201C] dark:text-emerald-100'
                  : 'bg-red-50 dark:bg-red-950/55 border-red-300 dark:border-red-800 text-red-950 dark:text-red-100'
              }`}
            >
              <div className="flex items-start gap-3">
                {evaluation.isCorrect ? (
                  <CheckCircle2
                    className="w-5 h-5 text-[#4E6231] dark:text-[#A5C178] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : (
                  <XCircle
                    className="w-5 h-5 text-[#B9382C] dark:text-red-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                )}

                <div className="space-y-1">
                  <p className="text-sm font-bold">
                    {evaluation.isCorrect ? t.correctTitle : t.incorrectTitle}
                  </p>
                  <p className="text-sm font-semibold">
                    <span className="text-xs font-normal opacity-80 mr-1.5">
                      {t.answerRevealLabel}
                    </span>
                    <span>{target.darijaLatin}</span>{' '}
                    <span className="font-arabic text-base mx-1" lang="ar">
                      <bdi dir="rtl">{target.darijaArabic}</bdi>
                    </span>
                  </p>
                  <p className="text-xs opacity-90">
                    {target.meaning}
                    {target.phoneticFrench && target.phoneticFrench !== target.darijaLatin
                      ? ` · [${target.phoneticFrench}]`
                      : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                data-testid="listen-guess-next-btn"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#C68335] hover:bg-[#B2732B] rounded-xl whitespace-nowrap shrink-0 self-start cursor-pointer"
              >
                <span>
                  {currentIdx + 1 >= deck.length ? t.seeResult : t.nextQuestion}
                </span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
