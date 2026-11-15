import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Layers,
  RotateCcw,
  Shuffle,
  Turtle,
  Volume2,
} from 'lucide-react';
import type { AppLanguage } from '../types/darija';
import type {
  ConjugationDifficulty,
  VerbConjugationIndexItem,
} from '../utils/conjugationLogic';
import { BEN_SEDIRA_TRANSLATIONS } from '../i18n/benSediraTranslations';
import {
  AUDIO_CACHE_UPDATED_EVENT,
  cacheAudioClipsOffline,
  getVerbOfflineCacheStatus,
  playDarijaPronunciation,
} from '../utils/audioPlayer';
import {
  formatBenSediraLatinForSpeech,
  type NativeSpeakerVoice,
} from '../utils/darijaSpeechFormat';
import {
  buildVerbFlashcardDeck,
  computeFlashcardSessionStats,
  evaluateFlashcardTyping,
  type FlashcardPersonScope,
  type FlashcardTenseMode,
  type VerbFlashcard,
} from '../utils/flashcardLogic';

interface ConjugationFlashcardTrainerProps {
  items: VerbConjugationIndexItem[];
  language: AppLanguage;
  voiceName?: NativeSpeakerVoice;
  onEarnXp?: (amount: number) => void;
}

const DECK_SIZE_OPTIONS = [10, 15, 20] as const;

export function ConjugationFlashcardTrainer({
  items,
  language,
  voiceName = 'Kore',
  onEarnXp,
}: ConjugationFlashcardTrainerProps) {
  const t = BEN_SEDIRA_TRANSLATIONS[language];
  const ct = t.conjugationTable;
  const ft = t.flashcards;

  const [tenseMode, setTenseMode] = useState<FlashcardTenseMode>('mixed');
  const [personScope, setPersonScope] = useState<FlashcardPersonScope>('core');
  const [deckSize, setDeckSize] = useState<number>(10);
  const [seed, setSeed] = useState<number>(31);
  const [customReviewDeck, setCustomReviewDeck] = useState<VerbFlashcard[] | null>(
    null
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [typingStatus, setTypingStatus] = useState<'idle' | 'correct' | 'close'>(
    'idle'
  );
  const [results, setResults] = useState<Record<string, 'known' | 'review'>>({});
  const [sessionXp, setSessionXp] = useState<number>(0);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [deckCacheStatus, setDeckCacheStatus] = useState<{
    cached: number;
    total: number;
  }>({ cached: 0, total: 0 });
  const [isCachingDeck, setIsCachingDeck] = useState<boolean>(false);

  const difficultyByVerbId = useMemo<Map<string, ConjugationDifficulty>>(
    () => new Map(items.map((item) => [item.entry.id, item.difficulty])),
    [items]
  );

  const poolFingerprint = useMemo(
    () =>
      `${items.length}:${items[0]?.entry.id ?? ''}:${items[items.length - 1]?.entry.id ?? ''}`,
    [items]
  );

  useEffect(() => {
    setCustomReviewDeck(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setTypedAnswer('');
    setTypingStatus('idle');
    setResults({});
  }, [poolFingerprint, tenseMode, personScope, deckSize, seed]);

  const generatedDeck = useMemo(
    () =>
      buildVerbFlashcardDeck(items, {
        tenseMode,
        personScope,
        deckSize,
        seed,
      }),
    [items, tenseMode, personScope, deckSize, seed]
  );

  const deck = customReviewDeck ?? generatedDeck;
  const stats = useMemo(
    () => computeFlashcardSessionStats(deck, results),
    [deck, results]
  );

  const deckAudioClips = useMemo(
    () =>
      deck.map((card) => ({
        textArabic: card.answerArabic,
        textLatin: card.answerLatin,
        slow: false,
        voiceName,
      })),
    [deck, voiceName]
  );

  useEffect(() => {
    let cancelled = false;
    const refreshDeckCache = async () => {
      if (deckAudioClips.length === 0) {
        if (!cancelled) setDeckCacheStatus({ cached: 0, total: 0 });
        return;
      }
      const status = await getVerbOfflineCacheStatus(deckAudioClips);
      if (!cancelled) setDeckCacheStatus(status);
    };
    void refreshDeckCache();

    const onCacheUpdated = () => {
      void refreshDeckCache();
    };
    window.addEventListener(AUDIO_CACHE_UPDATED_EVENT, onCacheUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(AUDIO_CACHE_UPDATED_EVENT, onCacheUpdated);
    };
  }, [deckAudioClips]);

  const handleCacheDeckOffline = async () => {
    if (isCachingDeck || deckAudioClips.length === 0) return;
    setIsCachingDeck(true);
    try {
      const status = await cacheAudioClipsOffline(
        deckAudioClips,
        language,
        voiceName,
        (cached, total) => setDeckCacheStatus({ cached, total })
      );
      setDeckCacheStatus(status);
    } finally {
      setIsCachingDeck(false);
    }
  };

  const isSessionComplete = deck.length > 0 && currentIndex >= deck.length;
  const activeCard = !isSessionComplete ? deck[currentIndex] : undefined;

  const handleNewDeck = () => {
    setCustomReviewDeck(null);
    setSeed((prev) => prev + 1);
    setCurrentIndex(0);
    setIsFlipped(false);
    setTypedAnswer('');
    setTypingStatus('idle');
    setResults({});
  };

  const handleRetryMissed = () => {
    const missed = deck.filter((card) => results[card.id] === 'review');
    if (missed.length === 0) return;
    setCustomReviewDeck(missed);
    setCurrentIndex(0);
    setIsFlipped(false);
    setTypedAnswer('');
    setTypingStatus('idle');
    setResults({});
  };

  const handleCheckTyping = () => {
    if (!activeCard || !typedAnswer.trim()) return;
    const isMatch = evaluateFlashcardTyping(typedAnswer, activeCard.answerLatin);
    setTypingStatus(isMatch ? 'correct' : 'close');
    setIsFlipped(true);
  };

  const handleRateCard = (rating: 'known' | 'review') => {
    if (!activeCard) return;
    const prevRating = results[activeCard.id];
    setResults((prev) => ({
      ...prev,
      [activeCard.id]: rating,
    }));

    if (rating === 'known' && prevRating !== 'known') {
      setSessionXp((prev) => prev + 5);
      onEarnXp?.(5);
    }

    setCurrentIndex((prev) => prev + 1);
    setIsFlipped(false);
    setTypedAnswer('');
    setTypingStatus('idle');
  };

  const handlePlayCard = (
    key: string,
    arabicText: string,
    latinText: string,
    slow = false
  ) => {
    void playDarijaPronunciation({
      textArabic: arabicText,
      textLatin: formatBenSediraLatinForSpeech(latinText),
      slow,
      language,
      voiceName,
      onStart: () => setPlayingKey(key),
      onEnd: () => setPlayingKey((curr) => (curr === key ? null : curr)),
    });
  };

  if (items.length === 0) {
    return (
      <div
        data-testid="flashcard-empty-state"
        className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-8 text-center space-y-2"
      >
        <p className="font-display text-lg font-bold text-[#23201C] dark:text-slate-100">
          {ft.emptyPoolTitle}
        </p>
        <p className="text-sm text-[#686259] dark:text-slate-400">
          {ft.emptyPoolHint}
        </p>
      </div>
    );
  }

  const tenseTagText = activeCard
    ? activeCard.tense === 'past'
      ? ft.tenseTagPast
      : activeCard.tense === 'present'
        ? ft.tenseTagPresent
        : ft.tenseTagFuture
    : '';

  const tenseTagSurface = activeCard
    ? activeCard.tense === 'past'
      ? 'bg-[#EFE9DC] dark:bg-[#232018] text-[#8E5B1E] dark:text-[#E5A95E]'
      : activeCard.tense === 'present'
        ? 'bg-[#E5EBD6] dark:bg-[#1E2B20] text-[#4E6231] dark:text-[#A5C178]'
        : 'bg-[#E3EBF2] dark:bg-[#1A252E] text-[#2F5373] dark:text-[#8BB7DE]'
    : '';

  return (
    <div
      data-testid="conjugation-flashcards-trainer"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
    >
      {/* Left / Main Zone (Interactive Flashcard Stage) */}
      <div className="lg:col-span-8 space-y-4">
        {/* Progress Header */}
        <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold text-[#23201C] dark:text-slate-100">
                {ft.title}
              </h3>
              <p className="text-xs text-[#686259] dark:text-slate-400">
                {ft.subtitle(items.length)}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold tabular-nums text-[#686259] dark:text-slate-300">
              <span>
                {ft.cardProgress(
                  Math.min(currentIndex + 1, deck.length),
                  deck.length
                )}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[#4E6231] dark:text-[#A5C178]">
                {ft.knownStat(stats.known)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[#C68335]">
                {ft.reviewStat(stats.review)}
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#EFECE4] dark:bg-[#2A352F] overflow-hidden">
            <div
              className="h-full bg-[#5C723C] dark:bg-[#A5C178] transition-all duration-200"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>

        {/* Active Card Stage OR Summary */}
        {!isSessionComplete && activeCard ? (
          <article
            data-testid="flashcard-stage"
            className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-6 sm:p-8 space-y-6"
          >
            {/* Unboxed Metadata Line */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#686259] dark:text-slate-400 flex flex-wrap items-center gap-x-2">
                <span className="font-mono font-bold text-[#C68335]">
                  {activeCard.entry.letter}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-arabic text-sm text-[#4E6231] dark:text-[#A5C178]" lang="ar">
                  <bdi>{activeCard.arabicRoot}</bdi>
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{activeCard.latinRoot}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {activeCard.entry.verbPattern
                    ? t.verbPatterns[activeCard.entry.verbPattern]
                    : t.verbPatterns.regular}
                </span>
                {difficultyByVerbId.get(activeCard.entry.id) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[#4E6231] dark:text-[#A5C178]">
                      {ct.difficultyLevels[difficultyByVerbId.get(activeCard.entry.id)!]}
                    </span>
                  </>
                )}
              </p>

              <span
                data-testid="flashcard-tense-label"
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${tenseTagSurface}`}
              >
                {tenseTagText}
              </span>
            </div>

            {/* Prompt Area: Target Tense + Pronoun + French Verb */}
            <div className="py-4 px-5 rounded-2xl bg-[#F5F1E8]/80 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] space-y-2 text-center">
              <p className="text-xs font-semibold text-[#686259] dark:text-slate-400">
                {ft.frontQuestion}
              </p>
              <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-[#23201C] dark:text-slate-50 [text-wrap:balance]">
                {activeCard.entry.frenchHeadword}
              </h4>
              <p className="font-display text-base sm:text-lg font-bold text-[#4E6231] dark:text-[#A5C178]">
                {activeCard.pronoun} · {tenseTagText}
              </p>
            </div>

            {/* Optional Quick Typed Recall Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCheckTyping();
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <input
                type="text"
                data-testid="flashcard-type-input"
                value={typedAnswer}
                onChange={(e) => {
                  setTypedAnswer(e.target.value);
                  if (typingStatus !== 'idle') setTypingStatus('idle');
                }}
                placeholder={ft.typingPlaceholder}
                aria-label={ft.typingPlaceholder}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F5F1E8]/60 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] text-sm text-[#23201C] dark:text-slate-100 placeholder:text-[#8E867B] focus:outline-none focus:border-[#5C723C]"
              />
              <button
                type="submit"
                data-testid="flashcard-check-btn"
                disabled={!typedAnswer.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#23201C] dark:bg-slate-100 text-white dark:text-[#171E1B] text-xs font-semibold whitespace-nowrap shrink-0 disabled:opacity-40 cursor-pointer"
              >
                {ft.checkBtn}
              </button>
              <button
                type="button"
                data-testid="flashcard-flip-btn"
                onClick={() => setIsFlipped((prev) => !prev)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5C723C] hover:bg-[#4E6231] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isFlipped ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{ft.hideBtn}</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{ft.revealBtn}</span>
                  </>
                )}
              </button>
            </form>

            {/* Typing feedback (icon + text, never color alone) */}
            {typingStatus !== 'idle' && (
              <div
                data-testid="flashcard-typing-feedback"
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  typingStatus === 'correct'
                    ? 'bg-[#E5EBD6]/70 dark:bg-[#1E2B20] border-[#5C723C] text-[#4E6231] dark:text-[#A5C178]'
                    : 'bg-[#EFE9DC]/80 dark:bg-[#232018] border-[#C68335] text-[#8E5B1E] dark:text-[#E5A95E]'
                }`}
              >
                {typingStatus === 'correct' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                ) : (
                  <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {typingStatus === 'correct' ? ft.typingExact : ft.typingRetry}
                </span>
              </div>
            )}

            {/* Card Back (Answer + 3-Tense Comparison + Self-Assessment) */}
            {isFlipped && (
              <div
                data-testid="flashcard-answer-panel"
                className="pt-4 border-t border-[#EFECE4] dark:border-[#2A352F] space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F7F9F2] dark:bg-[#1D2622] border border-[#D8E2C8] dark:border-[#2E3C31]">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#686259] dark:text-slate-400">
                      {activeCard.pronoun} · {tenseTagText}
                    </p>
                    <p
                      data-testid="flashcard-target-answer"
                      className="font-display text-2xl font-extrabold text-[#4E6231] dark:text-[#A5C178]"
                    >
                      {activeCard.answerLatin}
                    </p>
                    <p className="font-arabic text-lg text-[#23201C] dark:text-slate-200" lang="ar">
                      <bdi>{activeCard.answerArabic || activeCard.entry.darijaArabic}</bdi>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      data-testid="flashcard-listen-answer"
                      onClick={() =>
                        handlePlayCard(
                          'answer',
                          activeCard.answerArabic,
                          activeCard.answerLatin,
                          false
                        )
                      }
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                        playingKey === 'answer'
                          ? 'bg-[#5C723C] text-white border-[#5C723C]'
                          : 'bg-white dark:bg-[#171E1B] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                      <span>{playingKey === 'answer' ? t.playing : t.listen}</span>
                    </button>

                    <button
                      type="button"
                      data-testid="flashcard-listen-answer-slow"
                      onClick={() =>
                        handlePlayCard(
                          'answer-slow',
                          activeCard.answerArabic,
                          activeCard.answerLatin,
                          true
                        )
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                        playingKey === 'answer-slow'
                          ? 'bg-[#C68335] text-white border-[#C68335]'
                          : 'bg-white dark:bg-[#171E1B] text-[#8E5B1E] dark:text-[#E5A95E] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#C68335]'
                      }`}
                    >
                      <Turtle className="w-4 h-4" aria-hidden="true" />
                      <span>{ct.listenSlow}</span>
                    </button>
                  </div>
                </div>

                {activeCard.tense === 'future' && (
                  <p className="text-xs text-[#686259] dark:text-slate-400">
                    {ft.futureHint}
                  </p>
                )}

                {/* 3-Tense + Negation Comparison Strip */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#686259] dark:text-slate-400">
                    {ft.comparisonTitle} ({activeCard.pronoun})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(
                      [
                        {
                          key: 'past',
                          label: ft.pastLabel,
                          latin: activeCard.allForms.past,
                          arabic: activeCard.allArabicForms.past,
                          activeClass:
                            'bg-[#EFE9DC]/60 dark:bg-[#232018] border-[#C68335]',
                        },
                        {
                          key: 'present',
                          label: ft.presentLabel,
                          latin: activeCard.allForms.present,
                          arabic: activeCard.allArabicForms.present,
                          activeClass:
                            'bg-[#E5EBD6]/60 dark:bg-[#1E2B20] border-[#5C723C]',
                        },
                        {
                          key: 'future',
                          label: ft.futureLabel,
                          latin: activeCard.allForms.future,
                          arabic: activeCard.allArabicForms.future,
                          activeClass:
                            'bg-[#E3EBF2]/60 dark:bg-[#1A252E] border-[#3B6B94]',
                        },
                        {
                          key: 'negation',
                          label: ft.negationLabel,
                          latin: activeCard.allForms.negativePresent,
                          arabic: activeCard.allArabicForms.negativePresent,
                          activeClass:
                            'bg-[#F5F1E8]/50 dark:bg-[#151B18] border-[#EFECE4] dark:border-[#2A352F]',
                        },
                      ] as const
                    ).map((cardItem) => {
                      const isCurrentTense = activeCard.tense === cardItem.key;
                      const compKey = `comp-${cardItem.key}`;
                      const isCompPlaying = playingKey === compKey;
                      return (
                        <div
                          key={cardItem.key}
                          className={`p-3 rounded-xl border flex items-start justify-between gap-1.5 ${
                            isCurrentTense
                              ? cardItem.activeClass
                              : 'bg-[#F5F1E8]/50 dark:bg-[#151B18] border-[#EFECE4] dark:border-[#2A352F]'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-[#686259] dark:text-slate-400">
                              {cardItem.label}
                            </p>
                            <p className="text-sm font-bold text-[#23201C] dark:text-slate-100 mt-0.5 break-words">
                              {cardItem.latin}
                            </p>
                            {cardItem.arabic && (
                              <p className="font-arabic text-xs text-[#686259] dark:text-slate-400 mt-0.5" lang="ar">
                                <bdi>{cardItem.arabic}</bdi>
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handlePlayCard(compKey, cardItem.arabic, cardItem.latin)
                            }
                            aria-label={ct.listenFormAria(cardItem.label, cardItem.latin)}
                            className={`w-6 h-6 rounded-md inline-flex items-center justify-center border shrink-0 cursor-pointer ${
                              isCompPlaying
                                ? 'bg-[#5C723C] text-white border-[#5C723C]'
                                : 'bg-white dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                            }`}
                          >
                            <Volume2 className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Self-Assessment Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    data-testid="flashcard-rate-review"
                    onClick={() => handleRateCard('review')}
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#C68335] bg-[#EFE9DC]/60 dark:bg-[#232018] hover:bg-[#EFE9DC] text-[#8E5B1E] dark:text-[#E5A95E] text-sm font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>{ft.rateReview}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="flashcard-rate-known"
                    onClick={() => handleRateCard('known')}
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#5C723C] hover:bg-[#4E6231] text-white text-sm font-bold cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>{ft.rateKnown}</span>
                  </button>
                </div>
              </div>
            )}
          </article>
        ) : (
          /* Session Completion Summary */
          <div
            data-testid="flashcard-summary"
            className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-8 text-center space-y-5"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E5EBD6] dark:bg-[#26322B] text-[#4E6231] dark:text-[#A5C178] flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-display text-2xl font-extrabold text-[#23201C] dark:text-slate-50">
                {ft.summaryTitle}
              </h4>
              <p className="text-sm font-semibold text-[#23201C] dark:text-slate-200 tabular-nums">
                {ft.summaryScore(stats.known, stats.total)}
              </p>
              <p className="text-xs font-bold text-[#C68335] tabular-nums">
                {ft.summaryXpEarned(sessionXp)}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {stats.review > 0 && (
                <button
                  type="button"
                  data-testid="flashcard-retry-review"
                  onClick={handleRetryMissed}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#C68335] bg-[#EFE9DC]/70 dark:bg-[#232018] text-[#8E5B1E] dark:text-[#E5A95E] text-xs font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{ft.retryReviewBtn(stats.review)}</span>
                </button>
              )}
              <button
                type="button"
                data-testid="flashcard-restart-deck"
                onClick={handleNewDeck}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5C723C] hover:bg-[#4E6231] text-white text-xs font-bold cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{ft.newDeckBtn}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Zone: Flashcards Configuration Deck */}
      <aside className="lg:col-span-4 bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 space-y-5">
        {/* Target Tense Mode */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#686259] dark:text-slate-400">
            {ft.tenseModeLabel}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'mixed', label: ft.tenseMixed },
                { id: 'past', label: ft.tensePast },
                { id: 'present', label: ft.tensePresent },
                { id: 'future', label: ft.tenseFuture },
              ] as const
            ).map((opt) => {
              const active = tenseMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`flashcard-tense-${opt.id}`}
                  aria-pressed={active}
                  onClick={() => setTenseMode(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#5C723C] text-white border-[#5C723C]'
                      : 'bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Person Scope */}
        <div className="space-y-2 pt-3 border-t border-[#EFECE4] dark:border-[#2A352F]">
          <p className="text-xs font-bold text-[#686259] dark:text-slate-400">
            {ft.personScopeLabel}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'core', label: ft.personScopeCore },
                { id: 'all8', label: ft.personScopeAll8 },
              ] as const
            ).map((opt) => {
              const active = personScope === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`flashcard-scope-${opt.id}`}
                  aria-pressed={active}
                  onClick={() => setPersonScope(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#C68335] text-white border-[#C68335]'
                      : 'bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#C68335]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Deck Size & Shuffle */}
        <div className="space-y-2 pt-3 border-t border-[#EFECE4] dark:border-[#2A352F]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#686259] dark:text-slate-400">
              {ft.deckSizeLabel}
            </span>
            <div className="flex items-center gap-1">
              {DECK_SIZE_OPTIONS.map((sizeOpt) => {
                const active = deckSize === sizeOpt;
                return (
                  <button
                    key={sizeOpt}
                    type="button"
                    data-testid={`flashcard-size-${sizeOpt}`}
                    aria-pressed={active}
                    onClick={() => setDeckSize(sizeOpt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border tabular-nums cursor-pointer ${
                      active
                        ? 'bg-[#23201C] dark:bg-slate-100 text-white dark:text-[#171E1B] border-transparent'
                        : 'bg-white dark:bg-[#1D2622] text-[#686259] dark:text-slate-300 border-[#E4DFD2] dark:border-[#2A352F]'
                    }`}
                  >
                    {sizeOpt}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            data-testid="flashcard-new-deck"
            onClick={handleNewDeck}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/70 dark:bg-[#1D2622] hover:border-[#5C723C] text-xs font-bold text-[#4E6231] dark:text-[#A5C178] cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{ft.newDeckBtn}</span>
          </button>

          <button
            type="button"
            data-testid="flashcard-cache-offline"
            disabled={isCachingDeck || deckAudioClips.length === 0}
            onClick={() => void handleCacheDeckOffline()}
            className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold tabular-nums cursor-pointer disabled:opacity-70 ${
              deckCacheStatus.total > 0 &&
              deckCacheStatus.cached >= deckCacheStatus.total
                ? 'bg-[#E5EBD6]/80 dark:bg-[#1E2B20] border-[#5C723C]/50 text-[#4E6231] dark:text-[#A5C178]'
                : 'bg-white dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C] text-[#23201C] dark:text-slate-200'
            }`}
          >
            {deckCacheStatus.total > 0 &&
            deckCacheStatus.cached >= deckCacheStatus.total ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{ft.offlineDeckReady}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {isCachingDeck
                    ? ft.offlineDeckSaving(
                        deckCacheStatus.cached,
                        deckCacheStatus.total
                      )
                    : deckCacheStatus.cached > 0 &&
                        deckCacheStatus.cached < deckCacheStatus.total
                      ? `${ft.offlineDeckBtn} (${deckCacheStatus.cached}/${deckCacheStatus.total})`
                      : ft.offlineDeckBtn}
                </span>
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}
