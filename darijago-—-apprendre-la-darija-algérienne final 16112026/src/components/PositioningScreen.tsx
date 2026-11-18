import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import {
  POSITIONING_QUESTIONS,
  PROFILES,
  computeProfile,
  type LearnerProfile,
} from '../utils/positioningLogic';

interface PositioningScreenProps {
  language: string;
  dark: boolean;
  onToggleTheme: () => void;
  onComplete: (profile: LearnerProfile) => void;
}

export function PositioningScreen({ onComplete }: PositioningScreenProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, LearnerProfile>>({});
  const [showResult, setShowResult] = useState(false);

  const profil = computeProfile(answers);
  const total = POSITIONING_QUESTIONS.length;

  const choose = (profilReponse: LearnerProfile) => {
    const q = POSITIONING_QUESTIONS[step];
    const next = { ...answers, [q.id]: profilReponse };
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const p = PROFILES[profil];
    return (
      <div
        data-testid="positioning-result"
        className="min-h-screen flex items-center justify-center bg-[#F5F1E8] dark:bg-[#0E1311] px-4"
      >
        <div className="w-full max-w-lg bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="text-5xl" aria-hidden="true">{p.icon}</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B7410E] dark:text-[#E8A184]">
              Votre profil
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#23201C] dark:text-slate-50 mt-2">
              {p.label}
            </h1>
            <p className="text-[#686259] dark:text-slate-400 mt-3">{p.description}</p>
          </div>
          <div className="bg-[#F5F1E8] dark:bg-[#1D2622] rounded-xl p-4 text-sm text-[#686259] dark:text-slate-400">
            Votre parcours est adapté dès la première leçon. Vous pourrez le changer à tout moment dans votre profil.
          </div>
          <button
            type="button"
            data-testid="positioning-finish"
            onClick={() => onComplete(profil)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#B7410E] hover:bg-[#8C2F18] cursor-pointer"
          >
            Commencer mon parcours <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  const q = POSITIONING_QUESTIONS[step];
  return (
    <div
      data-testid="positioning-screen"
      className="min-h-screen flex items-center justify-center bg-[#F5F1E8] dark:bg-[#0E1311] px-4"
    >
      <div className="w-full max-w-xl bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 text-[#B7410E] dark:text-[#E8A184]">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider">Positionnement · {step + 1}/{total}</span>
        </div>

        <div className="h-1.5 rounded-full bg-[#EFECE4] dark:bg-[#2A352F] overflow-hidden">
          <div
            className="h-full bg-[#B7410E] transition-all"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#23201C] dark:text-slate-50">
          {q.question}
        </h1>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              data-testid={`positioning-option-${step}-${i}`}
              onClick={() => choose(opt.profil)}
              className="w-full text-left px-4 py-3.5 rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#1D2622] hover:border-[#B7410E] dark:hover:border-[#E8A184] text-[#23201C] dark:text-slate-100 font-medium cursor-pointer transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>

        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1.5 text-sm text-[#686259] dark:text-slate-400 hover:text-[#23201C] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Retour
          </button>
        )}
      </div>
    </div>
  );
}
