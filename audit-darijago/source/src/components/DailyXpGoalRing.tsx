import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { CheckCircle2, Sparkles, Target } from 'lucide-react';
import type { AppLanguage } from '../types/darija';
import { UI_TRANSLATIONS } from '../i18n/translations';
import {
  DAILY_XP_GOAL_PRESETS,
  MAX_DAILY_XP_GOAL,
  MIN_DAILY_XP_GOAL,
  sanitizeDailyXpGoal,
} from '../utils/darijaLogic';

interface DailyXpGoalRingProps {
  language: AppLanguage;
  todayXp: number;
  dailyGoal: number;
  pendingCelebration: boolean;
  onChangeDailyGoal: (goal: number) => void;
  onCelebrationShown: () => void;
}

const SPARK_PARTICLES: ReadonlyArray<{
  tx: string;
  ty: string;
  rot: string;
  color: string;
  delay: string;
}> = [
  { tx: '0px', ty: '-58px', rot: '90deg', color: '#0E7C47', delay: '0ms' },
  { tx: '30px', ty: '-50px', rot: '130deg', color: '#F59E0B', delay: '35ms' },
  { tx: '52px', ty: '-26px', rot: '160deg', color: '#D92B22', delay: '60ms' },
  { tx: '58px', ty: '4px', rot: '45deg', color: '#10B981', delay: '20ms' },
  { tx: '48px', ty: '34px', rot: '110deg', color: '#F59E0B', delay: '75ms' },
  { tx: '24px', ty: '52px', rot: '150deg', color: '#0E7C47', delay: '40ms' },
  { tx: '-6px', ty: '58px', rot: '75deg', color: '#D92B22', delay: '55ms' },
  { tx: '-34px', ty: '48px', rot: '140deg', color: '#10B981', delay: '25ms' },
  { tx: '-54px', ty: '22px', rot: '95deg', color: '#F59E0B', delay: '70ms' },
  { tx: '-58px', ty: '-10px', rot: '125deg', color: '#0E7C47', delay: '30ms' },
  { tx: '-44px', ty: '-40px', rot: '170deg', color: '#D92B22', delay: '50ms' },
  { tx: '-20px', ty: '-54px', rot: '60deg', color: '#10B981', delay: '15ms' },
];

export function DailyXpGoalRing({
  language,
  todayXp,
  dailyGoal,
  pendingCelebration,
  onChangeDailyGoal,
  onCelebrationShown,
}: DailyXpGoalRingProps) {
  const heroT = UI_TRANSLATIONS[language].hero;
  const goal = sanitizeDailyXpGoal(dailyGoal);
  const percent = Math.min(100, Math.round((todayXp / goal) * 100));
  const remainingXp = Math.max(0, goal - todayXp);
  const reached = todayXp >= goal;

  const [customValue, setCustomValue] = useState<string>(String(goal));
  const [celebrating, setCelebrating] = useState<boolean>(false);
  const [burstKey, setBurstKey] = useState<number>(0);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setCustomValue(String(goal));
  }, [goal]);

  const triggerBurst = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setBurstKey((prev) => prev + 1);
    setCelebrating(true);
    timerRef.current = window.setTimeout(() => {
      setCelebrating(false);
      timerRef.current = null;
    }, 2400);
  };

  useEffect(() => {
    if (pendingCelebration) {
      triggerBurst();
      onCelebrationShown();
    }
  }, [pendingCelebration, onCelebrationShown]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number.parseInt(customValue, 10);
    if (Number.isFinite(parsed)) {
      const sanitized = sanitizeDailyXpGoal(parsed);
      setCustomValue(String(sanitized));
      onChangeDailyGoal(sanitized);
    } else {
      setCustomValue(String(goal));
    }
  };

  return (
    <div
      data-testid="daily-xp-goal-section"
      className="w-full"
    >
      <div
        className={`rounded-xl border px-5 py-4 sm:px-6 sm:py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
          reached
            ? 'bg-[#F7F9F2] dark:bg-[#202B1E] border-[#C7D2B0] dark:border-[#3D4F30]'
            : 'bg-[#F5F1E8]/60 dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F]'
        }`}
      >
        {/* Left: Progress Ring + Daily Status + Celebration */}
        <div className="flex items-center gap-5 min-w-0">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            {celebrating && (
              <div
                key={`celebration-${burstKey}`}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
              >
                <span className="animate-goal-halo absolute w-20 h-20 rounded-full border-2 border-[#0E7C47] dark:border-emerald-400" />
                {SPARK_PARTICLES.map((spark, index) => (
                  <span
                    key={index}
                    className="animate-goal-spark absolute w-2 h-2 rounded-xs"
                    style={
                      {
                        backgroundColor: spark.color,
                        animationDelay: spark.delay,
                        '--tx': spark.tx,
                        '--ty': spark.ty,
                        '--rot': spark.rot,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
            )}

            <div
              data-testid="daily-goal-ring"
              data-reached={String(reached)}
              data-celebrating={String(celebrating)}
              role="progressbar"
              aria-valuenow={todayXp}
              aria-valuemin={0}
              aria-valuemax={goal}
              aria-label={heroT.dailyGoalAria(todayXp, goal)}
              className={`relative w-24 h-24 flex items-center justify-center ${
                celebrating ? 'animate-goal-ring-pop' : ''
              }`}
            >
              <svg
                viewBox="0 0 100 100"
                className="w-24 h-24"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  strokeWidth="8"
                  className="stroke-[#E4DFD2] dark:stroke-[#2A352F]"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 50 50)"
                  className="transition-[stroke-dashoffset,stroke] duration-500 ease-out stroke-[#5C723C] dark:stroke-[#A5C178]"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {reached ? (
                  <CheckCircle2
                    className="w-5 h-5 text-[#5C723C] dark:text-[#A5C178] mb-0.5"
                    aria-hidden="true"
                  />
                ) : (
                  <Target
                    className="w-4 h-4 text-[#8E867B] dark:text-slate-500 mb-0.5"
                    aria-hidden="true"
                  />
                )}
                <span className="font-display text-sm font-extrabold text-[#23201C] dark:text-slate-100 tabular-nums leading-none">
                  {percent}%
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <h2 className="font-display text-base font-bold text-[#23201C] dark:text-slate-100">
                {heroT.dailyGoalTitle}
              </h2>
              <span
                data-testid="daily-goal-counter"
                className="text-sm font-bold text-[#4E6231] dark:text-[#A5C178] tabular-nums"
              >
                {todayXp} / {goal} XP
              </span>
            </div>

            {reached ? (
              <div
                data-testid="daily-goal-celebration"
                role="status"
                className="space-y-1"
              >
                <p className="text-sm font-semibold text-[#4E6231] dark:text-[#A5C178] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{heroT.dailyGoalReachedTitle}</span>
                </p>
                <p className="text-xs text-[#686259] dark:text-slate-300">
                  {heroT.dailyGoalReachedSubtitle}
                </p>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-300">
                {heroT.dailyGoalRemaining(remainingXp)}
              </p>
            )}
          </div>
        </div>

        {/* Right: Goal Preset Selector + Custom Input + Replay button when reached */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div
            role="group"
            aria-label={heroT.dailyGoalSelectAria}
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#E9E4D8] dark:bg-[#171E1B] border border-[#DFD9CA] dark:border-[#2A352F]"
          >
            {DAILY_XP_GOAL_PRESETS.map((preset) => {
              const active = goal === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChangeDailyGoal(preset)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 tabular-nums cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C723C] ${
                    active
                      ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-slate-100 shadow-xs'
                      : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
                  }`}
                >
                  {preset} XP
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleCustomSubmit}
            className="inline-flex items-center gap-1.5"
          >
            <label
              htmlFor="daily-xp-goal-input"
              className="text-xs font-medium text-[#686259] dark:text-slate-400 whitespace-nowrap"
            >
              {heroT.dailyGoalCustomLabel}
            </label>
            <input
              id="daily-xp-goal-input"
              type="number"
              min={MIN_DAILY_XP_GOAL}
              max={MAX_DAILY_XP_GOAL}
              step={5}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              aria-label={heroT.dailyGoalSelectAria}
              className="w-20 px-2.5 py-1.5 text-xs font-semibold tabular-nums rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] text-[#23201C] dark:text-slate-100 focus:outline-none focus:border-[#5C723C]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#171E1B] text-[#23201C] dark:text-slate-100 hover:border-[#5C723C] hover:text-[#4E6231] dark:hover:text-[#A5C178] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {heroT.dailyGoalApply}
            </button>
          </form>

          {reached && (
            <button
              type="button"
              onClick={triggerBurst}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#C68335] hover:bg-[#B2732B] text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{heroT.dailyGoalReplay}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
