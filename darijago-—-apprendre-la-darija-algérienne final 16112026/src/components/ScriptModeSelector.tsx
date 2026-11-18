import { Languages } from 'lucide-react';
import { SCRIPT_MODES, type ScriptMode } from '../utils/scriptMode';

interface ScriptModeSelectorProps {
  mode: ScriptMode;
  onChange: (mode: ScriptMode) => void;
  label: string;
}

export function ScriptModeSelector({ mode, onChange, label }: ScriptModeSelectorProps) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] p-0.5"
      role="group"
      aria-label={label}
      data-testid="script-mode-selector"
    >
      <Languages className="w-3.5 h-3.5 mx-1.5 text-[#8E867B]" aria-hidden="true" />
      {SCRIPT_MODES.map((m) => {
        const actif = m.id === mode;
        return (
          <button
            key={m.id}
            type="button"
            data-testid={`script-mode-${m.id}`}
            onClick={() => onChange(m.id)}
            aria-pressed={actif}
            title={`${m.label} — ${m.sample}`}
            className={`px-2 py-1 rounded-md text-xs font-bold cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#5C723C] ${
              actif
                ? 'bg-[#5C723C] text-white dark:bg-[#4E6231]'
                : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
            }`}
          >
            {m.short}
          </button>
        );
      })}
    </div>
  );
}
