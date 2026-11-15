import { Moon, Sun } from 'lucide-react';
import type { AppLanguage, WorkspaceTab } from '../types/darija';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';

interface TopBarProps {
  language: AppLanguage;
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onPrimaryAction: () => void;
  hasStarted: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  xp: number;
}

export function TopBar({
  language,
  activeTab,
  onSelectTab,
  onPrimaryAction,
  hasStarted,
  isDark,
  onToggleTheme,
  xp,
}: TopBarProps) {
  const navT = UI_TRANSLATIONS[language].nav;
  const expT = EXPERIENCE_TRANSLATIONS[language];

  const navItems: Array<{ id: WorkspaceTab; label: string }> = [
    { id: 'apprendre', label: navT.apprendre },
    { id: 'parcours', label: navT.parcours },
    { id: 'quiz', label: navT.quiz },
    { id: 'progres', label: navT.progres },
    { id: 'profil', label: navT.profil },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F5F1E8]/95 dark:bg-[#0E1311]/95 backdrop-blur-sm border-b border-[#E4DFD2] dark:border-[#2A352F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('apprendre');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2.5 font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#23201C] dark:text-slate-100 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C723C]"
        >
          <img
            src="/assets/aistudio/image_ae2514c7.png"
            alt="Speak Algeria"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F2EB] shrink-0"
          />
          <span>
            <span className="text-[#146B3A] dark:text-[#6EE7B7]">Speak</span>{' '}
            <span className="text-[#B91C1C] dark:text-[#FCA5A5]">Algeria</span>
          </span>
        </a>

        {/* Zone 2: Desktop 5-tab navigation */}
        <nav
          aria-label={navT.mainAria}
          className="hidden md:flex items-center gap-7"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`nav-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C723C] ${
                  isActive
                    ? 'text-[#23201C] dark:text-white font-semibold'
                    : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#5C723C] dark:bg-[#A5C178] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Theme toggle + XP/CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            data-testid="topbar-xp-pill"
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tabular-nums bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] text-[#4E6231] dark:text-[#A5C178]"
          >
            {xp} XP
          </span>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? navT.enableLight : navT.enableDark}
            aria-pressed={isDark}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] text-[#23201C] dark:text-slate-200 hover:bg-[#EFE9DC] dark:hover:bg-[#1F2924] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C723C]"
          >
            {isDark ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onPrimaryAction}
            title={expT.dialectBadge}
            className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-white bg-[#5C723C] hover:bg-[#4E6231] dark:bg-[#4E6231] dark:hover:bg-[#5C723C] rounded-lg whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C723C]"
          >
            {hasStarted ? navT.resume : navT.start}
          </button>
        </div>
      </div>
    </header>
  );
}
