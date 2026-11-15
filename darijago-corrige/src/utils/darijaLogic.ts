import type {
  AchievementStatus,
  AppLanguage,
  DailyXpPoint,
  DarijaPhrase,
  LearningModule,
  MasteryStatus,
  PhraseReviewState,
  QuizQuestion,
  ReviewRating,
  UserProgressState,
} from '../types/darija';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { getLocalizedPhrase } from '../i18n/curriculumTranslations';

export const PROGRESS_STORAGE_KEY = 'darijago_progress_v1';

export const DEFAULT_DAILY_XP_GOAL = 50;
export const MIN_DAILY_XP_GOAL = 10;
export const MAX_DAILY_XP_GOAL = 1000;
export const DAILY_XP_GOAL_PRESETS = [20, 50, 100, 150] as const;

export const DEFAULT_PROGRESS: UserProgressState = {
  xp: 0,
  streak: 1,
  dailyXpGoal: DEFAULT_DAILY_XP_GOAL,
  masteredIds: [],
  practicedIds: [],
  readStoryIds: [],
  quizzesCompleted: 0,
  bestQuizAccuracy: 0,
  quizStreak: 0,
  bestQuizStreak: 0,
  dialogueTurnsCount: 0,
  xpByDate: {},
  phraseReviews: {},
};

export function sanitizeDailyXpGoal(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    return DEFAULT_DAILY_XP_GOAL;
  }
  const rounded = Math.round(raw);
  return Math.min(MAX_DAILY_XP_GOAL, Math.max(MIN_DAILY_XP_GOAL, rounded));
}

export function setDailyXpGoal(
  progress: UserProgressState,
  goal: number
): UserProgressState {
  return {
    ...progress,
    dailyXpGoal: sanitizeDailyXpGoal(goal),
  };
}

export function getTodayXp(
  progress: UserProgressState,
  today: Date = new Date()
): number {
  const key = formatLocalDateKey(today);
  return Math.max(0, progress.xpByDate[key] ?? 0);
}

export interface DailyGoalStatus {
  todayXp: number;
  goal: number;
  percent: number;
  remainingXp: number;
  reached: boolean;
}

export function computeDailyGoalStatus(
  progress: UserProgressState,
  today: Date = new Date()
): DailyGoalStatus {
  const goal = sanitizeDailyXpGoal(progress.dailyXpGoal);
  const todayXp = getTodayXp(progress, today);
  const percent = Math.min(100, Math.round((todayXp / goal) * 100));
  const remainingXp = Math.max(0, goal - todayXp);
  return {
    todayXp,
    goal,
    percent,
    remainingXp,
    reached: todayXp >= goal,
  };
}

export function formatLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDailyXp(
  xpByDate: Record<string, number>,
  xpGain: number,
  date: Date = new Date()
): Record<string, number> {
  if (xpGain <= 0) return xpByDate;
  const key = formatLocalDateKey(date);
  return {
    ...xpByDate,
    [key]: (xpByDate[key] ?? 0) + xpGain,
  };
}

/**
 * Normalizes Arabizi/French Darija text so minor spelling differences
 * (accents, 7/h, 3/a, 9/q/k, punctuation) match fairly during typing practice.
 */
export function normalizeDarijaInput(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/7/g, 'h')
    .replace(/3/g, 'a')
    .replace(/9/g, 'q')
    .replace(/5/g, 'kh')
    .replace(/[’'`.,?!;:—\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isDarijaAnswerMatch(
  userInput: string,
  phrase: Pick<DarijaPhrase, 'darijaLatin' | 'acceptedAnswers'>
): boolean {
  const normalizedUser = normalizeDarijaInput(userInput);
  if (!normalizedUser) return false;

  const candidates = [phrase.darijaLatin, ...phrase.acceptedAnswers].map(
    normalizeDarijaInput
  );

  return candidates.some((candidate) => {
    if (candidate === normalizedUser) return true;
    // Allow matching when user types the core expression (>= 5 chars) contained cleanly
    if (normalizedUser.length >= 5 && candidate.includes(normalizedUser)) {
      return true;
    }
    return false;
  });
}

export function getPhraseStatus(
  phraseId: string,
  progress: UserProgressState
): MasteryStatus {
  if (progress.masteredIds.includes(phraseId)) return 'mastered';
  if (progress.practicedIds.includes(phraseId)) return 'learning';
  return 'new';
}

export function addDaysToDateKey(
  baseDate: Date,
  days: number
): string {
  const next = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate()
  );
  next.setDate(next.getDate() + days);
  return formatLocalDateKey(next);
}

export function getRelativeReviewDays(
  nextReviewDate: string,
  today: Date = new Date()
): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nextReviewDate);
  if (!match) return 0;
  const targetUtc = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return Math.round((targetUtc - todayUtc) / 86_400_000);
}

export function isPhraseDueForReview(
  phraseOrDate: string | Pick<DarijaPhrase, 'nextReviewDate'> | undefined,
  today: Date = new Date()
): boolean {
  const nextReviewDate =
    typeof phraseOrDate === 'string'
      ? phraseOrDate
      : phraseOrDate?.nextReviewDate;
  if (!nextReviewDate) return false;
  return nextReviewDate <= formatLocalDateKey(today);
}

/**
 * Simple SM-2-inspired spaced repetition interval scheduler.
 */
export function computeNextPhraseReview(
  current: PhraseReviewState | undefined,
  rating: ReviewRating,
  today: Date = new Date()
): PhraseReviewState {
  const baseEase = current?.easeFactor ?? 2.5;
  const prevReps = current?.repetitions ?? 0;
  const prevInterval = current?.intervalDays ?? 0;

  let repetitions = prevReps;
  let intervalDays = 0;
  let easeFactor = baseEase;

  if (rating === 'again') {
    repetitions = 0;
    intervalDays = 0;
    easeFactor = Math.max(1.3, Number((baseEase - 0.2).toFixed(2)));
  } else if (rating === 'hard') {
    repetitions = Math.max(1, prevReps);
    intervalDays =
      prevInterval >= 1 ? Math.max(1, Math.round(prevInterval * 1.2)) : 1;
    easeFactor = Math.max(1.3, Number((baseEase - 0.15).toFixed(2)));
  } else if (rating === 'good') {
    repetitions = prevReps + 1;
    if (prevReps === 0) {
      intervalDays = 1;
    } else if (prevReps === 1) {
      intervalDays = 3;
    } else {
      intervalDays = Math.max(4, Math.round(prevInterval * baseEase));
    }
  } else {
    repetitions = prevReps + 1;
    if (prevReps === 0) {
      intervalDays = 4;
    } else if (prevReps === 1) {
      intervalDays = 7;
    } else {
      intervalDays = Math.max(7, Math.round(prevInterval * (baseEase + 0.15)));
    }
    easeFactor = Math.min(3.0, Number((baseEase + 0.15).toFixed(2)));
  }

  return {
    repetitions,
    intervalDays,
    easeFactor,
    lastReviewedDate: formatLocalDateKey(today),
    nextReviewDate: addDaysToDateKey(today, intervalDays),
  };
}

export function previewReviewIntervals(
  current: PhraseReviewState | undefined,
  today: Date = new Date()
): Record<ReviewRating, number> {
  return {
    again: computeNextPhraseReview(current, 'again', today).intervalDays,
    hard: computeNextPhraseReview(current, 'hard', today).intervalDays,
    good: computeNextPhraseReview(current, 'good', today).intervalDays,
    easy: computeNextPhraseReview(current, 'easy', today).intervalDays,
  };
}

export function recordPhraseReview(
  progress: UserProgressState,
  phraseId: string,
  rating: ReviewRating,
  xpGain = 5,
  today: Date = new Date()
): UserProgressState {
  const nextReview = computeNextPhraseReview(
    progress.phraseReviews[phraseId],
    rating,
    today
  );
  const alreadyPracticed = progress.practicedIds.includes(phraseId);
  return {
    ...progress,
    xp: progress.xp + xpGain,
    practicedIds: alreadyPracticed
      ? progress.practicedIds
      : [...progress.practicedIds, phraseId],
    xpByDate: addDailyXp(progress.xpByDate, xpGain, today),
    phraseReviews: {
      ...progress.phraseReviews,
      [phraseId]: nextReview,
    },
  };
}

export function attachPhraseReviewDates(
  phrases: DarijaPhrase[],
  progress: UserProgressState
): DarijaPhrase[] {
  return phrases.map((phrase) => ({
    ...phrase,
    nextReviewDate: progress.phraseReviews[phrase.id]?.nextReviewDate,
  }));
}

export interface PriorityReviewItem {
  phrase: DarijaPhrase;
  moduleId: string;
  moduleNumber: string;
  moduleTitle: string;
  reviewState?: PhraseReviewState;
  isDue: boolean;
  daysUntilDue: number;
  priorityReason: 'overdue' | 'due-today' | 'upcoming';
}

export function getPriorityReviewPhrases(
  modules: LearningModule[],
  progress: UserProgressState,
  today: Date = new Date()
): { dueItems: PriorityReviewItem[]; upcomingItems: PriorityReviewItem[] } {
  const dueItems: PriorityReviewItem[] = [];
  const upcomingItems: PriorityReviewItem[] = [];

  for (const mod of modules) {
    for (const rawPhrase of mod.phrases) {
      const reviewState = progress.phraseReviews[rawPhrase.id];
      if (!reviewState) continue;

      const phrase: DarijaPhrase = {
        ...rawPhrase,
        nextReviewDate: reviewState.nextReviewDate,
      };
      const daysUntilDue = getRelativeReviewDays(
        reviewState.nextReviewDate,
        today
      );
      const isDue = daysUntilDue <= 0;
      const priorityReason: PriorityReviewItem['priorityReason'] =
        daysUntilDue < 0
          ? 'overdue'
          : daysUntilDue === 0
            ? 'due-today'
            : 'upcoming';

      const item: PriorityReviewItem = {
        phrase,
        moduleId: mod.id,
        moduleNumber: mod.number,
        moduleTitle: mod.title,
        reviewState,
        isDue,
        daysUntilDue,
        priorityReason,
      };

      if (isDue) {
        dueItems.push(item);
      } else {
        upcomingItems.push(item);
      }
    }
  }

  dueItems.sort((a, b) => {
    if (a.daysUntilDue !== b.daysUntilDue) {
      return a.daysUntilDue - b.daysUntilDue;
    }
    const easeDiff =
      (a.reviewState?.easeFactor ?? 2.5) - (b.reviewState?.easeFactor ?? 2.5);
    if (easeDiff !== 0) return easeDiff;
    return (a.reviewState?.repetitions ?? 0) - (b.reviewState?.repetitions ?? 0);
  });

  upcomingItems.sort((a, b) => {
    if (a.daysUntilDue !== b.daysUntilDue) {
      return a.daysUntilDue - b.daysUntilDue;
    }
    return (a.reviewState?.repetitions ?? 0) - (b.reviewState?.repetitions ?? 0);
  });

  return { dueItems, upcomingItems };
}

export function togglePhraseMastery(
  progress: UserProgressState,
  phraseId: string,
  date: Date = new Date()
): UserProgressState {
  const alreadyMastered = progress.masteredIds.includes(phraseId);
  if (alreadyMastered) {
    return {
      ...progress,
      masteredIds: progress.masteredIds.filter((id) => id !== phraseId),
    };
  }
  const nextPracticed = progress.practicedIds.includes(phraseId)
    ? progress.practicedIds
    : [...progress.practicedIds, phraseId];
  const nextReview = computeNextPhraseReview(
    progress.phraseReviews[phraseId],
    'good',
    date
  );
  return {
    ...progress,
    xp: progress.xp + 25,
    masteredIds: [...progress.masteredIds, phraseId],
    practicedIds: nextPracticed,
    xpByDate: addDailyXp(progress.xpByDate, 25, date),
    phraseReviews: {
      ...progress.phraseReviews,
      [phraseId]: nextReview,
    },
  };
}

export function markPhrasePracticed(
  progress: UserProgressState,
  phraseId: string,
  xpGain = 10,
  date: Date = new Date()
): UserProgressState {
  const alreadyPracticed = progress.practicedIds.includes(phraseId);
  const nextReview = computeNextPhraseReview(
    progress.phraseReviews[phraseId],
    'good',
    date
  );
  return {
    ...progress,
    xp: progress.xp + xpGain,
    practicedIds: alreadyPracticed
      ? progress.practicedIds
      : [...progress.practicedIds, phraseId],
    xpByDate: addDailyXp(progress.xpByDate, xpGain, date),
    phraseReviews: {
      ...progress.phraseReviews,
      [phraseId]: nextReview,
    },
  };
}

export function recordQuizResult(
  progress: UserProgressState,
  correctCount: number,
  totalQuestions: number,
  date: Date = new Date()
): UserProgressState {
  const accuracy =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const xpGain = correctCount * 20;
  return {
    ...progress,
    xp: progress.xp + xpGain,
    quizzesCompleted: progress.quizzesCompleted + 1,
    bestQuizAccuracy: Math.max(progress.bestQuizAccuracy, accuracy),
    xpByDate: addDailyXp(progress.xpByDate, xpGain, date),
  };
}

export function recordQuizAnswerStreak(
  progress: UserProgressState,
  isCorrect: boolean
): UserProgressState {
  const nextStreak = isCorrect ? progress.quizStreak + 1 : 0;
  return {
    ...progress,
    quizStreak: nextStreak,
    bestQuizStreak: Math.max(progress.bestQuizStreak, nextStreak),
  };
}

export function recordDialogueTurn(
  progress: UserProgressState,
  xpGain = 15,
  date: Date = new Date()
): UserProgressState {
  return {
    ...progress,
    xp: progress.xp + xpGain,
    dialogueTurnsCount: progress.dialogueTurnsCount + 1,
    xpByDate: addDailyXp(progress.xpByDate, xpGain, date),
  };
}

export function recordBonusXp(
  progress: UserProgressState,
  xpGain = 5,
  date: Date = new Date()
): UserProgressState {
  if (xpGain <= 0) return progress;
  return {
    ...progress,
    xp: progress.xp + xpGain,
    xpByDate: addDailyXp(progress.xpByDate, xpGain, date),
  };
}

export function markStoryRead(
  progress: UserProgressState,
  storyId: string,
  xpGain = 10,
  date: Date = new Date()
): UserProgressState {
  if (!storyId || progress.readStoryIds.includes(storyId)) {
    return progress;
  }
  return {
    ...progress,
    xp: progress.xp + xpGain,
    readStoryIds: [...progress.readStoryIds, storyId],
    xpByDate: addDailyXp(progress.xpByDate, xpGain, date),
  };
}

export function buildLast7DaysXpSeries(
  progress: UserProgressState,
  today: Date = new Date(),
  lang: AppLanguage = 'fr'
): DailyXpPoint[] {
  const heroStrings = UI_TRANSLATIONS[lang].hero;
  const baseDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days: Array<{
    date: string;
    label: string;
    fullDate: string;
    xpEarned: number;
  }> = [];

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - offset);
    const key = formatLocalDateKey(d);
    const weekday = heroStrings.weekdays[d.getDay()];
    const dayNum = d.getDate();
    const month = heroStrings.months[d.getMonth()];
    days.push({
      date: key,
      label: offset === 0 ? heroStrings.todayLabel : `${weekday} ${dayNum}`,
      fullDate: lang === 'zh' ? `${month}${dayNum}日` : `${dayNum} ${month}`,
      xpEarned: Math.max(0, progress.xpByDate[key] ?? 0),
    });
  }

  const windowTotal = days.reduce((sum, item) => sum + item.xpEarned, 0);
  let runningTotal = Math.max(0, progress.xp - windowTotal);

  return days.map((item) => {
    runningTotal += item.xpEarned;
    return {
      ...item,
      cumulativeXp: runningTotal,
    };
  });
}

function clampProgress(current: number, target: number): { current: number; percent: number; unlocked: boolean } {
  const clamped = Math.min(current, target);
  const percent = target > 0 ? Math.round((clamped / target) * 100) : 0;
  return { current: clamped, percent, unlocked: current >= target };
}

interface LocalizedAchievementMeta {
  title: string;
  description: string;
  category: string;
  unitLabel: string;
}

const ACHIEVEMENT_LOCALE_TEXTS: Record<
  AppLanguage,
  Record<string, LocalizedAchievementMeta>
> = {
  fr: {
    'first-phrase': {
      title: 'Premier Pas',
      description: 'Maîtriser ta première expression en darija algérienne.',
      category: 'Leçons',
      unitLabel: 'phrase',
    },
    'five-lessons': {
      title: '5 Leçons Complétées',
      description: 'Maîtriser 5 phrases essentielles du programme.',
      category: 'Leçons',
      unitLabel: 'phrases',
    },
    'first-100-xp': {
      title: 'Premiers 100 XP',
      description: 'Atteindre 100 points d’expérience par la pratique.',
      category: 'Progression',
      unitLabel: 'XP',
    },
    'quiz-streak-3': {
      title: 'Série Quiz (3 de suite)',
      description: 'Réussir 3 réponses consécutives sans erreur au quiz.',
      category: 'Quiz',
      unitLabel: 'bonnes réponses',
    },
    'unit-complete': {
      title: 'Unité Validée',
      description: 'Maîtriser toutes les phrases d’une unité complète.',
      category: 'Leçons',
      unitLabel: 'unité',
    },
    'perfect-quiz': {
      title: 'Sans-Faute au Quiz',
      description: 'Obtenir 100 % de réussite sur une session de quiz.',
      category: 'Quiz',
      unitLabel: '%',
    },
    'dialogue-turns-3': {
      title: 'Conversation Locale',
      description: 'Échanger 3 répliques dans le simulateur de dialogues.',
      category: 'Dialogues',
      unitLabel: 'répliques',
    },
    'xp-500': {
      title: 'Maître de la Darija',
      description: 'Cumuler 500 XP sur l’ensemble des entraînements.',
      category: 'Progression',
      unitLabel: 'XP',
    },
  },
  en: {
    'first-phrase': {
      title: 'First Step',
      description: 'Master your first expression in Algerian Darija.',
      category: 'Lessons',
      unitLabel: 'phrase',
    },
    'five-lessons': {
      title: '5 Lessons Completed',
      description: 'Master 5 essential phrases from the curriculum.',
      category: 'Lessons',
      unitLabel: 'phrases',
    },
    'first-100-xp': {
      title: 'First 100 XP',
      description: 'Reach 100 experience points through practice.',
      category: 'Progress',
      unitLabel: 'XP',
    },
    'quiz-streak-3': {
      title: 'Quiz Streak (3 in a row)',
      description: 'Answer 3 quiz questions correctly in a row.',
      category: 'Quiz',
      unitLabel: 'answers',
    },
    'unit-complete': {
      title: 'Unit Completed',
      description: 'Master every phrase in a complete learning unit.',
      category: 'Lessons',
      unitLabel: 'unit',
    },
    'perfect-quiz': {
      title: 'Flawless Quiz',
      description: 'Score 100% accuracy in a quiz session.',
      category: 'Quiz',
      unitLabel: '%',
    },
    'dialogue-turns-3': {
      title: 'Local Conversation',
      description: 'Exchange 3 replies in the dialogue simulator.',
      category: 'Dialogues',
      unitLabel: 'turns',
    },
    'xp-500': {
      title: 'Darija Master',
      description: 'Earn 500 XP across all learning activities.',
      category: 'Progress',
      unitLabel: 'XP',
    },
  },
  es: {
    'first-phrase': {
      title: 'Primer Paso',
      description: 'Domina tu primera expresión en dariya argelina.',
      category: 'Lecciones',
      unitLabel: 'frase',
    },
    'five-lessons': {
      title: '5 Lecciones Completadas',
      description: 'Domina 5 frases esenciales del programa.',
      category: 'Lecciones',
      unitLabel: 'frases',
    },
    'first-100-xp': {
      title: 'Primeros 100 XP',
      description: 'Alcanza 100 puntos de experiencia practicando.',
      category: 'Progreso',
      unitLabel: 'XP',
    },
    'quiz-streak-3': {
      title: 'Racha Quiz (3 seguidas)',
      description: 'Acierta 3 respuestas consecutivas sin error en el quiz.',
      category: 'Quiz',
      unitLabel: 'aciertos',
    },
    'unit-complete': {
      title: 'Unidad Completada',
      description: 'Domina todas las frases de una unidad completa.',
      category: 'Lecciones',
      unitLabel: 'unidad',
    },
    'perfect-quiz': {
      title: 'Quiz Perfecto',
      description: 'Obtén un 100 % de precisión en una sesión de quiz.',
      category: 'Quiz',
      unitLabel: '%',
    },
    'dialogue-turns-3': {
      title: 'Conversación Local',
      description: 'Intercambia 3 réplicas en el simulador de diálogos.',
      category: 'Diálogos',
      unitLabel: 'turnos',
    },
    'xp-500': {
      title: 'Maestro de la Dariya',
      description: 'Acumula 500 XP entre todas tus prácticas.',
      category: 'Progreso',
      unitLabel: 'XP',
    },
  },
  de: {
    'first-phrase': {
      title: 'Erster Schritt',
      description: 'Meistere deinen ersten Ausdruck auf algerischem Darija.',
      category: 'Lektionen',
      unitLabel: 'Satz',
    },
    'five-lessons': {
      title: '5 Lektionen Abgeschlossen',
      description: 'Meistere 5 wichtige Sätze aus dem Kurs.',
      category: 'Lektionen',
      unitLabel: 'Sätze',
    },
    'first-100-xp': {
      title: 'Erste 100 XP',
      description: 'Erreiche 100 Erfahrungspunkte durch aktives Üben.',
      category: 'Fortschritt',
      unitLabel: 'XP',
    },
    'quiz-streak-3': {
      title: 'Quiz-Serie (3 in Folge)',
      description: 'Beantworte 3 Quizfragen hintereinander richtig.',
      category: 'Quiz',
      unitLabel: 'Treffer',
    },
    'unit-complete': {
      title: 'Einheit Gemeistert',
      description: 'Meistere alle Sätze einer kompletten Lerneinheit.',
      category: 'Lektionen',
      unitLabel: 'Einheit',
    },
    'perfect-quiz': {
      title: 'Fehlerfreies Quiz',
      description: 'Erziele 100 % Genauigkeit in einer Quizrunde.',
      category: 'Quiz',
      unitLabel: '%',
    },
    'dialogue-turns-3': {
      title: 'Lokales Gespräch',
      description: 'Wechsle 3 Antworten im Dialogsimulator.',
      category: 'Dialoge',
      unitLabel: 'Züge',
    },
    'xp-500': {
      title: 'Meister des Darija',
      description: 'Sammle insgesamt 500 XP in allen Übungen.',
      category: 'Fortschritt',
      unitLabel: 'XP',
    },
  },
  it: {
    'first-phrase': {
      title: 'Primo Passo',
      description: 'Acquisisci la tua prima espressione in darija algerina.',
      category: 'Lezioni',
      unitLabel: 'frase',
    },
    'five-lessons': {
      title: '5 Lezioni Completate',
      description: 'Acquisisci 5 frasi essenziali del programma.',
      category: 'Lezioni',
      unitLabel: 'frasi',
    },
    'first-100-xp': {
      title: 'Primi 100 XP',
      description: 'Raggiungi 100 punti esperienza con la pratica.',
      category: 'Progressi',
      unitLabel: 'XP',
    },
    'quiz-streak-3': {
      title: 'Serie Quiz (3 di fila)',
      description: 'Indovina 3 risposte consecutive senza errori nel quiz.',
      category: 'Quiz',
      unitLabel: 'risposte',
    },
    'unit-complete': {
      title: 'Unità Completata',
      description: 'Acquisisci tutte le frasi di una unità completa.',
      category: 'Lezioni',
      unitLabel: 'unità',
    },
    'perfect-quiz': {
      title: 'Quiz Perfetto',
      description: 'Ottieni il 100% di precisione in una sessione di quiz.',
      category: 'Quiz',
      unitLabel: '%',
    },
    'dialogue-turns-3': {
      title: 'Conversazione Locale',
      description: 'Scambia 3 battute nel simulatore di dialoghi.',
      category: 'Dialoghi',
      unitLabel: 'battute',
    },
    'xp-500': {
      title: 'Maestro della Darija',
      description: 'Accumula 500 XP in tutti gli esercizi.',
      category: 'Progressi',
      unitLabel: 'XP',
    },
  },
  nl: {
    'first-phrase': {
      title: 'Eerste Stap',
      description: 'Beheers je eerste uitdrukking in Algerijns Darija.',
      category: 'Lessen',
      unitLabel: 'zin',
    },
    'five-lessons': {
      title: '5 Lessen Voltooid',
      description: 'Beheers 5 essentiële zinnen uit het programma.',
      category: 'Lessen',
      unitLabel: 'zinnen',
    },
    'first-100-xp': {
      title: 'Eerste 100 XP',
      description: 'Bereik 100 ervaringspunten door te oefenen.',
      category: 'Voortgang',
      unitLabel: 'XP',
    },
    'quiz-streak-3': {
      title: 'Quizreeks (3 op rij)',
      description: 'Geef 3 goede antwoorden achter elkaar in de quiz.',
      category: 'Quiz',
      unitLabel: 'antwoorden',
    },
    'unit-complete': {
      title: 'Module Voltooid',
      description: 'Beheers alle zinnen van een volledige leermodule.',
      category: 'Lessen',
      unitLabel: 'module',
    },
    'perfect-quiz': {
      title: 'Foutloze Quiz',
      description: 'Behaal 100% nauwkeurigheid in een quizsessie.',
      category: 'Quiz',
      unitLabel: '%',
    },
    'dialogue-turns-3': {
      title: 'Lokaal Gesprek',
      description: 'Wissel 3 reacties uit in de dialoogsimulator.',
      category: 'Dialogen',
      unitLabel: 'beurten',
    },
    'xp-500': {
      title: 'Meester in Darija',
      description: 'Verzamel 500 XP over alle oefeningen heen.',
      category: 'Voortgang',
      unitLabel: 'XP',
    },
  },
  zh: {
    'first-phrase': {
      title: '迈出第一步',
      description: '掌握你的第一句阿尔及利亚达里贾语表达。',
      category: '课程',
      unitLabel: '句',
    },
    'five-lessons': {
      title: '完成 5 句课程',
      description: '掌握课程中的 5 句核心表达。',
      category: '课程',
      unitLabel: '句',
    },
    'first-100-xp': {
      title: '首次达成 100 XP',
      description: '通过学习与练习累计获得 100 点经验值。',
      category: '进度',
      unitLabel: 'XP',
    },
    'quiz-streak-3': {
      title: '测验 3 连胜',
      description: '在测验中连续答对 3 道题目。',
      category: '测验',
      unitLabel: '连对',
    },
    'unit-complete': {
      title: '通关一个单元',
      description: '掌握任意完整单元中的所有句子。',
      category: '课程',
      unitLabel: '个单元',
    },
    'perfect-quiz': {
      title: '测验满分',
      description: '在单轮测验中取得 100% 正确率。',
      category: '测验',
      unitLabel: '%',
    },
    'dialogue-turns-3': {
      title: '地道对话',
      description: '在情景对话模拟器中完成 3 轮回应。',
      category: '对话',
      unitLabel: '轮',
    },
    'xp-500': {
      title: '达里贾语大师',
      description: '在所有练习中累计获得 500 XP。',
      category: '进度',
      unitLabel: 'XP',
    },
  },
};

export function evaluateAchievements(
  progress: UserProgressState,
  modules: LearningModule[],
  lang: AppLanguage = 'fr'
): AchievementStatus[] {
  const masteredCount = progress.masteredIds.length;
  const completedUnits = modules.filter(
    (m) => m.phrases.length > 0 && m.phrases.every((p) => progress.masteredIds.includes(p.id))
  ).length;
  const texts = ACHIEVEMENT_LOCALE_TEXTS[lang];

  const rawList: Array<{ id: string; rawCurrent: number; target: number }> = [
    { id: 'first-phrase', rawCurrent: masteredCount, target: 1 },
    { id: 'five-lessons', rawCurrent: masteredCount, target: 5 },
    { id: 'first-100-xp', rawCurrent: progress.xp, target: 100 },
    { id: 'quiz-streak-3', rawCurrent: progress.bestQuizStreak, target: 3 },
    { id: 'unit-complete', rawCurrent: completedUnits, target: 1 },
    { id: 'perfect-quiz', rawCurrent: progress.bestQuizAccuracy, target: 100 },
    { id: 'dialogue-turns-3', rawCurrent: progress.dialogueTurnsCount, target: 3 },
    { id: 'xp-500', rawCurrent: progress.xp, target: 500 },
  ];

  return rawList.map((item) => {
    const meta = texts[item.id] ?? ACHIEVEMENT_LOCALE_TEXTS.fr[item.id];
    const { current, percent, unlocked } = clampProgress(item.rawCurrent, item.target);
    return {
      id: item.id,
      title: meta.title,
      description: meta.description,
      category: meta.category,
      current,
      target: item.target,
      percent,
      unlocked,
      unitLabel: meta.unitLabel,
    };
  });
}

export function countUnlockedAchievements(achievements: AchievementStatus[]): number {
  return achievements.filter((a) => a.unlocked).length;
}

export function computeModuleProgress(
  module: LearningModule,
  progress: UserProgressState
): { mastered: number; total: number; percent: number } {
  const total = module.phrases.length;
  const mastered = module.phrases.filter((p) =>
    progress.masteredIds.includes(p.id)
  ).length;
  const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return { mastered, total, percent };
}

export function computeOverallProgress(
  allPhrases: DarijaPhrase[],
  progress: UserProgressState
): { mastered: number; practiced: number; total: number; percent: number } {
  const total = allPhrases.length;
  const mastered = allPhrases.filter((p) =>
    progress.masteredIds.includes(p.id)
  ).length;
  const practiced = allPhrases.filter((p) =>
    progress.practicedIds.includes(p.id)
  ).length;
  const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return { mastered, practiced, total, percent };
}

export function filterLexicon(
  phrases: DarijaPhrase[],
  query: string,
  moduleFilter: string,
  lang: AppLanguage = 'fr'
): DarijaPhrase[] {
  const q = normalizeDarijaInput(query);
  const rawQuery = query.trim().toLowerCase();

  return phrases
    .map((phrase) => getLocalizedPhrase(phrase, lang))
    .filter((phrase) => {
      const matchesModule =
        moduleFilter === 'all' || phrase.moduleId === moduleFilter;
      if (!matchesModule) return false;
      if (!rawQuery) return true;

      const haystack = [
        phrase.darijaLatin,
        phrase.frenchMeaning,
        phrase.phoneticFrench,
        phrase.regionalNote,
        phrase.darijaArabic,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (q.length > 0 && normalizeDarijaInput(haystack).includes(q)) ||
        haystack.includes(rawQuery)
      );
    });
}

function deterministicRotate<T>(items: T[], seed: number): T[] {
  if (items.length <= 1) return [...items];
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = (seed * 31 + i * 17) % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function generateQuizDeck(
  allPhrases: DarijaPhrase[],
  moduleFilter: string,
  seed = 1,
  lang: AppLanguage = 'fr'
): QuizQuestion[] {
  const quizStrings = UI_TRANSLATIONS[lang].quiz;
  const localizedAll = allPhrases.map((p) => getLocalizedPhrase(p, lang));
  const pool =
    moduleFilter === 'all'
      ? localizedAll
      : localizedAll.filter((p) => p.moduleId === moduleFilter);

  const selected = pool.slice(0, 6);

  return selected.map((phrase, idx) => {
    const distractorsPool = localizedAll.filter((p) => p.id !== phrase.id);
    const rotatedDistractors = deterministicRotate(
      distractorsPool,
      seed + idx * 7
    ).slice(0, 3);

    // Every 3rd question is a sentence-builder if phrase has >= 2 breakdown tokens
    if (idx % 3 === 2 && phrase.breakdown.length >= 2) {
      const correctTokens = phrase.breakdown.map((b) => b.darija);
      const extraDistractorToken =
        rotatedDistractors[0]?.breakdown[0]?.darija ?? 'bezzaf';
      const tiles = deterministicRotate(
        extraDistractorToken && !correctTokens.includes(extraDistractorToken)
          ? [...correctTokens, extraDistractorToken]
          : correctTokens,
        seed + idx + 3
      );

      return {
        id: `q-${phrase.id}-builder`,
        type: 'sentence-builder',
        phrase,
        prompt: quizStrings.promptBuilder(phrase.frenchMeaning),
        promptSubtext: phrase.phoneticFrench,
        tiles,
        correctAnswer: correctTokens.join(' '),
        correctTokens,
        explanation: `${phrase.darijaLatin} (${phrase.darijaArabic}) — ${phrase.regionalNote}`,
      };
    }

    if (idx % 2 === 0) {
      const options = deterministicRotate(
        [
          phrase.darijaLatin,
          ...rotatedDistractors.map((d) => d.darijaLatin),
        ],
        seed + idx + 5
      );
      return {
        id: `q-${phrase.id}-fr2dz`,
        type: 'fr-to-darija',
        phrase,
        prompt: quizStrings.promptFrToDarija(phrase.frenchMeaning),
        options,
        correctAnswer: phrase.darijaLatin,
        explanation: quizStrings.explanationFrToDarija(
          phrase.darijaLatin,
          phrase.phoneticFrench,
          phrase.regionalNote
        ),
      };
    }

    const options = deterministicRotate(
      [
        phrase.frenchMeaning,
        ...rotatedDistractors.map((d) => d.frenchMeaning),
      ],
      seed + idx + 9
    );
    return {
      id: `q-${phrase.id}-dz2fr`,
      type: 'darija-to-fr',
      phrase,
      prompt: quizStrings.promptDarijaToFr(phrase.darijaLatin),
      promptSubtext: phrase.darijaArabic,
      options,
      correctAnswer: phrase.frenchMeaning,
      explanation: quizStrings.explanationDarijaToFr(
        phrase.darijaLatin,
        phrase.frenchMeaning
      ),
    };
  });
}

function sanitizePhraseReviews(
  raw: unknown
): Record<string, PhraseReviewState> {
  const sanitized: Record<string, PhraseReviewState> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return sanitized;
  }
  for (const [phraseId, entry] of Object.entries(raw)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const candidate = entry as Partial<PhraseReviewState>;
    if (
      typeof candidate.nextReviewDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(candidate.nextReviewDate)
    ) {
      continue;
    }
    const lastReviewedDate =
      typeof candidate.lastReviewedDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(candidate.lastReviewedDate)
        ? candidate.lastReviewedDate
        : candidate.nextReviewDate;
    sanitized[phraseId] = {
      repetitions:
        typeof candidate.repetitions === 'number' &&
        Number.isFinite(candidate.repetitions) &&
        candidate.repetitions >= 0
          ? Math.round(candidate.repetitions)
          : 0,
      intervalDays:
        typeof candidate.intervalDays === 'number' &&
        Number.isFinite(candidate.intervalDays) &&
        candidate.intervalDays >= 0
          ? Math.round(candidate.intervalDays)
          : 0,
      easeFactor:
        typeof candidate.easeFactor === 'number' &&
        Number.isFinite(candidate.easeFactor)
          ? Math.min(3.0, Math.max(1.3, candidate.easeFactor))
          : 2.5,
      lastReviewedDate,
      nextReviewDate: candidate.nextReviewDate,
    };
  }
  return sanitized;
}

export function parseProgressState(
  raw: string | null,
  today: Date = new Date()
): UserProgressState {
  if (!raw) {
    return {
      ...DEFAULT_PROGRESS,
      readStoryIds: [],
      xpByDate: {},
      phraseReviews: {},
    };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<UserProgressState>;
    const xp = typeof parsed.xp === 'number' ? parsed.xp : 0;
    const rawHistory = parsed.xpByDate;
    const sanitizedHistory: Record<string, number> = {};
    if (rawHistory && typeof rawHistory === 'object' && !Array.isArray(rawHistory)) {
      for (const [k, v] of Object.entries(rawHistory)) {
        if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
          sanitizedHistory[k] = v;
        }
      }
    }
    if (Object.keys(sanitizedHistory).length === 0 && xp > 0) {
      sanitizedHistory[formatLocalDateKey(today)] = xp;
    }

    return {
      xp,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 1,
      dailyXpGoal: sanitizeDailyXpGoal(parsed.dailyXpGoal),
      masteredIds: Array.isArray(parsed.masteredIds) ? parsed.masteredIds : [],
      practicedIds: Array.isArray(parsed.practicedIds)
        ? parsed.practicedIds
        : [],
      readStoryIds: Array.isArray(parsed.readStoryIds)
        ? parsed.readStoryIds.filter((id): id is string => typeof id === 'string')
        : [],
      quizzesCompleted:
        typeof parsed.quizzesCompleted === 'number'
          ? parsed.quizzesCompleted
          : 0,
      bestQuizAccuracy:
        typeof parsed.bestQuizAccuracy === 'number'
          ? parsed.bestQuizAccuracy
          : 0,
      quizStreak:
        typeof parsed.quizStreak === 'number' ? parsed.quizStreak : 0,
      bestQuizStreak:
        typeof parsed.bestQuizStreak === 'number' ? parsed.bestQuizStreak : 0,
      dialogueTurnsCount:
        typeof parsed.dialogueTurnsCount === 'number'
          ? parsed.dialogueTurnsCount
          : 0,
      xpByDate: sanitizedHistory,
      phraseReviews: sanitizePhraseReviews(parsed.phraseReviews),
    };
  } catch {
    return {
      ...DEFAULT_PROGRESS,
      readStoryIds: [],
      xpByDate: {},
      phraseReviews: {},
    };
  }
}
