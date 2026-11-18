// Etiquetage Vital / Courant / Avance des phrases (recommandation audit B, A).
// Vital = survie (salutations, douleur, prix, orientation, urgence).
// Avance = grammaire/conjugaison Ben Sedira. Courant = le reste.
export type PhrasePriority = 'vital' | 'courant' | 'avance';

const VITAL_KEYWORDS = [
  'salam', 'bonjour', 'aide', 'urgence', 'malade', 'médecin', 'doucement',
  'prix', 'combien', 'bch7al', 'où', 'ou', 'orientation', 'taxi', 'police',
  'panne', 'a3tini', 'donne', 'merci', 'chokran', 'pardon', '3afak',
  'faim', 'soif', 'eau', 'lma', 'toilettes',
];
const AVANCE_MODULES = ['bensedira-base', 'verbes'];

export function classifyPhrasePriority(
  phrase: { darijaLatin?: string; frenchMeaning?: string; moduleId?: string },
  moduleId?: string
): PhrasePriority {
  const mid = moduleId ?? phrase.moduleId ?? '';
  if (AVANCE_MODULES.some((m) => mid.includes(m))) return 'avance';
  const texte = `${phrase.darijaLatin ?? ''} ${phrase.frenchMeaning ?? ''}`.toLowerCase();
  if (VITAL_KEYWORDS.some((k) => texte.includes(k))) return 'vital';
  return 'courant';
}

export const PRIORITY_LABEL: Record<PhrasePriority, string> = {
  vital: '🔴 Vital',
  courant: '🟡 Courant',
  avance: '🟢 Avancé',
};
