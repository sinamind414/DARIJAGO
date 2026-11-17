import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Headphones,
  RotateCcw,
  Turtle,
  Volume2,
  XCircle,
} from 'lucide-react';
import { ALL_PHRASES, CURRICULUM_MODULES } from '../data/curriculum';
import type { AppLanguage } from '../types/darija';
import { getLocalizedModule } from '../i18n/curriculumTranslations';
import { DICTATION_TRANSLATIONS } from '../i18n/dictationTranslations';
import {
  buildDictationDeck,
  computeDictationHintMask,
  evaluateDictationAttempt,
  type DictationEvaluation,
} from '../utils/dictationLogic';
import {
  playDarijaPronunciation,
  prefetchDarijaClips,
} from '../utils/audioPlayer';

interface DictationArenaProps {
  language: AppLanguage;
  onSessionComplete: (correctCount: number, totalCount: number) => void;
  onAnswerEvaluated?: (isCorrect: boolean, phraseId: string) => void;
  onGoToLessons: () => void;
}

const ARABIZI_QUICK_KEYS = [
  { char: '3', hint: 'ع' },
  { char: '7', hint: 'ح' },
  { char: '9', hint: 'ق' },
  { char: '5', hint: 'خ' },
] as const;

export function DictationArena({
  language,
  onSessionComplete,
  onAnswerEvaluated,
  onGoToLessons,
}: DictationArenaProps) {
  const t = DICTATION_TRANSLATIONS[language];
  const localizedModules = useMemo(
    () => CURRICULUM_MODULES.map((m) => getLocalizedModule(m, language)),
    [language]
  );

  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [seed, setSeed] = useState<number>(1);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [typedInput, setTypedInput] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [playCount, setPlayCount] = useState<number>(0);
  const [playingMode, setPlayingMode] = useState<'normal' | 'slow' | null>(
    null
  );
  const [evaluation, setEvaluation] = useState<DictationEvaluation | null>(
    null
  );
  const [score, setScore] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const deck = useMemo(
    () => buildDictationDeck(ALL_PHRASES, moduleFilter, seed, language, 8),
    [moduleFilter, seed, language]
  );

  const currentItem = deck[currentIdx] ?? deck[0];
  const currentPhrase = currentItem?.phrase;

  useEffect(() => {
    if (!currentPhrase) return;
    void prefetchDarijaClips(
      [
        {
          textArabic: currentPhrase.darijaArabic,
          textLatin: currentPhrase.darijaLatin,
          slow: false,
        },
        {
          textArabic: currentPhrase.darijaArabic,
          textLatin: currentPhrase.darijaLatin,
          slow: true,
        },
      ],
      language
    );
  }, [currentPhrase, language]);

  const startNewDictation = (nextModule: string, nextSeed: number) => {
    setModuleFilter(nextModule);
    setSeed(nextSeed);
    setCurrentIdx(0);
    setTypedInput('');
    setShowHint(false);
    setPlayCount(0);
    setPlayingMode(null);
    setEvaluation(null);
    setScore(0);
    setFinished(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handlePlayPhrase = (slow: boolean) => {
    if (!currentPhrase) return;
    setPlayCount((c) => c + 1);
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

  const handleInsertArabiziChar = (char: string) => {
    if (evaluation) return;
    const inputEl = inputRef.current;
    if (!inputEl) {
      setTypedInput((prev) => `${prev}${char}`);
      return;
    }
    const start = inputEl.selectionStart ?? typedInput.length;
    const end = inputEl.selectionEnd ?? typedInput.length;
    const nextValue = `${typedInput.slice(0, start)}${char}${typedInput.slice(end)}`;
    setTypedInput(nextValue);
    requestAnimationFrame(() => {
      inputEl.focus();
      const cursor = start + char.length;
      inputEl.setSelectionRange(cursor, cursor);
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentPhrase || evaluation || !typedInput.trim()) return;
    const result = evaluateDictationAttempt(typedInput, currentPhrase);
    setEvaluation(result);
    onAnswerEvaluated?.(result.isCorrect, currentPhrase.id);
    if (result.isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= deck.length) {
      setFinished(true);
      onSessionComplete(score, deck.length);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setTypedInput('');
    setShowHint(false);
    setPlayCount(0);
    setPlayingMode(null);
    setEvaluation(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  if (!currentPhrase) return null;

  return (
    <section
      aria-label={t.sectionAria}
      data-testid="dictation-arena"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header + Unit Filter */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-[#23201C] dark:text-slate-100 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-[#5C723C] dark:text-[#A5C178]" aria-hidden="true" />
            <span>{t.title}</span>
          </h2>
          <p className="text-sm text-[#686259] dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label
            htmlFor="dictation-module-select"
            className="text-xs font-semibold text-[#686259] dark:text-slate-300 whitespace-nowrap"
          >
            {t.unitLabel}
          </label>
          <select
            id="dictation-module-select"
            data-testid="dictation-unit-select"
            value={moduleFilter}
            onChange={(e) => startNewDictation(e.target.value, seed + 1)}
            className="px-3 py-2 text-sm rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/60 dark:bg-[#0E1311] text-[#23201C] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5C723C]"
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

      {/* Finished Summary Screen */}
      {finished ? (
        <div
          data-testid="dictation-summary"
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
                Math.round((score / deck.length) * 100),
                score * 20
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              data-testid="dictation-restart-btn"
              onClick={() => startNewDictation(moduleFilter, seed + 7)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C68335] hover:bg-[#B2732B] rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{t.restartBtn}</span>
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
        /* Active Dictation Card */
        <div className="bg-[#F7F9F2] dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-3xl p-6 sm:p-8 space-y-6">
          {/* Progress & Score Bar */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E4DFD2] dark:border-[#2A352F]">
            <span
              data-testid="dictation-counter"
              className="text-xs font-medium text-[#686259] dark:text-slate-400 tabular-nums"
            >
              {t.questionCounter(currentIdx + 1, deck.length)}
            </span>
            <span
              data-testid="dictation-score"
              className="text-sm font-bold text-[#4E6231] dark:text-[#A5C178] tabular-nums"
            >
              {t.scoreLabel(score)}
            </span>
          </div>

          {/* Audio Listening Stage */}
          <div className="rounded-2xl bg-white dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#23201C] dark:text-slate-100">
                {t.listenPromptTitle}
              </h3>
              {playCount > 0 && (
                <span className="text-xs font-mono text-[#686259] dark:text-slate-400 tabular-nums">
                  {t.listenCountLabel(playCount)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                data-testid="dictation-listen-btn"
                onClick={() => handlePlayPhrase(false)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border whitespace-nowrap shrink-0 cursor-pointer ${
                  playingMode === 'normal'
                    ? 'bg-[#5C723C] text-white border-[#5C723C]'
                    : 'bg-[#5C723C] hover:bg-[#4E6231] text-white border-[#5C723C]'
                }`}
              >
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>
                  {playingMode === 'normal' ? t.playingBtn : t.listenBtn}
                </span>
              </button>

              <button
                type="button"
                data-testid="dictation-listen-slow-btn"
                onClick={() => handlePlayPhrase(true)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border whitespace-nowrap shrink-0 cursor-pointer ${
                  playingMode === 'slow'
                    ? 'bg-[#C68335] text-white border-[#C68335]'
                    : 'bg-[#F5F1E8]/70 dark:bg-[#171E1B] text-[#8E5B1E] dark:text-[#E5A95E] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#C68335]'
                }`}
              >
                <Turtle className="w-4 h-4" aria-hidden="true" />
                <span>{t.listenSlowBtn}</span>
              </button>

              <button
                type="button"
                data-testid="dictation-hint-toggle"
                onClick={() => setShowHint((prev) => !prev)}
                aria-expanded={showHint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] text-[#686259] dark:text-slate-300 hover:border-[#5C723C] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {showHint ? (
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{showHint ? t.hideHintBtn : t.showHintBtn}</span>
              </button>
            </div>

            {showHint && (
              <div
                data-testid="dictation-hint-box"
                className="rounded-xl bg-[#F5F1E8]/70 dark:bg-[#141A17] border border-[#E4DFD2] dark:border-[#2A352F] p-3.5 space-y-1.5 text-xs"
              >
                <p className="text-[#23201C] dark:text-slate-200">
                  <span className="font-semibold text-[#686259] dark:text-slate-400">
                    {t.hintMeaningLabel}{' '}
                  </span>
                  {currentPhrase.frenchMeaning}
                </p>
                <p className="font-mono text-[#4E6231] dark:text-[#A5C178] tracking-wide">
                  <span className="font-sans font-semibold text-[#686259] dark:text-slate-400">
                    {t.hintPatternLabel}{' '}
                  </span>
                  {computeDictationHintMask(currentPhrase.darijaLatin)}
                </p>
              </div>
            )}
          </div>

          {/* Keyboard Transcription Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="dictation-input"
                className="block text-xs font-bold text-[#686259] dark:text-slate-300"
              >
                {t.inputLabel}
              </label>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  ref={inputRef}
                  id="dictation-input"
                  data-testid="dictation-input"
                  type="text"
                  value={typedInput}
                  disabled={Boolean(evaluation)}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="flex-1 px-4 py-3 text-base rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 placeholder:text-[#8E867B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5C723C] disabled:opacity-75"
                />

                {!evaluation && (
                  <div className="flex items-center gap-2 shrink-0">
                    {typedInput.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTypedInput('');
                          inputRef.current?.focus();
                        }}
                        className="px-3.5 py-3 text-xs font-semibold rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#1D2622] text-[#686259] dark:text-slate-300 hover:border-[#5C723C] cursor-pointer"
                      >
                        {t.clearBtn}
                      </button>
                    )}

                    <button
                      type="submit"
                      data-testid="dictation-submit-btn"
                      disabled={!typedInput.trim()}
                      className="px-5 py-3 text-sm font-semibold text-white bg-[#5C723C] hover:bg-[#4E6231] disabled:opacity-45 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {t.validateBtn}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Arabizi Quick-Insert Bar */}
            {!evaluation && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#686259] dark:text-slate-400">
                  {t.arabiziBarLabel}
                </span>
                {ARABIZI_QUICK_KEYS.map((item) => (
                  <button
                    key={item.char}
                    type="button"
                    data-testid={`dictation-key-${item.char}`}
                    onClick={() => handleInsertArabiziChar(item.char)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#1D2622] hover:border-[#5C723C] text-xs font-mono font-bold text-[#23201C] dark:text-slate-100 cursor-pointer"
                  >
                    <span>{item.char}</span>
                    <span className="text-[#686259] dark:text-slate-400 font-arabic">
                      {item.hint}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Immediate Validation Banner */}
          {evaluation && (
            <div
              role="status"
              data-testid="dictation-feedback"
              className={`p-5 rounded-2xl border space-y-4 ${
                evaluation.isCorrect
                  ? 'bg-[#E5EBD6]/75 dark:bg-[#202B1E] border-[#5C723C] text-[#23201C] dark:text-emerald-100'
                  : 'bg-red-50 dark:bg-red-950/55 border-red-300 dark:border-red-800 text-red-950 dark:text-red-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold">
                      {evaluation.isCorrect
                        ? t.correctTitle
                        : t.incorrectTitle(evaluation.accuracyPercent)}
                    </p>
                    {evaluation.isArabicMatch && (
                      <p className="text-xs font-semibold text-[#4E6231] dark:text-[#A5C178]">
                        {t.arabicMatchNote}
                      </p>
                    )}
                    <p className="text-sm font-semibold">
                      <span className="text-xs font-normal opacity-80 mr-1.5">
                        {t.expectedLabel}
                      </span>
                      <span>{currentPhrase.darijaLatin}</span>
                    </p>
                    <p
                      className="font-arabic text-base text-left text-[#23201C] dark:text-slate-100"
                      lang="ar"
                    >
                      <bdi dir="rtl">{currentPhrase.darijaArabic}</bdi>
                    </p>
                    <p className="text-xs opacity-90">
                      [{currentPhrase.phoneticFrench}] —{' '}
                      {currentPhrase.frenchMeaning}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  data-testid="dictation-next-btn"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#C68335] hover:bg-[#B2732B] rounded-xl whitespace-nowrap shrink-0 self-start cursor-pointer"
                >
                  <span>
                    {currentIdx + 1 >= deck.length
                      ? t.seeResult
                      : t.nextQuestion}
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Word-by-word Diff Breakdown */}
              <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
                <p className="text-xs font-semibold opacity-80">
                  {t.wordDiffLabel}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {evaluation.wordFeedback.map((wf, idx) => {
                    const chipStyle =
                      wf.status === 'match'
                        ? 'bg-white/90 dark:bg-[#171E1B] border-[#5C723C]/50 text-[#4E6231] dark:text-[#A5C178]'
                        : wf.status === 'close'
                          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-900 dark:text-amber-200'
                          : 'bg-white/90 dark:bg-[#171E1B] border-red-400 text-red-700 dark:text-red-300';
                    return (
                      <span
                        key={`${wf.expected}-${idx}`}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium ${chipStyle}`}
                      >
                        <span>{wf.expected}</span>
                        {wf.typed && wf.status !== 'match' && (
                          <span className="opacity-70 line-through">
                            {wf.typed}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
