// Test de positionnement en 5 questions -> 3 profils (recommandation R5 / audit A, B, GPT).
// Le profil est stocke separement pour ne pas casser UserProgressState.

export type LearnerProfile = 'debutant' | 'heritage' | 'intermediaire';

export const PROFILE_STORAGE_KEY = 'darijago_learner_profile_v1';

export interface PositioningQuestion {
  id: string;
  question: string;
  options: Array<{
    label: string;
    profil: LearnerProfile;
  }>;
}

export const POSITIONING_QUESTIONS: PositioningQuestion[] = [
  {
    id: 'q1',
    question: 'Comprenez-vous la darija quand un Algérien parle ?',
    options: [
      { label: 'Non, presque rien', profil: 'debutant' },
      { label: 'Oui, à la maison / en famille', profil: 'heritage' },
      { label: 'Oui, assez bien', profil: 'intermediaire' },
    ],
  },
  {
    id: 'q2',
    question: 'Parlez-vous (ou avez-vous déjà parlé) la darija ?',
    options: [
      { label: 'Jamais', profil: 'debutant' },
      { label: 'Un peu, je comprends mais je bloque', profil: 'heritage' },
      { label: 'Oui, je me débrouille', profil: 'intermediaire' },
    ],
  },
  {
    id: 'q3',
    question: "Qu'est-ce qui vous gêne le plus à l'écrit ?",
    options: [
      { label: "Je ne connais pas les lettres arabes", profil: 'debutant' },
      { label: 'Je connais les sons mais pas les chiffres (3, 7, 9)', profil: 'heritage' },
      { label: 'Rien, je lis les trois écritures', profil: 'intermediaire' },
    ],
  },
  {
    id: 'q4',
    question: 'Pourquoi apprenez-vous la darija ?',
    options: [
      { label: 'Découvrir, pour le plaisir', profil: 'debutant' },
      { label: 'Parler avec ma famille / belle-famille', profil: 'heritage' },
      { label: 'Voyager ou travailler en Algérie', profil: 'intermediaire' },
    ],
  },
  {
    id: 'q5',
    question: "Quel est votre objectif dans les prochaines semaines ?",
    options: [
      { label: 'Comprendre et dire quelques mots', profil: 'debutant' },
      { label: 'Tenir une conversation simple', profil: 'heritage' },
      { label: 'Être à l’aise dans la rue et au travail', profil: 'intermediaire' },
    ],
  },
];

export const PROFILES: Record<LearnerProfile, {
  label: string;
  description: string;
  icon: string;
  startMode: 'guided' | 'heritage' | 'immersion';
}> = {
  debutant: {
    label: 'Débutant',
    description: 'On part de zéro : sons, salutations et gestes du quotidien, sans alphabet imposé.',
    icon: '🌱',
    startMode: 'guided',
  },
  heritage: {
    label: 'Héritage',
    description: 'Vous comprenez déjà : on valorise vos variantes familiales et on débloque la parole.',
    icon: '🏠',
    startMode: 'heritage',
  },
  intermediaire: {
    label: 'Intermédiaire',
    description: 'Objectif terrain : survie, navigation et conversation dès la première leçon.',
    icon: '🧭',
    startMode: 'immersion',
  },
};

export function computeProfile(answers: Record<string, LearnerProfile>): LearnerProfile {
  const scores: Record<LearnerProfile, number> = {
    debutant: 0,
    heritage: 0,
    intermediaire: 0,
  };
  for (const p of Object.values(answers)) scores[p] += 1;
  // En cas d'egalite, priorite au profil le plus accompagne (deboutant < heritage < intermediaire)
  return (Object.keys(scores) as LearnerProfile[]).reduce((best, p) =>
    scores[p] > scores[best] ? p : best, 'debutant');
}

export function getStoredProfile(): LearnerProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw === 'debutant' || raw === 'heritage' || raw === 'intermediaire' ? raw : null;
  } catch {
    return null;
  }
}

/** Ordre des modules recommande selon le profil (IDs des 7 modules du curriculum). */
export const PROFILE_MODULE_ORDER: Record<LearnerProfile, string[]> = {
  debutant: ['salutations', 'presentation', 'cafe', 'quotidien'],
  heritage: ['salutations', 'presentation', 'marche', 'quotidien', 'cafe'],
  intermediaire: ['marche', 'quotidien', 'verbes', 'bensedira-base', 'cafe'],
};

/** Message d'accroche affiche en haut de lecon selon le profil. */
export const PROFILE_HINT: Record<LearnerProfile, string> = {
  debutant: '🌱 Parcours débutant : on commence par les salutations, sans alphabet imposé.',
  heritage: '🏠 Parcours héritage : on valorise ce que vous comprenez déjà et on débloque la parole.',
  intermediaire: '🧭 Parcours intermédiaire : objectif terrain — marchés, orientation et conversation.',
};

export function storeProfile(profile: LearnerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, profile);
  } catch {
    // ignore
  }
}
