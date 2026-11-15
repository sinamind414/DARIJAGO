import { BarChart3, Compass, Home, Star, User } from 'lucide-react';
import type { AppLanguage, WorkspaceTab } from '../types/darija';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface BottomNavProps {
  language: AppLanguage;
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
}

export function BottomNav({ language, activeTab, onSelectTab }: BottomNavProps) {
  const navT = UI_TRANSLATIONS[language].nav;

  const items: Array<{
    id: WorkspaceTab;
    label: string;
    Icon: typeof Home;
  }> = [
    { id: 'apprendre', label: navT.apprendre, Icon: Home },
    { id: 'parcours', label: navT.parcours, Icon: Compass },
    { id: 'quiz', label: navT.quiz, Icon: Star },
    { id: 'progres', label: navT.progres, Icon: BarChart3 },
    { id: 'profil', label: navT.profil, Icon: User },
  ];

  return (
    <nav
      aria-label={navT.mainAria}
      data-testid="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-[#F5F1E8]/95 dark:bg-[#141A17]/95 backdrop-blur-sm border-t border-[#E4DFD2] dark:border-[#2A352F] px-2"
    >
      <div className="h-full max-w-md mx-auto grid grid-cols-5 items-center">
        {items.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              data-testid={`mobile-nav-${id}`}
              onClick={() => {
                onSelectTab(id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-0.5 py-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C723C]"
            >
              <span
                className={`inline-flex items-center justify-center w-12 h-7 rounded-full ${
                  isActive
                    ? 'bg-[#DDE3CE] dark:bg-[#2B3824] text-[#4E6231] dark:text-[#A5C178]'
                    : 'text-[#686259] dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>
              <span
                className={`text-[11px] leading-tight whitespace-nowrap ${
                  isActive
                    ? 'font-bold text-[#23201C] dark:text-slate-100'
                    : 'font-medium text-[#686259] dark:text-slate-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
