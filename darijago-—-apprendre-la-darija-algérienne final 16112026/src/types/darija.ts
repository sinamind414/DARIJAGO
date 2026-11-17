export type AppLanguage = 'fr' | 'en' | 'es' | 'de' | 'it' | 'nl' | 'zh';

export interface LanguageOption {
  code: AppLanguage;
  shortLabel: string;
  nativeName: string;
}

export type WorkspaceTab =
  | 'apprendre'
  | 'parcours'
  | 'dictionnaire'
  | 'quiz'
  | 'progres'
  | 'profil';

export type MasteryStatus = 'new' | 'learning' | 'mastered';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface PhraseReviewState {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lastReviewedDate: string;
  nextReviewDate: string;
}

export interface CulturalStory {
  id: string;
  category: string;
  title: string;
  imageUrl?: string;
  focusWord: {
    darijaLatin: string;
    darijaArabic: string;
    meaning: string;
  };
  body: string;
  xpReward: number;
}

export type AchievementCategory = string;

export interface AchievementStatus {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  current: number;
  target: number;
  percent: number;
  unlocked: boolean;
  unitLabel: string;
}

export interface DailyXpPoint {
  date: string;
  label: string;
  fullDate: string;
  xpEarned: number;
  cumulativeXp: number;
}

export interface DailyActivityRecord {
  verbsLearned: number;
  verbIds: string[];
  phrasesPracticed: number;
  phraseIds: string[];
  quizzesCompleted: number;
  quizCorrectAnswers: number;
  dialogueTurns: number;
  storiesRead: number;
  claimedChallengeIds: string[];
}

export interface UserProgressState {
  xp: number;
  streak: number;
  dailyXpGoal: number;
  masteredIds: string[];
  practicedIds: string[];
  readStoryIds: string[];
  quizzesCompleted: number;
  bestQuizAccuracy: number;
  quizStreak: number;
  bestQuizStreak: number;
  dialogueTurnsCount: number;
  xpByDate: Record<string, number>;
  phraseReviews: Record<string, PhraseReviewState>;
  dailyActivityByDate: Record<string, DailyActivityRecord>;
}

export interface WordToken {
  darija: string;
  arabic: string;
  french: string;
}

export interface DarijaPhrase {
  id: string;
  moduleId: string;
  darijaLatin: string;
  darijaArabic: string;
  phoneticFrench: string;
  frenchMeaning: string;
  literalMeaning?: string;
  regionalNote: string;
  difficulty: 'Débutant' | 'Intermédiaire';
  acceptedAnswers: string[];
  breakdown: WordToken[];
  nextReviewDate?: string;
}

export interface LearningModule {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  contextLabel: string;
  phrases: DarijaPhrase[];
}

export interface ArabiziSound {
  symbol: string;
  arabicLetter: string;
  name: string;
  pronunciationTip: string;
  exampleDarija: string;
  exampleArabic: string;
  exampleFrench: string;
}

export interface DialogueSuggestion {
  darijaLatin: string;
  darijaArabic: string;
  frenchMeaning: string;
}

export interface DialogueTurn {
  id: string;
  speaker: 'interlocutor' | 'learner';
  darijaLatin: string;
  darijaArabic?: string;
  frenchTranslation: string;
  coachingTip?: string;
}

export interface DialogueScenario {
  id: string;
  title: string;
  setting: string;
  partnerName: string;
  partnerRole: string;
  objective: string;
  openingTurn: DialogueTurn;
  starterSuggestions: DialogueSuggestion[];
}

export type QuizQuestionType = 'fr-to-darija' | 'darija-to-fr' | 'sentence-builder';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  phrase: DarijaPhrase;
  prompt: string;
  promptSubtext?: string;
  options?: string[];
  tiles?: string[];
  correctAnswer: string;
  correctTokens?: string[];
  explanation: string;
}
