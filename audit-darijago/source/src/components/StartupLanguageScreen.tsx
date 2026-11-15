import { useState } from 'react';
import { ArrowRight, Moon, Sun, Volume2 } from 'lucide-react';
import type { AppLanguage } from '../types/darija';
import { LANGUAGE_OPTIONS, UI_TRANSLATIONS } from '../i18n/translations';
import { LanguageSelector } from './LanguageSelector';
import { playDarijaPronunciation } from '../utils/audioPlayer';

interface StartupLanguageScreenProps {
  language: AppLanguage;
  isDark: boolean;
  onSelectLanguage: (lang: AppLanguage) => void;
  onConfirmStart: () => void;
  onToggleTheme: () => void;
}

export function StartupLanguageScreen({
  language,
  isDark,
  onSelectLanguage,
  onConfirmStart,
  onToggleTheme,
}: StartupLanguageScreenProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [playingSample, setPlayingSample] = useState(false);

  const t = UI_TRANSLATIONS[language];
  const selectedOption =
    LANGUAGE_OPTIONS.find((opt) => opt.code === language) ?? LANGUAGE_OPTIONS[0];

  const handlePlayPreview = () => {
    void playDarijaPronunciation({
      textArabic: 'السلام عليكم، واش راك؟',
      textLatin: 'Salam alikoum, wach rak?',
      phoneticFrench: 'Sa-lam a-li-koum, ouach rak ?',
      language,
      onStart: () => setPlayingSample(true),
      onEnd: () => setPlayingSample(false),
    });
  };

  return (
    <div
      data-testid="startup-language-screen"
      className="min-h-screen flex flex-col bg-[#F5F1E8] dark:bg-[#0E1311] text-[#23201C] dark:text-slate-100"
    >
      {/* Top minimal bar: Wordmark + Dark toggle */}
      <header className="w-full border-b border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/95 dark:bg-[#0E1311]/95">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2.5 font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#23201C] dark:text-slate-100 whitespace-nowrap shrink-0">
            <img
              src="/assets/aistudio/image_ae2514c7.png"
              alt=""
              aria-hidden="true"
              className="w-8 h-8 rounded-lg object-cover border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F2EB] shrink-0"
            />
            <span>
              <span className="text-[#146B3A] dark:text-[#6EE7B7]">Speak</span>{' '}
              <span className="text-[#B91C1C] dark:text-[#FCA5A5]">Algeria</span>
            </span>
          </span>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? t.nav.enableLight : t.nav.enableDark}
            aria-pressed={isDark}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] text-[#23201C] dark:text-slate-200 hover:bg-[#EFE9DC] dark:hover:bg-[#1D2622] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C723C]"
          >
            {isDark ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Main centered language selection stage */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-3xl bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-[#EFECE4] dark:border-[#2A352F]">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-[#F5F2EB] border border-[#E4DFD2] dark:border-[#2A352F] flex items-center justify-center overflow-hidden p-1.5 shrink-0 shadow-xs">
              {!imgFailed ? (
                <img
                  src="/assets/aistudio/image_ae2514c7.png"
                  alt="Speak Algeria — Apprendre la darija algérienne"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="font-display text-lg font-extrabold text-center leading-tight">
                  <span className="text-[#146B3A]">Speak</span>{' '}
                  <span className="text-[#B91C1C]">Algeria</span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-[#5C723C] dark:text-[#A5C178]">
                {t.startup.eyebrow}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#23201C] dark:text-slate-50 leading-tight [text-wrap:balance]">
                {t.startup.title}
              </h1>
              <p className="text-sm sm:text-base text-[#686259] dark:text-slate-300 leading-relaxed">
                {t.startup.subtitle}
              </p>
            </div>
          </div>

          {/* Segmented language selector matching reference */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t.startup.selectLabel}
              </span>
              <span className="text-xs font-semibold text-[#0F2D3A] dark:text-slate-200">
                {selectedOption.nativeName} ({selectedOption.shortLabel})
              </span>
            </div>

            <div className="flex justify-start">
              <LanguageSelector
                value={language}
                onChange={onSelectLanguage}
                ariaLabel={t.startup.selectLabel}
                size="md"
              />
            </div>
          </div>

          {/* Live lesson preview updating immediately as user selects language */}
          <div className="rounded-2xl bg-[#F7F9F2] dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-medium text-[#686259] dark:text-slate-400">
                {t.startup.previewLabel}
              </p>
              <p className="font-display text-lg sm:text-xl font-bold text-[#23201C] dark:text-slate-100">
                Salam alikoum, wach rak?
              </p>
              <p className="text-sm text-[#4E6231] dark:text-[#A5C178] font-medium">
                {t.startup.previewPhraseMeaning}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlayPreview}
              aria-label={t.hero.listen}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer ${
                playingSample
                  ? 'bg-[#5C723C] text-white border-[#5C723C]'
                  : 'bg-white dark:bg-[#171E1B] text-[#23201C] dark:text-slate-100 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C]'
              }`}
            >
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              <span>{playingSample ? t.hero.playing : t.hero.listen}</span>
            </button>
          </div>

          {/* Primary Confirm CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <p className="text-xs text-[#686259] dark:text-slate-400">
              {t.startup.selectedNote}
            </p>
            <button
              type="button"
              data-testid="startup-confirm-button"
              onClick={onConfirmStart}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-semibold text-white bg-[#C68335] hover:bg-[#B2732B] rounded-xl whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C68335]"
            >
              <span>{t.startup.startButton}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
