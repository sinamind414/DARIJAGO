import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Layers,
  LayoutList,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Square,
  Table2,
  Trash2,
  Turtle,
  Volume2,
  X,
} from 'lucide-react';
import { ConjugationFlashcardTrainer } from './ConjugationFlashcardTrainer';
import type { AppLanguage } from '../types/darija';
import type { VerbPattern, DictionarySource } from '../types/benSedira';
import {
  BEN_SEDIRA_ALPHABET,
  BEN_SEDIRA_DICTIONARY,
} from '../data/benSediraDictionary';
import { BEN_SEDIRA_TRANSLATIONS } from '../i18n/benSediraTranslations';
import {
  buildVerbConjugationIndex,
  computeConjugationDifficultyCounts,
  computeConjugationPatternCounts,
  computeConjugationSourceCounts,
  filterVerbConjugationIndex,
  type ConjugationDifficulty,
  type ConjugationSearchScope,
  type ConjugationTenseFilter,
  type VerbConjugationIndexItem,
} from '../utils/conjugationLogic';
import {
  getAvailableDictionaryLetters,
  getEntrySource,
} from '../utils/dictionaryLogic';
import { collectVerbOfflineAudioClips } from '../utils/audioCacheStorage';
import {
  AUDIO_CACHE_UPDATED_EVENT,
  cacheAudioClipsOffline,
  clearAllOfflineAudioCache,
  getTotalCachedAudioClips,
  getVerbOfflineCacheStatus,
  playDarijaPronunciation,
  VERB_AUDIO_RATE_FACTOR,
  prefetchDarijaClips,
  stopAllAudio,
} from '../utils/audioPlayer';
import {
  NATIVE_SPEAKER_VOICES,
  formatBenSediraLatinForSpeech,
  type NativeSpeakerVoice,
} from '../utils/darijaSpeechFormat';

interface BenSediraConjugationTableProps {
  language: AppLanguage;
  onEarnXp?: (amount: number, verbId?: string) => void;
  onStudyVerb?: (verbId: string) => void;
}

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

const DIFFICULTY_ORDER: Array<ConjugationDifficulty | 'all'> = [
  'all',
  'beginner',
  'intermediate',
  'advanced',
];

const DIFFICULTY_TEXT_CLASSES: Record<ConjugationDifficulty, string> = {
  beginner: 'font-semibold text-[#4E6231] dark:text-[#A5C178]',
  intermediate: 'font-semibold text-[#8E5B1E] dark:text-[#E5A95E]',
  advanced: 'font-semibold text-[#5E574E] dark:text-slate-300',
};

const QUICK_ROOT_PRESETS = [
  { id: 'ktb', arabic: 'ك-ت-ب', latin: 'k-t-b', query: 'ktb' },
  { id: 'chrb', arabic: 'ش-ر-ب', latin: 'ch-r-b', query: 'chrb' },
  { id: 'ql', arabic: 'ق-ا-ل', latin: 'q-l', query: 'قال' },
  { id: 'khd', arabic: 'خ-ذ', latin: 'kh-d', query: 'khd' },
  { id: 'rh', arabic: 'ر-ا-ح', latin: 'r-h', query: 'راح' },
  { id: 'aml', arabic: 'ع-م-ل', latin: 'a-m-l', query: 'aml' },
] as const;

const PAGE_BATCH_SIZE = 40;

export function BenSediraConjugationTable({
  language,
  onEarnXp,
  onStudyVerb,
}: BenSediraConjugationTableProps) {
  const t = BEN_SEDIRA_TRANSLATIONS[language];
  const ct = t.conjugationTable;

  const allVerbsIndex = useMemo(
    () => buildVerbConjugationIndex(BEN_SEDIRA_DICTIONARY),
    []
  );

  const [source, setSource] = useState<DictionarySource | 'all'>('all');

  const sourceCounts = useMemo(
    () => computeConjugationSourceCounts(allVerbsIndex),
    [allVerbsIndex]
  );

  const sourceScopedIndex = useMemo(
    () =>
      source === 'all'
        ? allVerbsIndex
        : allVerbsIndex.filter((item) => getEntrySource(item.entry) === source),
    [allVerbsIndex, source]
  );

  const patternCounts = useMemo(
    () => computeConjugationPatternCounts(sourceScopedIndex),
    [sourceScopedIndex]
  );

  const difficultyCounts = useMemo(
    () => computeConjugationDifficultyCounts(sourceScopedIndex),
    [sourceScopedIndex]
  );

  const activeLetters = useMemo(() => {
    const verbEntries = sourceScopedIndex.map((item) => item.entry);
    const available = new Set(getAvailableDictionaryLetters(verbEntries));
    return BEN_SEDIRA_ALPHABET.filter((l) => available.has(l));
  }, [sourceScopedIndex]);

  const [query, setQuery] = useState('');
  const [searchScope, setSearchScope] = useState<ConjugationSearchScope>('all');
  const [tenseFilter, setTenseFilter] = useState<ConjugationTenseFilter>('all');
  const [difficulty, setDifficulty] = useState<ConjugationDifficulty | 'all'>('all');
  const [verbPattern, setVerbPattern] = useState<VerbPattern | 'all'>('all');
  const [letter, setLetter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'detail' | 'matrix' | 'flashcards'>(
    'detail'
  );
  const [showFiltersInFlashcards, setShowFiltersInFlashcards] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(PAGE_BATCH_SIZE);
  const [selectedVerbId, setSelectedVerbId] = useState<string>(
    () => allVerbsIndex[0]?.entry.id ?? ''
  );
  const voiceName: NativeSpeakerVoice = 'Kore';
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [totalCachedClips, setTotalCachedClips] = useState(0);
  const [verbCacheProgress, setVerbCacheProgress] = useState<{
    cached: number;
    total: number;
  }>({ cached: 0, total: 0 });
  const [isCachingVerb, setIsCachingVerb] = useState(false);

  const filteredItems = useMemo(
    () =>
      filterVerbConjugationIndex(allVerbsIndex, {
        query,
        searchScope,
        tense: tenseFilter,
        difficulty,
        verbPattern,
        letter,
        source,
      }),
    [allVerbsIndex, query, searchScope, tenseFilter, difficulty, verbPattern, letter, source]
  );

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleLimit),
    [filteredItems, visibleLimit]
  );

  const remainingCount = Math.max(0, filteredItems.length - visibleItems.length);

  const activeItem: VerbConjugationIndexItem | undefined = useMemo(() => {
    if (filteredItems.length === 0) return undefined;
    return (
      filteredItems.find((item) => item.entry.id === selectedVerbId) ??
      filteredItems[0]
    );
  }, [filteredItems, selectedVerbId]);

  useEffect(() => {
    if (!activeItem || viewMode !== 'detail') return;
    const timer = window.setTimeout(() => {
      const conj = activeItem.entry.conjugation;
      const itemsToPreload: Array<{ textArabic: string; textLatin: string; slow?: boolean }> = [
        {
          textArabic: activeItem.arabicTriple.spokenTripleArabic,
          textLatin: formatBenSediraLatinForSpeech(activeItem.entry.darijaLatin),
          slow: false,
        },
      ];
      if (conj) {
        itemsToPreload.push(
          {
            textArabic: activeItem.arabicTriple.present1sArabic,
            textLatin: conj.present1s,
          },
          {
            textArabic: activeItem.arabicTriple.past1sArabic,
            textLatin: conj.past1s,
          },
          {
            textArabic: activeItem.arabicTriple.past3msArabic,
            textLatin: conj.past3ms,
          }
        );
      }
      if (activeItem.entry.exampleDarija) {
        itemsToPreload.push({
          textArabic: activeItem.entry.exampleArabic ?? '',
          textLatin: activeItem.entry.exampleDarija,
        });
      }
      void prefetchDarijaClips(itemsToPreload, language, voiceName);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [activeItem, language, viewMode, voiceName]);

  useEffect(() => {
    let cancelled = false;

    const refreshCacheStatus = async () => {
      const totalCount = await getTotalCachedAudioClips();
      if (!cancelled) {
        setTotalCachedClips(totalCount);
      }
      if (activeItem) {
        const clips = collectVerbOfflineAudioClips(activeItem, voiceName);
        const status = await getVerbOfflineCacheStatus(clips);
        if (!cancelled) {
          setVerbCacheProgress(status);
        }
      } else if (!cancelled) {
        setVerbCacheProgress({ cached: 0, total: 0 });
      }
    };

    void refreshCacheStatus();

    const handleCacheUpdate = () => {
      void refreshCacheStatus();
    };
    window.addEventListener(AUDIO_CACHE_UPDATED_EVENT, handleCacheUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(AUDIO_CACHE_UPDATED_EVENT, handleCacheUpdate);
    };
  }, [activeItem, voiceName]);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const handleCacheActiveVerbOffline = async () => {
    if (!activeItem || isCachingVerb) return;
    const clips = collectVerbOfflineAudioClips(activeItem, voiceName);
    setIsCachingVerb(true);
    try {
      const finalStatus = await cacheAudioClipsOffline(
        clips,
        language,
        voiceName,
        (cached, total) => {
          setVerbCacheProgress({ cached, total });
        }
      );
      setVerbCacheProgress(finalStatus);
      setTotalCachedClips(await getTotalCachedAudioClips());
    } finally {
      setIsCachingVerb(false);
    }
  };

  const handleClearAudioCache = async () => {
    await clearAllOfflineAudioCache();
    setTotalCachedClips(0);
    if (activeItem) {
      const clips = collectVerbOfflineAudioClips(activeItem, voiceName);
      setVerbCacheProgress({ cached: 0, total: clips.length });
    }
  };

  const handleResetFilters = () => {
    setQuery('');
    setSource('all');
    setSearchScope('all');
    setTenseFilter('all');
    setDifficulty('all');
    setVerbPattern('all');
    setLetter('all');
    setVisibleLimit(PAGE_BATCH_SIZE);
  };

  const handleStopAudio = () => {
    stopAllAudio();
    setIsSequencePlaying(false);
    setPlayingKey(null);
  };

  const handlePlayAudio = (
    key: string,
    arabic: string,
    latin: string,
    phonetic?: string,
    slow = false,
    verbIdToTrack?: string
  ) => {
    const trackedId = verbIdToTrack ?? activeItem?.entry.id;
    if (trackedId) {
      onStudyVerb?.(trackedId);
    }
    setIsSequencePlaying(false);
    void playDarijaPronunciation({
      textArabic: arabic,
      textLatin: formatBenSediraLatinForSpeech(latin),
      phoneticFrench: phonetic,
      slow,
      language,
      voiceName,
      rateFactor: VERB_AUDIO_RATE_FACTOR,
      onStart: () => setPlayingKey(key),
      onEnd: () => setPlayingKey((curr) => (curr === key ? null : curr)),
    });
  };

  // Une seule voix off par verbe : le triple canonique (نوطّي، وطّيت، وطّى),
  // deja present dans les donnees. Evite 18 clips par verbe et la voix navigateur.
  const handlePlayVerbTriple = (item: VerbConjugationIndexItem) => {
    const triple = item.arabicTriple?.spokenTripleArabic;
    if (!triple) return;
    if (isSequencePlaying) {
      handleStopAudio();
      return;
    }
    if (item.entry.id) {
      onStudyVerb?.(item.entry.id);
    }
    const key = `triple-${item.entry.id}`;
    setIsSequencePlaying(true);
    void playDarijaPronunciation({
      textArabic: triple,
      textLatin: '',
      language,
      voiceName,
      rateFactor: VERB_AUDIO_RATE_FACTOR,
      onStart: () => setPlayingKey(key),
      onEnd: () => {
        setIsSequencePlaying(false);
        setPlayingKey(null);
      },
    });
  };

  const renderTensePreview = (item: VerbConjugationIndexItem) => {
    const conj = item.entry.conjugation!;
    const neg1s = item.tableRows[0]?.negativePresent ?? '';
    if (tenseFilter === 'present') {
      return `${conj.present1s} · ${item.tableRows[3]?.present ?? ''}`;
    }
    if (tenseFilter === 'past') {
      return `${conj.past1s} · ${conj.past3ms}`;
    }
    if (tenseFilter === 'negation') {
      return neg1s;
    }
    if (tenseFilter === 'imperative') {
      return conj.imperative ?? '—';
    }
    return `${conj.present1s} · ${conj.past1s} · ${conj.past3ms}`;
  };

  return (
    <section aria-label={ct.title} className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-xs font-semibold text-[#C68335] tabular-nums">
              {t.sourceLabel} · {t.volumeStatus}
            </p>
            <h2 className="font-display text-2xl font-bold text-[#23201C] dark:text-slate-100 [text-wrap:balance]">
              {ct.title}
            </h2>
            <p className="text-sm text-[#686259] dark:text-slate-400">
              {ct.subtitle}
            </p>
          </div>

          {/* Detail vs Comparison Matrix vs Flashcards Switcher */}
          <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
            <div
              role="group"
              aria-label={ct.viewLabel}
              className="flex flex-wrap sm:inline-flex items-center gap-1 p-1 rounded-2xl sm:rounded-full bg-[#E9E4D8] dark:bg-[#1D2622] border border-[#DFD9CA] dark:border-[#2A352F] self-start sm:self-end shrink-0"
            >
              <button
                type="button"
                data-testid="conjugation-view-detail"
                aria-pressed={viewMode === 'detail'}
                onClick={() => setViewMode('detail')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'detail'
                    ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                    : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{ct.viewDetail}</span>
              </button>
              <button
                type="button"
                data-testid="conjugation-view-matrix"
                aria-pressed={viewMode === 'matrix'}
                onClick={() => setViewMode('matrix')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                    : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{ct.viewMatrix}</span>
              </button>
              <button
                type="button"
                data-testid="conjugation-view-flashcards"
                aria-pressed={viewMode === 'flashcards'}
                onClick={() => setViewMode('flashcards')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'flashcards'
                    ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                    : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{ct.viewFlashcards}</span>
              </button>
            </div>

            {/* Unified Native Female Speaker */}
            <div
              aria-label={ct.nativeVoiceLabel}
              className="flex flex-wrap items-center gap-1.5"
            >
              <span className="text-[11px] font-semibold text-[#686259] dark:text-slate-400">
                {ct.nativeVoiceLabel}
              </span>
              {NATIVE_SPEAKER_VOICES.map((voice) => (
                <span
                  key={voice.id}
                  data-testid={`conjugation-voice-${voice.id}`}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#4E6231] text-white whitespace-nowrap shrink-0"
                >
                  {voice.speakerName} · {voice.cityHint}
                </span>
              ))}
            </div>

            {totalCachedClips > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#686259] dark:text-slate-400">
                <span data-testid="conjugation-cached-count" className="tabular-nums">
                  {ct.cachedClipsLabel(totalCachedClips)}
                </span>
                <button
                  type="button"
                  data-testid="conjugation-clear-audio-cache"
                  onClick={() => void handleClearAudioCache()}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/70 dark:bg-[#1D2622] hover:border-[#C68335] text-[#686259] dark:text-slate-300 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                  <span>{ct.clearAudioCache}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {viewMode === 'flashcards' && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#EFECE4] dark:border-[#2A352F]">
            <p className="text-xs font-semibold tabular-nums text-[#686259] dark:text-slate-400">
              {ct.countSummary(filteredItems.length, sourceScopedIndex.length)}
              {source !== 'all' ? ` · ${t.sources[source]}` : ''}
              {query.trim() ? ` · « ${query.trim()} »` : ''}
              {difficulty !== 'all' ? ` · ${ct.difficultyLevels[difficulty]}` : ''}
              {verbPattern !== 'all' ? ` · ${t.verbPatterns[verbPattern]}` : ''}
              {letter !== 'all' ? ` · ${letter}` : ''}
            </p>
            <button
              type="button"
              data-testid="flashcard-toggle-filters"
              aria-expanded={showFiltersInFlashcards}
              onClick={() => setShowFiltersInFlashcards((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/70 dark:bg-[#1D2622] hover:border-[#5C723C] text-xs font-semibold text-[#4E6231] dark:text-[#A5C178] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {`${ct.difficultyLabel.replace(/[:：]/g, '').trim()} · ${t.verbPatternLabel.replace(/[:：]/g, '').trim()} · ${t.alphabetLabel.split(/[（(]/)[0].trim()}`}
              </span>
              {showFiltersInFlashcards ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        {(viewMode !== 'flashcards' || showFiltersInFlashcards) && (
          <div className="space-y-5">
        {/* Search Input + Search Scope */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-7 relative">
            <Search
              className="w-4 h-4 text-[#8E867B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              data-testid="conjugation-search-input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleLimit(PAGE_BATCH_SIZE);
              }}
              placeholder={ct.searchPlaceholder}
              aria-label={ct.searchLabel}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] text-sm text-[#23201C] dark:text-slate-100 placeholder:text-[#8E867B] focus:outline-none focus:border-[#5C723C]"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setVisibleLimit(PAGE_BATCH_SIZE);
                }}
                aria-label={t.clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#686259] hover:text-[#23201C] dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div
            role="group"
            aria-label={ct.scopeLabel}
            className="lg:col-span-5 flex flex-wrap items-center gap-1.5"
          >
            <span className="text-xs font-semibold text-[#686259] dark:text-slate-400 mr-1">
              {ct.scopeLabel}
            </span>
            {(
              [
                { id: 'all', label: ct.scopeAll },
                { id: 'root', label: ct.scopeRoot },
                { id: 'tense', label: ct.scopeTense },
              ] as const
            ).map((scope) => {
              const active = searchScope === scope.id;
              return (
                <button
                  key={scope.id}
                  type="button"
                  data-testid={`conjugation-scope-${scope.id}`}
                  aria-pressed={active}
                  onClick={() => {
                    setSearchScope(scope.id);
                    setVisibleLimit(PAGE_BATCH_SIZE);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#5C723C] text-white border-[#5C723C]'
                      : 'bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                  }`}
                >
                  {scope.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tense Filter Row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[#686259] dark:text-slate-400 mr-1">
            {ct.tenseLabel}
          </span>
          {(
            [
              { id: 'all', label: ct.tenseAll },
              { id: 'present', label: ct.tensePresent },
              { id: 'past', label: ct.tensePast },
              { id: 'negation', label: ct.tenseNegation },
              { id: 'imperative', label: ct.tenseImperative },
            ] as const
          ).map((tenseItem) => {
            const active = tenseFilter === tenseItem.id;
            return (
              <button
                key={tenseItem.id}
                type="button"
                data-testid={`conjugation-tense-${tenseItem.id}`}
                aria-pressed={active}
                onClick={() => {
                  setTenseFilter(tenseItem.id);
                  setVisibleLimit(PAGE_BATCH_SIZE);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#C68335] text-white border-[#C68335]'
                    : 'bg-white dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#C68335]'
                }`}
              >
                {tenseItem.label}
              </button>
            );
          })}
        </div>

        {/* Source Book Filter Row */}
        <div
          role="group"
          aria-label={t.sourceFilterLabel}
          className="flex flex-wrap items-center gap-1.5"
        >
          <span className="text-xs font-semibold text-[#686259] dark:text-slate-400 mr-1">
            {t.sourceFilterLabel}
          </span>
          {SOURCE_ORDER.map((srcKey) => {
            const active = source === srcKey;
            return (
              <button
                key={srcKey}
                type="button"
                data-testid={`conjugation-source-${srcKey}`}
                aria-pressed={active}
                onClick={() => {
                  setSource(srcKey);
                  if (letter !== 'all' && srcKey !== 'all') {
                    const nextEntries = allVerbsIndex
                      .filter((item) => getEntrySource(item.entry) === srcKey)
                      .map((item) => item.entry);
                    const nextLetters = new Set(getAvailableDictionaryLetters(nextEntries));
                    if (!nextLetters.has(letter)) {
                      setLetter('all');
                    }
                  }
                  setVisibleLimit(PAGE_BATCH_SIZE);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap shrink-0 tabular-nums cursor-pointer ${
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

        {/* Difficulty Level + Verb Pattern Filter + Quick Root Presets */}
        <div className="space-y-3 pt-2 border-t border-[#EFECE4] dark:border-[#2A352F]">
          <div
            role="group"
            aria-label={ct.difficultyLabel}
            className="flex flex-wrap items-center gap-1.5"
          >
            <span className="text-xs font-semibold text-[#686259] dark:text-slate-400 mr-1">
              {ct.difficultyLabel}
            </span>
            {DIFFICULTY_ORDER.map((lvl) => {
              const active = difficulty === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  data-testid={`conjugation-difficulty-${lvl}`}
                  aria-pressed={active}
                  onClick={() => {
                    setDifficulty(lvl);
                    setVisibleLimit(PAGE_BATCH_SIZE);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap shrink-0 tabular-nums cursor-pointer ${
                    active
                      ? 'bg-[#23201C] dark:bg-slate-100 text-white dark:text-[#171E1B] border-transparent'
                      : 'bg-[#F5F1E8]/60 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                  }`}
                >
                  {ct.difficultyLevels[lvl]} ({difficultyCounts[lvl]})
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#686259] dark:text-slate-400 mr-1">
              {t.verbPatternLabel}
            </span>
            {VERB_PATTERN_ORDER.map((patternKey) => {
              const active = verbPattern === patternKey;
              return (
                <button
                  key={patternKey}
                  type="button"
                  data-testid={`conjugation-pattern-${patternKey}`}
                  aria-pressed={active}
                  onClick={() => {
                    setVerbPattern(patternKey);
                    setVisibleLimit(PAGE_BATCH_SIZE);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap shrink-0 tabular-nums cursor-pointer ${
                    active
                      ? 'bg-[#4E6231] text-white border-[#4E6231]'
                      : 'bg-[#F5F1E8]/60 dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                  }`}
                >
                  {t.verbPatterns[patternKey]} ({patternCounts[patternKey]})
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#686259] dark:text-slate-400 mr-1">
              {ct.quickRootsLabel}
            </span>
            {QUICK_ROOT_PRESETS.map((preset) => {
              const active =
                searchScope === 'root' &&
                query.trim().toLowerCase() === preset.query;
              return (
                <button
                  key={preset.id}
                  type="button"
                  data-testid={`conjugation-quick-root-${preset.id}`}
                  onClick={() => {
                    setSearchScope('root');
                    setQuery(preset.query);
                    setLetter('all');
                    setDifficulty('all');
                    setVerbPattern('all');
                    setVisibleLimit(PAGE_BATCH_SIZE);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#5C723C] text-white border-[#5C723C]'
                      : 'bg-white dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                  }`}
                >
                  <span className="font-arabic" lang="ar">
                    {preset.arabic}
                  </span>
                  <span className="font-mono text-[11px] opacity-80">
                    {preset.latin}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alphabet Filter & Count Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#EFECE4] dark:border-[#2A352F]">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              data-testid="conjugation-letter-all"
              onClick={() => {
                setLetter('all');
                setVisibleLimit(PAGE_BATCH_SIZE);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                letter === 'all'
                  ? 'bg-[#23201C] dark:bg-slate-100 text-white dark:text-[#171E1B] border-transparent'
                  : 'bg-white dark:bg-[#1D2622] text-[#686259] dark:text-slate-300 border-[#E4DFD2] dark:border-[#2A352F]'
              }`}
            >
              {t.letterAll}
            </button>
            {activeLetters.map((ltr) => {
              const active = letter === ltr;
              return (
                <button
                  key={ltr}
                  type="button"
                  data-testid={`conjugation-letter-${ltr}`}
                  onClick={() => {
                    setLetter(ltr);
                    setVisibleLimit(PAGE_BATCH_SIZE);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold border inline-flex items-center justify-center shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#5C723C] text-white border-[#5C723C]'
                      : 'bg-white dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                  }`}
                >
                  {ltr}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-semibold tabular-nums text-[#686259] dark:text-slate-400">
            {ct.countSummary(filteredItems.length, sourceScopedIndex.length)}
          </p>
        </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div
          data-testid="conjugation-empty-state"
          className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-8 text-center space-y-3"
        >
          <p className="font-display text-lg font-bold text-[#23201C] dark:text-slate-100">
            {ct.emptyTitle(query)}
          </p>
          <p className="text-sm text-[#686259] dark:text-slate-400 max-w-md mx-auto">
            {ct.emptyHint}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5C723C] hover:bg-[#4E6231] text-white text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.resetFilters}</span>
          </button>
        </div>
      )}

      {/* VIEW 1: Two-Zone Interactive Detail View */}
      {filteredItems.length > 0 && viewMode === 'detail' && activeItem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Verb List */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {visibleItems.map((item) => {
                const isSelected = item.entry.id === activeItem.entry.id;
                const listAudioKey = `list-${item.entry.id}`;
                const isListPlaying = playingKey === listAudioKey;
                const patternLabel = item.entry.verbPattern
                  ? t.verbPatterns[item.entry.verbPattern]
                  : t.verbPatterns.regular;

                return (
                  <div
                    key={item.entry.id}
                    className={`w-full p-4 rounded-2xl border flex items-start justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#F7F9F2] dark:bg-[#1D2622] border-[#5C723C]'
                        : 'bg-white dark:bg-[#171E1B] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                    }`}
                  >
                    <button
                      type="button"
                      data-testid={`conjugation-verb-item-${item.entry.id}`}
                      onClick={() => {
                        setSelectedVerbId(item.entry.id);
                        onStudyVerb?.(item.entry.id);
                      }}
                      className="flex-1 min-w-0 text-left cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-display text-sm font-bold text-[#23201C] dark:text-slate-100">
                          {item.entry.frenchHeadword}
                        </span>
                        {item.entry.sourcePage && (
                          <span className="font-mono text-[11px] tabular-nums text-[#8E867B] dark:text-slate-400 shrink-0">
                            {item.entry.sourcePage}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#686259] dark:text-slate-400 flex flex-wrap items-center gap-x-1.5">
                        <span className="font-arabic text-sm text-[#4E6231] dark:text-[#A5C178]" lang="ar">
                          <bdi>{item.arabicRoot}</bdi>
                        </span>
                        <span>·</span>
                        <span className="font-mono">{item.latinRoot}</span>
                        <span>·</span>
                        <span>{patternLabel}</span>
                        <span>·</span>
                        <span className={DIFFICULTY_TEXT_CLASSES[item.difficulty]}>
                          {ct.difficultyLevels[item.difficulty]}
                        </span>
                      </p>

                      <p className="text-xs font-medium text-[#23201C] dark:text-slate-200 truncate">
                        {renderTensePreview(item)}
                      </p>
                    </button>

                    <button
                      type="button"
                      data-testid={`conjugation-list-listen-${item.entry.id}`}
                      onClick={() =>
                        handlePlayAudio(
                          listAudioKey,
                          item.arabicTriple.spokenTripleArabic,
                          item.entry.darijaLatin,
                          item.entry.phonetic,
                          false,
                          item.entry.id
                        )
                      }
                      aria-label={`${t.listen}: ${item.entry.frenchHeadword}`}
                      className={`w-8 h-8 rounded-xl inline-flex items-center justify-center border shrink-0 cursor-pointer ${
                        isListPlaying
                          ? 'bg-[#5C723C] text-white border-[#5C723C]'
                          : 'bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>

            {remainingCount > 0 && (
              <button
                type="button"
                data-testid="conjugation-show-more"
                onClick={() => setVisibleLimit((prev) => prev + PAGE_BATCH_SIZE)}
                className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C] text-xs font-semibold text-[#4E6231] dark:text-[#A5C178] cursor-pointer"
              >
                {ct.showMoreVerbs(remainingCount)}
              </button>
            )}
          </div>

          {/* Right Column: Sticky Interactive Conjugation Stage */}
          <article
            data-testid="conjugation-detail-stage"
            className="lg:col-span-7 lg:sticky lg:top-20 bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 space-y-5"
          >
            {/* Stage Header */}
            <div className="flex flex-col gap-3 pb-4 border-b border-[#EFECE4] dark:border-[#2A352F]">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-mono text-[#C68335] tabular-nums flex flex-wrap items-center gap-x-1.5">
                  <span>{activeItem.entry.letter}</span>
                  <span>·</span>
                  <span>
                    {activeItem.entry.sourcePage ?? t.sources[getEntrySource(activeItem.entry)]}
                  </span>
                  <span>·</span>
                  <span
                    data-testid="conjugation-stage-difficulty"
                    className={`font-sans ${DIFFICULTY_TEXT_CLASSES[activeItem.difficulty]}`}
                  >
                    {ct.difficultyLevels[activeItem.difficulty]}
                  </span>
                  {activeItem.entry.preposition ? (
                    <>
                      <span>·</span>
                      <span>{`${t.prepositionLabel} ${activeItem.entry.preposition}`}</span>
                    </>
                  ) : null}
                </p>
                <h3 className="font-display text-2xl font-extrabold text-[#23201C] dark:text-slate-50">
                  {activeItem.entry.frenchHeadword}
                </h3>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-sm font-bold text-[#4E6231] dark:text-[#A5C178]">
                    {activeItem.entry.darijaLatin}
                  </span>
                  <span
                    className="font-arabic text-lg text-[#23201C] dark:text-slate-100"
                    lang="ar"
                    dir="rtl"
                  >
                    <bdi>{activeItem.entry.darijaArabic}</bdi>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="conjugation-stage-listen"
                  onClick={() =>
                    handlePlayAudio(
                      `stage-${activeItem.entry.id}`,
                      activeItem.arabicTriple.spokenTripleArabic,
                      activeItem.entry.darijaLatin,
                      activeItem.entry.phonetic
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                    playingKey === `stage-${activeItem.entry.id}`
                      ? 'bg-[#5C723C] text-white border-[#5C723C]'
                      : 'bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                  }`}
                >
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {playingKey === `stage-${activeItem.entry.id}`
                      ? t.playing
                      : t.listen}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="conjugation-stage-listen-slow"
                  onClick={() =>
                    handlePlayAudio(
                      `stage-slow-${activeItem.entry.id}`,
                      activeItem.arabicTriple.spokenTripleArabic,
                      activeItem.entry.darijaLatin,
                      activeItem.entry.phonetic,
                      true
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                    playingKey === `stage-slow-${activeItem.entry.id}`
                      ? 'bg-[#C68335] text-white border-[#C68335]'
                      : 'bg-white dark:bg-[#1D2622] text-[#8E5B1E] dark:text-[#E5A95E] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#C68335]'
                  }`}
                >
                  <Turtle className="w-4 h-4" aria-hidden="true" />
                  <span>{ct.listenSlow}</span>
                </button>

                <button
                  type="button"
                  data-testid="conjugation-stage-listen-all8"
                  onClick={() => handlePlayVerbTriple(activeItem)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 cursor-pointer ${
                    isSequencePlaying
                      ? 'bg-[#23201C] dark:bg-slate-100 text-white dark:text-[#171E1B] border-transparent'
                      : 'bg-white dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                  }`}
                >
                  {isSequencePlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{ct.stopAudio}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{ct.listenVerbTriple}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  data-testid="conjugation-stage-cache-offline"
                  disabled={isCachingVerb}
                  onClick={() => void handleCacheActiveVerbOffline()}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 tabular-nums cursor-pointer disabled:opacity-70 ${
                    verbCacheProgress.total > 0 &&
                    verbCacheProgress.cached >= verbCacheProgress.total
                      ? 'bg-[#E5EBD6]/80 dark:bg-[#1E2B20] text-[#4E6231] dark:text-[#A5C178] border-[#5C723C]/50'
                      : 'bg-white dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                  }`}
                >
                  {verbCacheProgress.total > 0 &&
                  verbCacheProgress.cached >= verbCacheProgress.total ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{ct.offlineReady}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {isCachingVerb
                          ? ct.savingOffline(
                              verbCacheProgress.cached,
                              verbCacheProgress.total
                            )
                          : verbCacheProgress.cached > 0 &&
                              verbCacheProgress.cached < verbCacheProgress.total
                            ? `${ct.saveOffline} (${verbCacheProgress.cached}/${verbCacheProgress.total})`
                            : ct.saveOffline}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 4-Cell Root, Pattern & Imperative Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F]">
                <p className="text-[11px] font-semibold text-[#686259] dark:text-slate-400">
                  {ct.arabicRootLabel}
                </p>
                <p className="font-arabic text-lg font-bold text-[#4E6231] dark:text-[#A5C178] mt-0.5" lang="ar">
                  <bdi>{activeItem.arabicRoot}</bdi>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F]">
                <p className="text-[11px] font-semibold text-[#686259] dark:text-slate-400">
                  {ct.latinRootLabel}
                </p>
                <p className="font-mono text-sm font-bold text-[#23201C] dark:text-slate-100 mt-1">
                  {activeItem.latinRoot}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F]">
                <p className="text-[11px] font-semibold text-[#686259] dark:text-slate-400">
                  {ct.patternLabel}
                </p>
                <p className="text-sm font-bold text-[#23201C] dark:text-slate-100 mt-1">
                  {activeItem.entry.verbPattern
                    ? t.verbPatterns[activeItem.entry.verbPattern]
                    : t.verbPatterns.regular}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#686259] dark:text-slate-400">
                    {t.imperative}
                  </p>
                  <p className="text-sm font-bold text-[#C68335] mt-1 truncate">
                    {activeItem.entry.conjugation?.imperative ?? '—'}
                  </p>
                  {activeItem.entry.conjugation?.imperative && activeItem.arabicImperative && (
                    <p className="font-arabic text-xs text-[#686259] dark:text-slate-400" lang="ar">
                      <bdi>{activeItem.arabicImperative}</bdi>
                    </p>
                  )}
                </div>
                {activeItem.entry.conjugation?.imperative && (
                  <button
                    type="button"
                    data-testid="conjugation-listen-imperative"
                    onClick={() =>
                      handlePlayAudio(
                        `imp-${activeItem.entry.id}`,
                        activeItem.arabicImperative,
                        activeItem.entry.conjugation!.imperative!
                      )
                    }
                    aria-label={ct.listenFormAria(
                      t.imperative,
                      activeItem.entry.conjugation.imperative
                    )}
                    className={`w-7 h-7 rounded-lg inline-flex items-center justify-center border shrink-0 cursor-pointer ${
                      playingKey === `imp-${activeItem.entry.id}`
                        ? 'bg-[#C68335] text-white border-[#C68335]'
                        : 'bg-white dark:bg-[#171E1B] text-[#C68335] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#C68335]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* 3-Form Principal Parts */}
            {activeItem.entry.conjugation && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#686259] dark:text-slate-400">
                  {ct.principalPartsLabel}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      {
                        key: 'p1s',
                        label: t.present1s,
                        latin: activeItem.entry.conjugation.present1s,
                        arabic: activeItem.arabicTriple.present1sArabic,
                      },
                      {
                        key: 'k1s',
                        label: t.past1s,
                        latin: activeItem.entry.conjugation.past1s,
                        arabic: activeItem.arabicTriple.past1sArabic,
                      },
                      {
                        key: 'k3ms',
                        label: t.past3ms,
                        latin: activeItem.entry.conjugation.past3ms,
                        arabic: activeItem.arabicTriple.past3msArabic,
                      },
                    ] as const
                  ).map((part) => {
                    const partAudioKey = `part-${activeItem.entry.id}-${part.key}`;
                    const isPartPlaying = playingKey === partAudioKey;
                    return (
                      <div
                        key={part.key}
                        className="p-3 rounded-xl border border-[#EFECE4] dark:border-[#2A352F] bg-white dark:bg-[#151B18] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-[#686259] dark:text-slate-400">
                            {part.label}
                          </p>
                          <p className="text-sm font-bold text-[#23201C] dark:text-slate-100 mt-0.5 truncate">
                            {part.latin}
                          </p>
                          {part.arabic && (
                            <p className="font-arabic text-xs text-[#4E6231] dark:text-[#A5C178]" lang="ar">
                              <bdi>{part.arabic}</bdi>
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          data-testid={`conjugation-part-listen-${part.key}`}
                          onClick={() =>
                            handlePlayAudio(partAudioKey, part.arabic, part.latin)
                          }
                          aria-label={ct.listenFormAria(part.label, part.latin)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center border shrink-0 cursor-pointer ${
                            isPartPlaying
                              ? 'bg-[#5C723C] text-white border-[#5C723C]'
                              : 'bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full 8-Person Interactive Table */}
            <div className="overflow-x-auto border border-[#EFECE4] dark:border-[#2A352F] rounded-xl">
              <table
                data-testid="conjugation-8person-table"
                className="w-full text-left border-collapse text-xs sm:text-sm"
              >
                <thead>
                  <tr className="bg-[#F5F1E8]/80 dark:bg-[#1D2622] border-b border-[#EFECE4] dark:border-[#2A352F] text-[#686259] dark:text-slate-300">
                    <th className="py-2.5 px-3 font-bold">{t.personHeader}</th>
                    <th
                      className={`py-2.5 px-3 font-bold ${
                        tenseFilter === 'present'
                          ? 'text-[#4E6231] dark:text-[#A5C178] bg-[#E5EBD6]/60 dark:bg-[#26322B]'
                          : ''
                      }`}
                    >
                      {t.presentHeader}
                    </th>
                    <th
                      className={`py-2.5 px-3 font-bold ${
                        tenseFilter === 'past'
                          ? 'text-[#4E6231] dark:text-[#A5C178] bg-[#E5EBD6]/60 dark:bg-[#26322B]'
                          : ''
                      }`}
                    >
                      {t.pastHeader}
                    </th>
                    <th
                      className={`py-2.5 px-3 font-bold ${
                        tenseFilter === 'negation'
                          ? 'text-[#4E6231] dark:text-[#A5C178] bg-[#E5EBD6]/60 dark:bg-[#26322B]'
                          : ''
                      }`}
                    >
                      {t.negationHeader}
                    </th>
                    <th className="py-2.5 px-2 w-10" aria-label={t.listen} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE4] dark:divide-[#2A352F]">
                  {activeItem.tableRows.map((row) => {
                    const rowKey = `row-${activeItem.entry.id}-${row.personKey}`;
                    const presKey = `${rowKey}-pres`;
                    const pastKey = `${rowKey}-past`;
                    const negKey = `${rowKey}-neg`;
                    const arabicRow = activeItem.arabicRows[row.personKey];
                    const spokenForm =
                      tenseFilter === 'past'
                        ? row.past
                        : tenseFilter === 'negation'
                          ? row.negativePresent
                          : row.present;
                    const spokenArabic =
                      tenseFilter === 'past'
                        ? arabicRow.pastArabic
                        : tenseFilter === 'negation'
                          ? arabicRow.negativePresentArabic
                          : arabicRow.presentArabic;
                    const isRowPlaying = playingKey === rowKey;

                    return (
                      <tr
                        key={row.personKey}
                        className={
                          isRowPlaying
                            ? 'bg-[#E5EBD6]/55 dark:bg-[#26322B]/80'
                            : 'hover:bg-[#F5F1E8]/40 dark:hover:bg-[#1D2622]/60'
                        }
                      >
                        <td className="py-2.5 px-3 font-semibold text-[#23201C] dark:text-slate-100 whitespace-nowrap">
                          {row.pronoun}
                        </td>
                        <td
                          className={`py-2 px-3 font-medium text-[#23201C] dark:text-slate-200 ${
                            tenseFilter === 'present'
                              ? 'bg-[#F7F9F2] dark:bg-[#1D2622] font-bold text-[#4E6231] dark:text-[#A5C178]'
                              : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handlePlayAudio(
                                presKey,
                                arabicRow.presentArabic,
                                row.present
                              )
                            }
                            aria-label={ct.listenRowAria(row.pronoun, row.present)}
                            className={`text-left group inline-flex flex-col cursor-pointer rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors ${
                              playingKey === presKey
                                ? 'bg-[#5C723C] text-white'
                                : 'hover:bg-[#EFECE4]/70 dark:hover:bg-[#26322B]'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <span>{row.present}</span>
                              <Volume2
                                className={`w-3 h-3 shrink-0 ${
                                  playingKey === presKey
                                    ? 'opacity-100'
                                    : 'opacity-40 group-hover:opacity-100'
                                }`}
                                aria-hidden="true"
                              />
                            </span>
                            {arabicRow.presentArabic && (
                              <span
                                className={`font-arabic text-[11px] leading-tight ${
                                  playingKey === presKey
                                    ? 'text-white/90'
                                    : 'text-[#686259] dark:text-slate-400'
                                }`}
                                lang="ar"
                              >
                                <bdi>{arabicRow.presentArabic}</bdi>
                              </span>
                            )}
                          </button>
                        </td>
                        <td
                          className={`py-2 px-3 font-medium text-[#23201C] dark:text-slate-200 ${
                            tenseFilter === 'past'
                              ? 'bg-[#F7F9F2] dark:bg-[#1D2622] font-bold text-[#4E6231] dark:text-[#A5C178]'
                              : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handlePlayAudio(
                                pastKey,
                                arabicRow.pastArabic,
                                row.past
                              )
                            }
                            aria-label={ct.listenRowAria(row.pronoun, row.past)}
                            className={`text-left group inline-flex flex-col cursor-pointer rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors ${
                              playingKey === pastKey
                                ? 'bg-[#5C723C] text-white'
                                : 'hover:bg-[#EFECE4]/70 dark:hover:bg-[#26322B]'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <span>{row.past}</span>
                              <Volume2
                                className={`w-3 h-3 shrink-0 ${
                                  playingKey === pastKey
                                    ? 'opacity-100'
                                    : 'opacity-40 group-hover:opacity-100'
                                }`}
                                aria-hidden="true"
                              />
                            </span>
                            {arabicRow.pastArabic && (
                              <span
                                className={`font-arabic text-[11px] leading-tight ${
                                  playingKey === pastKey
                                    ? 'text-white/90'
                                    : 'text-[#686259] dark:text-slate-400'
                                }`}
                                lang="ar"
                              >
                                <bdi>{arabicRow.pastArabic}</bdi>
                              </span>
                            )}
                          </button>
                        </td>
                        <td
                          className={`py-2 px-3 font-medium text-[#686259] dark:text-slate-300 ${
                            tenseFilter === 'negation'
                              ? 'bg-[#F7F9F2] dark:bg-[#1D2622] font-bold text-[#C68335]'
                              : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handlePlayAudio(
                                negKey,
                                arabicRow.negativePresentArabic,
                                row.negativePresent
                              )
                            }
                            aria-label={ct.listenRowAria(
                              row.pronoun,
                              row.negativePresent
                            )}
                            className={`text-left group inline-flex flex-col cursor-pointer rounded-lg px-1.5 py-0.5 -mx-1.5 transition-colors ${
                              playingKey === negKey
                                ? 'bg-[#C68335] text-white'
                                : 'hover:bg-[#EFECE4]/70 dark:hover:bg-[#26322B]'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <span>{row.negativePresent}</span>
                              <Volume2
                                className={`w-3 h-3 shrink-0 ${
                                  playingKey === negKey
                                    ? 'opacity-100'
                                    : 'opacity-40 group-hover:opacity-100'
                                }`}
                                aria-hidden="true"
                              />
                            </span>
                            {arabicRow.negativePresentArabic && (
                              <span
                                className={`font-arabic text-[11px] leading-tight ${
                                  playingKey === negKey
                                    ? 'text-white/90'
                                    : 'text-[#686259] dark:text-slate-400'
                                }`}
                                lang="ar"
                              >
                                <bdi>{arabicRow.negativePresentArabic}</bdi>
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handlePlayAudio(rowKey, spokenArabic, spokenForm)
                            }
                            aria-label={ct.listenRowAria(row.pronoun, spokenForm)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center border cursor-pointer ${
                              isRowPlaying
                                ? 'bg-[#5C723C] text-white border-[#5C723C]'
                                : 'bg-white dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Attested Book Example & Alternative Forms */}
            {(activeItem.entry.exampleDarija ||
              (activeItem.entry.alternativeForms &&
                activeItem.entry.alternativeForms.length > 0) ||
              activeItem.entry.usageNote) && (
              <div className="p-4 rounded-xl bg-[#F5F1E8]/60 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] space-y-2.5 text-xs">
                {activeItem.entry.exampleDarija && (
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-[#23201C] dark:text-slate-100">
                        {activeItem.entry.exampleDarija}
                        {activeItem.entry.exampleArabic && (
                          <span
                            className="font-arabic text-sm text-[#4E6231] dark:text-[#A5C178] ml-2"
                            lang="ar"
                          >
                            <bdi>{activeItem.entry.exampleArabic}</bdi>
                          </span>
                        )}
                      </p>
                      {activeItem.entry.exampleFrench && (
                        <p className="text-[#686259] dark:text-slate-300">
                          {activeItem.entry.exampleFrench}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        data-testid="conjugation-listen-example"
                        onClick={() =>
                          handlePlayAudio(
                            `ex-${activeItem.entry.id}`,
                            activeItem.entry.exampleArabic ?? '',
                            activeItem.entry.exampleDarija!
                          )
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border whitespace-nowrap cursor-pointer ${
                          playingKey === `ex-${activeItem.entry.id}`
                            ? 'bg-[#5C723C] text-white border-[#5C723C]'
                            : 'bg-white dark:bg-[#171E1B] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{ct.listenExample}</span>
                      </button>
                      <button
                        type="button"
                        data-testid="conjugation-listen-example-slow"
                        onClick={() =>
                          handlePlayAudio(
                            `ex-slow-${activeItem.entry.id}`,
                            activeItem.entry.exampleArabic ?? '',
                            activeItem.entry.exampleDarija!,
                            undefined,
                            true
                          )
                        }
                        aria-label={`${ct.listenExample} (${ct.listenSlow})`}
                        className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold border whitespace-nowrap cursor-pointer ${
                          playingKey === `ex-slow-${activeItem.entry.id}`
                            ? 'bg-[#C68335] text-white border-[#C68335]'
                            : 'bg-white dark:bg-[#171E1B] text-[#8E5B1E] dark:text-[#E5A95E] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#C68335]'
                        }`}
                      >
                        <Turtle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>0,75×</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeItem.entry.alternativeForms &&
                  activeItem.entry.alternativeForms.length > 0 && (
                    <p className="text-[#686259] dark:text-slate-300">
                      <span className="font-semibold text-[#23201C] dark:text-slate-100">
                        {t.alternativesLabel}{' '}
                      </span>
                      {activeItem.entry.alternativeForms.join(' · ')}
                    </p>
                  )}

                {activeItem.entry.usageNote && (
                  <p className="text-[#686259] dark:text-slate-400">
                    {activeItem.entry.usageNote}
                  </p>
                )}
              </div>
            )}
          </article>
        </div>
      )}

      {/* VIEW 2: Comparative Multi-Verb Matrix */}
      {filteredItems.length > 0 && viewMode === 'matrix' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table
                data-testid="conjugation-matrix-table"
                className="w-full text-left border-collapse text-xs sm:text-sm"
              >
                <thead>
                  <tr className="bg-[#F5F1E8]/80 dark:bg-[#1D2622] border-b border-[#EFECE4] dark:border-[#2A352F] text-[#686259] dark:text-slate-300">
                    <th className="py-3 px-3.5 font-bold whitespace-nowrap">
                      {ct.matrixVerbHeader}
                    </th>
                    <th className="py-3 px-3.5 font-bold whitespace-nowrap">
                      {ct.matrixRootHeader}
                    </th>
                    <th className="py-3 px-3.5 font-bold whitespace-nowrap">
                      {ct.matrixPatternHeader}
                    </th>
                    <th className="py-3 px-3.5 font-bold whitespace-nowrap">
                      {ct.matrixDifficultyHeader}
                    </th>
                    <th className="py-3 px-3.5 font-bold whitespace-nowrap">
                      {ct.matrixPresentHeader}
                    </th>
                    <th className="py-3 px-3.5 font-bold whitespace-nowrap">
                      {ct.matrixPast1Header}
                    </th>
                    <th className="py-3 px-3.5 font-bold whitespace-nowrap">
                      {ct.matrixPast3Header}
                    </th>
                    <th className="py-3 px-3.5 font-bold whitespace-nowrap">
                      {ct.matrixNegHeader}
                    </th>
                    <th className="py-3 px-3.5 font-bold whitespace-nowrap">
                      {ct.matrixImpHeader}
                    </th>
                    <th className="py-3 px-2.5 w-10" aria-label={t.listen} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE4] dark:divide-[#2A352F]">
                  {visibleItems.map((item) => {
                    const conj = item.entry.conjugation!;
                    const neg1s = item.tableRows[0]?.negativePresent ?? '—';
                    const rowAudioKey = `matrix-${item.entry.id}`;
                    const isPlaying = playingKey === rowAudioKey;
                    const patternLabel = item.entry.verbPattern
                      ? t.verbPatterns[item.entry.verbPattern]
                      : t.verbPatterns.regular;

                    return (
                      <tr
                        key={item.entry.id}
                        className="hover:bg-[#F5F1E8]/40 dark:hover:bg-[#1D2622]/60"
                      >
                        <td className="py-2.5 px-3.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVerbId(item.entry.id);
                              setViewMode('detail');
                            }}
                            className="text-left font-bold text-[#4E6231] dark:text-[#A5C178] hover:underline cursor-pointer"
                          >
                            {item.entry.frenchHeadword}
                          </button>
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-arabic text-sm text-[#23201C] dark:text-slate-100" lang="ar">
                            <bdi>{item.arabicRoot}</bdi>
                          </span>
                          <span className="font-mono text-xs text-[#686259] dark:text-slate-400 ml-1.5">
                            {item.latinRoot}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-xs text-[#686259] dark:text-slate-300 whitespace-nowrap">
                          {patternLabel}
                        </td>
                        <td className="py-2.5 px-3.5 text-xs whitespace-nowrap">
                          <span className={DIFFICULTY_TEXT_CLASSES[item.difficulty]}>
                            {ct.difficultyLevels[item.difficulty]}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 font-medium text-[#23201C] dark:text-slate-100 whitespace-nowrap">
                          {conj.present1s}
                        </td>
                        <td className="py-2.5 px-3.5 font-medium text-[#23201C] dark:text-slate-200 whitespace-nowrap">
                          {conj.past1s}
                        </td>
                        <td className="py-2.5 px-3.5 font-medium text-[#23201C] dark:text-slate-200 whitespace-nowrap">
                          {conj.past3ms}
                        </td>
                        <td className="py-2.5 px-3.5 font-medium text-[#686259] dark:text-slate-300 whitespace-nowrap">
                          {neg1s}
                        </td>
                        <td className="py-2.5 px-3.5 font-medium text-[#C68335] whitespace-nowrap">
                          {conj.imperative ?? '—'}
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handlePlayAudio(
                                rowAudioKey,
                                item.arabicTriple.spokenTripleArabic,
                                item.entry.darijaLatin,
                                item.entry.phonetic
                              )
                            }
                            aria-label={`${t.listen}: ${item.entry.frenchHeadword}`}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center border cursor-pointer ${
                              isPlaying
                                ? 'bg-[#5C723C] text-white border-[#5C723C]'
                                : 'bg-white dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {remainingCount > 0 && (
            <button
              type="button"
              data-testid="conjugation-matrix-show-more"
              onClick={() => setVisibleLimit((prev) => prev + PAGE_BATCH_SIZE)}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C] text-xs font-semibold text-[#4E6231] dark:text-[#A5C178] cursor-pointer"
            >
              {ct.showMoreVerbs(remainingCount)}
            </button>
          )}
        </div>
      )}

      {/* VIEW 3: Flashcards Trainer (Past / Present / Future) */}
      {filteredItems.length > 0 && viewMode === 'flashcards' && (
        <ConjugationFlashcardTrainer
          items={filteredItems}
          language={language}
          voiceName={voiceName}
          onEarnXp={onEarnXp}
        />
      )}
    </section>
  );
}
