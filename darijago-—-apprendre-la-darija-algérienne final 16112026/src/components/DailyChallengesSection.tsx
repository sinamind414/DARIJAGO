import { ArrowRight, CheckCircle2, Flame, Gift, Target } from 'lucide-react';
import type { AppLanguage } from '../types/darija';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import {
  computeDailyChallengesSummary,
  type DailyChallenge,
  type DailyChallengeActionTarget,
} from '../utils/dailyChallengesLogic';

interface DailyChallengesSectionProps {
  language: AppLanguage;
  challenges: DailyChallenge[];
  onClaimChallenge: (challengeId: string) => void;
  onActionNavigate: (target: DailyChallengeActionTarget) => void;
}

export function DailyChallengesSection({
  language,
  challenges,
  onClaimChallenge,
  onActionNavigate,
}: DailyChallengesSectionProps) {
  const dcT = EXPERIENCE_TRANSLATIONS[language].dailyChallenges;
  const summary = computeDailyChallengesSummary(challenges);

  return (
    <section
      aria-label={dcT.sectionTitle}
      data-testid="daily-challenges-section"
      className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 space-y-5"
    >
      {/* Header + Summary Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#C68335] shrink-0" aria-hidden="true" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#23201C] dark:text-slate-100">
              {dcT.sectionTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400">
            {dcT.sectionSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold tabular-nums text-[#686259] dark:text-slate-300 shrink-0">
          <span
            data-testid="daily-challenges-completed-summary"
            className="text-[#8C2F18] dark:text-[#E8A184]"
          >
            {dcT.completedSummary(summary.completedCount, summary.total)}
          </span>
          <span aria-hidden="true">·</span>
          <span
            data-testid="daily-challenges-bonus-summary"
            className="text-[#C68335]"
          >
            {dcT.bonusPoolSummary(summary.earnedBonusXp, summary.totalBonusXp)}
          </span>
        </div>
      </div>

      {/* All Claimed Banner */}
      {summary.allClaimed && (
        <div
          data-testid="daily-challenges-all-claimed"
          className="p-3.5 rounded-xl bg-[#F7F9F2] dark:bg-[#1E2B20] border border-[#D8E2C8] dark:border-[#2E3C31] flex items-center gap-3"
        >
          <CheckCircle2
            className="w-5 h-5 text-[#8C2F18] dark:text-[#E8A184] shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-[#23201C] dark:text-slate-100">
              {dcT.allDoneTitle}
            </p>
            <p className="text-xs text-[#686259] dark:text-slate-400">
              {dcT.allDoneHint}
            </p>
          </div>
        </div>
      )}

      {/* 3 Daily Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {challenges.map((challenge) => {
          const isClaimed = challenge.claimed;
          const isReadyToClaim = challenge.completed && !challenge.claimed;

          return (
            <article
              key={challenge.id}
              data-testid={`daily-challenge-card-${challenge.kind}`}
              className={`rounded-xl border p-4 flex flex-col justify-between gap-4 transition-colors ${
                isClaimed
                  ? 'bg-[#F7F9F2]/75 dark:bg-[#1A241D] border-[#C9D7B2] dark:border-[#2E3C31]'
                  : isReadyToClaim
                    ? 'bg-[#FFFDF8] dark:bg-[#221F17] border-[#C68335]'
                    : 'bg-[#F5F1E8]/60 dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F]'
              }`}
            >
              <div className="space-y-3">
                {/* Unboxed Status & Bonus Reward Row */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 font-semibold ${
                      isClaimed
                        ? 'text-[#8C2F18] dark:text-[#E8A184]'
                        : isReadyToClaim
                          ? 'text-[#B2732B] dark:text-[#E5A95E]'
                          : 'text-[#686259] dark:text-slate-400'
                    }`}
                  >
                    {isClaimed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    ) : isReadyToClaim ? (
                      <Gift className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <Target className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {isClaimed
                        ? dcT.statusClaimed
                        : isReadyToClaim
                          ? dcT.statusReady
                          : dcT.statusInProgress}
                    </span>
                  </span>

                  <span className="font-bold text-[#C68335] tabular-nums shrink-0">
                    {dcT.bonusRewardLabel(challenge.bonusXp)}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h3 className="font-display text-base font-bold text-[#23201C] dark:text-slate-100 leading-snug">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-[#686259] dark:text-slate-400 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                {/* Progress Bar + Count */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs tabular-nums">
                    <span
                      data-testid={`daily-challenge-progress-${challenge.kind}`}
                      className="font-semibold text-[#23201C] dark:text-slate-200"
                    >
                      {challenge.current} / {challenge.target} {challenge.unitLabel}
                    </span>
                    <span className="font-mono text-[#686259] dark:text-slate-400">
                      {challenge.percent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E8E2D4] dark:bg-[#2A352F] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isReadyToClaim
                          ? 'bg-[#C68335]'
                          : 'bg-[#B7410E] dark:bg-[#E8A184]'
                      }`}
                      style={{ width: `${challenge.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action CTA */}
              {isReadyToClaim ? (
                <button
                  type="button"
                  data-testid={`daily-challenge-claim-${challenge.kind}`}
                  onClick={() => onClaimChallenge(challenge.id)}
                  className="w-full min-h-[40px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#C68335] hover:bg-[#B2732B] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                >
                  <Gift className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{dcT.claimBtn(challenge.bonusXp)}</span>
                </button>
              ) : isClaimed ? (
                <div
                  data-testid={`daily-challenge-claimed-${challenge.kind}`}
                  className="w-full min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#E5EBD6] dark:bg-[#273322] text-[#8C2F18] dark:text-[#E8A184] text-xs sm:text-sm font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{dcT.claimedBtn(challenge.bonusXp)}</span>
                </div>
              ) : (
                <button
                  type="button"
                  data-testid={`daily-challenge-go-${challenge.kind}`}
                  onClick={() => onActionNavigate(challenge.actionTarget)}
                  className="w-full min-h-[40px] inline-flex items-center justify-between px-4 py-2 rounded-xl bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E] text-[#23201C] dark:text-slate-100 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  <span>{challenge.actionLabel}</span>
                  <ArrowRight className="w-4 h-4 text-[#B7410E] dark:text-[#E8A184] shrink-0" aria-hidden="true" />
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
