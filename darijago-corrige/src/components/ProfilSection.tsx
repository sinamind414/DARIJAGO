import { useState } from 'react';
import {
  ArrowRight,
  Bell,
  BellOff,
  CheckCircle2,
  Globe,
  Moon,
  RotateCcw,
  Sun,
  Target,
} from 'lucide-react';
import type { AppLanguage } from '../types/darija';
import type { DesktopNotificationPermission } from '../utils/notifications';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import { LanguageSelector } from './LanguageSelector';

interface ProfilSectionProps {
  language: AppLanguage;
  isDark: boolean;
  dailyXpGoal: number;
  desktopPermission: DesktopNotificationPermission;
  onChangeLanguage: (lang: AppLanguage) => void;
  onToggleTheme: () => void;
  onRequestDesktopPermission: () => void;
  onOpenProgress: () => void;
  onResetProgress: () => void;
}

export function ProfilSection({
  language,
  isDark,
  dailyXpGoal,
  desktopPermission,
  onChangeLanguage,
  onToggleTheme,
  onRequestDesktopPermission,
  onOpenProgress,
  onResetProgress,
}: ProfilSectionProps) {
  const expT = EXPERIENCE_TRANSLATIONS[language];
  const profT = expT.profil;
  const notifT = UI_TRANSLATIONS[language].notifications;

  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleConfirmReset = () => {
    onResetProgress();
    setConfirmingReset(false);
    setResetDone(true);
  };

  return (
    <section
      aria-label={profT.pageTitle}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6"
    >
      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#23201C] dark:text-slate-50 tracking-tight">
          {profT.pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400">
          {profT.pageSubtitle}
        </p>
      </div>

      {/* Language Switcher Card */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F5F1E8] dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178] flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-display text-base font-bold text-[#23201C] dark:text-slate-100">
              {profT.languageTitle}
            </h2>
            <p className="text-xs text-[#686259] dark:text-slate-400">
              {profT.languageDesc}
            </p>
          </div>
        </div>

        <LanguageSelector
          value={language}
          onChange={onChangeLanguage}
          ariaLabel={profT.languageTitle}
          size="md"
        />
      </div>

      {/* Appearance + Notifications + Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Theme Switch */}
        <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-[#23201C] dark:text-slate-100">
              {profT.appearanceTitle}
            </h2>
            <p className="text-xs text-[#686259] dark:text-slate-400 leading-relaxed">
              {profT.appearanceDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-pressed={isDark}
            className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/60 dark:bg-[#1D2622] text-xs font-semibold text-[#23201C] dark:text-slate-100 hover:border-[#5C723C] cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              {isDark ? (
                <Moon className="w-4 h-4 text-[#A5C178]" aria-hidden="true" />
              ) : (
                <Sun className="w-4 h-4 text-[#C68335]" aria-hidden="true" />
              )}
              <span>{isDark ? profT.darkLabel : profT.lightLabel}</span>
            </span>
            <span className="text-[#4E6231] dark:text-[#A5C178]">⇄</span>
          </button>
        </div>

        {/* Daily Goal Shortcut */}
        <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#5C723C] dark:text-[#A5C178]" aria-hidden="true" />
              <h2 className="font-display text-base font-bold text-[#23201C] dark:text-slate-100">
                {profT.goalTitle}
              </h2>
            </div>
            <p className="text-xs text-[#686259] dark:text-slate-400 leading-relaxed">
              {profT.goalDesc(dailyXpGoal)}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenProgress}
            className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/60 dark:bg-[#1D2622] text-xs font-semibold text-[#4E6231] dark:text-[#A5C178] hover:border-[#5C723C] cursor-pointer"
          >
            <span>{profT.goalManageLink}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Desktop Notifications */}
      {desktopPermission !== 'unsupported' && (
        <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-[#23201C] dark:text-slate-100">
              {profT.notificationsTitle}
            </h2>
            <p className="text-xs text-[#686259] dark:text-slate-400">
              {profT.notificationsDesc}
            </p>
          </div>

          <button
            type="button"
            data-testid="profil-desktop-notifications-button"
            onClick={onRequestDesktopPermission}
            disabled={desktopPermission === 'granted' || desktopPermission === 'denied'}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border whitespace-nowrap shrink-0 ${
              desktopPermission === 'granted'
                ? 'bg-[#E5EBD6] dark:bg-[#273322] text-[#4E6231] dark:text-[#A5C178] border-[#C7D2B0] dark:border-[#3D4F30] cursor-default'
                : desktopPermission === 'denied'
                  ? 'bg-[#EFECE4] dark:bg-[#1D2622] text-[#8E867B] border-[#E4DFD2] dark:border-[#2A352F] cursor-not-allowed'
                  : 'bg-white dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C] cursor-pointer'
            }`}
          >
            {desktopPermission === 'denied' ? (
              <BellOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Bell className="w-4 h-4" aria-hidden="true" />
            )}
            <span>
              {desktopPermission === 'granted'
                ? notifT.desktopEnabled
                : desktopPermission === 'denied'
                  ? notifT.desktopBlocked
                  : notifT.desktopEnable}
            </span>
          </button>
        </div>
      )}

      {/* Inline-Confirmed Progress Reset */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-[#23201C] dark:text-slate-100">
              {profT.resetTitle}
            </h2>
            <p className="text-xs text-[#686259] dark:text-slate-400">
              {profT.resetDesc}
            </p>
          </div>

          {!confirmingReset && (
            <button
              type="button"
              data-testid="profil-reset-trigger"
              onClick={() => {
                setConfirmingReset(true);
                setResetDone(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900/70 text-[#B9382C] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{profT.resetButton}</span>
            </button>
          )}
        </div>

        {confirmingReset && (
          <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs font-semibold text-[#B9382C] dark:text-red-300">
              {profT.resetConfirmPrompt}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                data-testid="profil-reset-confirm"
                onClick={handleConfirmReset}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#B9382C] hover:bg-[#9E2D22] text-white cursor-pointer"
              >
                {profT.resetConfirmYes}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-200 cursor-pointer"
              >
                {profT.resetConfirmCancel}
              </button>
            </div>
          </div>
        )}

        {resetDone && (
          <p
            role="status"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4E6231] dark:text-[#A5C178]"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>{profT.resetDoneMessage}</span>
          </p>
        )}
      </div>
    </section>
  );
}
