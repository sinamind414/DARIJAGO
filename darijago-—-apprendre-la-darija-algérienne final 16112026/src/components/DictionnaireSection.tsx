import { useEffect, useMemo, useState } from 'react';
import { CORPUS_SOURCES, CORPUS_TOTAL } from '../data/corpus';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
  Volume2,
  X,
} from 'lucide-react';
import { BEN_SEDIRA_ALPHABET } from '../data/benSediraDictionary';
import { BEN_SEDIRA_TRANSLATIONS } from '../i18n/benSediraTranslations';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import type { DictionaryCategory, VerbPattern } from '../types/benSedira';
import type { AppLanguage } from '../types/darija';
import { playDarijaPronunciation, stopAllAudio } from '../utils/audioPlayer';
import { stopWebSpeechPlayback } from '../utils/webSpeechPlayer';
import { PhrasePlayButton } from './PhrasePlayButton';
import { deriveFullConjugationTable } from '../utils/dictionaryLogic';
import {
  OFFLINE_STATUS_UPDATED_EVENT,
  readOfflineDictionaryFromIndexedDb,
} from '../utils/offlineIndexedDb';
import {
  buildUnifiedDictionary,
  computeGrammaticalCategoryCounts,
  computeUnifiedLetterCounts,
  computeUnifiedSourceCounts,
  computeUnifiedVerbPatternCounts,
  searchUnifiedDictionary,
  type UnifiedDictionaryEntry,
  type UnifiedDictionarySource,
} from '../utils/unifiedDictionaryLogic';
import { searchCorpus } from '../utils/corpusSearch';

interface DictionnaireSectionProps {
  language: AppLanguage;
  initialCategory?: DictionaryCategory | 'all';
  onVerbStudied?: (verbId: string) => void;
}

const GRAMMATICAL_CATEGORY_ORDER: Array<DictionaryCategory | 'all'> = [
  'all',
  'verb',
  'noun',
  'adjective',
  'expression',
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

const SOURCE_ORDER: Array<UnifiedDictionarySource | 'all'> = [
  'all',
  'curriculum',
  'ben-sedira',
  'aziri',
  'tapiero',
  'tadjer',
];

const QUICK_SEARCH_SUGGESTIONS = [
  'prendre',
  'qahwa',
  'salam',
  'nakhoud',
  '7abib',
  'كتب',
];

const PAGE_BATCH_SIZE = 30;

export function DictionnaireSection({
  language,
  initialCategory = 'all',
  onVerbStudied,
}: DictionnaireSectionProps) {
  const expT = EXPERIENCE_TRANSLATIONS[language];
  const dictT = expT.dictionaryPage;
  const bsT = BEN_SEDIRA_TRANSLATIONS[language];

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DictionaryCategory | 'all'>(initialCategory);
  const [verbPattern, setVerbPattern] = useState<VerbPattern | 'all'>('all');
  const [source, setSource] = useState<UnifiedDictionarySource | 'all'>('all');
  const [letter, setLetter] = useState<string>('all');
  const [visibleLimit, setVisibleLimit] = useState(PAGE_BATCH_SIZE);
  const [expandedVerbIds, setExpandedVerbIds] = useState<Record<string, boolean>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Corpus de recherche importe de projet-darija (sources sous droit, needs_review)
  const [corpusOpen, setCorpusOpen] = useState(false);
  const [corpusSource, setCorpusSource] = useState('all');
  const corpusResults = useMemo(
    () => (query.trim() ? searchCorpus(query, corpusSource, 12) : []),
    [query, corpusSource]
  );

  const [offlineDictEntries, setOfflineDictEntries] = useState<
    UnifiedDictionaryEntry[] | null
  >(null);

  useEffect(() => {
    let active = true;
    const syncDict = async () => {
      const cached = await readOfflineDictionaryFromIndexedDb(language);
      if (active) setOfflineDictEntries(cached);
    };
    void syncDict();
    const handler = () => {
      void syncDict();
    };
    window.addEventListener(OFFLINE_STATUS_UPDATED_EVENT, handler);
    return () => {
      active = false;
      window.removeEventListener(OFFLINE_STATUS_UPDATED_EVENT, handler);
    };
  }, [language]);

  const allEntries = useMemo(
    () => offlineDictEntries ?? buildUnifiedDictionary(language),
    [offlineDictEntries, language]
  );

  const sourceCounts = useMemo(
    () => computeUnifiedSourceCounts(allEntries),
    [allEntries]
  );

  const sourceScopedEntries = useMemo(
    () =>
      source === 'all'
        ? allEntries
        : allEntries.filter((entry) => entry.source === source),
    [allEntries, source]
  );

  const categoryCounts = useMemo(
    () => computeGrammaticalCategoryCounts(sourceScopedEntries),
    [sourceScopedEntries]
  );

  const verbPatternCounts = useMemo(
    () => computeUnifiedVerbPatternCounts(sourceScopedEntries),
    [sourceScopedEntries]
  );

  const letterCounts = useMemo(
    () => computeUnifiedLetterCounts(sourceScopedEntries),
    [sourceScopedEntries]
  );

  const availableLetters = useMemo(
    () => new Set(Object.keys(letterCounts)),
    [letterCounts]
  );

  const filteredEntries = useMemo(
    () =>
      searchUnifiedDictionary(allEntries, {
        query,
        category,
        verbPattern: category === 'verb' ? verbPattern : 'all',
        source,
        letter,
      }),
    [allEntries, query, category, verbPattern, source, letter]
  );

  const visibleEntries = useMemo(
    () => filteredEntries.slice(0, visibleLimit),
    [filteredEntries, visibleLimit]
  );

  const remainingCount = Math.max(0, filteredEntries.length - visibleEntries.length);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    category !== 'all' ||
    verbPattern !== 'all' ||
    source !== 'all' ||
    letter !== 'all';

  const resetAllFilters = () => {
    setQuery('');
    setCategory('all');
    setVerbPattern('all');
    setSource('all');
    setLetter('all');
    setVisibleLimit(PAGE_BATCH_SIZE);
  };

  const handlePlay = (
    id: string,
    arabic: string,
    latin: string,
    phonetic?: string,
    entryCategory?: DictionaryCategory
  ) => {
    if (entryCategory === 'verb') {
      onVerbStudied?.(id);
    }
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

  const getSourceLabel = (src: UnifiedDictionarySource | 'all') => {
    if (src === 'curriculum') return dictT.curriculumSourceLabel;
    return bsT.sources[src];
  };

  return (
    <section
      aria-label={dictT.pageTitle}
      data-testid="dictionnaire-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6"
    >
      {/* Page Title & Dialect Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#23201C] dark:text-slate-50 tracking-tight">
            {dictT.pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400 max-w-3xl">
            {dictT.pageSubtitle}
          </p>
        </div>

        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] text-xs font-semibold text-[#8C2F18] dark:text-[#E8A184] shrink-0">
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="tabular-nums">
            {allEntries.length.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} ·{' '}
            {expT.dialectBadge}
          </span>
        </span>
      </div>

      {/* Full-Text Search & Grammatical Filters Card */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 space-y-5">
        {/* Full-Text Search Bar */}
        <div className="space-y-2.5">
          <div className="relative">
            <label htmlFor="unified-dict-search" className="sr-only">
              {dictT.searchLabel}
            </label>
            <Search
              className="w-4 h-4 text-[#8E867B] dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="unified-dict-search"
              data-testid="dict-search-input"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleLimit(PAGE_BATCH_SIZE);
              }}
              placeholder={dictT.searchPlaceholder}
              className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/60 dark:bg-[#0E1311] text-[#23201C] dark:text-slate-100 placeholder:text-[#8E867B] focus:outline-none focus:ring-2 focus:ring-[#B7410E]"
            />
            {query && (
              <button
                type="button"
                data-testid="dict-clear-search"
                onClick={() => {
                  setQuery('');
                  setVisibleLimit(PAGE_BATCH_SIZE);
                }}
                aria-label={dictT.clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E867B] hover:text-[#23201C] dark:hover:text-slate-200 p-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-medium text-[#686259] dark:text-slate-400 mr-1">
              {dictT.quickQueriesLabel}
            </span>
            {QUICK_SEARCH_SUGGESTIONS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term);
                  setVisibleLimit(PAGE_BATCH_SIZE);
                }}
                className="px-2.5 py-1 rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 hover:border-[#B7410E] text-xs font-medium cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Corpus de recherche — sources importées de projet-darija (needs_review) */}
        <div className="pt-3 border-t border-[#EFECE4] dark:border-[#2A352F] space-y-2.5">
          <button
            type="button"
            onClick={() => setCorpusOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C2F18] dark:text-[#E8A184] hover:underline cursor-pointer"
            aria-expanded={corpusOpen}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Corpus sources ({CORPUS_TOTAL.toLocaleString('fr-FR')} entrées · needs_review)
          </button>
          {corpusOpen && (
            <div className="space-y-2">
              <select
                value={corpusSource}
                onChange={(e) => setCorpusSource(e.target.value)}
                aria-label="Source du corpus"
                className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] text-[#23201C] dark:text-slate-100 cursor-pointer"
              >
                {CORPUS_SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              {query.trim() ? (
                corpusResults.length > 0 ? (
                  <ul className="divide-y divide-[#EFECE4] dark:divide-[#2A352F] rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] overflow-hidden">
                    {corpusResults.map((r) => (
                      <li key={`${r.source}-${r.id}`} className="px-3 py-2 bg-white dark:bg-[#171E1B]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[#23201C] dark:text-slate-100">{r.fr || r.lat || r.ar}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F1E8] dark:bg-[#1D2622] text-[#686259] dark:text-slate-400 shrink-0">{r.source}{r.page ? ` · p.${r.page}` : ''}</span>
                        </div>
                        {(r.ar || r.lat) && (
                          <p className="text-xs text-[#686259] dark:text-slate-400" dir="auto">{r.ar} {r.lat ? `· ${r.lat}` : ''}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#8E867B]">Aucun résultat dans le corpus pour « {query} ».</p>
                )
              ) : (
                <p className="text-xs text-[#8E867B]">Saisissez une recherche pour interroger le corpus.</p>
              )}
              <p className="text-[10px] text-[#8E867B] dark:text-slate-500">
                Sources sous droit, usage interne/recherche. Validation native requise avant publication.
              </p>
            </div>
          )}
        </div>

        {/* Grammatical Category Filter Tabs */}
        <div className="pt-4 border-t border-[#EFECE4] dark:border-[#2A352F] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#23201C] dark:text-slate-200">
              {dictT.categoryFilterLabel}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                data-testid="dict-reset-filters"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#C68335] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{dictT.resetFilters}</span>
              </button>
            )}
          </div>

          <div
            role="tablist"
            aria-label={dictT.categoryFilterLabel}
            className="flex flex-wrap sm:inline-flex items-center gap-1 p-1.5 sm:p-1 bg-[#E9E4D8] dark:bg-[#1D2622] border border-[#DFD9CA] dark:border-[#2A352F] rounded-2xl max-w-full"
          >
            {GRAMMATICAL_CATEGORY_ORDER.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  data-testid={`dict-cat-${cat}`}
                  aria-selected={active}
                  onClick={() => {
                    setCategory(cat);
                    if (cat !== 'verb') setVerbPattern('all');
                    setVisibleLimit(PAGE_BATCH_SIZE);
                  }}
                  className={`px-3 sm:px-3.5 py-1.5 text-xs font-medium rounded-xl sm:rounded-full whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                    active
                      ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white font-semibold shadow-xs'
                      : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
                  }`}
                >
                  {bsT.categories[cat]} ({categoryCounts[cat]})
                </button>
              );
            })}
          </div>

          {/* Secondary Verb Pattern Filter (only when Verbes is selected) */}
          {category === 'verb' && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-[#686259] dark:text-slate-400">
                {bsT.verbPatternLabel}
              </span>
              <div
                role="tablist"
                aria-label={bsT.verbPatternLabel}
                className="flex items-center gap-1 overflow-x-auto pb-0.5"
              >
                {VERB_PATTERN_ORDER.map((pat) => (
                  <button
                    key={pat}
                    type="button"
                    role="tab"
                    data-testid={`dict-pattern-${pat}`}
                    aria-selected={verbPattern === pat}
                    onClick={() => {
                      setVerbPattern(pat);
                      setVisibleLimit(PAGE_BATCH_SIZE);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg border whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                      verbPattern === pat
                        ? 'bg-[#B7410E] text-white border-[#B7410E]'
                        : 'bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#686259] dark:text-slate-300 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E]'
                    }`}
                  >
                    {bsT.verbPatterns[pat]} ({verbPatternCounts[pat]})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Source & Alphabetical Index */}
        <div className="pt-4 border-t border-[#EFECE4] dark:border-[#2A352F] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-semibold text-[#23201C] dark:text-slate-200 shrink-0">
              {dictT.sourceFilterLabel}
            </span>
            <div
              role="group"
              aria-label={dictT.sourceFilterLabel}
              className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
            >
              {SOURCE_ORDER.map((srcKey) => {
                const active = source === srcKey;
                return (
                  <button
                    key={srcKey}
                    type="button"
                    data-testid={`dict-source-${srcKey}`}
                    aria-pressed={active}
                    onClick={() => {
                      setSource(srcKey);
                      setLetter('all');
                      setVisibleLimit(PAGE_BATCH_SIZE);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap shrink-0 tabular-nums cursor-pointer ${
                      active
                        ? 'bg-[#23201C] dark:bg-slate-100 text-white dark:text-[#171E1B] border-transparent'
                        : 'bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E]'
                    }`}
                  >
                    {getSourceLabel(srcKey)} ({sourceCounts[srcKey]})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-semibold text-[#23201C] dark:text-slate-200 shrink-0">
              {dictT.letterFilterLabel}
            </span>
            <div
              role="tablist"
              aria-label={dictT.letterFilterLabel}
              className="flex items-center gap-1 overflow-x-auto pb-0.5"
            >
              <button
                type="button"
                role="tab"
                data-testid="dict-letter-all"
                aria-selected={letter === 'all'}
                onClick={() => {
                  setLetter('all');
                  setVisibleLimit(PAGE_BATCH_SIZE);
                }}
                className={`px-2.5 h-7 rounded-lg text-xs font-bold tabular-nums whitespace-nowrap shrink-0 cursor-pointer ${
                  letter === 'all'
                    ? 'bg-[#B7410E] text-white'
                    : 'bg-[#F5F1E8] dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 hover:bg-[#E5EBD6]'
                }`}
              >
                {dictT.letterAll}
              </button>
              {BEN_SEDIRA_ALPHABET.map((char) => {
                const isLoaded = availableLetters.has(char);
                const isSelected = letter === char;
                return (
                  <button
                    key={char}
                    type="button"
                    role="tab"
                    data-testid={`dict-letter-${char}`}
                    disabled={!isLoaded}
                    aria-selected={isSelected}
                    onClick={() => {
                      if (isLoaded) {
                        setLetter(char);
                        setVisibleLimit(PAGE_BATCH_SIZE);
                      }
                    }}
                    className={`px-2 h-7 rounded-lg text-xs font-bold tabular-nums whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#B7410E] text-white cursor-pointer'
                        : isLoaded
                          ? 'bg-[#F5F1E8] dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 hover:bg-[#E5EBD6] cursor-pointer'
                          : 'text-[#B5AEA2] dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results List Card */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EFECE4] dark:border-[#2A352F]">
          <p
            data-testid="dict-result-count"
            className="text-sm font-medium text-[#686259] dark:text-slate-400 tabular-nums"
          >
            {dictT.countSummary(filteredEntries.length, sourceScopedEntries.length)}
          </p>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="py-12 text-center space-y-3 border border-dashed border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl">
            <p className="text-base font-semibold text-[#23201C] dark:text-slate-100">
              {dictT.emptyTitle(query)}
            </p>
            <p className="text-sm text-[#686259] dark:text-slate-400 max-w-md mx-auto">
              {dictT.emptyHint}
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#B7410E] rounded-xl hover:bg-[#8C2F18] cursor-pointer"
            >
              {dictT.resetFilters}
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
                  isExpanded && entry.baseEntry?.conjugation
                    ? deriveFullConjugationTable(entry.baseEntry)
                    : [];

                return (
                  <article
                    key={entry.id}
                    data-testid={`dict-entry-${entry.id}`}
                    className="py-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-[#686259] dark:text-slate-400">
                          <span className="font-display text-lg font-bold text-[#23201C] dark:text-slate-100">
                            {entry.headword}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-[#C68335]">
                            {bsT.categories[entry.category]}
                          </span>
                          {entry.verbPattern && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-medium text-[#8C2F18] dark:text-[#E8A184]">
                                {bsT.verbPatterns[entry.verbPattern]}
                              </span>
                            </>
                          )}
                          {entry.arabicRoot && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span
                                className="font-arabic text-sm text-[#8C2F18] dark:text-[#E8A184]"
                                lang="ar"
                              >
                                <bdi>{entry.arabicRoot}</bdi>
                              </span>
                            </>
                          )}
                          {entry.preposition && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">
                                {bsT.prepositionLabel} +{entry.preposition}
                              </span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums font-medium text-[#8E5B1E] dark:text-[#E5A95E]">
                            {entry.source === 'curriculum'
                              ? `${dictT.curriculumSourceLabel} · ${entry.sourceBadge}`
                              : `${bsT.sources[entry.source]} · ${entry.sourceBadge}`}
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
                            playbackId={`dict-word-${entry.id}`}
                            variant="icon"
                            size="md"
                            testId={`dict-word-play-${entry.id}`}
                            ariaLabelPlay={dictT.playWordAria(entry.darijaLatin)}
                            ariaLabelStop={dictT.stopWordAria(entry.darijaLatin)}
                            onBeforePlay={() => {
                              stopAllAudio();
                              setPlayingId(null);
                              if (entry.category === 'verb') {
                                onVerbStudied?.(entry.id);
                              }
                            }}
                          />
                          <span className="text-base font-bold text-[#8C2F18] dark:text-[#E8A184]">
                            {entry.darijaLatin}
                          </span>
                          <span
                            className="font-arabic text-lg text-[#23201C] dark:text-slate-200"
                            lang="ar"
                            dir="rtl"
                          >
                            <bdi>{entry.darijaArabic}</bdi>
                          </span>
                          {entry.phonetic && entry.phonetic !== entry.darijaLatin && (
                            <span className="font-mono text-xs text-[#686259] dark:text-slate-400">
                              [{entry.phonetic}]
                            </span>
                          )}
                        </div>

                        {(entry.pluralLatin || entry.feminineLatin) && (
                          <p className="text-xs text-[#686259] dark:text-slate-400">
                            {entry.feminineLatin && (
                              <span>
                                {bsT.feminineLabel} {entry.feminineLatin}
                                {entry.pluralLatin ? ' · ' : ''}
                              </span>
                            )}
                            {entry.pluralLatin && (
                              <span>
                                {bsT.pluralLabel} {entry.pluralLatin}
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
                              entry.phonetic,
                              entry.category
                            )
                          }
                          aria-label={`${bsT.listen}: ${entry.headword}`}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border whitespace-nowrap shrink-0 cursor-pointer ${
                            isPlaying
                              ? 'bg-[#B7410E] text-white border-[#B7410E]'
                              : 'bg-white dark:bg-[#1D2622] text-[#8C2F18] dark:text-[#E8A184] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E]'
                          }`}
                        >
                          <Volume2 className="w-4 h-4" aria-hidden="true" />
                          <span>{isPlaying ? bsT.playing : bsT.listen}</span>
                        </button>
                      </div>
                    </div>

                    {/* Verb Conjugation Preview & 8-Person Expansion */}
                    {entry.conjugation && (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-xs">
                          <div>
                            <p className="text-[#686259] dark:text-slate-400">{bsT.present1s}</p>
                            <p className="font-semibold text-[#23201C] dark:text-slate-100">
                              {entry.conjugation.present1s}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#686259] dark:text-slate-400">{bsT.past1s}</p>
                            <p className="font-semibold text-[#23201C] dark:text-slate-100">
                              {entry.conjugation.past1s}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#686259] dark:text-slate-400">{bsT.past3ms}</p>
                            <p className="font-semibold text-[#23201C] dark:text-slate-100">
                              {entry.conjugation.past3ms}
                            </p>
                          </div>
                          {entry.conjugation.imperative && (
                            <div>
                              <p className="text-[#686259] dark:text-slate-400">{bsT.imperative}</p>
                              <p className="font-semibold text-[#C68335]">
                                {entry.conjugation.imperative}
                              </p>
                            </div>
                          )}
                        </div>

                        {entry.baseEntry && (
                          <button
                            type="button"
                            data-testid={`dict-conjugate-${entry.id}`}
                            aria-expanded={isExpanded}
                            onClick={() => {
                              const nextExpanded = !expandedVerbIds[entry.id];
                              if (nextExpanded && entry.category === 'verb') {
                                onVerbStudied?.(entry.id);
                              }
                              setExpandedVerbIds((prev) => ({
                                ...prev,
                                [entry.id]: nextExpanded,
                              }));
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C2F18] dark:text-[#E8A184] hover:underline cursor-pointer"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>{bsT.conjugationCollapse}</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>{bsT.conjugationExpand}</span>
                              </>
                            )}
                          </button>
                        )}

                        {isExpanded && fullRows.length > 0 && (
                          <div
                            data-testid={`dict-conj-table-${entry.id}`}
                            className="overflow-x-auto border border-[#E4DFD2] dark:border-[#2A352F] rounded-xl"
                          >
                            <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
                              <thead>
                                <tr className="bg-[#F5F1E8] dark:bg-[#1D2622] border-b border-[#E4DFD2] dark:border-[#2A352F]">
                                  <th className="py-2 px-2 sm:px-3 font-semibold text-[#23201C] dark:text-slate-100">
                                    {bsT.personHeader}
                                  </th>
                                  <th className="py-2 px-2 sm:px-3 font-semibold text-[#8C2F18] dark:text-[#E8A184]">
                                    <span className="sm:hidden">{bsT.presentHeader.split(' ')[0]}</span>
                                    <span className="hidden sm:inline">{bsT.presentHeader}</span>
                                  </th>
                                  <th className="py-2 px-2 sm:px-3 font-semibold text-[#23201C] dark:text-slate-100">
                                    <span className="sm:hidden">{bsT.pastHeader.split(' ')[0]}</span>
                                    <span className="hidden sm:inline">{bsT.pastHeader}</span>
                                  </th>
                                  <th className="py-2 px-2 sm:px-3 font-semibold text-[#C68335]">
                                    <span className="sm:hidden">{bsT.negationHeader.split(' ')[0]}</span>
                                    <span className="hidden sm:inline">{bsT.negationHeader}</span>
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
                          {bsT.alternativesLabel}{' '}
                        </span>
                        {entry.alternativeForms.join(' · ')}
                      </p>
                    )}

                    {(entry.exampleDarija || entry.usageNote) && (
                      <div className="space-y-1 text-xs">
                        {entry.exampleDarija && (
                          <p className="text-[#23201C] dark:text-slate-200">
                            <span className="text-[#686259] dark:text-slate-400 mr-1">
                              {dictT.exampleLabel}
                            </span>
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
                  data-testid="dict-show-more"
                  onClick={() => setVisibleLimit((prev) => prev + PAGE_BATCH_SIZE)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 hover:border-[#B7410E] cursor-pointer tabular-nums"
                >
                  {dictT.showMore(remainingCount)}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
