import { useState, useMemo } from 'react';
import { Search, Volume2, X } from 'lucide-react';
import {
  ALL_PHRASES,
  ARABIZI_SOUNDS,
  CURRICULUM_MODULES,
} from '../data/curriculum';
import type { AppLanguage } from '../types/darija';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { getLocalizedModule, getLocalizedSound } from '../i18n/curriculumTranslations';
import { filterLexicon } from '../utils/darijaLogic';
import { playDarijaPronunciation } from '../utils/audioPlayer';

interface LexiconGuideProps {
  language: AppLanguage;
}

export function LexiconGuide({ language }: LexiconGuideProps) {
  const t = UI_TRANSLATIONS[language].lexicon;
  const localizedSounds = useMemo(
    () => ARABIZI_SOUNDS.map((s) => getLocalizedSound(s, language)),
    [language]
  );
  const localizedModules = useMemo(
    () => CURRICULUM_MODULES.map((m) => getLocalizedModule(m, language)),
    [language]
  );

  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredPhrases = useMemo(
    () => filterLexicon(ALL_PHRASES, query, moduleFilter, language),
    [query, moduleFilter, language]
  );

  const handlePlay = (
    id: string,
    arabic: string,
    latin: string,
    phonetic?: string
  ) => {
    void playDarijaPronunciation({
      textArabic: arabic,
      textLatin: latin,
      phoneticFrench: phonetic,
      language,
      onStart: () => setPlayingId(id),
      onEnd: () => setPlayingId(null),
    });
  };

  return (
    <section
      aria-label={t.sectionAria}
      className="space-y-10"
    >
      {/* Part 1: Special Sounds Guide (Arabizi 3, 7, 9...) */}
      <div className="space-y-4">
        <div className="max-w-2xl space-y-1">
          <h2 className="font-display text-2xl font-bold text-[#23201C] dark:text-slate-100">
            {t.soundsTitle}
          </h2>
          <p className="text-sm text-[#686259] dark:text-slate-400">
            {t.soundsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localizedSounds.map((sound) => {
            const soundId = `sound-${sound.symbol}`;
            const isPlaying = playingId === soundId;
            return (
              <div
                key={sound.symbol}
                className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-2xl font-bold text-[#C68335]">
                        {sound.symbol}
                      </span>
                      <span className="text-sm font-semibold text-[#23201C] dark:text-slate-100">
                        {sound.name}
                      </span>
                    </div>
                    <span
                      className="font-arabic text-2xl text-[#686259] dark:text-slate-200"
                      lang="ar"
                      dir="rtl"
                    >
                      {sound.arabicLetter}
                    </span>
                  </div>
                  <p className="text-sm text-[#686259] dark:text-slate-400 leading-relaxed">
                    {sound.pronunciationTip}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EFECE4] dark:border-[#2A352F] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#23201C] dark:text-slate-100 truncate">
                      {sound.exampleDarija}
                    </p>
                    <p className="text-xs text-[#686259] dark:text-slate-400 truncate">
                      {sound.exampleFrench}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handlePlay(
                        soundId,
                        sound.exampleArabic,
                        sound.exampleDarija
                      )
                    }
                    aria-label={`${t.listen}: ${sound.exampleDarija}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border whitespace-nowrap shrink-0 cursor-pointer ${
                      isPlaying
                        ? 'bg-[#B7410E] text-white border-[#B7410E]'
                        : 'bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#8C2F18] dark:text-[#E8A184] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isPlaying ? t.playing : t.listen}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: Searchable Phrasebook */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#23201C] dark:text-slate-100">
              {t.lexiconTitle}
            </h2>
            <p className="text-sm text-[#686259] dark:text-slate-400 tabular-nums">
              {t.countSummary(filteredPhrases.length, ALL_PHRASES.length)}
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <label htmlFor="lexicon-search" className="sr-only">
              {t.searchLabel}
            </label>
            <Search
              className="w-4 h-4 text-[#8E867B] dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="lexicon-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/50 dark:bg-[#0E1311] text-[#23201C] dark:text-slate-100 placeholder:text-[#8E867B] focus:outline-none focus:ring-2 focus:ring-[#B7410E]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t.clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E867B] hover:text-[#23201C] dark:hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Interactive Filter Tabs */}
        <div
          role="tablist"
          aria-label={t.filterAria}
          className="flex items-center gap-1 p-1 bg-[#E9E4D8] dark:bg-[#1D2622] border border-[#DFD9CA] dark:border-[#2A352F] rounded-full overflow-x-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={moduleFilter === 'all'}
            onClick={() => setModuleFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 cursor-pointer ${
              moduleFilter === 'all'
                ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white font-semibold shadow-xs'
                : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
            }`}
          >
            {t.allFilter(ALL_PHRASES.length)}
          </button>
          {localizedModules.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={moduleFilter === m.id}
              onClick={() => setModuleFilter(m.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 cursor-pointer ${
                moduleFilter === m.id
                  ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white font-semibold shadow-xs'
                  : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
              }`}
            >
              {m.number}. {m.title.split('&')[0].split(',')[0].split('、')[0].split(' y ')[0].split(' e ')[0].split(' en ')[0].trim()}
            </button>
          ))}
        </div>

        {/* Results Grid or Empty State */}
        {filteredPhrases.length === 0 ? (
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
                setModuleFilter('all');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#B7410E] rounded-xl hover:bg-[#8C2F18] cursor-pointer"
            >
              {t.showAll}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#EFECE4] dark:divide-[#2A352F]">
            {filteredPhrases.map((phrase) => {
              const isPlaying = playingId === phrase.id;
              return (
                <div
                  key={phrase.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-base font-bold text-[#23201C] dark:text-slate-100">
                        {phrase.darijaLatin}
                      </span>
                      <span
                        className="font-arabic text-lg text-[#686259] dark:text-slate-300"
                        lang="ar"
                        dir="rtl"
                      >
                        {phrase.darijaArabic}
                      </span>
                    </div>
                    <p className="text-sm text-[#686259] dark:text-slate-300">
                      {phrase.frenchMeaning}
                    </p>
                    <p className="font-mono text-xs text-[#8C2F18] dark:text-[#E8A184]">
                      [{phrase.phoneticFrench}]
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handlePlay(
                        phrase.id,
                        phrase.darijaArabic,
                        phrase.darijaLatin,
                        phrase.phoneticFrench
                      )
                    }
                    aria-label={`${t.listen}: ${phrase.darijaLatin}`}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer ${
                      isPlaying
                        ? 'bg-[#B7410E] text-white border-[#B7410E]'
                        : 'bg-white dark:bg-[#1D2622] text-[#8C2F18] dark:text-[#E8A184] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E]'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                    <span>{isPlaying ? t.playing : t.listen}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
