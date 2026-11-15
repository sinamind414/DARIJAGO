import { useState, useMemo } from 'react';
import { Volume2, CheckCircle2, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { ALL_PHRASES, CURRICULUM_MODULES } from '../data/curriculum';
import type { AppLanguage } from '../types/darija';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { getLocalizedModule } from '../i18n/curriculumTranslations';
import { generateQuizDeck, normalizeDarijaInput } from '../utils/darijaLogic';
import { playDarijaPronunciation } from '../utils/audioPlayer';

interface QuizArenaProps {
  language: AppLanguage;
  onQuizComplete: (correctCount: number, totalCount: number) => void;
  onAnswerEvaluated?: (isCorrect: boolean, phraseId: string) => void;
  onGoToLessons: () => void;
}

export function QuizArena({
  language,
  onQuizComplete,
  onAnswerEvaluated,
  onGoToLessons,
}: QuizArenaProps) {
  const t = UI_TRANSLATIONS[language].quiz;
  const localizedModules = useMemo(
    () => CURRICULUM_MODULES.map((m) => getLocalizedModule(m, language)),
    [language]
  );

  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [seed, setSeed] = useState<number>(1);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedTileIndices, setSelectedTileIndices] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);

  const deck = useMemo(
    () => generateQuizDeck(ALL_PHRASES, moduleFilter, seed, language),
    [moduleFilter, seed, language]
  );

  const currentQuestion = deck[currentIdx] ?? deck[0];

  const startNewQuiz = (nextModule: string, nextSeed: number) => {
    setModuleFilter(nextModule);
    setSeed(nextSeed);
    setCurrentIdx(0);
    setSelectedOption(null);
    setSelectedTileIndices([]);
    setSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setFinished(false);
  };

  const handleSubmitOption = (option: string) => {
    if (submitted) return;
    setSelectedOption(option);
    const ok = option === currentQuestion.correctAnswer;
    setIsCorrect(ok);
    setSubmitted(true);
    onAnswerEvaluated?.(ok, currentQuestion.phrase.id);
    if (ok) {
      setScore((s) => s + 1);
    }
  };

  const handleToggleTile = (tileIndex: number) => {
    if (submitted) return;
    setSelectedTileIndices((prev) =>
      prev.includes(tileIndex)
        ? prev.filter((i) => i !== tileIndex)
        : [...prev, tileIndex]
    );
  };

  const handleSubmitBuilder = () => {
    if (submitted || !currentQuestion.tiles) return;
    const built = selectedTileIndices
      .map((i) => currentQuestion.tiles![i])
      .join(' ');
    const ok =
      normalizeDarijaInput(built) ===
      normalizeDarijaInput(currentQuestion.correctAnswer);
    setIsCorrect(ok);
    setSubmitted(true);
    onAnswerEvaluated?.(ok, currentQuestion.phrase.id);
    if (ok) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= deck.length) {
      setFinished(true);
      onQuizComplete(score, deck.length);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelectedOption(null);
    setSelectedTileIndices([]);
    setSubmitted(false);
    setIsCorrect(false);
  };

  const handleListenPhrase = () => {
    void playDarijaPronunciation({
      textArabic: currentQuestion.phrase.darijaArabic,
      textLatin: currentQuestion.phrase.darijaLatin,
      phoneticFrench: currentQuestion.phrase.phoneticFrench,
      language,
    });
  };

  return (
    <section
      aria-label={t.sectionAria}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Unit Filter Header */}
      <div className="bg-white dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#23201C] dark:text-slate-100">
            {t.title}
          </h2>
          <p className="text-sm text-[#686259] dark:text-slate-400">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="quiz-module-select" className="text-xs font-semibold text-[#686259] dark:text-slate-300 whitespace-nowrap">
            {t.unitLabel}
          </label>
          <select
            id="quiz-module-select"
            value={moduleFilter}
            onChange={(e) => startNewQuiz(e.target.value, seed + 1)}
            className="px-3 py-2 text-sm rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-[#F5F1E8]/60 dark:bg-[#0E1311] text-[#23201C] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5C723C]"
          >
            <option value="all">{t.allUnits}</option>
            {localizedModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.number}. {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Finished Summary Screen */}
      {finished ? (
        <div className="bg-[#F7F9F2] dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-3xl p-8 text-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#4E6231] dark:text-[#A5C178]">
              {t.sessionDone}
            </p>
            <h3 className="font-display text-3xl font-extrabold text-[#23201C] dark:text-slate-100 tabular-nums">
              {t.correctCount(score, deck.length)}
            </h3>
            <p className="text-base text-[#686259] dark:text-slate-300 tabular-nums">
              {t.accuracySummary(
                Math.round((score / deck.length) * 100),
                score * 20
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => startNewQuiz(moduleFilter, seed + 7)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C68335] hover:bg-[#B2732B] rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{t.restartQuiz}</span>
            </button>

            <button
              type="button"
              onClick={onGoToLessons}
              className="px-5 py-2.5 text-sm font-semibold text-[#23201C] dark:text-slate-100 bg-white dark:bg-[#1D2622] border border-[#E4DFD2] dark:border-[#2A352F] hover:border-[#5C723C] rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.reviewLessons}
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Card */
        <div className="bg-[#F7F9F2] dark:bg-[#171E1B] border border-[#E4DFD2] dark:border-[#2A352F] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E4DFD2] dark:border-[#2A352F]">
            <span className="text-xs font-medium text-[#686259] dark:text-slate-400 tabular-nums">
              {t.questionCounter(currentIdx + 1, deck.length)} ·{' '}
              {currentQuestion.type === 'sentence-builder'
                ? t.typeBuilder
                : t.typeMcq}
            </span>
            <span className="text-sm font-bold text-[#4E6231] dark:text-[#A5C178] tabular-nums">
              {t.scoreLabel(score)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#23201C] dark:text-slate-100 [text-wrap:balance]">
                {currentQuestion.prompt}
              </h3>
              <button
                type="button"
                onClick={handleListenPhrase}
                aria-label={t.listenAria}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#1D2622] text-[#4E6231] dark:text-[#A5C178] hover:border-[#5C723C] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>{t.listen}</span>
              </button>
            </div>

            {currentQuestion.promptSubtext && (
              <p className="text-base text-[#686259] dark:text-slate-300 font-arabic" lang="auto">
                {currentQuestion.promptSubtext}
              </p>
            )}
          </div>

          {/* Multiple Choice Options */}
          {currentQuestion.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option;
                const isRightOption = option === currentQuestion.correctAnswer;

                let stateClasses =
                  'bg-white dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-100 hover:border-[#5C723C]';
                if (submitted) {
                  if (isRightOption) {
                    stateClasses =
                      'bg-[#E5EBD6] dark:bg-[#273322] border-[#5C723C] text-[#23201C] dark:text-emerald-100 font-semibold';
                  } else if (isSelected) {
                    stateClasses =
                      'bg-red-50 dark:bg-red-950/60 border-[#B9382C] dark:border-red-500 text-red-950 dark:text-red-100';
                  } else {
                    stateClasses = 'bg-[#F5F1E8]/60 dark:bg-[#141A17] border-[#E4DFD2] dark:border-[#2A352F] text-[#8E867B] dark:text-slate-500';
                  }
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={submitted}
                    onClick={() => handleSubmitOption(option)}
                    className={`text-left p-4 rounded-2xl border cursor-pointer disabled:cursor-default ${stateClasses}`}
                  >
                    <span className="text-sm sm:text-base">{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Sentence Builder Word Tiles */}
          {currentQuestion.type === 'sentence-builder' && currentQuestion.tiles && (
            <div className="space-y-4">
              <div className="min-h-[60px] p-3.5 rounded-2xl border border-[#E4DFD2] dark:border-[#2A352F] bg-white dark:bg-[#1D2622] flex flex-wrap items-center gap-2">
                {selectedTileIndices.length === 0 ? (
                  <span className="text-sm text-[#8E867B] dark:text-slate-500">
                    {t.builderHint}
                  </span>
                ) : (
                  selectedTileIndices.map((tileIdx) => (
                    <button
                      key={`chosen-${tileIdx}`}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleToggleTile(tileIdx)}
                      className="px-3.5 py-2 text-sm font-semibold rounded-xl bg-[#5C723C] text-white cursor-pointer"
                    >
                      {currentQuestion.tiles![tileIdx]}
                    </button>
                  ))
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {currentQuestion.tiles.map((tile, tileIdx) => {
                  const used = selectedTileIndices.includes(tileIdx);
                  return (
                    <button
                      key={`tile-${tileIdx}`}
                      type="button"
                      disabled={submitted || used}
                      onClick={() => handleToggleTile(tileIdx)}
                      className={`px-3.5 py-2 text-sm font-medium rounded-xl border cursor-pointer ${
                        used
                          ? 'bg-[#EFECE4] dark:bg-[#141A17] border-[#E4DFD2] dark:border-[#2A352F] text-[#B5ADA0] dark:text-slate-600 cursor-default'
                          : 'bg-white dark:bg-[#1D2622] border-[#E4DFD2] dark:border-[#2A352F] text-[#23201C] dark:text-slate-100 hover:border-[#5C723C]'
                      }`}
                    >
                      {tile}
                    </button>
                  );
                })}
              </div>

              {!submitted && (
                <button
                  type="button"
                  disabled={selectedTileIndices.length === 0}
                  onClick={handleSubmitBuilder}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#5C723C] hover:bg-[#4E6231] disabled:opacity-40 rounded-xl cursor-pointer"
                >
                  {t.validateSentence}
                </button>
              )}
            </div>
          )}

          {/* Immediate Feedback Banner */}
          {submitted && (
            <div
              role="status"
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isCorrect
                  ? 'bg-[#E5EBD6]/70 dark:bg-[#202B1E] border-[#5C723C] text-[#23201C] dark:text-emerald-100'
                  : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-950 dark:text-red-100'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2
                    className="w-5 h-5 text-[#4E6231] dark:text-[#A5C178] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : (
                  <XCircle
                    className="w-5 h-5 text-[#B9382C] dark:text-red-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-bold">
                    {isCorrect
                      ? t.correctFeedback
                      : t.expectedAnswer(currentQuestion.correctAnswer)}
                  </p>
                  <p className="text-xs leading-relaxed opacity-90">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#C68335] hover:bg-[#B2732B] rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>
                  {currentIdx + 1 >= deck.length
                    ? t.seeResult
                    : t.nextQuestion}
                </span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
