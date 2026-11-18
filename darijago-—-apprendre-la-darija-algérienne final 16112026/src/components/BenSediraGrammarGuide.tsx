import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import type { AppLanguage } from '../types/darija';
import type { GrammarSectionId } from '../types/benSedira';
import { BEN_SEDIRA_GRAMMAR_SECTIONS } from '../data/benSediraGrammar';
import { BEN_SEDIRA_TRANSLATIONS } from '../i18n/benSediraTranslations';
import { playDarijaPronunciation } from '../utils/audioPlayer';

interface BenSediraGrammarGuideProps {
  language: AppLanguage;
}

export function BenSediraGrammarGuide({ language }: BenSediraGrammarGuideProps) {
  const t = BEN_SEDIRA_TRANSLATIONS[language];
  const [activeId, setActiveId] = useState<GrammarSectionId>(
    BEN_SEDIRA_GRAMMAR_SECTIONS[0].id
  );
  const [playingId, setPlayingId] = useState<string | null>(null);

  const activeSection =
    BEN_SEDIRA_GRAMMAR_SECTIONS.find((s) => s.id === activeId) ??
    BEN_SEDIRA_GRAMMAR_SECTIONS[0];

  const handlePlayExample = (
    key: string,
    arabic: string,
    latin: string
  ) => {
    void playDarijaPronunciation({
      textArabic: arabic,
      textLatin: latin,
      language,
      onStart: () => setPlayingId(key),
      onEnd: () => setPlayingId(null),
    });
  };

  return (
    <section
      aria-label={t.grammarTitle}
      className="space-y-6"
    >
      {/* Header + Chapter Selector */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-6 space-y-5">
        <div className="space-y-1 max-w-2xl">
          <p className="text-xs font-semibold text-[#C68335]">
            {t.sourceLabel} · {activeSection.sourcePages}
          </p>
          <h2 className="font-display text-2xl font-bold text-[#23201C] dark:text-slate-100 [text-wrap:balance]">
            {t.grammarTitle}
          </h2>
          <p className="text-sm text-[#686259] dark:text-slate-400">
            {t.grammarSubtitle}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t.grammarChaptersAria}
          className="flex items-center gap-1 p-1 bg-[#E9E4D8] dark:bg-[#1D2622] border border-[#DFD9CA] dark:border-[#2A352F] rounded-full overflow-x-auto"
        >
          {BEN_SEDIRA_GRAMMAR_SECTIONS.map((section) => {
            const isSelected = section.id === activeSection.id;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                data-testid={`grammar-tab-${section.id}`}
                aria-selected={isSelected}
                onClick={() => setActiveId(section.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                    : 'text-[#686259] dark:text-slate-300 hover:text-[#23201C] dark:hover:text-white'
                }`}
              >
                {section.order}. {section.title.split('(')[0].split('&')[0].trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Chapter Content */}
      <article
        data-testid={`grammar-panel-${activeSection.id}`}
        className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-6 space-y-6"
      >
        <div className="space-y-1.5">
          <p className="text-xs font-mono font-bold text-[#C68335]">
            {activeSection.order} · {activeSection.sourcePages}
          </p>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#23201C] dark:text-slate-100">
            {activeSection.title}
          </h3>
          <p className="text-sm text-[#686259] dark:text-slate-400">
            {activeSection.subtitle}
          </p>
        </div>

        {/* Key Rule Box (clean hairline border, no border-l-4) */}
        <div className="p-4 rounded-xl bg-[#F5F1E8]/80 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] space-y-1">
          <p className="text-xs font-bold text-[#8C2F18] dark:text-[#E8A184]">
            {t.grammarRuleLabel}
          </p>
          <p className="text-sm text-[#23201C] dark:text-slate-200 leading-relaxed">
            {activeSection.keyRule}
          </p>
        </div>

        {/* Spoken Examples with 1-Tap Audio */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#686259] dark:text-slate-400">
            {t.grammarExamplesLabel}
          </h4>
          <div className="divide-y divide-[#EFECE4] dark:divide-[#2A352F] border border-[#EFECE4] dark:border-[#2A352F] rounded-xl px-4">
            {activeSection.examples.map((ex, idx) => {
              const exKey = `${activeSection.id}-ex-${idx}`;
              const isPlaying = playingId === exKey;
              return (
                <div
                  key={exKey}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-sm font-bold text-[#23201C] dark:text-slate-100">
                        {ex.darijaLatin}
                      </span>
                      <span
                        className="font-arabic text-base text-[#8C2F18] dark:text-[#E8A184]"
                        lang="ar"
                        dir="rtl"
                      >
                        <bdi>{ex.darijaArabic}</bdi>
                      </span>
                    </div>
                    <p className="text-xs text-[#686259] dark:text-slate-300">
                      {ex.frenchMeaning}
                    </p>
                    {ex.note && (
                      <p className="text-xs text-[#8E867B] dark:text-slate-400">
                        {ex.note}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handlePlayExample(exKey, ex.darijaArabic, ex.darijaLatin)
                    }
                    aria-label={`${t.listen}: ${ex.darijaLatin}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer ${
                      isPlaying
                        ? 'bg-[#B7410E] text-white border-[#B7410E]'
                        : 'bg-white dark:bg-[#1D2622] text-[#8C2F18] dark:text-[#E8A184] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isPlaying ? t.playing : t.listen}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Structured Grammar Tables */}
        {activeSection.tables.map((table) => (
          <div key={table.caption} className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#686259] dark:text-slate-400">
              {table.caption}
            </h4>
            <div className="overflow-x-auto border border-[#E4DFD2] dark:border-[#2A352F] rounded-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm tabular-nums">
                <thead>
                  <tr className="bg-[#F5F1E8] dark:bg-[#1D2622] border-b border-[#E4DFD2] dark:border-[#2A352F]">
                    {table.headers.map((header) => (
                      <th
                        key={header}
                        className="py-2.5 px-3.5 font-semibold text-[#23201C] dark:text-slate-100 whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE4] dark:divide-[#2A352F]">
                  {table.rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-[#F5F1E8]/40 dark:hover:bg-[#1D2622]/60"
                    >
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`py-2.5 px-3.5 ${
                            cellIdx === 0
                              ? 'font-semibold text-[#23201C] dark:text-slate-100'
                              : 'text-[#686259] dark:text-slate-300'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </article>
    </section>
  );
}
