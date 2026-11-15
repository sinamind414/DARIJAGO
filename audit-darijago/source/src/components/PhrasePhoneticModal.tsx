import { useEffect, useMemo, useState } from 'react';
import { AudioLines, Info, Turtle, Volume2, X } from 'lucide-react';
import type { AppLanguage, DarijaPhrase } from '../types/darija';
import { PHONETIC_MODAL_TRANSLATIONS } from '../i18n/phoneticModalTranslations';
import { analyzePhrasePhonetics } from '../utils/phoneticGuideLogic';
import { playDarijaPronunciation } from '../utils/audioPlayer';

interface PhrasePhoneticModalProps {
  phrase: DarijaPhrase | null;
  language: AppLanguage;
  onClose: () => void;
}

export function PhrasePhoneticModal({
  phrase,
  language,
  onClose,
}: PhrasePhoneticModalProps) {
  const t = PHONETIC_MODAL_TRANSLATIONS[language];
  const [playingMode, setPlayingMode] = useState<'normal' | 'slow' | null>(
    null
  );

  const analysis = useMemo(
    () => (phrase ? analyzePhrasePhonetics(phrase, language) : null),
    [phrase, language]
  );

  useEffect(() => {
    if (!phrase) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phrase, onClose]);

  if (!phrase || !analysis) return null;

  const handlePlayPhrase = (slow: boolean) => {
    void playDarijaPronunciation({
      textArabic: phrase.darijaArabic,
      textLatin: phrase.darijaLatin,
      phoneticFrench: phrase.phoneticFrench,
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phonetic-modal-title"
      data-testid="phonetic-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] shadow-xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#171E1B]/95 backdrop-blur-xs px-5 sm:px-6 py-4 border-b border-[#EFECE4] dark:border-[#2A352F] flex items-start justify-between gap-4">
          <div className="space-y-0.5 min-w-0">
            <h2
              id="phonetic-modal-title"
              className="font-display text-lg sm:text-xl font-extrabold text-[#23201C] dark:text-slate-50 flex items-center gap-2"
            >
              <AudioLines
                className="w-5 h-5 text-[#5C723C] dark:text-[#A5C178] shrink-0"
                aria-hidden="true"
              />
              <span>{t.modalTitle}</span>
            </h2>
            <p className="text-xs text-[#686259] dark:text-slate-400">
              {t.modalSubtitle}
            </p>
          </div>

          <button
            type="button"
            data-testid="phonetic-modal-close"
            onClick={onClose}
            aria-label={t.closeLabel}
            className="w-9 h-9 rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-200 hover:border-[#5C723C] inline-flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Active Phrase & Simplified Latin Phonetic Showcase */}
          <div className="rounded-2xl bg-[#F7F9F2] dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <p className="font-display text-2xl font-extrabold text-[#23201C] dark:text-slate-50">
                  {phrase.darijaLatin}
                </p>
                <p
                  className="font-arabic text-lg text-[#686259] dark:text-slate-300"
                  lang="ar"
                >
                  <bdi dir="rtl">{phrase.darijaArabic}</bdi>
                </p>
                <p className="text-xs italic text-[#686259] dark:text-slate-400">
                  “{phrase.frenchMeaning}”
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  data-testid="phonetic-modal-listen"
                  onClick={() => handlePlayPhrase(false)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap cursor-pointer ${
                    playingMode === 'normal'
                      ? 'bg-[#5C723C] text-white border-[#5C723C]'
                      : 'bg-white dark:bg-[#171E1B] text-[#4E6231] dark:text-[#A5C178] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.listenNormal}</span>
                </button>

                <button
                  type="button"
                  data-testid="phonetic-modal-listen-slow"
                  onClick={() => handlePlayPhrase(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap cursor-pointer ${
                    playingMode === 'slow'
                      ? 'bg-[#C68335] text-white border-[#C68335]'
                      : 'bg-white dark:bg-[#171E1B] text-[#8E5B1E] dark:text-[#E5A95E] border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#C68335]'
                  }`}
                >
                  <Turtle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.listenSlow}</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] px-4 py-3 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#686259] dark:text-slate-400">
                {t.simplifiedAlphabetLabel}
              </p>
              <p
                data-testid="phonetic-modal-sentence"
                className="font-mono text-base sm:text-lg font-bold text-[#4E6231] dark:text-[#A5C178]"
              >
                [{analysis.simplifiedSentence}]
              </p>
            </div>
          </div>

          {/* Word-by-word Syllables & Simplified Latin */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#686259] dark:text-slate-400">
              {t.wordByWordTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {analysis.wordBreakdowns.map((word, idx) => (
                <button
                  key={`${word.darija}-${idx}`}
                  type="button"
                  onClick={() => handlePlayWord(word.arabic, word.darija)}
                  className="text-left p-3.5 rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C] cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold text-[#23201C] dark:text-slate-100">
                      {word.darija}
                    </span>
                    <Volume2
                      className="w-3.5 h-3.5 text-[#5C723C] dark:text-[#A5C178] shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {word.syllables.map((syl, sIdx) => (
                      <span
                        key={`${syl}-${sIdx}`}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] font-mono text-xs font-semibold text-[#4E6231] dark:text-[#A5C178]"
                      >
                        {syl}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#686259] dark:text-slate-400">
                    {word.meaning}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Special Darija Sounds Detected in This Phrase */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#686259] dark:text-slate-400">
              {t.specialSoundsTitle}
            </h3>

            {analysis.detectedSounds.length === 0 ? (
              <p className="text-sm text-[#686259] dark:text-slate-300 p-4 rounded-xl bg-[#F5F1E8]/60 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F]">
                {t.noSpecialSoundsNote}
              </p>
            ) : (
              <div className="space-y-2.5">
                {analysis.detectedSounds.map((sound) => (
                  <div
                    key={sound.id}
                    data-testid={`phonetic-sound-${sound.id}`}
                    className="p-4 rounded-xl bg-white dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E5EBD6] dark:bg-[#273322] text-xs font-mono font-bold text-[#4E6231] dark:text-[#A5C178]">
                          <span>{sound.marker}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-arabic">{sound.arabicLetter}</span>
                        </span>
                        <span className="text-sm font-bold text-[#23201C] dark:text-slate-100">
                          {sound.title}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#C68335] dark:text-[#E5A95E]">
                        [{sound.simplifiedLatin}]
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-300 leading-relaxed">
                      {sound.articulationTip}
                    </p>

                    {sound.exampleInPhrase && (
                      <p className="text-xs text-[#4E6231] dark:text-[#A5C178] font-medium">
                        <span className="opacity-80 mr-1">
                          {t.inThisPhraseLabel}
                        </span>
                        <span className="font-bold">{sound.exampleInPhrase}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* General Articulation Tip */}
          <div className="rounded-xl bg-[#F5F1E8]/70 dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] p-4 flex items-start gap-3">
            <Info
              className="w-4 h-4 text-[#C68335] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-[#23201C] dark:text-slate-100">
                {t.tipGeneralTitle}
              </p>
              <p className="text-[#686259] dark:text-slate-300 leading-relaxed">
                {t.tipGeneralBody}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
