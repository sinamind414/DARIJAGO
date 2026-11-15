import type { AppLanguage } from '../types/darija';
import { LANGUAGE_OPTIONS } from '../i18n/translations';

interface LanguageSelectorProps {
  value: AppLanguage;
  onChange: (lang: AppLanguage) => void;
  ariaLabel?: string;
  size?: 'md' | 'sm';
}

export function LanguageSelector({
  value,
  onChange,
  ariaLabel = 'Language selector',
  size = 'md',
}: LanguageSelectorProps) {
  const paddingClass =
    size === 'sm'
      ? 'px-2 sm:px-2.5 py-1 text-xs'
      : 'px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm';

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="max-w-full overflow-x-auto inline-flex items-center gap-0.5 p-1 rounded-full bg-[#E9E4D8] dark:bg-[#171E1B] border border-[#DFD9CA] dark:border-[#2A352F]"
    >
      {LANGUAGE_OPTIONS.map((option) => {
        const isSelected = option.code === value;
        return (
          <button
            key={option.code}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.nativeName}
            title={option.nativeName}
            data-lang-code={option.code}
            onClick={() => onChange(option.code)}
            className={`${paddingClass} rounded-full font-semibold tracking-tight whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C723C] ${
              isSelected
                ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
            }`}
          >
            {option.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
