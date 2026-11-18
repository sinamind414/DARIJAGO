import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  AudioLines,
  CheckCircle2,
  Eye,
  EyeOff,
  RotateCcw,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import type {
  AppLanguage,
  DarijaPhrase,
  LearningModule,
  UserProgressState,
} from '../types/darija';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import { PHONETIC_MODAL_TRANSLATIONS } from '../i18n/phoneticModalTranslations';
import {
  computeQuickReviewSessionStats,
  generateQuickReviewList,
  type QuickReviewDecision,
  type QuickReviewFilter,
  type QuickReviewItem,
  type QuickReviewReason,
} from '../utils/quickReviewLogic';
import { PhrasePlayButton } from './PhrasePlayButton';

interface QuickReviewPanelProps {
  language: AppLanguage;
  modules: LearningModule[];
  progress: UserProgressState;
  onMarkMastered: (phraseId: string) => void;
  onMarkForReview: (phraseId: string) => void;
  onOpenPhonetic: (phrase: DarijaPhrase) => void;
  onOpenInLesson: (moduleId: string, phraseId: string) => void;
  onBeforeAudioPlay?: () => void;
}

interface QuickReviewDeckEntry {
  phraseId: string;
  moduleId: string;
  reason: QuickReviewReason;
}

export function QuickReviewPanel({
  language,
  modules,
  progress,
  onMarkMastered,
  onMarkForReview,
  onOpenPhonetic,
  onOpenInLesson,
  onBeforeAudioPlay,
}: QuickReviewPanelProps) {
  const qrT = EXPERIENCE_TRANSLATIONS[language].quickReview;
  const pt = PHONETIC_MODAL_TRANSLATIONS[language];

  const [filter, setFilter] = useState<QuickReviewFilter>('mixed');
  const [hideMeanings, setHideMeanings] = useState<boolean>(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [decisions, setDecisions] = useState<Record<string, QuickReviewDecision>>({});
  const [deckEntries, setDeckEntries] = useState<QuickReviewDeckEntry[]>(() =>
    generateQuickReviewList(modules, progress, {
      count: 8,
      filter: 'mixed',
      seed: Date.now(),
    }).map((item) => ({
      phraseId: item.phrase.id,
      moduleId: item.moduleId,
      reason: item.reason,
    }))
  );

  const deckItems: QuickReviewItem[] = useMemo(() => {
    const moduleMap = new Map(modules.map((m) => [m.id, m]));
    const resolved: QuickReviewItem[] = [];
    for (const entry of deckEntries) {
      const mod = moduleMap.get(entry.moduleId);
      const phrase = mod?.phrases.find((p) => p.id === entry.phraseId);
      if (!mod || !phrase) continue;
      resolved.push({
        phrase,
        moduleId: mod.id,
        moduleNumber: mod.number,
        moduleTitle: mod.title,
        reason: entry.reason,
        priorityScore: 0,
        isMastered: progress.masteredIds.includes(phrase.id),
      });
    }
    return resolved;
  }, [deckEntries, modules, progress.masteredIds]);

  const sessionStats = useMemo(
    () => computeQuickReviewSessionStats(deckItems, decisions),
    [deckItems, decisions]
  );

  const handleRegenerate = (nextFilter: QuickReviewFilter = filter) => {
    const nextList = generateQuickReviewList(modules, progress, {
      count: 8,
      filter: nextFilter,
      seed: Date.now() + Math.floor(Math.random() * 100000),
    });
    setFilter(nextFilter);
    setDeckEntries(
      nextList.map((item) => ({
        phraseId: item.phrase.id,
        moduleId: item.moduleId,
        reason: item.reason,
      }))
    );
    setDecisions({});
    setRevealedIds({});
  };

  const handleMarkMastered = (phraseId: string) => {
    setDecisions((prev) => ({ ...prev, [phraseId]: 'mastered' }));
    onMarkMastered(phraseId);
  };

  const handleMarkForReview = (phraseId: string) => {
    setDecisions((prev) => ({ ...prev, [phraseId]: 'review' }));
    onMarkForReview(phraseId);
  };

  const getReasonBadge = (reason: QuickReviewReason) => {
    switch (reason) {
      case 'difficult':
        return {
          label: qrT.reasonDifficult,
          className:
            'bg-amber-50 dark:bg-amber-950/50 text-[#A86B22] dark:text-amber-300 border-amber-200 dark:border-amber-900/70',
        };
      case 'due':
        return {
          label: qrT.reasonDue,
          className:
            'bg-red-50 dark:bg-red-950/40 text-[#B9382C] dark:text-red-300 border-red-200 dark:border-red-900/60',
        };
      case 'recent':
        return {
          label: qrT.reasonRecent,
          className:
            'bg-[#E5EBD6]/70 dark:bg-[#223020] text-[#8C2F18] dark:text-[#E8A184] border-[#C7D2B0] dark:border-[#3D4F30]',
        };
      default:
        return {
          label: qrT.reasonDiscovery,
          className:
            'bg-[#F5F1E8] dark:bg-[#1D2622] text-[#686259] dark:text-slate-300 border-[#E4DFD2] dark:border-[#2A352F]',
        };
    }
  };

  const allEvaluated =
    sessionStats.total > 0 && sessionStats.decidedCount === sessionStats.total;

  return (
    <section
      data-testid="quick-review-panel"
      aria-label={qrT.title}
      className="space-y-5"
    >
      {/* Header & Controls Card */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles
                className="w-4 h-4 text-[#C68335] shrink-0"
                aria-hidden="true"
              />
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#23201C] dark:text-slate-50 tracking-tight">
                {qrT.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#686259] dark:text-slate-400">
              {qrT.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-testid="quick-review-toggle-meanings"
              onClick={() => setHideMeanings((v) => !v)}
              aria-pressed={hideMeanings}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#FAF8F3] dark:bg-[#121815] text-xs font-semibold text-[#23201C] dark:text-slate-200 hover:border-[#B7410E] cursor-pointer"
            >
              {hideMeanings ? (
                <Eye className="w-3.5 h-3.5 text-[#B7410E] dark:text-[#E8A184]" aria-hidden="true" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-[#686259] dark:text-slate-400" aria-hidden="true" />
              )}
              <span>
                {hideMeanings ? qrT.showMeaningsBtn : qrT.hideMeaningsBtn}
              </span>
            </button>

            <button
              type="button"
              data-testid="quick-review-regenerate"
              onClick={() => handleRegenerate(filter)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B7410E] hover:bg-[#8C2F18] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{qrT.regenerateBtn}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills + Progress Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#EFECE4] dark:border-[#2A352F]">
          <div
            role="group"
            aria-label={qrT.filterGroupAria}
            className="inline-flex items-center self-start bg-[#F5F1E8] dark:bg-[#111714] border border-[#E4DFD2] dark:border-[#2A352F] rounded-xl p-1 gap-1"
          >
            {(
              [
                ['mixed', qrT.filterMixed],
                ['difficult', qrT.filterDifficult],
                ['recent', qrT.filterRecent],
              ] as Array<[QuickReviewFilter, string]>
            ).map(([id, label]) => {
              const active = filter === id;
              return (
                <button
                  key={id}
                  type="button"
                  data-testid={`quick-review-filter-${id}`}
                  aria-pressed={active}
                  onClick={() => handleRegenerate(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-[#1E2723] text-[#8C2F18] dark:text-[#E8A184] shadow-xs border border-[#E4DFD2]/80 dark:border-[#2A352F]'
                      : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="flex-1 h-2 bg-[#EFECE4] dark:bg-[#2A352F] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B7410E] dark:bg-[#E8A184] transition-all duration-200"
                style={{ width: `${sessionStats.percent}%` }}
              />
            </div>
            <span
              data-testid="quick-review-session-progress"
              className="text-xs font-bold text-[#8C2F18] dark:text-[#E8A184] tabular-nums shrink-0"
            >
              {qrT.sessionProgress(sessionStats.decidedCount, sessionStats.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Completion Summary Banner */}
      {allEvaluated && (
        <div
          data-testid="quick-review-completed-banner"
          role="status"
          className="bg-[#F7F9F2] dark:bg-[#1B261E] border border-[#C7D2B0] dark:border-[#3D4F30] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-0.5">
            <p className="font-display text-base font-bold text-[#23201C] dark:text-slate-100">
              {qrT.completedTitle}
            </p>
            <p className="text-xs sm:text-sm text-[#8C2F18] dark:text-[#E8A184] font-medium">
              {qrT.completedSummary(
                sessionStats.masteredCount,
                sessionStats.toReviewCount
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleRegenerate(filter)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#B7410E] hover:bg-[#8C2F18] text-white text-xs font-semibold shrink-0 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{qrT.newSessionBtn}</span>
          </button>
        </div>
      )}

      {/* Randomized Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deckItems.map((item) => {
          const phrase = item.phrase;
          const decision = decisions[phrase.id];
          const currentlyMastered =
            decision === 'mastered' ||
            (decision !== 'review' && progress.masteredIds.includes(phrase.id));
          const reasonBadge = getReasonBadge(item.reason);
          const isMeaningVisible = !hideMeanings || Boolean(revealedIds[phrase.id]);

          return (
            <article
              key={phrase.id}
              data-testid={`quick-review-card-${phrase.id}`}
              data-decision={decision ?? 'pending'}
              className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-colors ${
                decision === 'mastered'
                  ? 'bg-[#F7F9F2] dark:bg-[#19231B] border-[#9BB375] dark:border-[#49633B]'
                  : decision === 'review'
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-[#C68335]/70 dark:border-amber-800/70'
                    : 'bg-white dark:bg-[#171E1B] border-[#E4DFD2] dark:border-[#2A352F]'
              }`}
            >
              <div className="space-y-3">
                {/* Top Metadata + Audio/Phonetic Quick Buttons */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${reasonBadge.className}`}
                    >
                      {reasonBadge.label}
                    </span>
                    <span className="text-[11px] font-medium text-[#686259] dark:text-slate-400 truncate">
                      {item.moduleNumber} · {item.moduleTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <PhrasePlayButton
                      phrase={phrase}
                      language={language}
                      playbackId={`qr-${phrase.id}`}
                      testId={`quick-review-play-${phrase.id}`}
                      onBeforePlay={onBeforeAudioPlay}
                    />
                    <button
                      type="button"
                      data-testid={`quick-review-phonetic-${phrase.id}`}
                      onClick={() => onOpenPhonetic(phrase)}
                      aria-label={pt.openItemAria(phrase.darijaLatin)}
                      title={pt.openButtonShort}
                      className="w-7 h-7 rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#8C2F18] dark:text-[#E8A184] hover:border-[#B7410E] inline-flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <AudioLines className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      data-testid={`quick-review-open-${phrase.id}`}
                      onClick={() => onOpenInLesson(item.moduleId, phrase.id)}
                      aria-label={`${qrT.openInLessonBtn} : ${phrase.darijaLatin}`}
                      title={qrT.openInLessonBtn}
                      className="w-7 h-7 rounded-lg border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/70 dark:bg-[#1D2622] text-[#686259] dark:text-slate-300 hover:border-[#B7410E] hover:text-[#8C2F18] inline-flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Darija Phrase + Arabic + Phonetics */}
                <div className="space-y-1">
                  <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#23201C] dark:text-slate-50 leading-snug">
                    {phrase.darijaLatin}
                  </h3>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p
                      className="font-arabic text-base text-[#686259] dark:text-slate-300"
                      lang="ar"
                      dir="rtl"
                    >
                      {phrase.darijaArabic}
                    </p>
                    <p className="font-mono text-xs text-[#8C2F18] dark:text-[#E8A184]">
                      [{phrase.phoneticFrench}]
                    </p>
                  </div>
                </div>

                {/* Meaning / Recall Reveal */}
                {isMeaningVisible ? (
                  <div className="pt-2 border-t border-[#EFECE4] dark:border-[#2A352F] space-y-0.5">
                    <p className="text-sm font-medium italic text-[#23201C] dark:text-slate-200">
                      “{phrase.frenchMeaning}”
                    </p>
                    {phrase.literalMeaning && (
                      <p className="text-xs text-[#686259] dark:text-slate-400">
                        {phrase.literalMeaning}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[#EFECE4] dark:border-[#2A352F]">
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedIds((prev) => ({
                          ...prev,
                          [phrase.id]: true,
                        }))
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B7410E] dark:text-[#E8A184] hover:underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{qrT.revealOneBtn}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons: Maîtrisé / À revoir */}
              <div className="space-y-2 pt-2 border-t border-[#EFECE4] dark:border-[#2A352F]">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid={`quick-review-mastered-${phrase.id}`}
                    aria-pressed={decision === 'mastered' || currentlyMastered}
                    onClick={() => handleMarkMastered(phrase.id)}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      decision === 'mastered' || currentlyMastered
                        ? 'bg-[#B7410E] dark:bg-[#8C2F18] border-[#B7410E] text-white'
                        : 'bg-[#FAF8F3] dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F] text-[#8C2F18] dark:text-[#E8A184] hover:border-[#B7410E]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{qrT.markMasteredBtn}</span>
                  </button>

                  <button
                    type="button"
                    data-testid={`quick-review-again-${phrase.id}`}
                    aria-pressed={decision === 'review'}
                    onClick={() => handleMarkForReview(phrase.id)}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      decision === 'review'
                        ? 'bg-[#9E621E] border-[#9E621E] text-white'
                        : 'bg-[#FAF8F3] dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F] text-[#9E621E] dark:text-amber-300 hover:border-[#C68335]'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{qrT.markReviewBtn}</span>
                  </button>
                </div>

                {decision && (
                  <p
                    role="status"
                    className={`text-[11px] font-semibold ${
                      decision === 'mastered'
                        ? 'text-[#8C2F18] dark:text-[#E8A184]'
                        : 'text-[#A86B22] dark:text-amber-300'
                    }`}
                  >
                    {decision === 'mastered' ? qrT.masteredBadge : qrT.reviewBadge}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
