import { useEffect, useState } from 'react';
import { Volume2, Send, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { DIALOGUE_SCENARIOS } from '../data/curriculum';
import type {
  AppLanguage,
  DialogueScenario,
  DialogueSuggestion,
  DialogueTurn,
} from '../types/darija';
import { UI_TRANSLATIONS } from '../i18n/translations';
import {
  getLocalizedScenario,
  getOfflineFallbackDialogueReply,
} from '../i18n/curriculumTranslations';
import { playDarijaPronunciation } from '../utils/audioPlayer';

interface DialogueSimulatorProps {
  language: AppLanguage;
  onEarnXp: (amount: number) => void;
}

export function DialogueSimulator({
  language,
  onEarnXp,
}: DialogueSimulatorProps) {
  const t = UI_TRANSLATIONS[language].dialogues;
  const localizedScenarios = DIALOGUE_SCENARIOS.map((sc) =>
    getLocalizedScenario(sc, language)
  );

  const [scenarioId, setScenarioId] = useState(localizedScenarios[0].id);
  const scenario =
    localizedScenarios.find((s) => s.id === scenarioId) ??
    localizedScenarios[0];

  const [turns, setTurns] = useState<DialogueTurn[]>([scenario.openingTurn]);
  const [suggestions, setSuggestions] = useState<DialogueSuggestion[]>(
    scenario.starterSuggestions
  );
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [playingTurnId, setPlayingTurnId] = useState<string | null>(null);

  useEffect(() => {
    setTurns((prev) =>
      prev.map((turn) =>
        turn.id === scenario.openingTurn.id ? scenario.openingTurn : turn
      )
    );
    setSuggestions((prev) =>
      turns.length <= 1 ? scenario.starterSuggestions : prev
    );
  }, [language, scenarioId]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchScenario = (nextScenario: DialogueScenario) => {
    setScenarioId(nextScenario.id);
    setTurns([nextScenario.openingTurn]);
    setSuggestions(nextScenario.starterSuggestions);
    setInputText('');
    setIsSending(false);
  };

  const handlePlayTurn = (turn: DialogueTurn) => {
    void playDarijaPronunciation({
      textArabic: turn.darijaArabic || turn.darijaLatin,
      textLatin: turn.darijaLatin,
      language,
      onStart: () => setPlayingTurnId(turn.id),
      onEnd: () => setPlayingTurnId(null),
    });
  };

  const sendMessage = async (text: string, meaning?: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const learnerTurn: DialogueTurn = {
      id: `learner-${Date.now()}`,
      speaker: 'learner',
      darijaLatin: trimmed,
      frenchTranslation: meaning || t.yourReplyFallback,
    };

    const updatedHistory = [...turns, learnerTurn];
    setTurns(updatedHistory);
    setInputText('');
    setIsSending(true);
    onEarnXp(15);

    try {
      const resp = await fetch('/api/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: scenario.title,
          partnerName: scenario.partnerName,
          partnerRole: scenario.partnerRole,
          setting: scenario.setting,
          language,
          history: updatedHistory.map((item) => ({
            speaker: item.speaker,
            darijaLatin: item.darijaLatin,
            frenchTranslation: item.frenchTranslation,
          })),
          userMessage: trimmed,
        }),
      });

      if (!resp.ok) {
        throw new Error('Fallback');
      }

      const data = (await resp.json()) as {
        replyDarija?: string;
        replyArabic?: string;
        replyFrench?: string;
        coachingTip?: string;
        suggestedReplies?: DialogueSuggestion[];
      };

      const fallback = getOfflineFallbackDialogueReply(
        scenario,
        trimmed,
        language
      );

      const replyTurn: DialogueTurn = {
        id: `partner-${Date.now()}`,
        speaker: 'interlocutor',
        darijaLatin: data.replyDarija || fallback.replyDarija,
        darijaArabic: data.replyArabic,
        frenchTranslation: data.replyFrench || fallback.replyFrench,
        coachingTip: data.coachingTip,
      };

      setTurns((prev) => [...prev, replyTurn]);
      if (data.suggestedReplies && data.suggestedReplies.length > 0) {
        setSuggestions(data.suggestedReplies);
      }
    } catch {
      const fallback = getOfflineFallbackDialogueReply(
        scenario,
        trimmed,
        language
      );
      setTurns((prev) => [
        ...prev,
        {
          id: `partner-${Date.now()}`,
          speaker: 'interlocutor',
          darijaLatin: fallback.replyDarija,
          darijaArabic: fallback.replyArabic,
          frenchTranslation: fallback.replyFrench,
          coachingTip: fallback.coachingTip,
        },
      ]);
      setSuggestions(fallback.suggestedReplies);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      aria-label={t.sectionAria}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scenario Sidebar */}
        <aside className="lg:col-span-4 bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[#23201C] dark:text-slate-100">
              {t.sidebarTitle}
            </h2>
            <p className="text-sm text-[#686259] dark:text-slate-400 mt-1">
              {t.sidebarSubtitle}
            </p>
          </div>

          <div className="space-y-2">
            {localizedScenarios.map((sc) => {
              const active = sc.id === scenario.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => switchScenario(sc)}
                  aria-current={active ? 'true' : undefined}
                  className={`w-full text-left p-3.5 rounded-xl border cursor-pointer ${
                    active
                      ? 'bg-[#B7410E] dark:bg-[#8C2F18] text-white border-[#B7410E]'
                      : 'bg-[#F5F1E8]/50 dark:bg-[#1D2622] text-[#23201C] dark:text-slate-100 border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#B7410E]'
                  }`}
                >
                  <p className="text-sm font-semibold">{sc.title}</p>
                  <p
                    className={`text-xs mt-0.5 ${
                      active ? 'text-[#E5EBD6]' : 'text-[#686259] dark:text-slate-400'
                    }`}
                  >
                    {sc.partnerName} · {sc.setting}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#EFECE4] dark:border-[#2A352F]">
            <p className="text-xs font-semibold text-[#8C2F18] dark:text-[#E8A184]">
              {t.objectiveLabel}
            </p>
            <p className="text-sm text-[#23201C] dark:text-slate-300 mt-1 leading-relaxed">
              {scenario.objective}
            </p>
          </div>
        </aside>

        {/* Conversation Stage */}
        <div className="lg:col-span-8 bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#EFECE4] dark:border-[#2A352F] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-[#23201C] dark:text-slate-100">
                {scenario.title}
              </h3>
              <p className="text-xs text-[#686259] dark:text-slate-400">
                {t.partnerLabel} {scenario.partnerName} ({scenario.partnerRole})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTranslations((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-200 hover:bg-[#F5F1E8] dark:hover:bg-[#1D2622] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {showTranslations ? (
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {showTranslations ? t.hideTranslation : t.showTranslation}
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchScenario(scenario)}
                aria-label={t.restart}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-200 hover:bg-[#F5F1E8] dark:hover:bg-[#1D2622] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.restart}</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="p-6 space-y-5 max-h-[480px] overflow-y-auto bg-[#F5F1E8]/45 dark:bg-[#0E1311]/70"
            aria-live="polite"
          >
            {turns.map((turn) => {
              const isPartner = turn.speaker === 'interlocutor';
              return (
                <div
                  key={turn.id}
                  className={`flex flex-col ${
                    isPartner ? 'items-start' : 'items-end'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 border ${
                      isPartner
                        ? 'bg-white dark:bg-[#171E1B] border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-100'
                        : 'bg-[#B7410E] dark:bg-[#8C2F18] border-[#B7410E] text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span
                        className={`text-xs font-semibold ${
                          isPartner ? 'text-[#8C2F18] dark:text-[#E8A184]' : 'text-[#E5EBD6]'
                        }`}
                      >
                        {isPartner ? scenario.partnerName : t.you}
                      </span>

                      <button
                        type="button"
                        onClick={() => handlePlayTurn(turn)}
                        aria-label={`${t.listen}: ${turn.darijaLatin}`}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg cursor-pointer ${
                          isPartner
                            ? 'text-[#686259] dark:text-slate-300 hover:bg-[#F5F1E8] dark:hover:bg-[#1D2622]'
                            : 'text-white/90 hover:bg-white/15'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {playingTurnId === turn.id ? t.playing : t.listen}
                        </span>
                      </button>
                    </div>

                    <p className="text-base font-semibold leading-snug">
                      {turn.darijaLatin}
                    </p>
                    {turn.darijaArabic && (
                      <p
                        className={`font-arabic text-base mt-1 ${
                          isPartner ? 'text-[#686259] dark:text-slate-300' : 'text-white/85'
                        }`}
                        lang="ar"
                        dir="rtl"
                      >
                        {turn.darijaArabic}
                      </p>
                    )}

                    {showTranslations && (
                      <p
                        className={`text-xs mt-2 pt-2 border-t ${
                          isPartner
                            ? 'border-[#EFECE4] dark:border-[#2A352F] text-[#686259] dark:text-slate-400'
                            : 'border-white/20 text-white/90'
                        }`}
                      >
                        {turn.frenchTranslation}
                      </p>
                    )}

                    {turn.coachingTip && (
                      <p className="text-xs mt-2 text-[#8C2F18] dark:text-[#E8A184] font-medium">
                        {t.advicePrefix} {turn.coachingTip}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <p className="text-xs text-[#686259] dark:text-slate-400 font-medium">
                {t.typingIndicator(scenario.partnerName)}
              </p>
            )}
          </div>

          {/* Suggestions + Input */}
          <div className="p-5 border-t border-[#EFECE4] dark:border-[#2A352F] space-y-4 bg-white dark:bg-[#171E1B] rounded-b-2xl">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#686259] dark:text-slate-400">
                {t.suggestionsLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((sug, idx) => (
                  <button
                    key={`${sug.darijaLatin}-${idx}`}
                    type="button"
                    disabled={isSending}
                    onClick={() =>
                      void sendMessage(sug.darijaLatin, sug.frenchMeaning)
                    }
                    className="text-left px-3.5 py-2 rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F7F9F2] dark:bg-[#1D2622] hover:border-[#B7410E] cursor-pointer disabled:opacity-50"
                  >
                    <p className="text-xs font-semibold text-[#23201C] dark:text-slate-100">
                      {sug.darijaLatin}
                    </p>
                    <p className="text-xs text-[#686259] dark:text-slate-400">
                      {sug.frenchMeaning}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage(inputText);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <label htmlFor="dialogue-input" className="sr-only">
                {t.inputLabel}
              </label>
              <input
                id="dialogue-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/40 dark:bg-[#0E1311] text-[#23201C] dark:text-slate-100 placeholder:text-[#8E867B] focus:outline-none focus:ring-2 focus:ring-[#B7410E]"
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C68335] hover:bg-[#B2732B] disabled:opacity-50 rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{t.send}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
