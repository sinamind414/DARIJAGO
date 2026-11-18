import { Gauge } from 'lucide-react';
import { SPEED_OPTIONS, type PlaybackSpeed } from '../utils/playbackSpeed';

interface SpeedSelectorProps {
  speed: PlaybackSpeed;
  onChange: (speed: PlaybackSpeed) => void;
}

export function SpeedSelector({ speed, onChange }: SpeedSelectorProps) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] p-0.5"
      role="group"
      aria-label="Vitesse de lecture"
      data-testid="speed-selector"
    >
      <Gauge className="w-3.5 h-3.5 mx-1.5 text-[#8E867B]" aria-hidden="true" />
      {SPEED_OPTIONS.map((o) => {
        const actif = o.value === speed;
        return (
          <button
            key={o.value}
            type="button"
            data-testid={`speed-${o.value}`}
            onClick={() => onChange(o.value)}
            aria-pressed={actif}
            title={`${o.label} (${o.value}×)`}
            className={`px-2 py-1 rounded-md text-xs font-bold cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#B7410E] ${
              actif
                ? 'bg-[#B7410E] text-white dark:bg-[#8C2F18]'
                : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
            }`}
          >
            {o.value}×
          </button>
        );
      })}
    </div>
  );
}
