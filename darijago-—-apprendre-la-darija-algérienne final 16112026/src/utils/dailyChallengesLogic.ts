import type {
  AppLanguage,
  DailyActivityRecord,
  UserProgressState,
} from '../types/darija';

export type DailyChallengeKind =
  | 'learn-verbs'
  | 'practice-phrases'
  | 'complete-quiz'
  | 'quiz-correct'
  | 'earn-xp'
  | 'dialogue-turns'
  | 'read-story';

export type DailyChallengeActionTarget =
  | 'apprendre'
  | 'parcours-conjugation'
  | 'parcours-dialogues'
  | 'parcours-stories'
  | 'dictionnaire-verbs'
  | 'quiz';

export interface DailyChallenge {
  id: string;
  dateKey: string;
  kind: DailyChallengeKind;
  title: string;
  description: string;
  current: number;
  target: number;
  percent: number;
  unitLabel: string;
  bonusXp: number;
  completed: boolean;
  claimed: boolean;
  actionLabel: string;
  actionTarget: DailyChallengeActionTarget;
}

export interface DailyChallengesSummary {
  total: number;
  completedCount: number;
  claimedCount: number;
  claimableCount: number;
  earnedBonusXp: number;
  totalBonusXp: number;
  allCompleted: boolean;
  allClaimed: boolean;
}

export const EMPTY_DAILY_ACTIVITY_RECORD: DailyActivityRecord = {
  verbsLearned: 0,
  verbIds: [],
  phrasesPracticed: 0,
  phraseIds: [],
  quizzesCompleted: 0,
  quizCorrectAnswers: 0,
  dialogueTurns: 0,
  storiesRead: 0,
  claimedChallengeIds: [],
};

export function formatChallengeDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalDayIndex(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000
  );
}

function toNonNegativeInt(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.round(value);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    if (typeof item === 'string' && item.trim().length > 0 && !seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

export function sanitizeDailyActivityRecord(raw: unknown): DailyActivityRecord {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ...EMPTY_DAILY_ACTIVITY_RECORD,
      verbIds: [],
      phraseIds: [],
      claimedChallengeIds: [],
    };
  }
  const candidate = raw as Partial<DailyActivityRecord>;
  const verbIds = toStringArray(candidate.verbIds);
  const phraseIds = toStringArray(candidate.phraseIds);
  const claimedChallengeIds = toStringArray(candidate.claimedChallengeIds);
  return {
    verbsLearned: Math.max(toNonNegativeInt(candidate.verbsLearned), verbIds.length),
    verbIds,
    phrasesPracticed: Math.max(
      toNonNegativeInt(candidate.phrasesPracticed),
      phraseIds.length
    ),
    phraseIds,
    quizzesCompleted: toNonNegativeInt(candidate.quizzesCompleted),
    quizCorrectAnswers: toNonNegativeInt(candidate.quizCorrectAnswers),
    dialogueTurns: toNonNegativeInt(candidate.dialogueTurns),
    storiesRead: toNonNegativeInt(candidate.storiesRead),
    claimedChallengeIds,
  };
}

export function sanitizeDailyActivityByDate(
  raw: unknown
): Record<string, DailyActivityRecord> {
  const sanitized: Record<string, DailyActivityRecord> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return sanitized;
  }
  for (const [dateKey, entry] of Object.entries(raw)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) continue;
    sanitized[dateKey] = sanitizeDailyActivityRecord(entry);
  }
  return sanitized;
}

export function getTodayActivity(
  progress: UserProgressState,
  today: Date = new Date()
): DailyActivityRecord {
  const key = formatChallengeDateKey(today);
  const existing = progress.dailyActivityByDate?.[key];
  return sanitizeDailyActivityRecord(existing);
}

function updateTodayActivity(
  progress: UserProgressState,
  date: Date,
  updater: (current: DailyActivityRecord) => DailyActivityRecord
): Record<string, DailyActivityRecord> {
  const key = formatChallengeDateKey(date);
  const baseMap = progress.dailyActivityByDate ?? {};
  const current = sanitizeDailyActivityRecord(baseMap[key]);
  const updated = updater(current);
  return {
    ...baseMap,
    [key]: updated,
  };
}

export function recordDailyVerbStudy(
  progress: UserProgressState,
  verbId?: string,
  xpGain = 0,
  date: Date = new Date()
): UserProgressState {
  const cleanId = verbId?.trim() ?? '';
  const safeXp = xpGain > 0 ? Math.round(xpGain) : 0;
  const dateKey = formatChallengeDateKey(date);

  const nextActivityByDate = updateTodayActivity(progress, date, (curr) => {
    if (cleanId) {
      if (curr.verbIds.includes(cleanId)) {
        return curr;
      }
      const nextVerbIds = [...curr.verbIds, cleanId];
      return {
        ...curr,
        verbIds: nextVerbIds,
        verbsLearned: Math.max(curr.verbsLearned, nextVerbIds.length),
      };
    }
    return {
      ...curr,
      verbsLearned: curr.verbsLearned + 1,
    };
  });

  return {
    ...progress,
    xp: progress.xp + safeXp,
    xpByDate:
      safeXp > 0
        ? {
            ...progress.xpByDate,
            [dateKey]: (progress.xpByDate[dateKey] ?? 0) + safeXp,
          }
        : progress.xpByDate,
    dailyActivityByDate: nextActivityByDate,
  };
}

export function recordDailyPhraseActivity(
  progress: UserProgressState,
  phraseId?: string,
  date: Date = new Date()
): UserProgressState {
  const cleanId = phraseId?.trim() ?? '';
  const nextActivityByDate = updateTodayActivity(progress, date, (curr) => {
    if (cleanId) {
      if (curr.phraseIds.includes(cleanId)) {
        return curr;
      }
      const nextPhraseIds = [...curr.phraseIds, cleanId];
      return {
        ...curr,
        phraseIds: nextPhraseIds,
        phrasesPracticed: Math.max(curr.phrasesPracticed, nextPhraseIds.length),
      };
    }
    return {
      ...curr,
      phrasesPracticed: curr.phrasesPracticed + 1,
    };
  });

  return {
    ...progress,
    dailyActivityByDate: nextActivityByDate,
  };
}

export function recordDailyQuizCompleted(
  progress: UserProgressState,
  correctCount = 0,
  date: Date = new Date()
): UserProgressState {
  const safeCorrect = Math.max(0, Math.round(correctCount));
  const nextActivityByDate = updateTodayActivity(progress, date, (curr) => ({
    ...curr,
    quizzesCompleted: curr.quizzesCompleted + 1,
    quizCorrectAnswers: curr.quizCorrectAnswers + safeCorrect,
  }));

  return {
    ...progress,
    dailyActivityByDate: nextActivityByDate,
  };
}

export function recordDailyQuizCorrectAnswer(
  progress: UserProgressState,
  date: Date = new Date()
): UserProgressState {
  const nextActivityByDate = updateTodayActivity(progress, date, (curr) => ({
    ...curr,
    quizCorrectAnswers: curr.quizCorrectAnswers + 1,
  }));

  return {
    ...progress,
    dailyActivityByDate: nextActivityByDate,
  };
}

export function recordDailyDialogueTurn(
  progress: UserProgressState,
  date: Date = new Date()
): UserProgressState {
  const nextActivityByDate = updateTodayActivity(progress, date, (curr) => ({
    ...curr,
    dialogueTurns: curr.dialogueTurns + 1,
  }));

  return {
    ...progress,
    dailyActivityByDate: nextActivityByDate,
  };
}

export function recordDailyStoryRead(
  progress: UserProgressState,
  date: Date = new Date()
): UserProgressState {
  const nextActivityByDate = updateTodayActivity(progress, date, (curr) => ({
    ...curr,
    storiesRead: curr.storiesRead + 1,
  }));

  return {
    ...progress,
    dailyActivityByDate: nextActivityByDate,
  };
}

interface MissionLocaleSpec {
  title: string;
  description: string;
  unitLabel: string;
  actionLabel: string;
}

const CHALLENGE_LOCALE_TEXTS: Record<
  AppLanguage,
  Record<DailyChallengeKind, MissionLocaleSpec>
> = {
  fr: {
    'learn-verbs': {
      title: 'Apprendre 5 verbes',
      description: 'Étudiez ou écoutez 5 verbes algériens dans le Dictionnaire ou le tableau de conjugaison.',
      unitLabel: 'verbes',
      actionLabel: 'Ouvrir les verbes',
    },
    'practice-phrases': {
      title: 'Pratiquer 5 expressions',
      description: 'Révisez ou maîtrisez 5 expressions en darija dans Apprendre ou Révision Rapide.',
      unitLabel: 'expressions',
      actionLabel: 'Pratiquer',
    },
    'complete-quiz': {
      title: 'Terminer 1 quiz',
      description: 'Complétez une session complète dans Quiz actif, Écoute et devine ou Dictée.',
      unitLabel: 'quiz',
      actionLabel: 'Lancer un quiz',
    },
    'quiz-correct': {
      title: '5 bonnes réponses au quiz',
      description: 'Cumulez 5 bonnes réponses aujourd’hui sur les quiz ou jeux d’écoute.',
      unitLabel: 'bonnes réponses',
      actionLabel: 'Jouer au quiz',
    },
    'earn-xp': {
      title: 'Gagner 60 XP aujourd’hui',
      description: 'Restez régulier en cumulant au moins 60 XP dans vos activités du jour.',
      unitLabel: 'XP',
      actionLabel: 'Continuer',
    },
    'dialogue-turns': {
      title: 'Échanger 3 répliques',
      description: 'Participez à 3 répliques dans le simulateur de dialogues locaux.',
      unitLabel: 'répliques',
      actionLabel: 'Dialoguer',
    },
    'read-story': {
      title: 'Lire 1 fenêtre culturelle',
      description: 'Découvrez et validez un récit dans Fenêtre sur l’Algérie.',
      unitLabel: 'récit',
      actionLabel: 'Lire un récit',
    },
  },
  en: {
    'learn-verbs': {
      title: 'Learn 5 verbs',
      description: 'Study or listen to 5 Algerian verbs in the Dictionary or Conjugation table.',
      unitLabel: 'verbs',
      actionLabel: 'Open verbs',
    },
    'practice-phrases': {
      title: 'Practice 5 expressions',
      description: 'Review or master 5 Darija phrases in Learn or Quick Review.',
      unitLabel: 'phrases',
      actionLabel: 'Practice',
    },
    'complete-quiz': {
      title: 'Complete 1 quiz',
      description: 'Finish a full session in Active Quiz, Listen & Guess, or Dictation.',
      unitLabel: 'quiz',
      actionLabel: 'Start quiz',
    },
    'quiz-correct': {
      title: 'Score 5 quiz answers',
      description: 'Get 5 correct answers today across quiz or listening games.',
      unitLabel: 'answers',
      actionLabel: 'Play quiz',
    },
    'earn-xp': {
      title: 'Earn 60 XP today',
      description: 'Stay consistent by earning at least 60 XP across today’s sessions.',
      unitLabel: 'XP',
      actionLabel: 'Keep learning',
    },
    'dialogue-turns': {
      title: 'Exchange 3 dialogue lines',
      description: 'Send 3 replies in the local Algerian dialogue simulator.',
      unitLabel: 'turns',
      actionLabel: 'Open dialogues',
    },
    'read-story': {
      title: 'Read 1 cultural window',
      description: 'Explore and complete a story in Window on Algeria.',
      unitLabel: 'story',
      actionLabel: 'Read story',
    },
  },
  es: {
    'learn-verbs': {
      title: 'Aprender 5 verbos',
      description: 'Estudia o escucha 5 verbos argelinos en el Diccionario o Conjugación.',
      unitLabel: 'verbos',
      actionLabel: 'Ver verbos',
    },
    'practice-phrases': {
      title: 'Practicar 5 expresiones',
      description: 'Repasa o domina 5 expresiones en dariya en Aprender o Repaso Rápido.',
      unitLabel: 'frases',
      actionLabel: 'Practicar',
    },
    'complete-quiz': {
      title: 'Completar 1 quiz',
      description: 'Termina una sesión completa en Quiz activo, Escucha y adivina o Dictado.',
      unitLabel: 'quiz',
      actionLabel: 'Iniciar quiz',
    },
    'quiz-correct': {
      title: '5 aciertos en el quiz',
      description: 'Consigue 5 respuestas correctas hoy en los quiz o juegos de escucha.',
      unitLabel: 'aciertos',
      actionLabel: 'Ir al quiz',
    },
    'earn-xp': {
      title: 'Ganar 60 XP hoy',
      description: 'Mantén tu ritmo acumulando al menos 60 XP en tus actividades de hoy.',
      unitLabel: 'XP',
      actionLabel: 'Continuar',
    },
    'dialogue-turns': {
      title: 'Intercambiar 3 réplicas',
      description: 'Envía 3 respuestas en el simulador de diálogos locales.',
      unitLabel: 'turnos',
      actionLabel: 'Dialogar',
    },
    'read-story': {
      title: 'Leer 1 ventana cultural',
      description: 'Descubre y valida un relato en Ventana a Argelia.',
      unitLabel: 'relato',
      actionLabel: 'Leer relato',
    },
  },
  de: {
    'learn-verbs': {
      title: '5 Verben lernen',
      description: 'Lerne oder höre 5 algerische Verben im Wörterbuch oder der Konjugation.',
      unitLabel: 'Verben',
      actionLabel: 'Verben öffnen',
    },
    'practice-phrases': {
      title: '5 Ausdrücke üben',
      description: 'Wiederhole oder meistere 5 Darija-Sätze unter Lernen oder Schnell-Wiederholung.',
      unitLabel: 'Sätze',
      actionLabel: 'Üben',
    },
    'complete-quiz': {
      title: '1 Quiz abschließen',
      description: 'Beende eine komplette Runde in Quiz, Hören & Raten oder Diktat.',
      unitLabel: 'Quiz',
      actionLabel: 'Quiz starten',
    },
    'quiz-correct': {
      title: '5 richtige Quiz-Antworten',
      description: 'Sammle heute 5 richtige Antworten in Quiz- oder Hörübungen.',
      unitLabel: 'Treffer',
      actionLabel: 'Zum Quiz',
    },
    'earn-xp': {
      title: 'Heute 60 XP sammeln',
      description: 'Bleibe dran und sammle heute mindestens 60 XP in deinen Übungen.',
      unitLabel: 'XP',
      actionLabel: 'Weiterüben',
    },
    'dialogue-turns': {
      title: '3 Dialog-Antworten senden',
      description: 'Führe 3 Gesprächszüge im lokalen Dialogsimulator aus.',
      unitLabel: 'Züge',
      actionLabel: 'Dialog starten',
    },
    'read-story': {
      title: '1 Kultur-Einblick lesen',
      description: 'Lies und bestätige eine Geschichte in Einblick in Algerien.',
      unitLabel: 'Text',
      actionLabel: 'Geschichte lesen',
    },
  },
  it: {
    'learn-verbs': {
      title: 'Imparare 5 verbi',
      description: 'Studia o ascolta 5 verbi algerini nel Dizionario o nella Coniugazione.',
      unitLabel: 'verbi',
      actionLabel: 'Apri verbi',
    },
    'practice-phrases': {
      title: 'Praticare 5 espressioni',
      description: 'Ripassa o padroneggia 5 frasi in darija in Impara o Ripasso Rapido.',
      unitLabel: 'frasi',
      actionLabel: 'Pratica',
    },
    'complete-quiz': {
      title: 'Completare 1 quiz',
      description: 'Termina una sessione completa in Quiz attivo, Ascolta e indovina o Dettato.',
      unitLabel: 'quiz',
      actionLabel: 'Avvia quiz',
    },
    'quiz-correct': {
      title: '5 risposte esatte al quiz',
      description: 'Ottieni 5 risposte corrette oggi nei quiz o giochi di ascolto.',
      unitLabel: 'risposte',
      actionLabel: 'Gioca al quiz',
    },
    'earn-xp': {
      title: 'Guadagnare 60 XP oggi',
      description: 'Mantieni la costanza accumulando almeno 60 XP nelle sessioni di oggi.',
      unitLabel: 'XP',
      actionLabel: 'Continua',
    },
    'dialogue-turns': {
      title: 'Scambiare 3 battute',
      description: 'Invia 3 risposte nel simulatore di dialoghi locali.',
      unitLabel: 'battute',
      actionLabel: 'Dialoga',
    },
    'read-story': {
      title: 'Leggere 1 finestra culturale',
      description: 'Scopri e completa un racconto in Finestra sull’Algeria.',
      unitLabel: 'racconto',
      actionLabel: 'Leggi racconto',
    },
  },
  nl: {
    'learn-verbs': {
      title: '5 werkwoorden leren',
      description: 'Bestudeer of beluister 5 Algerijnse werkwoorden in het Woordenboek of Vervoeging.',
      unitLabel: 'werkwoorden',
      actionLabel: 'Open werkwoorden',
    },
    'practice-phrases': {
      title: '5 uitdrukkingen oefenen',
      description: 'Herhaal of beheers 5 Darija-zinnen bij Leren of Snelle Herhaling.',
      unitLabel: 'zinnen',
      actionLabel: 'Oefenen',
    },
    'complete-quiz': {
      title: '1 quiz voltooien',
      description: 'Rond een volledige sessie af in Actieve Quiz, Luister & Raad of Dictee.',
      unitLabel: 'quiz',
      actionLabel: 'Start quiz',
    },
    'quiz-correct': {
      title: '5 goede quizantwoorden',
      description: 'Behaal vandaag 5 goede antwoorden in quizzen of luisterspellen.',
      unitLabel: 'antwoorden',
      actionLabel: 'Speel quiz',
    },
    'earn-xp': {
      title: 'Vandaag 60 XP verdienen',
      description: 'Blijf consequent en verzamel vandaag minstens 60 XP.',
      unitLabel: 'XP',
      actionLabel: 'Doorgaan',
    },
    'dialogue-turns': {
      title: '3 dialoogzinnen uitwisselen',
      description: 'Wissel 3 reacties uit in de lokale dialoogsimulator.',
      unitLabel: 'beurten',
      actionLabel: 'Naar dialoog',
    },
    'read-story': {
      title: '1 cultuurvenster lezen',
      description: 'Lees en voltooi een verhaal in Venster op Algerije.',
      unitLabel: 'verhaal',
      actionLabel: 'Lees verhaal',
    },
  },
  zh: {
    'learn-verbs': {
      title: '学习 5 个动词',
      description: '在词典或动词变位表中学习或收听 5 个阿尔及利亚语动词。',
      unitLabel: '个动词',
      actionLabel: '查看动词',
    },
    'practice-phrases': {
      title: '练习 5 句表达',
      description: '在“学习”或“快速复习”中复习或掌握 5 句达里贾语表达。',
      unitLabel: '句',
      actionLabel: '去练习',
    },
    'complete-quiz': {
      title: '完成 1 次测验',
      description: '在主动测验、听音辨词或听写练习中完成一整轮。',
      unitLabel: '次测验',
      actionLabel: '开始测验',
    },
    'quiz-correct': {
      title: '测验答对 5 题',
      description: '今天在测验或听音小游戏中累计答对 5 道题。',
      unitLabel: '题',
      actionLabel: '去做测验',
    },
    'earn-xp': {
      title: '今日获得 60 XP',
      description: '保持每日学习节奏，今天累计获得至少 60 经验值。',
      unitLabel: 'XP',
      actionLabel: '继续学习',
    },
    'dialogue-turns': {
      title: '完成 3 轮情景对话',
      description: '在本地情景对话模拟器中发送 3 句回复。',
      unitLabel: '轮',
      actionLabel: '开始对话',
    },
    'read-story': {
      title: '阅读 1 篇文化之窗',
      description: '在“阿尔及利亚之窗”阅读并确认完成 1 篇文化故事。',
      unitLabel: '篇',
      actionLabel: '阅读故事',
    },
  },
};

interface MissionBlueprint {
  kind: DailyChallengeKind;
  target: number;
  bonusXp: number;
  actionTarget: DailyChallengeActionTarget;
  getRawProgress: (activity: DailyActivityRecord, todayXp: number) => number;
}

const MISSION_BLUEPRINTS: Record<DailyChallengeKind, MissionBlueprint> = {
  'learn-verbs': {
    kind: 'learn-verbs',
    target: 5,
    bonusXp: 35,
    actionTarget: 'parcours-conjugation',
    getRawProgress: (activity) => Math.max(activity.verbsLearned, activity.verbIds.length),
  },
  'practice-phrases': {
    kind: 'practice-phrases',
    target: 5,
    bonusXp: 30,
    actionTarget: 'apprendre',
    getRawProgress: (activity) =>
      Math.max(activity.phrasesPracticed, activity.phraseIds.length),
  },
  'complete-quiz': {
    kind: 'complete-quiz',
    target: 1,
    bonusXp: 30,
    actionTarget: 'quiz',
    getRawProgress: (activity) => activity.quizzesCompleted,
  },
  'quiz-correct': {
    kind: 'quiz-correct',
    target: 5,
    bonusXp: 30,
    actionTarget: 'quiz',
    getRawProgress: (activity) => activity.quizCorrectAnswers,
  },
  'earn-xp': {
    kind: 'earn-xp',
    target: 60,
    bonusXp: 25,
    actionTarget: 'apprendre',
    getRawProgress: (_activity, todayXp) => todayXp,
  },
  'dialogue-turns': {
    kind: 'dialogue-turns',
    target: 3,
    bonusXp: 25,
    actionTarget: 'parcours-dialogues',
    getRawProgress: (activity) => activity.dialogueTurns,
  },
  'read-story': {
    kind: 'read-story',
    target: 1,
    bonusXp: 25,
    actionTarget: 'parcours-stories',
    getRawProgress: (activity) => activity.storiesRead,
  },
};

export function selectDailyChallengeKinds(
  progress: UserProgressState,
  today: Date = new Date()
): [DailyChallengeKind, DailyChallengeKind, DailyChallengeKind] {
  const dayIndex = getLocalDayIndex(today);

  // Slot 0 alternates between learn-verbs and practice-phrases
  // On 2026-11-16 (dayIndex = 20773, odd), picks 'learn-verbs'.
  const slot0: DailyChallengeKind =
    dayIndex % 2 === 1 ? 'learn-verbs' : 'practice-phrases';

  // Slot 1 alternates between complete-quiz and quiz-correct
  // On 2026-11-16 (dayIndex = 20773, odd), picks 'complete-quiz'.
  const slot1: DailyChallengeKind =
    dayIndex % 2 === 1 ? 'complete-quiz' : 'quiz-correct';

  // Slot 2 rotates across earn-xp, dialogue-turns, and read-story
  // (20773 + 2) % 3 === 0 -> 'earn-xp' on 2026-11-16.
  const slot2Pool: DailyChallengeKind[] = [
    'earn-xp',
    'dialogue-turns',
    'read-story',
  ];
  let slot2 = slot2Pool[Math.abs(dayIndex + 2) % slot2Pool.length];
  if (slot2 === 'read-story' && progress.readStoryIds.length >= 3) {
    slot2 = 'earn-xp';
  }

  return [slot0, slot1, slot2];
}

export function generateDailyChallenges(
  progress: UserProgressState,
  language: AppLanguage = 'fr',
  today: Date = new Date()
): DailyChallenge[] {
  const dateKey = formatChallengeDateKey(today);
  const activity = getTodayActivity(progress, today);
  const todayXp = Math.max(0, progress.xpByDate[dateKey] ?? 0);
  const kinds = selectDailyChallengeKinds(progress, today);
  const localeMap = CHALLENGE_LOCALE_TEXTS[language] ?? CHALLENGE_LOCALE_TEXTS.fr;

  return kinds.map((kind) => {
    const bp = MISSION_BLUEPRINTS[kind];
    const text = localeMap[kind];
    const id = `${dateKey}:${kind}`;
    const rawCurrent = Math.max(0, bp.getRawProgress(activity, todayXp));
    const current = Math.min(rawCurrent, bp.target);
    const percent =
      bp.target > 0 ? Math.min(100, Math.round((current / bp.target) * 100)) : 0;
    const completed = rawCurrent >= bp.target;
    const claimed = activity.claimedChallengeIds.includes(id);

    return {
      id,
      dateKey,
      kind,
      title: text.title,
      description: text.description,
      current,
      target: bp.target,
      percent,
      unitLabel: text.unitLabel,
      bonusXp: bp.bonusXp,
      completed,
      claimed,
      actionLabel: text.actionLabel,
      actionTarget: bp.actionTarget,
    };
  });
}

export function claimDailyChallengeReward(
  progress: UserProgressState,
  challengeId: string,
  today: Date = new Date()
): { progress: UserProgressState; claimedChallenge: DailyChallenge | null } {
  const challenges = generateDailyChallenges(progress, 'fr', today);
  const target = challenges.find((c) => c.id === challengeId);
  if (!target || !target.completed || target.claimed) {
    return { progress, claimedChallenge: null };
  }

  const dateKey = formatChallengeDateKey(today);
  const nextActivityByDate = updateTodayActivity(progress, today, (curr) => ({
    ...curr,
    claimedChallengeIds: curr.claimedChallengeIds.includes(challengeId)
      ? curr.claimedChallengeIds
      : [...curr.claimedChallengeIds, challengeId],
  }));

  const nextProgress: UserProgressState = {
    ...progress,
    xp: progress.xp + target.bonusXp,
    xpByDate: {
      ...progress.xpByDate,
      [dateKey]: (progress.xpByDate[dateKey] ?? 0) + target.bonusXp,
    },
    dailyActivityByDate: nextActivityByDate,
  };

  return {
    progress: nextProgress,
    claimedChallenge: {
      ...target,
      claimed: true,
    },
  };
}

export function computeDailyChallengesSummary(
  challenges: DailyChallenge[]
): DailyChallengesSummary {
  const total = challenges.length;
  const completedCount = challenges.filter((c) => c.completed).length;
  const claimedCount = challenges.filter((c) => c.claimed).length;
  const claimableCount = challenges.filter((c) => c.completed && !c.claimed).length;
  const earnedBonusXp = challenges
    .filter((c) => c.claimed)
    .reduce((sum, c) => sum + c.bonusXp, 0);
  const totalBonusXp = challenges.reduce((sum, c) => sum + c.bonusXp, 0);

  return {
    total,
    completedCount,
    claimedCount,
    claimableCount,
    earnedBonusXp,
    totalBonusXp,
    allCompleted: total > 0 && completedCount === total,
    allClaimed: total > 0 && claimedCount === total,
  };
}
