import { useState } from 'react';
import { BookMarked, BookOpen, Headphones, Sparkles } from 'lucide-react';
import type { AppLanguage } from '../types/darija';
import { EXPERIENCE_TRANSLATIONS } from '../i18n/experienceTranslations';
import { BEN_SEDIRA_TRANSLATIONS } from '../i18n/benSediraTranslations';
import { QuizArena } from './QuizArena';
import { DictationArena } from './DictationArena';
import { LexiconGuide } from './LexiconGuide';
import { BenSediraDictionary } from './BenSediraDictionary';

type QuizSubTab = 'quiz' | 'dictation' | 'dictionary' | 'lexicon';

interface QuizHubSectionProps {
  language: AppLanguage;
  onQuizComplete: (correctCount: number, totalCount: number) => void;
  onAnswerEvaluated?: (isCorrect: boolean, phraseId: string) => void;
  onGoToLearn: () => void;
}

export function QuizHubSection({
  language,
  onQuizComplete,
  onAnswerEvaluated,
  onGoToLearn,
}: QuizHubSectionProps) {
  const qTabT = EXPERIENCE_TRANSLATIONS[language].quizTab;
  const bsT = BEN_SEDIRA_TRANSLATIONS[language];
  const [subTab, setSubTab] = useState<QuizSubTab>('quiz');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label={qTabT.tabQuiz}
          className="inline-flex items-center gap-1 p-1 rounded-full bg-[#E9E4D8] dark:bg-[#171E1B] border border-[#DFD9CA] dark:border-[#2A352F] overflow-x-auto max-w-full"
        >
          <button
            type="button"
            role="tab"
            data-testid="quiz-subtab-quiz"
            aria-selected={subTab === 'quiz'}
            onClick={() => setSubTab('quiz')}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'quiz'
                ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{qTabT.tabQuiz}</span>
          </button>

          <button
            type="button"
            role="tab"
            data-testid="quiz-subtab-dictation"
            aria-selected={subTab === 'dictation'}
            onClick={() => setSubTab('dictation')}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'dictation'
                ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{qTabT.tabDictation}</span>
          </button>

          <button
            type="button"
            role="tab"
            data-testid="quiz-subtab-dictionary"
            aria-selected={subTab === 'dictionary'}
            onClick={() => setSubTab('dictionary')}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'dictionary'
                ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{bsT.quizSubtabDictionary}</span>
          </button>

          <button
            type="button"
            role="tab"
            data-testid="quiz-subtab-lexicon"
            aria-selected={subTab === 'lexicon'}
            onClick={() => setSubTab('lexicon')}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'lexicon'
                ? 'bg-white dark:bg-[#26322B] text-[#23201C] dark:text-white shadow-xs'
                : 'text-[#686259] dark:text-slate-400 hover:text-[#23201C] dark:hover:text-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{qTabT.tabLexicon}</span>
          </button>
        </div>
      </div>

      {subTab === 'quiz' && (
        <QuizArena
          language={language}
          onQuizComplete={onQuizComplete}
          onAnswerEvaluated={onAnswerEvaluated}
          onGoToLessons={onGoToLearn}
        />
      )}
      {subTab === 'dictation' && (
        <DictationArena
          language={language}
          onSessionComplete={onQuizComplete}
          onAnswerEvaluated={onAnswerEvaluated}
          onGoToLessons={onGoToLearn}
        />
      )}
      {subTab === 'dictionary' && <BenSediraDictionary language={language} />}
      {subTab === 'lexicon' && <LexiconGuide language={language} />}
    </div>
  );
}
