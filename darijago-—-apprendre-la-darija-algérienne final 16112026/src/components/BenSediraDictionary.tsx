import { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  RotateCcw,
  Search,
  Sparkles,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import type { AppLanguage } from '../types/darija';
import type {
  DictionaryCategory,
  DictionarySource,
  VerbPattern,
} from '../types/benSedira';
import {
  BEN_SEDIRA_ALPHABET,
  BEN_SEDIRA_DICTIONARY,
} from '../data/benSediraDictionary';
import { BEN_SEDIRA_TRANSLATIONS } from '../i18n/benSediraTranslations';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import {
  buildDictionaryQuickDrill,
  computeDictionaryCategoryCounts,
  computeDictionarySourceCounts,
  computeLetterCounts,
  computeVerbPatternCounts,
  deriveFullConjugationTable,
  filterBenSediraEntries,
  getAvailableDictionaryLetters,
  getEntrySource,
} from '../utils/dictionaryLogic';
import { playDarijaPronunciation, stopAllAudio } from '../utils/audioPlayer';
import { stopWebSpeechPlayback } from '../utils/webSpeechPlayer';
import { PhrasePlayButton } from './PhrasePlayButton';

interface BenSediraDictionaryProps {
  language: AppLanguage;
}

const CATEGORY_ORDER: Array<DictionaryCategory | 'all'> = [
  'all',
  'verb',
  'expression',
  'noun',
  'adjective',
  'time-number',
  'grammar',
];

const VERB_PATTERN_ORDER: Array<VerbPattern | 'all'> = [
  'all',
  'regular',
  'doubled',
  'hollow',
  'defective',
  'derived',
];

const SOURCE_ORDER: Array<DictionarySource | 'all'> = [
  'all',
  'ben-sedira',
  'aziri',
  'tapiero',
  'tadjer',
];

const PAGE_BATCH_SIZE = 30;

export function BenSediraDictionary({ language }: BenSediraDictionaryProps) {
  const t = BEN_SEDIRA_TRANSLATIONS[language];
  const dictT = EXPERIENCE_TRANSLATIONS[language].dictionaryPage;
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<DictionarySource | 'all'>('all');
  const [category, setCategory] = useState<DictionaryCategory | 'all'>('all');
  const [letter, setLetter] = useState<string>('all');
  const [verbPattern, setVerbPattern] = useState<VerbPattern | 'all'>('all');
  const [visibleLimit, setVisibleLimit] = useState(PAGE_BATCH_SIZE);
  const [expandedVerbIds, setExpandedVerbIds] = useState<Record<string, boolean>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Drill state ('none' | 'mixed' | 'verbs')
  const [drillMode, setDrillMode] = useState<'none' | 'mixed' | 'verbs'>('none');
  const [drillSeed, setDrillSeed] = useState(17);
  const [drillIndex, setDrillIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [drillScore, setDrillScore] = useState(0);

  const sourceCounts = useMemo(
    () => computeDictionarySourceCounts(BEN_SEDIRA_DICTIONARY),
    []
  );

  const sourceScopedEntries = useMemo(
    () =>
      source === 'all'
        ? BEN_SEDIRA_DICTIONARY
        : BEN_SEDIRA_DICTIONARY.filter((e) => getEntrySource(e) === source),
    [source]
  );

  const availableLetters = useMemo(
    () => new Set(getAvailableDictionaryLetters(sourceScopedEntries)),
    [sourceScopedEntries]
  );

  const letterCounts = useMemo(
    () => computeLetterCounts(sourceScopedEntries),
    [sourceScopedEntries]
  );

  const categoryCounts = useMemo(
    () => computeDictionaryCategoryCounts(sourceScopedEntries),
    [sourceScopedEntries]
  );

  const verbPatternCounts = useMemo(
    () => computeVerbPatternCounts(sourceScopedEntries),
    [sourceScopedEntries]
  );

  const filteredEntries = useMemo(
    () =>
      filterBenSediraEntries(BEN_SEDIRA_DICTIONARY, {
        query,
        source,
        category,
        letter,
        verbPattern: category === 'verb' ? verbPattern : 'all',
      }),
    [query, source, category, letter, verbPattern]
  );

  const visibleEntries = useMemo(
    () => filteredEntries.slice(0, visibleLimit),
    [filteredEntries, visibleLimit]
  );

  const remainingCount = Math.max(0, filteredEntries.length - visibleEntries.length);

  const drillItems = useMemo(() => {
    if (drillMode === 'none') return [];
    return buildDictionaryQuickDrill(
      BEN_SEDIRA_DICTIONARY,
      drillSeed,
      drillMode === 'verbs' ? 10 : 6,
      { verbsOnly: drillMode === 'verbs', letter, source }
    );
  }, [drillMode, drillSeed, letter, source]);

  const currentDrill = drillItems[drillIndex] ?? drillItems[0];

  const handlePlay = (
    id: string,
    arabic: string,
    latin: string,
    phonetic?: string
  ) => {
    stopWebSpeechPlayback();
    void playDarijaPronunciation({
      textArabic: arabic,
      textLatin: latin,
      phoneticFrench: phonetic,
      language,
      onStart: () => setPlayingId(id),
      onEnd: () => setPlayingId(null),
    });
  };

  const startOrExitDrill = (mode: 'mixed' | 'verbs') => {
    if (drillMode === mode) {
      setDrillMode('none');
    } else {
      setDrillMode(mode);
      setDrillIndex(0);
      setSelectedOption(null);
      setDrillScore(0);
    }
  };

  const handleSelectDrillOption = (option: string) => {
    if (selectedOption || !currentDrill) return;
    setSelectedOption(option);
    if (option === currentDrill.correctAnswer) {
      setDrillScore((prev) => prev + 1);
    }
  };

  const handleNextDrill = () => {
    if (drillIndex + 1 < drillItems.length) {
      setDrillIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setDrillSeed((prev) => prev + 29);
      setDrillIndex(0);
      setSelectedOption(null);
      setDrillScore(0);
    }
  };

  const toggleVerbConjugation = (id: string) => {
    setExpandedVerbIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLetterChange = (nextLetter: string) => {
    setLetter(nextLetter);
    setVisibleLimit(PAGE_BATCH_SIZE);
  };

  const handleCategoryChange = (nextCat: DictionaryCategory | 'all') => {
    setCategory(nextCat);
    if (nextCat !== 'verb') {
      setVerbPattern('all');
    }
    setVisibleLimit(PAGE_BATCH_SIZE);
  };

  const handleSourceChange = (nextSource: DictionarySource | 'all') => {
    setSource(nextSource);
    if (letter !== 'all' && nextSource !== 'all') {
      const nextScoped = BEN_SEDIRA_DICTIONARY.filter(
        (e) => getEntrySource(e) === nextSource
      );
      const nextLetters = new Set(getAvailableDictionaryLetters(nextScoped));
      if (!nextLetters.has(letter)) {
        setLetter('all');
      }
    }
    setVisibleLimit(PAGE_BATCH_SIZE);
  };

  return (
    <section
      aria-label={t.dictTitle}
      className="space-y-6"
    >
      {/* Editorial Header + Drill Actions */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-xs font-semibold text-[#C68335]">
              {t.sourceLabel} · {t.volumeStatus}
            </p>
            <h2 className="font-display text-2xl font-bold text-[#23201C] dark:text-slate-100 [text-wrap:balance]">
              {t.dictTitle}
            </h2>
            <p className="text-sm text-[#686259] dark:text-slate-400">
              {t.dictSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              data-testid="bensedira-verb-drill-toggle"
              onClick={() => startOrExitDrill('verbs')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                drillMode === 'verbs'
                  ? 'bg-[#E9E4D8] dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 border border-[#DFD9CA] dark:border-[#2A352F]'
                  : 'bg-[#5C723C] hover:bg-[#4E6231] text-white'
              }`}
            >
              {drillMode === 'verbs' ? (
                <>
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span>{t.drillToggleBrowse}</span>
                </>
              ) : (
                <>
                  <Dumbbell className="w-4 h-4" aria-hidden="true" />
                  <span>{t.drillVerbsToggle}</span>
                </>
              )}
            </button>

            <button
              type="button"
              data-testid="bensedira-drill-toggle"
              onClick={() => startOrExitDrill('mixed')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border cursor-pointer ${
                drillMode === 'mixed'
                  ? 'bg-[#E9E4D8] dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 border-[#DFD9CA] dark:border-[#2A352F]'
                  : 'bg-white dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
              }`}
            >
              {drillMode === 'mixed' ? (
                <>
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span>{t.drillToggleBrowse}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>{t.drillToggleStart}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Source Book Filter Bar */}
        <div className="pt-4 border-t border-[#EFECE4] dark:border-[#2A352F] space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#686259] dark:text-slate-400">
            <span className="font-semibold text-[#23201C] dark:text-slate-200">
              {t.sourceFilterLabel}
            </span>
            <span>{t.corpusSummaryLabel}</span>
          </div>
          <div
            role="group"
            aria-label={t.sourceFilterLabel}
            className="flex items-center gap-1.5 overflow-x-auto pb-1"
          >
            {SOURCE_ORDER.map((srcKey) => {
              const active = source === srcKey;
              return (
                <button
                  key={srcKey}
                  type="button"
                  data-testid={`bensedira-source-${srcKey}`}
                  aria-pressed={active}
                  onClick={() => handleSourceChange(srcKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap shrink-0 tabular-nums transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#23201C] dark:bg-slate-100 text-white dark:text-[#171E1B] border-transparent'
                      : 'bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                  }`}
                >
                  {t.sources[srcKey]} ({sourceCounts[srcKey]})
                </button>
              );
            })}
          </div>
        </div>

        {/* Alphabet Volume Index */}
        <div className="pt-4 border-t border-[#EFECE4] dark:border-[#2A352F] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#686259] dark:text-slate-400">
            <span className="font-semibold text-[#23201C] dark:text-slate-200">
              {t.alphabetLabel}
            </span>
            <span>{t.upcomingVolumeHint}</span>
          </div>
          <div
            role="tablist"
            aria-label={t.alphabetLabel}
            className="flex items-center gap-1 overflow-x-auto pb-1"
          >
            <button
              type="button"
              role="tab"
              data-testid="bensedira-letter-all"
              aria-selected={letter === 'all'}
              onClick={() => handleLetterChange('all')}
              className={`px-3 h-8 rounded-lg text-xs font-bold tabular-nums whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                letter === 'all'
                  ? 'bg-[#5C723C] text-white'
                  : 'bg-[#F5F1E8] dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 hover:bg-[#E5EBD6]'
              }`}
            >
              {t.letterAll} ({sourceScopedEntries.length})
            </button>

            {BEN_SEDIRA_ALPHABET.map((char) => {
              const isLoaded = availableLetters.has(char);
              const isSelected = letter === char;
              const charCount = letterCounts[char] ?? 0;
              return (
                <button
                  key={char}
                  type="button"
                  role="tab"
                  data-testid={`bensedira-letter-${char}`}
                  disabled={!isLoaded}
                  aria-selected={isSelected}
                  onClick={() => {
                    if (isLoaded) handleLetterChange(char);
                  }}
                  className={`px-2.5 h-8 rounded-lg text-xs font-bold tabular-nums whitespace-nowrap shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#5C723C] text-white cursor-pointer'
                      : isLoaded
                        ? 'bg-[#F5F1E8] dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 hover:bg-[#E5EBD6] cursor-pointer'
                        : 'text-[#B5AEA2] dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {isLoaded ? `${char} · ${charCount}` : char}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mode 1: Quick Recall Drill (Mixed or Verbs-only) */}
      {drillMode !== 'none' && currentDrill ? (
        <div
          data-testid="bensedira-drill-card"
          className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-6 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#C68335] tabular-nums">
              {drillIndex + 1} / {drillItems.length}
            </span>
            <span className="text-xs font-semibold text-[#4E6231] dark:text-[#A5C178] tabular-nums">
              {t.drillScore(drillScore, drillItems.length)}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-[#686259] dark:text-slate-400">
              {t.drillPromptLabel}
            </p>
            <h3 className="font-display text-2xl font-bold text-[#23201C] dark:text-slate-100">
              {currentDrill.frenchPrompt}
            </h3>
            <p className="text-xs font-mono text-[#686259] dark:text-slate-400">
              {currentDrill.promptHint}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentDrill.options.map((opt) => {
              const isChosen = selectedOption === opt;
              const isCorrect = opt === currentDrill.correctAnswer;
              let cardClass =
                'bg-[#F5F1E8]/60 dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-100 hover:border-[#5C723C]';
              if (selectedOption) {
                if (isCorrect) {
                  cardClass =
                    'bg-[#E5EBD6] dark:bg-[#243422] border-[#5C723C] text-[#2B3D1A] dark:text-[#CBE39E]';
                } else if (isChosen) {
                  cardClass =
                    'bg-[#FCECE9] dark:bg-[#341E1C] border-[#D9534F] text-[#8E2A26] dark:text-[#F5ACA9]';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={Boolean(selectedOption)}
                  onClick={() => handleSelectDrillOption(opt)}
                  className={`p-4 rounded-xl border text-left text-sm font-semibold transition-colors cursor-pointer ${cardClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <div className="pt-4 border-t border-[#EFECE4] dark:border-[#2A352F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#23201C] dark:text-slate-100">
                  {selectedOption === currentDrill.correctAnswer ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#5C723C]" aria-hidden="true" />
                      <span>{t.drillCorrect}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-[#D9534F]" aria-hidden="true" />
                      <span>
                        {t.drillWrong} {currentDrill.correctAnswer}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-xs text-[#686259] dark:text-slate-400">
                  {currentDrill.explanation}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handlePlay(
                      currentDrill.id,
                      currentDrill.correctArabic,
                      currentDrill.correctAnswer
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] text-xs font-semibold text-[#4E6231] dark:text-[#A5C178] cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{playingId === currentDrill.id ? t.playing : t.listen}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextDrill}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5C723C] hover:bg-[#4E6231] text-white text-xs font-semibold cursor-pointer"
                >
                  {drillIndex + 1 >= drillItems.length ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t.drillFinish}</span>
                    </>
                  ) : (
                    <span>{t.drillNext}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mode 2: Searchable & Filterable Dictionary + Complete Verb Repertoire */
        <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <p className="text-sm text-[#686259] dark:text-slate-400 tabular-nums">
              {t.countSummary(filteredEntries.length, sourceScopedEntries.length)}
            </p>

            <div className="relative w-full lg:w-96">
              <label htmlFor="bensedira-search" className="sr-only">
                {t.searchLabel}
              </label>
              <Search
                className="w-4 h-4 text-[#8E867B] dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="bensedira-search"
                data-testid="bensedira-search-input"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisibleLimit(PAGE_BATCH_SIZE);
                }}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/50 dark:bg-[#0E1311] text-[#23201C] dark:text-slate-100 placeholder:text-[#8E867B] focus:outline-none focus:ring-2 focus:ring-[#5C723C]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setVisibleLimit(PAGE_BATCH_SIZE);
                  }}
                  aria-label={t.clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E867B] hover:text-[#23201C] dark:hover:text-slate-300 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Primary Category Filter Bar */}
          <div
            role="tablist"
            aria-label={t.dictTitle}
            className="flex items-center gap-1 p-1 bg-[#E9E4D8] dark:bg-[#1D2622] border border-[#DFD9CA] dark:border-[#2A352F] rounded-full overflow-x-auto"
          >
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                data-testid={`bensedira-cat-${cat}`}
                aria-selected={category === cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                  category === cat
                    ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white font-semibold shadow-xs'
                    : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
                }`}
              >
                {t.categories[cat]} ({categoryCounts[cat]})
              </button>
            ))}
          </div>

          {/* Secondary Verb Pattern Filter (visible when Verbes tab is active) */}
          {category === 'verb' && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-[#686259] dark:text-slate-400">
                {t.verbPatternLabel}
              </span>
              <div
                role="tablist"
                aria-label={t.verbPatternLabel}
                className="flex items-center gap-1 overflow-x-auto pb-0.5"
              >
                {VERB_PATTERN_ORDER.map((pat) => (
                  <button
                    key={pat}
                    type="button"
                    role="tab"
                    data-testid={`bensedira-pattern-${pat}`}
                    aria-selected={verbPattern === pat}
                    onClick={() => {
                      setVerbPattern(pat);
                      setVisibleLimit(PAGE_BATCH_SIZE);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg border whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                      verbPattern === pat
                        ? 'bg-[#5C723C] text-white border-[#5C723C]'
                        : 'bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#686259] dark:text-slate-300 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                    }`}
                  >
                    {t.verbPatterns[pat]} ({verbPatternCounts[pat]})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dictionary Results */}
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center space-y-3 border border-dashed border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl">
              <p className="text-base font-semibold text-[#23201C] dark:text-slate-100">
                {t.emptyTitle(query)}
              </p>
              <p className="text-sm text-[#686259] dark:text-slate-400">
                {t.emptyHint}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSource('all');
                  setCategory('all');
                  setLetter('all');
                  setVerbPattern('all');
                  setVisibleLimit(PAGE_BATCH_SIZE);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5C723C] rounded-xl hover:bg-[#4E6231] cursor-pointer"
              >
                {t.resetFilters}
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#EFECE4] dark:divide-[#2A352F]">
                {visibleEntries.map((entry) => {
                  const isPlaying = playingId === entry.id;
                  const isExpanded = Boolean(expandedVerbIds[entry.id]);
                  const audioLatin = entry.exampleDarija ?? entry.darijaLatin;
                  const audioArabic = entry.exampleArabic ?? entry.darijaArabic;
                  const fullRows =
                    isExpanded && entry.conjugation
                      ? deriveFullConjugationTable(entry)
                      : [];

                  return (
                    <article
                      key={entry.id}
                      data-testid={`bensedira-entry-${entry.id}`}
                      className="py-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-[#686259] dark:text-slate-400">
                            <span className="font-display text-lg font-bold text-[#23201C] dark:text-slate-100">
                              {entry.frenchHeadword}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-[#C68335]">
                              {t.categories[entry.category]}
                            </span>
                            {entry.verbPattern && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-medium text-[#4E6231] dark:text-[#A5C178]">
                                  {t.verbPatterns[entry.verbPattern]}
                                </span>
                              </>
                            )}
                            {entry.arabicRoot && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-arabic text-sm text-[#4E6231] dark:text-[#A5C178]" lang="ar">
                                  <bdi>{entry.arabicRoot}</bdi>
                                </span>
                              </>
                            )}
                            {entry.preposition && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono">
                                  {t.prepositionLabel} +{entry.preposition}
                                </span>
                              </>
                            )}
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums font-medium text-[#8E5B1E] dark:text-[#E5A95E]">
                              {entry.sourcePage ?? t.sources[getEntrySource(entry)]}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                            <PhrasePlayButton
                              phrase={{
                                id: entry.id,
                                darijaArabic: entry.darijaArabic,
                                darijaLatin: entry.darijaLatin,
                                phoneticFrench: entry.phonetic,
                              }}
                              language={language}
                              playbackId={`bensedira-word-${entry.id}`}
                              variant="icon"
                              size="md"
                              testId={`bensedira-word-play-${entry.id}`}
                              ariaLabelPlay={dictT.playWordAria(entry.darijaLatin)}
                              ariaLabelStop={dictT.stopWordAria(entry.darijaLatin)}
                              onBeforePlay={() => {
                                stopAllAudio();
                                setPlayingId(null);
                              }}
                            />
                            <span className="text-base font-bold text-[#4E6231] dark:text-[#A5C178]">
                              {entry.darijaLatin}
                            </span>
                            <span
                              className="font-arabic text-lg text-[#23201C] dark:text-slate-200"
                              lang="ar"
                              dir="rtl"
                            >
                              <bdi>{entry.darijaArabic}</bdi>
                            </span>
                            <span className="font-mono text-xs text-[#686259] dark:text-slate-400">
                              [{entry.phonetic}]
                            </span>
                          </div>

                          {(entry.pluralLatin || entry.feminineLatin) && (
                            <p className="text-xs text-[#686259] dark:text-slate-400">
                              {entry.feminineLatin && (
                                <span>
                                  {t.feminineLabel} {entry.feminineLatin}
                                  {entry.pluralLatin ? ' · ' : ''}
                                </span>
                              )}
                              {entry.pluralLatin && (
                                <span>
                                  {t.pluralLabel} {entry.pluralLatin}
                                  {entry.pluralArabic ? ` (${entry.pluralArabic})` : ''}
                                </span>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start">
                          <button
                            type="button"
                            onClick={() =>
                              handlePlay(
                                entry.id,
                                audioArabic,
                                audioLatin,
                                entry.phonetic
                              )
                            }
                            aria-label={`${t.listen}: ${entry.frenchHeadword}`}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border whitespace-nowrap shrink-0 cursor-pointer ${
                              isPlaying
                                ? 'bg-[#5C723C] text-white border-[#5C723C]'
                                : 'bg-white dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                            }`}
                          >
                            <Volume2 className="w-4 h-4" aria-hidden="true" />
                            <span>{isPlaying ? t.playing : t.listen}</span>
                          </button>
                        </div>
                      </div>

                      {/* Triple Ben Sedira Conjugation Box + 8-person toggle */}
                      {entry.conjugation && (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-xs">
                            <div>
                              <p className="text-[#686259] dark:text-slate-400">{t.present1s}</p>
                              <p className="font-semibold text-[#23201C] dark:text-slate-100">
                                {entry.conjugation.present1s}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#686259] dark:text-slate-400">{t.past1s}</p>
                              <p className="font-semibold text-[#23201C] dark:text-slate-100">
                                {entry.conjugation.past1s}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#686259] dark:text-slate-400">{t.past3ms}</p>
                              <p className="font-semibold text-[#23201C] dark:text-slate-100">
                                {entry.conjugation.past3ms}
                              </p>
                            </div>
                            {entry.conjugation.imperative && (
                              <div>
                                <p className="text-[#686259] dark:text-slate-400">{t.imperative}</p>
                                <p className="font-semibold text-[#C68335]">
                                  {entry.conjugation.imperative}
                                </p>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            data-testid={`bensedira-conjugate-${entry.id}`}
                            aria-expanded={isExpanded}
                            onClick={() => toggleVerbConjugation(entry.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4E6231] dark:text-[#A5C178] hover:underline cursor-pointer"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>{t.conjugationCollapse}</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>{t.conjugationExpand}</span>
                              </>
                            )}
                          </button>

                          {isExpanded && fullRows.length > 0 && (
                            <div
                              data-testid={`bensedira-conj-table-${entry.id}`}
                              className="overflow-x-auto border border-[#E4DFD2] dark:border-[#2A352F] rounded-xl"
                            >
                              <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
                                <thead>
                                  <tr className="bg-[#F5F1E8] dark:bg-[#1D2622] border-b border-[#E4DFD2] dark:border-[#2A352F]">
                                    <th className="py-2 px-2 sm:px-3 font-semibold text-[#23201C] dark:text-slate-100">
                                      {t.personHeader}
                                    </th>
                                    <th className="py-2 px-2 sm:px-3 font-semibold text-[#4E6231] dark:text-[#A5C178]">
                                      <span className="sm:hidden">{t.presentHeader.split(' ')[0]}</span>
                                      <span className="hidden sm:inline">{t.presentHeader}</span>
                                    </th>
                                    <th className="py-2 px-2 sm:px-3 font-semibold text-[#23201C] dark:text-slate-100">
                                      <span className="sm:hidden">{t.pastHeader.split(' ')[0]}</span>
                                      <span className="hidden sm:inline">{t.pastHeader}</span>
                                    </th>
                                    <th className="py-2 px-2 sm:px-3 font-semibold text-[#C68335]">
                                      <span className="sm:hidden">{t.negationHeader.split(' ')[0]}</span>
                                      <span className="hidden sm:inline">{t.negationHeader}</span>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EFECE4] dark:divide-[#2A352F]">
                                  {fullRows.map((row) => {
                                    const [pronounMain, ...pronounRest] = row.pronoun.split(' ');
                                    return (
                                      <tr
                                        key={row.personKey}
                                        className="hover:bg-[#F5F1E8]/40 dark:hover:bg-[#1D2622]/50"
                                      >
                                        <td className="py-2 px-2 sm:px-3 font-medium text-[#686259] dark:text-slate-400 whitespace-nowrap">
                                          <span>{pronounMain}</span>
                                          {pronounRest.length > 0 && (
                                            <span className="hidden sm:inline">
                                              {' '}
                                              {pronounRest.join(' ')}
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 px-2 sm:px-3 font-semibold text-[#23201C] dark:text-slate-100">
                                          {row.present}
                                        </td>
                                        <td className="py-2 px-2 sm:px-3 text-[#23201C] dark:text-slate-200">
                                          {row.past}
                                        </td>
                                        <td className="py-2 px-2 sm:px-3 font-mono text-[#686259] dark:text-slate-300">
                                          {row.negativePresent}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {entry.alternativeForms && entry.alternativeForms.length > 0 && (
                        <p className="text-xs text-[#686259] dark:text-slate-400">
                          <span className="font-semibold text-[#23201C] dark:text-slate-300">
                            {t.alternativesLabel}{' '}
                          </span>
                          {entry.alternativeForms.join(' · ')}
                        </p>
                      )}

                      {(entry.exampleDarija || entry.usageNote) && (
                        <div className="space-y-1 text-xs">
                          {entry.exampleDarija && (
                            <p className="text-[#23201C] dark:text-slate-200">
                              <span className="font-semibold">{entry.exampleDarija}</span>
                              {entry.exampleFrench ? ` — ${entry.exampleFrench}` : ''}
                            </p>
                          )}
                          {entry.usageNote && (
                            <p className="text-[#686259] dark:text-slate-400 leading-relaxed">
                              {entry.usageNote}
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {remainingCount > 0 && (
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    data-testid="bensedira-show-more"
                    onClick={() => setVisibleLimit((prev) => prev + PAGE_BATCH_SIZE)}
                    className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 hover:border-[#5C723C] cursor-pointer tabular-nums"
                  >
                    {t.showMore(remainingCount)}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
